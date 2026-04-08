---
layout: post
title: Mini Banjo Chord Transposer
category: projects
---

<div class="text-sm">
  <p>
    An interactive chord visualizer for 5-string banjo. Select a root note and chord quality to see the fingering diagram. Toggle between mini banjo (C tuning) and standard banjo (G tuning) to see how chords transpose between the two instruments.
  </p>
  <p>
    I have a <a href="https://goldtonemusicgroup.com/goldtone/instruments/bg-mini">Gold Tone BG-Mini</a> and needed a way to convert standard banjo chord charts. The mini banjo is tuned a perfect fourth higher than standard, so the same chord shape produces a different chord on each instrument.
  </p>
</div>

<div id="banjo-tool" class="bg-white rounded-lg shadow-lg p-6 mt-8">

<div id="controls" class="mb-6 pt-4">

<div class="mb-4">
<label class="block text-sm font-medium mb-2">Tuning:</label>
<div class="flex gap-2 flex-wrap">
<button data-tuning="mini" class="toggle-btn toggle-active">Mini Banjo (C)</button>
<button data-tuning="standard" class="toggle-btn">Standard Banjo (G)</button>
</div>
</div>

<div class="mb-4">
<label class="block text-sm font-medium mb-2">Root:</label>
<div class="flex gap-2 flex-wrap" id="root-buttons">
<button data-root="C" class="toggle-btn toggle-sm">C</button>
<button data-root="C#" class="toggle-btn toggle-sm">C#</button>
<button data-root="D" class="toggle-btn toggle-sm">D</button>
<button data-root="D#" class="toggle-btn toggle-sm">D#</button>
<button data-root="E" class="toggle-btn toggle-sm">E</button>
<button data-root="F" class="toggle-btn toggle-sm">F</button>
<button data-root="F#" class="toggle-btn toggle-sm">F#</button>
<button data-root="G" class="toggle-btn toggle-sm toggle-active">G</button>
<button data-root="G#" class="toggle-btn toggle-sm">G#</button>
<button data-root="A" class="toggle-btn toggle-sm">A</button>
<button data-root="A#" class="toggle-btn toggle-sm">A#</button>
<button data-root="B" class="toggle-btn toggle-sm">B</button>
</div>
</div>

<div class="mb-4">
<label class="block text-sm font-medium mb-2">Quality:</label>
<div class="flex gap-2 flex-wrap" id="quality-buttons">
<button data-quality="major" class="toggle-btn toggle-sm toggle-active">Major</button>
<button data-quality="minor" class="toggle-btn toggle-sm">Minor</button>
<button data-quality="diminished" class="toggle-btn toggle-sm">Dim</button>
<button data-quality="augmented" class="toggle-btn toggle-sm">Aug</button>
<button data-quality="dominant7" class="toggle-btn toggle-sm">7</button>
<button data-quality="major7" class="toggle-btn toggle-sm">Maj7</button>
<button data-quality="minor7" class="toggle-btn toggle-sm">m7</button>
</div>
</div>

<div class="mb-4">
<label class="block text-sm font-medium mb-2">Position:</label>
<div class="flex gap-2 flex-wrap" id="position-buttons">
<button data-position="0" class="toggle-btn toggle-sm toggle-active">Open</button>
<button data-position="3" class="toggle-btn toggle-sm">3rd</button>
<button data-position="5" class="toggle-btn toggle-sm">5th</button>
<button data-position="7" class="toggle-btn toggle-sm">7th</button>
<button data-position="9" class="toggle-btn toggle-sm">9th</button>
</div>
</div>

<div class="flex gap-4 items-center flex-wrap">
<button id="add-chord" class="action-btn">Add Chord</button>
<div id="collection-actions" class="flex gap-4 items-center" style="display: none;">
<button id="clear-chords" class="text-sm cursor-pointer hover:opacity-70 transition-opacity green-text-button">Clear All</button>
<button id="export-svg" class="text-sm cursor-pointer hover:opacity-70 transition-opacity green-text-button">Save as SVG</button>
<button id="export-png" class="text-sm cursor-pointer hover:opacity-70 transition-opacity green-text-button">Save as PNG</button>
</div>
</div>

