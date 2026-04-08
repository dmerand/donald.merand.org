/**
 * Mini Banjo Chord Transposer - Widget / UI Controller
 * Wires core modules to DOM, handles events and rendering
 */

class BanjoToolController {
  constructor() {
    this.theory = new MusicalTheory();
    this.chordLib = new ChordLibrary();
    this.tunings = new BanjoTunings(this.theory);
    this.voicer = new BanjoVoicer(this.theory, this.tunings);
    this.renderer = new ChordDiagramRenderer();
    this.storage = new StorageManager('banjo-chord-');

    this.currentTuning = this.storage.load('tuning', 'mini');
    this.currentRoot = this.storage.load('root', 'G');
    this.currentQuality = this.storage.load('quality', 'major');
    this.currentPosition = this.storage.load('position', 0);
    this.chords = this.storage.load('chords', []);
  }

  init() {
    document.querySelectorAll('[data-tuning]').forEach(btn => {
      btn.addEventListener('click', () => this.setTuning(btn.dataset.tuning));
    });
    document.querySelectorAll('[data-root]').forEach(btn => {
      btn.addEventListener('click', () => this.setRoot(btn.dataset.root));
    });
    document.querySelectorAll('[data-quality]').forEach(btn => {
      btn.addEventListener('click', () => this.setQuality(btn.dataset.quality));
    });
    document.querySelectorAll('[data-position]').forEach(btn => {
      btn.addEventListener('click', () => this.setPosition(Number(btn.dataset.position)));
    });
    document.getElementById('add-chord').addEventListener('click', () => this.addChord());
    document.getElementById('clear-chords').addEventListener('click', () => {
      this.chords = [];
      this.persist();
      this.renderCollection();
    });
    document.getElementById('export-svg').addEventListener('click', () => this.exportSVG());

    this.syncToggleButtons();
    this.renderPreview();
    this.renderCollection();
  }

  syncToggleButtons() {
    document.querySelectorAll('[data-tuning]').forEach(btn => {
      btn.classList.toggle('toggle-active', btn.dataset.tuning === this.currentTuning);
    });
    document.querySelectorAll('[data-root]').forEach(btn => {
      btn.classList.toggle('toggle-active', btn.dataset.root === this.currentRoot);
    });
    document.querySelectorAll('[data-quality]').forEach(btn => {
      btn.classList.toggle('toggle-active', btn.dataset.quality === this.currentQuality);
    });
    document.querySelectorAll('[data-position]').forEach(btn => {
      btn.classList.toggle('toggle-active', Number(btn.dataset.position) === this.currentPosition);
    });
  }

  setTuning(tuningKey) {
    this.currentTuning = tuningKey;
    this.storage.save('tuning', tuningKey);
    document.querySelectorAll('[data-tuning]').forEach(btn => {
      btn.classList.toggle('toggle-active', btn.dataset.tuning === tuningKey);
    });
    this.renderPreview();
    this.renderCollection();
  }

  setRoot(root) {
    this.currentRoot = root;
    this.storage.save('root', root);
    document.querySelectorAll('[data-root]').forEach(btn => {
      btn.classList.toggle('toggle-active', btn.dataset.root === root);
    });
    this.renderPreview();
  }

  setQuality(quality) {
    this.currentQuality = quality;
    this.storage.save('quality', quality);
    document.querySelectorAll('[data-quality]').forEach(btn => {
      btn.classList.toggle('toggle-active', btn.dataset.quality === quality);
    });
    this.renderPreview();
  }

  setPosition(position) {
    this.currentPosition = position;
    this.storage.save('position', position);
    document.querySelectorAll('[data-position]').forEach(btn => {
      btn.classList.toggle('toggle-active', Number(btn.dataset.position) === position);
    });
    this.renderPreview();
  }

  addChord() {
    this.chords.push({ root: this.currentRoot, quality: this.currentQuality, position: this.currentPosition });
    this.persist();
    this.renderCollection();
  }

  persist() {
    this.storage.save('chords', this.chords);
  }

