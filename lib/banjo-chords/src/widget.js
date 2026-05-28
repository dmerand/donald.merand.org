const SLIDER_CONFIG = [
  { key: 'completeness', label: 'Completeness', actualMin: 0, actualMax: 100, low: 'partial', high: 'all tones', type: 'weight',
    tip: 'How strongly to prefer voicings with every chord tone sounding' },
  { key: 'doubledNote', label: 'Doubled Notes', actualMin: -15, actualMax: 0, low: 'unique', high: 'allow', type: 'weight',
    tip: 'Penalty for repeating the same pitch class on multiple strings' },
  { key: 'stretch', label: 'Stretch', actualMin: -6, actualMax: 6, low: 'compact', high: 'wide', type: 'weight',
    tip: 'Prefer tight fret clusters or spread-out shapes' },
  { key: 'fingerGap', label: 'Finger Gap', actualMin: -4, actualMax: 2, low: 'even', high: 'allow gaps', type: 'weight',
    tip: 'Penalty for large fret jumps between adjacent strings' },
  { key: 'positionTight', label: 'Position Freedom', actualMin: -5, actualMax: 0, low: 'strict', high: 'roam', type: 'weight',
    tip: 'How tightly voicings cluster around the target position up the neck' },
  { key: 'orientation', label: 'Orientation', actualMin: -3, actualMax: 3, low: 'nut', high: 'body', type: 'weight',
    tip: 'Bias voicings toward the nut (lower frets) or the body (higher frets) relative to the position' },
  { key: 'openString', label: 'Open Strings', actualMin: -30, actualMax: 30, low: 'avoid', high: 'prefer', type: 'weight',
    tip: 'Whether to favor open strings on non-bass strings or avoid them' },
  { key: 'effort', label: 'Effort', actualMin: -5, actualMax: 0, low: 'easy', high: 'any', type: 'weight',
    tip: 'How much to penalize higher frets and more fingers in open position' },
];

function toSlider(cfg, actual) {
  return Math.round((actual - cfg.actualMin) / (cfg.actualMax - cfg.actualMin) * 100);
}