</div>

<div id="chord-area" class="flex flex-wrap gap-4 items-start mt-4 mb-4">
<div id="preview-area">
</div>
<div id="chord-collection" class="contents">
</div>
</div>

<div class="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
<p>Version 0.3.0 &bull; <a href="https://github.com/dmerand/donald.merand.org" class="text-gray-500 hover:text-gray-700 underline">Source code</a></p>
</div>

</div>

<!-- banjo-chord-script -->
<script>
/*
 * Mini Banjo Chord Transposer
 * Version: 0.3.0
 * Built: 2026-04-08T14:02:29.804Z
 * Generated automatically - do not edit directly
 */
// === core/musical-theory.js ===
/**
 * Core musical theory utilities
 * Pure functions with no DOM dependencies
 */

class MusicalTheory {
  constructor() {
    this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  }

  noteToSemitone(noteName) {
    const idx = this.noteNames.indexOf(noteName);
    if (idx === -1) throw new Error(`Unknown note: ${noteName}`);
    return idx;
  }

  semitoneToNote(semitone) {
    return this.noteNames[((semitone % 12) + 12) % 12];
  }

  transpose(noteName, semitones) {
    return this.semitoneToNote(this.noteToSemitone(noteName) + semitones);
  }

  chordNotes(rootName, intervals) {
    const rootSemitone = this.noteToSemitone(rootName);
    return intervals.map(i => this.semitoneToNote(rootSemitone + i));
  }

  chordSemitones(rootName, intervals) {
    const rootSemitone = this.noteToSemitone(rootName);
    return intervals.map(i => ((rootSemitone + i) % 12 + 12) % 12);
  }
}

// === core/chord-library.js ===
/**
 * Chord definitions and quality formulas
 * Pure data + lookup, no DOM dependencies
 */

class ChordLibrary {
  constructor() {
    this.qualities = {
      'major':      { intervals: [0, 4, 7],     suffix: '',     name: 'Major' },
      'minor':      { intervals: [0, 3, 7],     suffix: 'm',    name: 'Minor' },
      'diminished': { intervals: [0, 3, 6],     suffix: 'dim',  name: 'Diminished' },
      'augmented':  { intervals: [0, 4, 8],     suffix: 'aug',  name: 'Augmented' },
      'dominant7':  { intervals: [0, 4, 7, 10], suffix: '7',    name: 'Dominant 7th' },
      'major7':     { intervals: [0, 4, 7, 11], suffix: 'maj7', name: 'Major 7th' },
      'minor7':     { intervals: [0, 3, 7, 10], suffix: 'm7',   name: 'Minor 7th' },
    };
  }

  getChord(rootName, qualityKey) {
    const quality = this.qualities[qualityKey];
    if (!quality) throw new Error(`Unknown quality: ${qualityKey}`);
    return {
      root: rootName,
      quality: qualityKey,
      intervals: quality.intervals,
      displayName: rootName + quality.suffix,
      fullName: rootName + ' ' + quality.name,
    };
  }
}

// === core/banjo-tunings.js ===
/**
 * Banjo tuning definitions
 * Strings indexed 5(drone) -> 4 -> 3 -> 2 -> 1 (highest)
 */

class BanjoTunings {
  constructor(theory) {
    this.theory = theory;
    this.tunings = {
      'standard': {
        name: 'Standard Banjo (G)',
        shortName: 'G Tuning',
        openNotes: ['G', 'D', 'G', 'B', 'D'],
        openSemitones: [7, 2, 7, 11, 2],
      },
      'mini': {
        name: 'Mini Banjo (C)',
        shortName: 'C Tuning',
        openNotes: ['C', 'G', 'C', 'E', 'G'],
        openSemitones: [0, 7, 0, 4, 7],
      },
    };
  }

  get(tuningKey) {
    return this.tunings[tuningKey];
  }

  noteAtFret(tuningKey, stringIndex, fret) {
    const tuning = this.tunings[tuningKey];
    const semitone = (tuning.openSemitones[stringIndex] + fret) % 12;
    return this.theory.semitoneToNote(semitone);
  }

