/**
 * Chord-finder UI controller.
 *
 * Pick a tuning, root, quality and inversion; the tool shows every distinct
 * playable voicing up the neck. Click a voicing to add it to the collection,
 * which can be exported as an SVG or PNG chord sheet.
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
    this.currentInversion = this.storage.load('inversion', 0);
    this.showAll = this.storage.load('showAll', false);
    this.voicingIndex = 0;
    // Drop any collection entries saved by the old scoring-based version; they
    // lack the concrete `frets` the renderer now needs.
    this.chords = this.storage.load('chords', []).filter(c => c && Array.isArray(c.frets));
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

    document.getElementById('clear-chords').addEventListener('click', () => {
      this.chords = [];
      this.persist();
      this.renderCollection();
    });
    document.getElementById('export-svg').addEventListener('click', () => this.exportSVG());
    document.getElementById('export-png').addEventListener('click', () => this.exportPNG());

    this.syncToggleButtons();
    this.buildInversionButtons();
    this.renderVoicings();
    this.renderCollection();
  }

  getBassSemitone(root, quality, inversion) {
    root = root || this.currentRoot;
    quality = quality || this.currentQuality;
    inversion = inversion !== undefined ? inversion : this.currentInversion;
    const chord = this.chordLib.getChord(root, quality);
    const semitones = this.theory.chordSemitones(root, chord.intervals);
    return semitones[inversion] !== undefined ? semitones[inversion] : semitones[0];
  }

  getChordDisplayName(root, quality, inversion) {
    const chord = this.chordLib.getChord(root, quality);
    if (!inversion) return chord.displayName;
    const spelling = this.theory.chordSpelling(root, chord.intervals);
    const bassSemitone = this.theory.chordSemitones(root, chord.intervals)[inversion];
    const bassNote = spelling[bassSemitone] || this.theory.semitoneToNote(bassSemitone);
    return chord.displayName + '/' + bassNote;
  }

  buildInversionButtons() {
    const container = document.getElementById('inversion-buttons');
    container.innerHTML = '';

    const chord = this.chordLib.getChord(this.currentRoot, this.currentQuality);
    const spelling = this.theory.chordSpelling(this.currentRoot, chord.intervals);
    const semitones = this.theory.chordSemitones(this.currentRoot, chord.intervals);

    if (this.currentInversion >= chord.intervals.length) {
      this.currentInversion = 0;
      this.storage.save('inversion', 0);
    }

    for (let i = 0; i < chord.intervals.length; i++) {
      const btn = document.createElement('button');
      btn.className = 'toggle-btn toggle-sm';
      if (i === 0) {
        btn.textContent = 'Root';
      } else {
        const noteName = spelling[semitones[i]] || this.theory.semitoneToNote(semitones[i]);
        btn.textContent = '/' + noteName;
      }
      btn.dataset.inversion = i;
      const active = i === this.currentInversion;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
      btn.addEventListener('click', () => this.setInversion(i));
      container.appendChild(btn);
    }
  }

  setInversion(inv) {
    this.currentInversion = inv;
    this.voicingIndex = 0;
    this.storage.save('inversion', inv);
    document.querySelectorAll('[data-inversion]').forEach(btn => {
      const active = Number(btn.dataset.inversion) === inv;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    this.renderVoicings();
  }

  syncToggleButtons() {
    document.querySelectorAll('[data-tuning]').forEach(btn => {
      const active = btn.dataset.tuning === this.currentTuning;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    document.querySelectorAll('[data-root]').forEach(btn => {
      const active = btn.dataset.root === this.currentRoot;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    document.querySelectorAll('[data-quality]').forEach(btn => {
      const active = btn.dataset.quality === this.currentQuality;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
  }

  setTuning(tuningKey) {
    this.currentTuning = tuningKey;
    this.voicingIndex = 0;
    this.storage.save('tuning', tuningKey);
    this.syncToggleButtons();
    this.renderVoicings();
  }

  setRoot(root) {
    this.currentRoot = root;
    this.voicingIndex = 0;
    this.storage.save('root', root);
    this.syncToggleButtons();
    this.buildInversionButtons();
    this.renderVoicings();
  }

  setQuality(quality) {
    this.currentQuality = quality;
    this.voicingIndex = 0;
    this.storage.save('quality', quality);
    this.syncToggleButtons();
    this.buildInversionButtons();
    this.renderVoicings();
  }

  currentVoicings() {
    // Cache by selection so stepping/toggling doesn't re-enumerate the whole neck.
    const key = `${this.currentTuning}|${this.currentRoot}|${this.currentQuality}|${this.currentInversion}`;
    if (this._voicingsKey === key) return this._voicings;

    const chord = this.chordLib.getChord(this.currentRoot, this.currentQuality);
    const semitones = this.theory.chordSemitones(this.currentRoot, chord.intervals);
    const rootSemitone = this.theory.noteToSemitone(this.currentRoot);
    const spelling = this.theory.chordSpelling(this.currentRoot, chord.intervals);
    const bassSemitone = this.getBassSemitone();

    this._voicingsKey = key;
    this._voicings = this.voicer.enumerateVoicings(semitones, rootSemitone, this.currentTuning, bassSemitone, spelling);
    return this._voicings;
  }

  voicingPosition(voicing) {
    const fretted = voicing.frets.filter(f => f > 0);
    return fretted.length === 0 ? 0 : Math.min(...fretted);
  }

  positionLabel(voicing) {
    const pos = this.voicingPosition(voicing);
    return pos === 0 ? 'open position' : 'fret ' + pos;
  }

  // A chip per distinct neck position, jumping to the first shape there.
  makeJumpChips(voicings) {
    const positions = [];
    voicings.forEach((v, idx) => {
      const fret = this.voicingPosition(v);
      if (!positions.some(p => p.fret === fret)) positions.push({ fret, idx });
    });
    if (positions.length < 2) return null;

    const row = document.createElement('div');
    row.className = 'stepper-jump';

    const lead = document.createElement('span');
    lead.className = 'stepper-jump-label';
    lead.textContent = 'jump:';
    row.appendChild(lead);

    const activeFret = this.voicingPosition(voicings[this.voicingIndex]);
    for (const p of positions) {
      const chip = document.createElement('button');
      chip.className = 'jump-chip';
      chip.textContent = p.fret === 0 ? 'Open' : String(p.fret);
      chip.classList.toggle('jump-active', p.fret === activeFret);
      chip.addEventListener('click', () => {
        this.voicingIndex = p.idx;
        this.renderVoicings();
      });
      row.appendChild(chip);
    }
    return row;
  }

  makeAddButton(voicing, displayName) {
    const addBtn = document.createElement('button');
    addBtn.className = 'add-voicing-btn';
    addBtn.textContent = '+ add';
    addBtn.setAttribute('aria-label', `Add ${displayName} voicing to collection`);
    addBtn.addEventListener('click', () => this.addVoicing(voicing, displayName));
    return addBtn;
  }

  makeShowAllToggle(count) {
    const toggle = document.createElement('button');
    toggle.className = 'show-all-toggle';
    toggle.textContent = this.showAll ? 'show fewer ▴' : `show all ${count} ▾`;
    toggle.addEventListener('click', () => {
      this.showAll = !this.showAll;
      this.storage.save('showAll', this.showAll);
      this.renderVoicings();
    });
    return toggle;
  }

  renderVoicings() {
    const container = document.getElementById('preview-area');
    const jumpArea = document.getElementById('jump-area');
    container.innerHTML = '';
    jumpArea.innerHTML = '';

    const tuning = this.tunings.get(this.currentTuning);
    const displayName = this.getChordDisplayName(this.currentRoot, this.currentQuality, this.currentInversion);
    const voicings = this.currentVoicings();

    if (voicings.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'voicings-empty';
      empty.textContent = `No playable ${displayName} voicings in this tuning.`;
      container.appendChild(empty);
      return;
    }

    if (this.showAll) {
      const grid = document.createElement('div');
      grid.className = 'voicings-grid';
      for (const voicing of voicings) {
        const wrapper = document.createElement('div');
        wrapper.className = 'chord-card chord-voicing';
        wrapper.appendChild(this.renderer.render(voicing, displayName, tuning.openNotes));
        wrapper.appendChild(this.makeAddButton(voicing, displayName));
        grid.appendChild(wrapper);
      }
      container.appendChild(grid);
      container.appendChild(this.makeShowAllToggle(voicings.length));
      return;
    }

    // Stepper: one voicing at a time with prev/next navigation.
    this.voicingIndex = Math.max(0, Math.min(this.voicingIndex, voicings.length - 1));
    const voicing = voicings[this.voicingIndex];

    const jump = this.makeJumpChips(voicings);
    if (jump) jumpArea.appendChild(jump);

    const stepper = document.createElement('div');
    stepper.className = 'voicings-stepper';

    const nav = document.createElement('div');
    nav.className = 'stepper-nav';

    const prev = document.createElement('button');
    prev.className = 'stepper-arrow';
    prev.textContent = '◀';
    prev.setAttribute('aria-label', 'Previous voicing');
    prev.disabled = this.voicingIndex === 0;
    prev.addEventListener('click', () => this.stepVoicing(-1));

    const label = document.createElement('span');
    label.className = 'stepper-label';
    label.innerHTML = `shape ${this.voicingIndex + 1} of ${voicings.length}` +
      `<span class="stepper-pos">${this.positionLabel(voicing)}</span>`;

    const next = document.createElement('button');
    next.className = 'stepper-arrow';
    next.textContent = '▶';
    next.setAttribute('aria-label', 'Next voicing');
    next.disabled = this.voicingIndex === voicings.length - 1;
    next.addEventListener('click', () => this.stepVoicing(1));

    nav.appendChild(prev);
    nav.appendChild(label);
    nav.appendChild(next);

    const card = document.createElement('div');
    card.className = 'chord-card chord-voicing';
    card.appendChild(this.renderer.render(voicing, displayName, tuning.openNotes));

    const actions = document.createElement('div');
    actions.className = 'stepper-actions';
    actions.appendChild(this.makeAddButton(voicing, displayName));
    actions.appendChild(this.makeShowAllToggle(voicings.length));

    stepper.appendChild(nav);
    stepper.appendChild(card);
    stepper.appendChild(actions);
    container.appendChild(stepper);
  }

  stepVoicing(delta) {
    this.voicingIndex += delta;
    this.renderVoicings();
  }

  addVoicing(voicing, displayName) {
    this.chords.push({
      root: this.currentRoot,
      quality: this.currentQuality,
      inversion: this.currentInversion,
      tuningKey: this.currentTuning,
      openNotes: this.tunings.get(this.currentTuning).openNotes.slice(),
      displayName,
      frets: voicing.frets.slice(),
      notes: voicing.notes.slice(),
    });
    this.persist();
    this.renderCollection();
  }

  persist() {
    this.storage.save('chords', this.chords);
  }

  voicingFromStored(c) {
    return { frets: c.frets, notes: c.notes, muted: c.frets.map(f => f === -1) };
  }

  renderCollection() {
    const container = document.getElementById('chord-collection');
    container.innerHTML = '';

    const actions = document.getElementById('collection-actions');
    if (actions) actions.style.display = this.chords.length > 0 ? 'flex' : 'none';

    if (this.chords.length === 0) return;

    for (let i = 0; i < this.chords.length; i++) {
      const c = this.chords[i];
      const svg = this.renderer.render(this.voicingFromStored(c), c.displayName, c.openNotes);
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

  buildExportSVG() {
    const gap = 10;
    let xOffset = 10;
    let maxHeight = 0;
    let body = '';

    for (const c of this.chords) {
      const numStrings = c.frets.length;
      const fretted = c.frets.filter(f => f > 0);
      const span = fretted.length > 0 ? Math.max(...fretted) - Math.min(...fretted) : 0;
      const numFrets = Math.max(this.renderer.config.numFrets, span + 1);
      const dw = this.renderer.getDiagramWidth(numStrings);
      const dh = this.renderer.getDiagramHeight(numFrets);
      maxHeight = Math.max(maxHeight, dh);

      const svg = this.renderer.render(this.voicingFromStored(c), c.displayName, c.openNotes);
      body += `<g transform="translate(${xOffset}, 10)">\n${svg.innerHTML}\n</g>\n`;
      xOffset += dw + gap;
    }

    const totalWidth = xOffset - gap + 10;
    const totalHeight = maxHeight + 40;

    const footerTuning = this.tunings.get(this.chords[0].tuningKey) || this.tunings.get(this.currentTuning);
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">\n`;
    svgContent += `<rect width="${totalWidth}" height="${totalHeight}" fill="white"/>\n`;
    svgContent += body;
    svgContent += `<text x="${totalWidth / 2}" y="${totalHeight - 5}" text-anchor="middle" font-size="10" fill="#999">${footerTuning.shortName}: ${footerTuning.openNotes.join(' ')}</text>\n`;
    svgContent += `</svg>`;

    const chordNames = this.chords.map(c => c.displayName).join('-');
    const filename = `chords-${footerTuning.shortName.replace(/\s+/g, '-').toLowerCase()}-${chordNames.replace(/\s+/g, '').replace(/[#]/g, 'sharp').replace(/\//g, '-')}`;

    return { svgContent, totalWidth, totalHeight, filename };
  }

  exportSVG() {
    if (this.chords.length === 0) return;
    const { svgContent, filename } = this.buildExportSVG();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportPNG() {
    if (this.chords.length === 0) return;
    const { svgContent, totalWidth, totalHeight, filename } = this.buildExportSVG();
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth * scale;
    canvas.height = totalHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    const img = new Image();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, totalWidth, totalHeight);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = filename + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.banjoTool = new BanjoToolController();
  window.banjoTool.init();
});