function toActual(cfg, slider) {
  return cfg.actualMin + (slider / 100) * (cfg.actualMax - cfg.actualMin);
}

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
    this.currentPosition = this.storage.load('position', 0);
    this.currentStyle = this.storage.load('style', 'open');
    this.customWeights = this.storage.load('customWeights', null);
    this.userPresets = this.storage.load('userPresets', {});
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

    const select = document.getElementById('style-select');
    select.addEventListener('change', () => this.setStyle(select.value));

    document.getElementById('add-chord').addEventListener('click', () => this.addChord());
    document.getElementById('clear-chords').addEventListener('click', () => {
      this.chords = [];
      this.persist();
      this.renderCollection();
    });
    document.getElementById('export-svg').addEventListener('click', () => this.exportSVG());
    document.getElementById('export-png').addEventListener('click', () => this.exportPNG());

    if (this.currentStyle === 'custom' && this.customWeights) {
      BanjoVoicer.STYLES.custom = this.customWeights;
    }
    for (const [name, weights] of Object.entries(this.userPresets)) {
      BanjoVoicer.STYLES['user:' + name] = weights;
    }

    this.buildSliders();
    this.rebuildPresetDropdown();
    this.syncToggleButtons();
    this.buildInversionButtons();
    this.buildPositionButtons();
    this.renderPreview();
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
    if (inversion === 0) return chord.displayName;
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
      if (i === this.currentInversion) {
        btn.classList.add('toggle-active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
      btn.addEventListener('click', () => this.setInversion(i));
      container.appendChild(btn);
    }
  }

  buildPositionButtons() {
    const container = document.getElementById('position-buttons');
    container.innerHTML = '';

    const bassSemitone = this.getBassSemitone();
    const positions = this.voicer.findAvailablePositions(bassSemitone, this.currentTuning);

    if (!positions.includes(this.currentPosition)) {
      this.currentPosition = positions.length > 0 ? positions[0] : 0;
      this.storage.save('position', this.currentPosition);
    }

    for (const pos of positions) {
      const btn = document.createElement('button');
      btn.className = 'toggle-btn toggle-sm';
      btn.textContent = pos === 0 ? 'Open' : String(pos);
      btn.dataset.position = pos;
      if (pos === this.currentPosition) {
        btn.classList.add('toggle-active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
      btn.addEventListener('click', () => this.setPosition(pos));
      container.appendChild(btn);
    }
  }

  setInversion(inv) {
    this.currentInversion = inv;
    this.storage.save('inversion', inv);
    document.querySelectorAll('[data-inversion]').forEach(btn => {
      const active = Number(btn.dataset.inversion) === inv;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    this.buildPositionButtons();
    this.renderPreview();
  }

  buildSliders() {
    const panel = document.getElementById('slider-panel');
    const weights = this.getActiveWeights();

    for (const cfg of SLIDER_CONFIG) {
      const group = document.createElement('div');
      group.className = 'slider-group';

      const tagLetter = cfg.type === 'limit' ? 'l' : 'w';

      const label = document.createElement('label');
      label.setAttribute('for', 'slider-' + cfg.key);
      label.title = cfg.tip;
      label.innerHTML = cfg.label + ' <span class="slider-type-hint">' + tagLetter + '</span>';

      const input = document.createElement('input');
      input.type = 'range';
      input.id = 'slider-' + cfg.key;
      input.min = 0;
      input.max = 100;
      input.step = 1;
      input.value = toSlider(cfg, weights[cfg.key]);
      input.addEventListener('input', () => {
        const actual = toActual(cfg, Number(input.value));
        this.onSliderChange(cfg.key, Math.round(actual * 10) / 10);
      });

      const extremes = document.createElement('div');
      extremes.className = 'slider-extremes';
      extremes.innerHTML = '<span>' + cfg.low + '</span><span>' + cfg.high + '</span>';

      group.appendChild(label);
      group.appendChild(input);
      group.appendChild(extremes);
      panel.appendChild(group);
    }

    const checkGroup = document.createElement('div');
    checkGroup.className = 'slider-group';
    checkGroup.innerHTML = '<div class="slider-checkbox">' +
      '<input type="checkbox" id="slider-allowWrongNotes" ' + (weights.allowWrongNotes ? 'checked' : '') + '>' +
      '<label for="slider-allowWrongNotes">Allow Wrong Notes</label>' +
      '</div><div class="slider-checkbox">' +
      '<input type="checkbox" id="slider-allowMuting" ' + (weights.allowMuting !== false ? 'checked' : '') + '>' +
      '<label for="slider-allowMuting">Allow Muted Strings</label></div>';
    checkGroup.querySelector('#slider-allowWrongNotes').addEventListener('change', (e) => {
      this.onSliderChange('allowWrongNotes', e.target.checked);
    });
    checkGroup.querySelector('#slider-allowMuting').addEventListener('change', (e) => {
      this.onSliderChange('allowMuting', e.target.checked);
    });
    panel.appendChild(checkGroup);

    const saveRow = document.createElement('div');
    saveRow.className = 'slider-save-row';
    saveRow.innerHTML = '<input type="text" id="preset-name" placeholder="Preset name" class="preset-name-input">' +
      '<button id="save-preset" class="preset-btn">Save</button>' +
      '<button id="delete-preset" class="preset-btn preset-btn-danger" style="display:none">Delete</button>';
    panel.appendChild(saveRow);

    document.getElementById('save-preset').addEventListener('click', () => this.savePreset());
    document.getElementById('delete-preset').addEventListener('click', () => this.deletePreset());
  }

  rebuildPresetDropdown() {
    const select = document.getElementById('style-select');
    select.querySelectorAll('optgroup.user-presets').forEach(g => g.remove());

    const names = Object.keys(this.userPresets);
    if (names.length > 0) {
      const group = document.createElement('optgroup');
      group.label = 'Saved';
      group.className = 'user-presets';
      for (const name of names) {
        const opt = document.createElement('option');
        opt.value = 'user:' + name;
        opt.textContent = name;
        group.appendChild(opt);
      }
      const customOpt = select.querySelector('option[value="custom"]');
      select.insertBefore(group, customOpt);
    }
    select.value = this.currentStyle;
    this.updateDeleteButton();
  }

  updateDeleteButton() {
    const btn = document.getElementById('delete-preset');
    const input = document.getElementById('preset-name');
    if (btn) btn.style.display = this.currentStyle.startsWith('user:') ? '' : 'none';
    if (input) input.value = this.currentStyle.startsWith('user:') ? this.currentStyle.slice(5) : '';
  }

  savePreset() {
    const input = document.getElementById('preset-name');
    const name = (input.value || '').trim();
    if (!name) return;
    const weights = { ...this.getActiveWeights() };
    this.userPresets[name] = weights;
    this.storage.save('userPresets', this.userPresets);
    BanjoVoicer.STYLES['user:' + name] = weights;
    this.currentStyle = 'user:' + name;
    this.storage.save('style', this.currentStyle);
    input.value = '';
    this.rebuildPresetDropdown();
    this.updateDeleteButton();
  }

  deletePreset() {
    if (!this.currentStyle.startsWith('user:')) return;
    const name = this.currentStyle.slice(5);
    delete this.userPresets[name];
    delete BanjoVoicer.STYLES[this.currentStyle];
    this.storage.save('userPresets', this.userPresets);
    this.customWeights = null;
    this.storage.save('customWeights', null);
    this.currentStyle = 'open';
    this.storage.save('style', 'open');
    const customOpt = document.getElementById('style-select').querySelector('option[value="custom"]');
    customOpt.disabled = true;
    customOpt.hidden = true;
    this.rebuildPresetDropdown();
    this.syncSliders();
    this.renderPreview();
  }

  getActiveWeights() {
    if (this.currentStyle === 'custom' && this.customWeights) return this.customWeights;
    if (this.currentStyle.startsWith('user:')) {
      const name = this.currentStyle.slice(5);
      if (this.userPresets[name]) return this.userPresets[name];
    }
    return BanjoVoicer.STYLES[this.currentStyle] || BanjoVoicer.STYLES.easy;
  }

  syncSliders() {
    const weights = this.getActiveWeights();
    for (const cfg of SLIDER_CONFIG) {
      const input = document.getElementById('slider-' + cfg.key);
      if (input) input.value = toSlider(cfg, weights[cfg.key]);
    }
    const checkbox = document.getElementById('slider-allowWrongNotes');
    if (checkbox) checkbox.checked = !!weights.allowWrongNotes;
    const muteCheckbox = document.getElementById('slider-allowMuting');
    if (muteCheckbox) muteCheckbox.checked = weights.allowMuting !== false;
  }

  onSliderChange(key, value) {
    const base = this.getActiveWeights();
    this.customWeights = { ...base, [key]: value };
    BanjoVoicer.STYLES.custom = this.customWeights;
    this.currentStyle = 'custom';
    this.storage.save('style', 'custom');
    this.storage.save('customWeights', this.customWeights);

    const select = document.getElementById('style-select');
    const customOpt = select.querySelector('option[value="custom"]');
    customOpt.disabled = false;
    customOpt.hidden = false;
    select.value = 'custom';

    this.renderPreview();
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

    const select = document.getElementById('style-select');
    if (this.currentStyle === 'custom') {
      const customOpt = select.querySelector('option[value="custom"]');
      customOpt.disabled = false;
      customOpt.hidden = false;
    }
    select.value = this.currentStyle;
  }

  setTuning(tuningKey) {
    this.currentTuning = tuningKey;
    this.storage.save('tuning', tuningKey);
    document.querySelectorAll('[data-tuning]').forEach(btn => {
      const active = btn.dataset.tuning === tuningKey;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    this.buildPositionButtons();
    this.renderPreview();
    this.renderCollection();
  }

  setRoot(root) {
    this.currentRoot = root;
    this.storage.save('root', root);
    document.querySelectorAll('[data-root]').forEach(btn => {
      const active = btn.dataset.root === root;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    this.buildInversionButtons();
    this.buildPositionButtons();
    this.renderPreview();
  }

  setQuality(quality) {
    this.currentQuality = quality;
    this.storage.save('quality', quality);
    document.querySelectorAll('[data-quality]').forEach(btn => {
      const active = btn.dataset.quality === quality;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    this.buildInversionButtons();
    this.buildPositionButtons();
    this.renderPreview();
  }

  setPosition(position) {
    this.currentPosition = position;
    this.storage.save('position', position);
    document.querySelectorAll('#position-buttons [data-position]').forEach(btn => {
      const active = Number(btn.dataset.position) === position;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    this.renderPreview();
  }

  setStyle(style) {
    this.currentStyle = style;
    this.storage.save('style', style);
    if (style !== 'custom' && !style.startsWith('user:')) {
      this.customWeights = null;
      this.storage.save('customWeights', null);
      const customOpt = document.getElementById('style-select').querySelector('option[value="custom"]');
      customOpt.disabled = true;
      customOpt.hidden = true;
    }
    this.syncSliders();
    this.updateDeleteButton();
    this.renderPreview();
  }

  addChord() {
    const style = this.currentStyle;
    const weights = style === 'custom' ? { ...this.customWeights } : null;
    this.chords.push({
      root: this.currentRoot,
      quality: this.currentQuality,
      inversion: this.currentInversion,
      position: this.currentPosition,
      style,
      weights,
    });
    this.persist();
    this.renderCollection();
  }

  persist() {
    this.storage.save('chords', this.chords);
  }

  renderChordDiagram(root, quality, inversion = 0, position = 0, style = null) {
    const tuning = this.tunings.get(this.currentTuning);
    const chord = this.chordLib.getChord(root, quality);
    const semitones = this.theory.chordSemitones(root, chord.intervals);
    const rootSemitone = this.theory.noteToSemitone(root);
    const spelling = this.theory.chordSpelling(root, chord.intervals);
    const bassSemitone = semitones[inversion] !== undefined ? semitones[inversion] : semitones[0];
    const displayName = this.getChordDisplayName(root, quality, inversion);
    const voicing = this.voicer.findBestVoicing(semitones, rootSemitone, this.currentTuning, bassSemitone, position, spelling, style || this.currentStyle);
    return this.renderer.render(voicing, displayName, tuning.openNotes);
  }

  updatePositionButtons() {
    const chord = this.chordLib.getChord(this.currentRoot, this.currentQuality);
    const semitones = this.theory.chordSemitones(this.currentRoot, chord.intervals);
    const rootSemitone = this.theory.noteToSemitone(this.currentRoot);
    const bassSemitone = this.getBassSemitone();

    const seen = [];
    document.querySelectorAll('#position-buttons [data-position]').forEach(btn => {
      const pos = Number(btn.dataset.position);
      const voicing = this.voicer.findBestVoicing(semitones, rootSemitone, this.currentTuning, bassSemitone, pos, null, this.currentStyle);
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
    const svg = this.renderChordDiagram(this.currentRoot, this.currentQuality, this.currentInversion, this.currentPosition);
    const wrapper = document.createElement('div');
    wrapper.className = 'chord-card chord-preview';
    wrapper.appendChild(svg);
    container.appendChild(wrapper);
  }

  renderCollection() {
    const container = document.getElementById('chord-collection');
    container.innerHTML = '';

    const actions = document.getElementById('collection-actions');
    if (actions) actions.style.display = this.chords.length > 0 ? 'flex' : 'none';

    if (this.chords.length === 0) return;

    for (let i = 0; i < this.chords.length; i++) {
      const { root, quality, inversion, position, style, weights } = this.chords[i];
      if (style === 'custom' && weights) BanjoVoicer.STYLES._saved = weights;
      const useStyle = (style === 'custom' && weights) ? '_saved' : (style || this.currentStyle);
      const svg = this.renderChordDiagram(root, quality, inversion || 0, position || 0, useStyle);
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
    const tuning = this.tunings.get(this.currentTuning);
    const dw = this.renderer.getDiagramWidth(tuning.numStrings);
    const allChords = [...this.chords];
    let maxNumFrets = this.renderer.config.numFrets;
    for (const { root, quality, inversion, position, style, weights } of allChords) {
      if (style === 'custom' && weights) BanjoVoicer.STYLES._saved = weights;
      const useStyle = (style === 'custom' && weights) ? '_saved' : (style || this.currentStyle);
      const chord = this.chordLib.getChord(root, quality);
      const sem = this.theory.chordSemitones(root, chord.intervals);
      const rs = this.theory.noteToSemitone(root);
      const bassSem = sem[inversion || 0] || sem[0];
      const v = this.voicer.findBestVoicing(sem, rs, this.currentTuning, bassSem, position || 0, null, useStyle);
      const ff = v.frets.filter(f => f > 0);
      if (ff.length > 0) maxNumFrets = Math.max(maxNumFrets, Math.max(...ff) - Math.min(...ff) + 1);
    }
    const dh = this.renderer.getDiagramHeight(maxNumFrets);
    const gap = 10;
    const totalWidth = allChords.length * (dw + gap) - gap + 20;
    const totalHeight = dh + 40;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">\n`;
    svgContent += `<rect width="${totalWidth}" height="${totalHeight}" fill="white"/>\n`;

    for (let i = 0; i < allChords.length; i++) {
      const { root, quality, inversion, position, style, weights } = allChords[i];
      if (style === 'custom' && weights) BanjoVoicer.STYLES._saved = weights;
      const useStyle = (style === 'custom' && weights) ? '_saved' : (style || this.currentStyle);
      const svg = this.renderChordDiagram(root, quality, inversion || 0, position || 0, useStyle);
      const xOffset = 10 + i * (dw + gap);
      svgContent += `<g transform="translate(${xOffset}, 10)">\n`;
      svgContent += svg.innerHTML;
      svgContent += `\n</g>\n`;
    }

    svgContent += `<text x="${totalWidth / 2}" y="${totalHeight - 5}" text-anchor="middle" font-size="10" fill="#999">${tuning.shortName}: ${tuning.openNotes.join(' ')}</text>\n`;
    svgContent += `</svg>`;

    const chordNames = allChords.map(c => this.getChordDisplayName(c.root, c.quality, c.inversion || 0)).join('-');
    const filename = `banjo-${tuning.shortName.replace(/\s+/g, '-').toLowerCase()}-${chordNames.replace(/\s+/g, '').replace(/[#]/g, 'sharp').replace(/\//g, '-')}`;

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