  semitoneAtFret(tuningKey, stringIndex, fret) {
    const tuning = this.tunings[tuningKey];
    return (tuning.openSemitones[stringIndex] + fret) % 12;
  }
}

// === core/banjo-voicer.js ===
/**
 * Algorithmic chord voicing finder for 5-string banjo
 *
 * Supports first-position (open) voicings and higher positions up the neck.
 * Position 0 = open/first position, position N = favor frets near fret N.
 */

class BanjoVoicer {
  constructor(theory, tunings) {
    this.theory = theory;
    this.tunings = tunings;
    this.maxFret = 12;
    this.maxSpan = 4;
  }

  findBestVoicing(chordSemitones, rootSemitone, tuningKey, position = 0) {
    const tuning = this.tunings.get(tuningKey);

    const drone5open = tuning.openSemitones[0];
    const string5 = (position === 0 && chordSemitones.includes(drone5open)) ? 0 : -1;

    // Include open string as candidate even if not a chord tone (conventional compromise)
    const candidates = [];
    for (let s = 1; s <= 4; s++) {
      const stringCandidates = [];
      const openSemitone = tuning.openSemitones[s];
      if (position === 0) {
        if (!chordSemitones.includes(openSemitone)) {
          stringCandidates.push({ fret: 0, semitone: openSemitone, nonChordTone: true });
        }
      }
      for (let f = 0; f <= this.maxFret; f++) {
        if (position > 0 && f === 0) continue; // skip open strings for higher positions
        const semitone = (tuning.openSemitones[s] + f) % 12;
        if (chordSemitones.includes(semitone)) {
          stringCandidates.push({ fret: f, semitone, nonChordTone: false });
        }
      }
      candidates.push(stringCandidates);
    }

    let bestVoicing = null;
    let bestScore = -Infinity;

    const search = (stringIdx, current) => {
      if (stringIdx === 4) {
        const score = this.scoreVoicing(current, chordSemitones, rootSemitone, tuning, string5, position);
        if (score > bestScore) {
          bestScore = score;
          bestVoicing = [...current];
        }
        return;
      }
      for (const candidate of candidates[stringIdx]) {
        current[stringIdx] = candidate;
        search(stringIdx + 1, current);
      }
    };

    search(0, new Array(4));

    if (!bestVoicing) {
      return {
        frets: [string5, 0, 0, 0, 0],
        notes: tuning.openNotes.slice(),
        muted: [string5 === -1, false, false, false, false],
      };
    }

    const frets = [string5, ...bestVoicing.map(c => c.fret)];
    const notes = [
      string5 >= 0 ? this.theory.semitoneToNote(drone5open) : null,
      ...bestVoicing.map(c => this.theory.semitoneToNote(c.semitone)),
    ];
    const muted = frets.map(f => f === -1);

    return { frets, notes, muted };
  }