  renderChordDiagram(root, quality, position = 0) {
    const tuning = this.tunings.get(this.currentTuning);
    const chord = this.chordLib.getChord(root, quality);
    const semitones = this.theory.chordSemitones(root, chord.intervals);
    const rootSemitone = this.theory.noteToSemitone(root);
    const voicing = this.voicer.findBestVoicing(semitones, rootSemitone, this.currentTuning, position);
    return this.renderer.render(voicing, chord.displayName, tuning.openNotes);
  }

  updatePositionButtons() {
    const chord = this.chordLib.getChord(this.currentRoot, this.currentQuality);
    const semitones = this.theory.chordSemitones(this.currentRoot, chord.intervals);
    const rootSemitone = this.theory.noteToSemitone(this.currentRoot);

    const seen = [];
    document.querySelectorAll('[data-position]').forEach(btn => {
      const pos = Number(btn.dataset.position);
      const voicing = this.voicer.findBestVoicing(semitones, rootSemitone, this.currentTuning, pos);
      const key = voicing.frets.join(',');
      const duplicate = seen.some(s => s.key === key);
      seen.push({ key, pos });
      btn.disabled = duplicate;
      btn.classList.toggle('toggle-disabled', duplicate);
    });
  }

  renderPreview() {
    this.updatePositionButtons();
    const container = document.getElementById('preview-area');
    container.innerHTML = '';
    const svg = this.renderChordDiagram(this.currentRoot, this.currentQuality, this.currentPosition);
    const wrapper = document.createElement('div');
    wrapper.className = 'chord-card chord-preview';
    wrapper.appendChild(svg);
    const tuning = this.tunings.get(this.currentTuning);
    const label = document.createElement('div');
    label.className = 'tuning-label';
    label.textContent = tuning.shortName + ': ' + tuning.openNotes.join(' ');
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  }

  renderCollection() {
    const container = document.getElementById('chord-collection');
    container.innerHTML = '';

    // Show/hide collection action buttons
    const actions = document.getElementById('collection-actions');
    if (actions) actions.style.display = this.chords.length > 0 ? 'flex' : 'none';

    if (this.chords.length === 0) return;

    const sep = document.createElement('div');
    sep.className = 'collection-separator';
    container.appendChild(sep);

    for (let i = 0; i < this.chords.length; i++) {
      const { root, quality, position } = this.chords[i];
      const svg = this.renderChordDiagram(root, quality, position || 0);
      const wrapper = document.createElement('div');
      wrapper.className = 'chord-card';
      wrapper.appendChild(svg);
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'remove';
      removeBtn.className = 'remove-btn';
      removeBtn.addEventListener('click', () => {
        this.chords.splice(i, 1);
        this.persist();
        this.renderCollection();
      });
      wrapper.appendChild(removeBtn);
      container.appendChild(wrapper);
    }
  }

  exportSVG() {
    if (this.chords.length === 0) return;

    const tuning = this.tunings.get(this.currentTuning);
    const dw = this.renderer.diagramWidth;
    const dh = this.renderer.diagramHeight;
    const gap = 10;
    const allChords = [...this.chords];
    const totalWidth = allChords.length * (dw + gap) - gap + 20;
    const totalHeight = dh + 40;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">\n`;
    svgContent += `<rect width="${totalWidth}" height="${totalHeight}" fill="white"/>\n`;

    for (let i = 0; i < allChords.length; i++) {
      const { root, quality, position } = allChords[i];
      const svg = this.renderChordDiagram(root, quality, position || 0);
      const xOffset = 10 + i * (dw + gap);
      svgContent += `<g transform="translate(${xOffset}, 10)">\n`;
      svgContent += svg.innerHTML;
      svgContent += `\n</g>\n`;
    }

    svgContent += `<text x="${totalWidth / 2}" y="${totalHeight - 5}" text-anchor="middle" font-size="10" fill="#999">${tuning.shortName}: ${tuning.openNotes.join(' ')}</text>\n`;
    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const chordNames = allChords.map(c => this.chordLib.getChord(c.root, c.quality).displayName).join('-');
    a.download = `banjo-${tuning.shortName.replace(/\s+/g, '-').toLowerCase()}-${chordNames.replace(/\s+/g, '').replace(/[#]/g, 'sharp')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize the widget when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.banjoTool = new BanjoToolController();
  window.banjoTool.init();
});