  scoreVoicing(strings4to1, chordSemitones, rootSemitone, tuning, string5Fret, position = 0) {
    const frets = strings4to1.map(c => c.fret);
    const semitones = strings4to1.map(c => c.semitone);
    const nonChordTones = strings4to1.map(c => c.nonChordTone || false);

    // Fret span (exclude open strings)
    const frettedFrets = frets.filter(f => f > 0);
    const span = frettedFrets.length > 0
      ? Math.max(...frettedFrets) - Math.min(...frettedFrets)
      : 0;

    if (span > this.maxSpan) return -1000;

    let score = 0;

    // Chord tone coverage (only count actual chord tones)
    const chordToneSemitones = semitones.filter((s, i) => !nonChordTones[i]);
    const allSemitones = [...chordToneSemitones];
    if (string5Fret >= 0) allSemitones.push(tuning.openSemitones[0]);
    const uniqueTones = new Set(allSemitones.filter(s => chordSemitones.includes(s)));
    score += uniqueTones.size * 15;
    if (uniqueTones.size === chordSemitones.length) score += 20;

    // Root in bass (string 4, index 0) - modest bonus
    if (!nonChordTones[0] && semitones[0] === rootSemitone) score += 6;

    // Open string handling (only relevant for first position)
    if (position === 0) {
      for (let i = 0; i < 4; i++) {
        if (frets[i] === 0 && !nonChordTones[i]) {
          score += 10;
        } else if (frets[i] === 0 && nonChordTones[i]) {
          score -= 5;
        } else if (frets[i] > 0 && chordSemitones.includes(tuning.openSemitones[i + 1])) {
          score -= 8;
        }
      }
    }

    // Penalize non-chord tones
    const nctCount = nonChordTones.filter(Boolean).length;
    score -= nctCount * 6;

    if (position === 0) {
      // First position: prefer lower frets
      const totalFrets = frets.reduce((a, b) => a + b, 0);
      score -= totalFrets * 2;

      // Penalize high frets
      const maxFret = Math.max(...frets);
      if (maxFret > 5) score -= (maxFret - 5) * 5;
    } else {
      // Higher positions: prefer frets near the target position
      for (const f of frettedFrets) {
        score -= Math.abs(f - position) * 3;
      }
    }

    // Penalize span
    score -= span * 3;

    // Penalize large gaps between adjacent fretted strings (awkward hand positions)
    const frettedPositions = frets.map((f, i) => ({ fret: f, idx: i })).filter(p => p.fret > 0);
    for (let i = 1; i < frettedPositions.length; i++) {
      const gap = Math.abs(frettedPositions[i].fret - frettedPositions[i - 1].fret);
      if (gap > 2) score -= gap * 2;
    }

    return score;
  }
}

// === core/storage-manager.js ===
/**
 * localStorage wrapper for persisting UI state
 */

class StorageManager {
  constructor(prefix) {
    this.prefix = prefix;
  }

  save(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) { /* quota exceeded or private mode */ }
  }

  load(key, defaultValue) {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
}

// === chord-diagram-renderer.js ===
/**
 * SVG chord diagram renderer
 * Produces vertical fretboard diagrams for 5-string banjo
 */

class ChordDiagramRenderer {
  constructor() {
    this.config = {
      stringSpacing: 28,
      fretSpacing: 32,
      numFrets: 5,
      numStrings: 5,
      topMargin: 58,
      bottomMargin: 24,
      leftMargin: 36,
      rightMargin: 18,
      dotRadius: 10,
      indicatorRadius: 7,
      nutWidth: 5,
      titleFontSize: 20,
    };
  }

  get diagramWidth() {
    const c = this.config;
    return c.leftMargin + (c.numStrings - 1) * c.stringSpacing + c.rightMargin;
  }

  get diagramHeight() {
    const c = this.config;
    return c.topMargin + c.numFrets * c.fretSpacing + c.bottomMargin;
  }

  render(voicing, chordName, tuningNotes) {
    const c = this.config;
    const w = this.diagramWidth;
    const h = this.diagramHeight;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `${chordName} chord diagram`);

    const frettedFrets = voicing.frets.filter(f => f > 0);
    const minFret = frettedFrets.length > 0 ? Math.min(...frettedFrets) : 0;
    const maxFret = frettedFrets.length > 0 ? Math.max(...frettedFrets) : 0;

    let startFret = 1;
    if (maxFret > c.numFrets) {
      startFret = Math.max(1, minFret);
      if (maxFret - startFret >= c.numFrets) {
        startFret = maxFret - c.numFrets + 1;
      }
    }
    const atNut = startFret === 1;

    // Chord name title
    svg.appendChild(this.svgText(w / 2, 16, chordName, {
      fontSize: c.titleFontSize, fontWeight: 'bold', textAnchor: 'middle',
    }));

    // Fretboard geometry
    const fretboardTop = c.topMargin;
    const fretboardLeft = c.leftMargin;
    const fretboardWidth = (c.numStrings - 1) * c.stringSpacing;

    // Fret lines
    for (let i = 0; i <= c.numFrets; i++) {
      const y = fretboardTop + i * c.fretSpacing;
      svg.appendChild(this.svgLine(fretboardLeft, y, fretboardLeft + fretboardWidth, y, {
        stroke: '#333',
        strokeWidth: i === 0 && atNut ? c.nutWidth : 1,
      }));
    }

    // String lines
    for (let i = 0; i < c.numStrings; i++) {
      const x = fretboardLeft + i * c.stringSpacing;
      svg.appendChild(this.svgLine(x, fretboardTop, x, fretboardTop + c.numFrets * c.fretSpacing, {
        stroke: '#333',
        strokeWidth: i === 0 ? 1.5 : 1,
      }));
    }

    // Fret numbers on the left
    for (let i = 0; i < c.numFrets; i++) {
      const y = fretboardTop + (i + 0.5) * c.fretSpacing + 5;
      svg.appendChild(this.svgText(
        fretboardLeft - 16, y,
        String(startFret + i),
        { fontSize: 11, textAnchor: 'middle', fill: '#999' }
      ));
    }

    // Indicator Y position: vertically centered between title and nut
    const indicatorY = fretboardTop - c.indicatorRadius - 6;

    // Open / muted indicators and finger dots
    for (let s = 0; s < c.numStrings; s++) {
      const x = fretboardLeft + s * c.stringSpacing;
      const fret = voicing.frets[s];

      if (fret === -1) {
        const r = c.indicatorRadius * 0.7;
        const cx = x;
        const cy = indicatorY;
        svg.appendChild(this.svgLine(cx - r, cy - r, cx + r, cy + r, {
          stroke: '#666', strokeWidth: 2,
        }));
        svg.appendChild(this.svgLine(cx - r, cy + r, cx + r, cy - r, {
          stroke: '#666', strokeWidth: 2,
        }));
      } else if (fret === 0) {
        svg.appendChild(this.svgCircle(x, indicatorY, c.indicatorRadius, {
          fill: 'none', stroke: '#333', strokeWidth: 1.5,
        }));
      } else {
        const displayFret = fret - startFret + 1;
        if (displayFret >= 1 && displayFret <= c.numFrets) {
          const y = fretboardTop + (displayFret - 0.5) * c.fretSpacing;
          svg.appendChild(this.svgCircle(x, y, c.dotRadius, {
            fill: '#333', stroke: 'none',
          }));
          svg.appendChild(this.svgText(x, y + 4, voicing.notes[s], {
            fontSize: 11, textAnchor: 'middle', fill: '#fff', fontWeight: 'bold',
          }));
        }
      }
    }

    // String labels at bottom
    for (let s = 0; s < c.numStrings; s++) {
      const x = fretboardLeft + s * c.stringSpacing;
      svg.appendChild(this.svgText(
        x, fretboardTop + c.numFrets * c.fretSpacing + 18,
        tuningNotes[s],
        { fontSize: 12, textAnchor: 'middle', fill: '#999' }
      ));
    }

    return svg;
  }

  svgLine(x1, y1, x2, y2, attrs = {}) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    for (const [key, val] of Object.entries(attrs)) {
      line.setAttribute(key === 'strokeWidth' ? 'stroke-width' : key, val);
    }
    return line;
  }

  svgCircle(cx, cy, r, attrs = {}) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    for (const [key, val] of Object.entries(attrs)) {
      circle.setAttribute(key === 'strokeWidth' ? 'stroke-width' : key, val);
    }
    return circle;
  }

  svgText(x, y, text, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.textContent = text;
    const attrMap = {
      fontSize: 'font-size', fontWeight: 'font-weight',
      textAnchor: 'text-anchor', strokeWidth: 'stroke-width',
    };
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(attrMap[key] || key, val);
    }
    return el;
  }
}

// === widget.js ===
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
    document.getElementById('export-png').addEventListener('click', () => this.exportPNG());

    this.syncToggleButtons();
    this.renderPreview();
    this.renderCollection();
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
    document.querySelectorAll('[data-position]').forEach(btn => {
      const active = Number(btn.dataset.position) === this.currentPosition;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
  }

  setTuning(tuningKey) {
    this.currentTuning = tuningKey;
    this.storage.save('tuning', tuningKey);
    document.querySelectorAll('[data-tuning]').forEach(btn => {
      const active = btn.dataset.tuning === tuningKey;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
    });
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
    this.renderPreview();
  }

  setPosition(position) {
    this.currentPosition = position;
    this.storage.save('position', position);
    document.querySelectorAll('[data-position]').forEach(btn => {
      const active = Number(btn.dataset.position) === position;
      btn.classList.toggle('toggle-active', active);
      btn.setAttribute('aria-pressed', active);
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

  buildExportSVG() {
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

    const chordNames = allChords.map(c => this.chordLib.getChord(c.root, c.quality).displayName).join('-');
    const filename = `banjo-${tuning.shortName.replace(/\s+/g, '-').toLowerCase()}-${chordNames.replace(/\s+/g, '').replace(/[#]/g, 'sharp')}`;

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

// Initialize the widget when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.banjoTool = new BanjoToolController();
  window.banjoTool.init();
});


</script>

<style>
#banjo-tool {
  max-width: 100%;
}

/* Toggle buttons */
.toggle-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #fff;
  color: #333;
  border: 2px solid #d1d5db;
  user-select: none;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.toggle-btn:hover:not(.toggle-disabled) {
  border-color: #333;
}

.toggle-btn.toggle-active {
  background: #333;
  color: #fff;
  border-color: #333;
}

.toggle-btn.toggle-disabled {
  opacity: 0.3;
  cursor: default;
}

.toggle-btn.toggle-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Action button */
.action-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  background: #333;
  color: #fff;
  border: 2px solid #333;
  user-select: none;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.action-btn:hover {
  opacity: 0.8;
}

/* Chord display area */
#chord-area {
  min-height: 220px;
  align-items: flex-start;
}

.chord-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 166px;
}

.green-text-button {
  color: #137752;
}

.tuning-label {
  font-size: 0.7rem;
  color: #999;
  text-align: center;
  margin-top: 2px;
}

#chord-collection {
  display: contents;
}

.remove-btn {
  font-size: 0.7rem;
  cursor: pointer;
  color: #999;
  background: none;
  border: none;
  margin-top: 2px;
  font-family: inherit;
  transition: opacity 0.15s ease;
}

.remove-btn:hover {
  opacity: 0.6;
}

.chord-card svg {
  display: block;
  height: auto;
}

/* Responsive */
@media (max-width: 640px) {
  #banjo-tool {
    padding: 12px;
  }

  .toggle-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }

  .toggle-btn.toggle-sm {
    padding: 5px 8px;
    font-size: 0.75rem;
  }

  .action-btn {
    padding: 8px 14px;
    font-size: 0.8rem;
  }

  .chord-card {
    width: 100%;
  }

  .chord-card svg {
    width: 100% !important;
  }

  #preview-area {
    width: 100%;
  }

  .remove-btn {
    font-size: 0.9rem;
    padding: 8px 16px;
  }
}

/* Print styles */
@media print {
  @page {
    size: landscape;
    margin: 0.5in;
  }

  .noprint, #controls, footer, nav, header {
    display: none !important;
  }

  body { margin: 0; padding: 0; }

  #banjo-tool {
    max-width: none;
    width: 100vw;
    margin: 0;
    padding: 20px;
    box-shadow: none;
  }
}
</style>

## How It Works

The standard 5-string banjo is tuned to open G: **g D G B D**. The [Gold Tone BG-Mini](https://goldtonemusicgroup.com/goldtone/instruments/bg-mini) is a short-scale banjo tuned a perfect fourth higher, giving open C tuning: **c G C E G**.

This means **every chord shape you know from standard banjo produces a chord five semitones (a perfect fourth) higher on the mini**. A "G shape" on the mini sounds as C. A "D shape" sounds as G. This tool shows you the correct fingerings for any chord on either instrument.

The voicings are generated algorithmically — given the chord tones and the tuning, the tool searches for the most playable fingering by optimizing for open strings, small fret span, complete chord coverage, and root in the bass. Use the **Position** selector to explore voicings at different points up the neck.
