---
layout: post
title: Stringed Instrument Chord Finder
category: projects
---

<div class="text-sm">
  <p>
    A chord finder for banjo, mandolin, and guitar. Pick a tuning, root, quality, and inversion, and it shows every distinct, playable voicing up the neck. Click any shape to add it to a collection you can export as a chord sheet.
  </p>
  <p>
    <strong>Update:</strong> This started as a mini banjo transposition tool, and has since grown into a general-purpose chord finder with support for inversions and multiple instruments. See <a href="#background">below</a> for the full story.
  </p>
</div>

<div id="banjo-tool" class="bg-white rounded-lg shadow-lg p-6 mt-8">

<div id="controls" class="mb-6 pt-4">

<div class="mb-4">
<label class="block text-sm font-medium mb-2">Tuning:</label>
<div class="flex gap-2 flex-wrap">
<button data-tuning="mini" class="toggle-btn toggle-active">Mini Banjo (C)</button>
<button data-tuning="standard" class="toggle-btn">Standard Banjo (G)</button>
<button data-tuning="mandolin" class="toggle-btn">Mandolin (GDAE)</button>
<button data-tuning="guitar" class="toggle-btn">Guitar (EADGBE)</button>
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
<label class="block text-sm font-medium mb-2">Inversion:</label>
<div class="flex gap-2 flex-wrap" id="inversion-buttons">
</div>
</div>

</div>

<div id="voicings-section" class="mt-4 mb-4">
<div class="voicings-header">
<label class="block text-sm font-medium">Playable voicings up the neck:</label>
<div id="jump-area"></div>
</div>
<div id="preview-area">
</div>
</div>

<div id="collection-section" class="mt-6 pt-4 border-t border-gray-200">
<div class="flex gap-4 items-center flex-wrap mb-3">
<label class="block text-sm font-medium">Your collection:</label>
<div id="collection-actions" class="flex gap-4 items-center" style="display: none;">
<button id="clear-chords" class="text-sm cursor-pointer hover:opacity-70 transition-opacity green-text-button">Clear All</button>
<button id="export-svg" class="text-sm cursor-pointer hover:opacity-70 transition-opacity green-text-button">Save as SVG</button>
<button id="export-png" class="text-sm cursor-pointer hover:opacity-70 transition-opacity green-text-button">Save as PNG</button>
</div>
</div>
<div id="chord-collection" class="flex flex-wrap gap-4 items-start">
</div>
</div>

<div class="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
<p>Version 1.0.0 &bull; <a href="https://github.com/dmerand/donald.merand.org" class="text-gray-500 hover:text-gray-700 underline">Source code</a></p>
</div>

</div>

<!-- banjo-chord-script -->
<script>
/*
 * Mini Banjo Chord Transposer
 * Version: 1.0.0
 * Built: 2026-06-18T01:22:51.534Z
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

  /**
   * Build a semitone → note name map with correct enharmonic spelling.
   * Tertian chords stack in thirds: root(0), 3rd(2), 5th(4), 7th(6) letters up.
   */
  chordSpelling(rootName, intervals) {
    const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const letterSemitones = [0, 2, 4, 5, 7, 9, 11];

    const rootLetter = rootName.charAt(0);
    const rootLetterIdx = letters.indexOf(rootLetter);
    const rootSemitone = this.noteToSemitone(rootName);

    const spelling = {};
    for (let i = 0; i < intervals.length; i++) {
      const semitone = (rootSemitone + intervals[i]) % 12;
      const targetLetterIdx = (rootLetterIdx + i * 2) % 7;
      const targetLetter = letters[targetLetterIdx];
      const natural = letterSemitones[targetLetterIdx];
      const diff = ((semitone - natural) + 12) % 12;

      if (diff === 0) spelling[semitone] = targetLetter;
      else if (diff === 1) spelling[semitone] = targetLetter + '#';
      else if (diff === 11) spelling[semitone] = targetLetter + 'b';
      else spelling[semitone] = this.semitoneToNote(semitone);
    }
    return spelling;
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
    // maxStretch is the widest fretted span (highest − lowest fret) a hand can
    // reach. It scales inversely with the instrument's scale length: the shorter
    // the scale, the closer the frets, the more of them a hand covers.
    this.tunings = {
      'standard': {
        name: 'Standard Banjo (G)',
        shortName: 'G Tuning',
        openNotes: ['G', 'D', 'G', 'B', 'D'],
        openSemitones: [7, 2, 7, 11, 2],
        numStrings: 5,
        hasDrone: true,
        maxStretch: 4, // ~26" scale
      },
      'mini': {
        name: 'Mini Banjo (C)',
        shortName: 'C Tuning',
        openNotes: ['C', 'G', 'C', 'E', 'G'],
        openSemitones: [0, 7, 0, 4, 7],
        numStrings: 5,
        hasDrone: true,
        maxStretch: 6, // ~19" short scale
      },
      'mandolin': {
        name: 'Mandolin (GDAE)',
        shortName: 'GDAE',
        openNotes: ['G', 'D', 'A', 'E'],
        openSemitones: [7, 2, 9, 4],
        numStrings: 4,
        hasDrone: false,
        maxStretch: 7, // ~14" scale
      },
      'guitar': {
        name: 'Guitar (EADGBE)',
        shortName: 'EADGBE',
        openNotes: ['E', 'A', 'D', 'G', 'B', 'E'],
        openSemitones: [4, 9, 2, 7, 11, 4],
        numStrings: 6,
        hasDrone: false,
        maxStretch: 4, // ~25.5" scale
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
 * Banjo/stringed-instrument voicer.
 *
 * Enumerates every distinct, playable voicing of a chord up the neck for a
 * given tuning, root, quality and inversion. There is no scoring or "best"
 * pick — each shape that is complete (all chord tones, no others) and
 * physically playable is returned, organized up the neck.
 */
class BanjoVoicer {
  constructor(theory, tunings) {
    this.theory = theory;
    this.tunings = tunings;
    this.maxFret = 12;
    this.maxStretch = 4;
  }

  /**
   * Is a set of frets physically playable?
   * Hard constraints that replace the old scoring penalties:
   *  - fretted span within reach (<= maxStretch); the reachable span depends on
   *    the instrument's scale length, so callers pass the tuning's value
   *  - at most four fingers, allowing one index barre across the lowest fret
   * Open (0) and muted (-1) strings cost no finger.
   */
  isPlayable(frets, maxStretch = this.maxStretch) {
    const fretted = frets.filter(f => f > 0);
    if (fretted.length === 0) return true;

    const minFret = Math.min(...fretted);
    const maxFret = Math.max(...fretted);
    if (maxFret - minFret > maxStretch) return false;

    const atLowest = fretted.filter(f => f === minFret).length;
    const barreSaving = atLowest >= 2 ? atLowest - 1 : 0;
    const fingers = fretted.length - barreSaving;
    return fingers <= 4;
  }

  /**
   * Every distinct playable voicing up the neck.
   *
   * @returns array of { frets, notes, muted } sorted from the nut upward.
   */
  enumerateVoicings(chordSemitones, rootSemitone, tuningKey, bassSemitone, spelling = null) {
    const tuning = this.tunings.get(tuningKey);
    const hasDrone = tuning.hasDrone !== false;
    const numFretted = hasDrone ? tuning.numStrings - 1 : tuning.numStrings;
    const frettedOffset = hasDrone ? 1 : 0;
    const maxStretch = tuning.maxStretch || this.maxStretch;

    // The drone (5th string) is fixed open; it only rings if it is a chord tone.
    let droneFret = -1;
    if (hasDrone) {
      const droneOpen = tuning.openSemitones[0];
      droneFret = chordSemitones.includes(droneOpen) ? 0 : -1;
    }

    // Per fretted string: every chord-tone fret across the neck, plus "muted".
    const candidates = [];
    for (let s = 0; s < numFretted; s++) {
      const openSemitone = tuning.openSemitones[s + frettedOffset];
      const stringCandidates = [{ fret: -1, semitone: -1, muted: true }];
      for (let f = 0; f <= this.maxFret; f++) {
        const semitone = (openSemitone + f) % 12;
        if (chordSemitones.includes(semitone)) {
          stringCandidates.push({ fret: f, semitone, muted: false });
        }
      }
      candidates.push(stringCandidates);
    }

    const chordToneSet = new Set(chordSemitones);
    const results = [];
    const seen = new Set();

    const accept = (fretted) => {
      // Bass note (lowest-pitched non-muted fretted string) must match the inversion.
      const firstActive = fretted.find(c => !c.muted);
      if (!firstActive || firstActive.semitone !== bassSemitone) return;

      // Collect sounding pitch classes, including the drone when it rings.
      const sounding = new Set();
      for (const c of fretted) {
        if (!c.muted) sounding.add(c.semitone);
      }
      if (droneFret === 0) sounding.add(tuning.openSemitones[0]);

      // Complete: every chord tone present (no non-chord tones can occur — only
      // chord-tone frets are generated as candidates).
      if (sounding.size !== chordToneSet.size) return;

      const frets = hasDrone
        ? [droneFret, ...fretted.map(c => c.fret)]
        : fretted.map(c => c.fret);

      if (!this.isPlayable(frets, maxStretch)) return;

      const key = frets.join(',');
      if (seen.has(key)) return;
      seen.add(key);

      const noteName = (semitone) =>
        (spelling && spelling[semitone]) || this.theory.semitoneToNote(semitone);
      const notes = frets.map((f, i) => {
        if (f < 0) return null;
        return noteName((tuning.openSemitones[i] + f) % 12);
      });

      results.push({ frets, notes, muted: frets.map(f => f === -1) });
    };

    const current = new Array(numFretted);
    const search = (stringIdx) => {
      if (stringIdx === numFretted) {
        accept(current);
        return;
      }
      for (const candidate of candidates[stringIdx]) {
        current[stringIdx] = candidate;
        search(stringIdx + 1);
      }
    };
    search(0);

    const frettedOf = (v) => v.frets.filter(f => f > 0);
    const soundCount = (v) => v.frets.filter(f => f >= 0).length;
    const lowFret = (v) => { const f = frettedOf(v); return f.length ? Math.min(...f) : 0; };
    const fretSpan = (v) => { const f = frettedOf(v); return f.length ? Math.max(...f) - Math.min(...f) : 0; };

    // Collapse muting variants: a player can always mute a string, so a voicing
    // that is just a more-muted version of another (same frets where it sounds,
    // fewer strings ringing) adds no information — provided filling in the muted
    // strings keeps the same grip (the fretted span barely grows; that guard
    // avoids collapsing an iconic open shape into a fuller, neck-shifted one).
    const isMutedSubsetOf = (a, b) => {
      for (let i = 0; i < a.frets.length; i++) {
        if (a.frets[i] === -1) continue;        // `a` may mute where `b` rings
        if (a.frets[i] !== b.frets[i]) return false;
      }
      return soundCount(a) < soundCount(b) && fretSpan(b) <= fretSpan(a) + 1;
    };
    // Fullest-first, so a compact shape is only dropped for a superset we keep —
    // never for one that is itself collapsed away later in the pass.
    results.sort((a, b) => soundCount(b) - soundCount(a));
    const kept = [];
    for (const a of results) {
      if (!kept.some(b => isMutedSubsetOf(a, b))) kept.push(a);
    }

    // Up the neck: lowest fretted note first, then tighter shapes first.
    kept.sort((a, b) => lowFret(a) - lowFret(b) || fretSpan(a) - fretSpan(b) || a.frets.join().localeCompare(b.frets.join()));

    return kept;
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

  getDiagramWidth(numStrings) {
    const c = this.config;
    const ns = numStrings || c.numStrings;
    return c.leftMargin + (ns - 1) * c.stringSpacing + c.rightMargin;
  }

  get diagramWidth() {
    return this.getDiagramWidth(this.config.numStrings);
  }

  getDiagramHeight(numFrets) {
    const c = this.config;
    const nf = numFrets || c.numFrets;
    return c.topMargin + nf * c.fretSpacing + c.bottomMargin;
  }

  get diagramHeight() {
    return this.getDiagramHeight(this.config.numFrets);
  }

  render(voicing, chordName, tuningNotes) {
    const c = this.config;
    const numStrings = voicing.frets.length;

    const frettedFrets = voicing.frets.filter(f => f > 0);
    const minFret = frettedFrets.length > 0 ? Math.min(...frettedFrets) : 0;
    const maxFret = frettedFrets.length > 0 ? Math.max(...frettedFrets) : 0;
    const span = frettedFrets.length > 0 ? maxFret - minFret : 0;
    const numFrets = Math.max(c.numFrets, span + 1);

    const w = this.getDiagramWidth(numStrings);
    const h = this.getDiagramHeight(numFrets);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `${chordName} chord diagram`);

    let startFret = 1;
    if (maxFret > numFrets) {
      startFret = Math.max(1, minFret);
      if (maxFret - startFret >= numFrets) {
        startFret = maxFret - numFrets + 1;
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
    const fretboardWidth = (numStrings - 1) * c.stringSpacing;

    // Fret lines
    for (let i = 0; i <= numFrets; i++) {
      const y = fretboardTop + i * c.fretSpacing;
      svg.appendChild(this.svgLine(fretboardLeft, y, fretboardLeft + fretboardWidth, y, {
        stroke: '#333',
        strokeWidth: i === 0 && atNut ? c.nutWidth : 1,
      }));
    }

    // String lines
    for (let i = 0; i < numStrings; i++) {
      const x = fretboardLeft + i * c.stringSpacing;
      svg.appendChild(this.svgLine(x, fretboardTop, x, fretboardTop + numFrets * c.fretSpacing, {
        stroke: '#333',
        strokeWidth: 1,
      }));
    }

    // Fret numbers on the left
    for (let i = 0; i < numFrets; i++) {
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
    for (let s = 0; s < numStrings; s++) {
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
        if (displayFret >= 1 && displayFret <= numFrets) {
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
    for (let s = 0; s < numStrings; s++) {
      const x = fretboardLeft + s * c.stringSpacing;
      svg.appendChild(this.svgText(
        x, fretboardTop + numFrets * c.fretSpacing + 18,
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


</script>

<style>
/* Voicings gallery */
.voicings-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.chord-voicing {
  position: relative;
}

.add-voicing-btn {
  font-size: 0.7rem;
  cursor: pointer;
  color: #137752;
  background: none;
  border: none;
  margin-top: 2px;
  font-family: inherit;
  transition: opacity 0.15s ease;
}

.add-voicing-btn:hover {
  opacity: 0.6;
}

.voicings-empty {
  font-size: 0.85rem;
  color: #888;
  padding: 1rem 0;
}

/* Voicing stepper */
.voicings-stepper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.voicings-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-bottom: 12px;
}

.stepper-jump {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.stepper-jump-label {
  font-size: 0.72rem;
  color: #888;
}

.jump-chip {
  border: 1.5px solid #d1d5db;
  background: #fff;
  color: #333;
  border-radius: 5px;
  padding: 2px 9px;
  font-size: 0.72rem;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.jump-chip:hover { border-color: #333; }

.jump-chip.jump-active {
  background: #333;
  color: #fff;
  border-color: #333;
}

.stepper-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.stepper-arrow {
  border: 2px solid #d1d5db;
  background: #fff;
  color: #333;
  border-radius: 6px;
  width: 34px;
  height: 34px;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease, opacity 0.15s ease;
}

.stepper-arrow:hover:not(:disabled) { border-color: #333; }
.stepper-arrow:disabled { opacity: 0.3; cursor: default; }

.stepper-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
  min-width: 130px;
  text-align: center;
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.stepper-pos {
  font-size: 0.7rem;
  font-weight: 400;
  color: #999;
}

.stepper-actions {
  display: flex;
  gap: 18px;
  align-items: center;
}

.show-all-toggle {
  font-size: 0.75rem;
  color: #137752;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s ease;
}

.show-all-toggle:hover { opacity: 0.6; }

#banjo-tool {
  max-width: 100%;
  overflow: hidden;
}

/* Ensure flex-wrap works regardless of Tailwind build */
#banjo-tool .flex-wrap,
#root-buttons,
#quality-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.toggle-btn:hover {
  border-color: #333;
}

.toggle-btn.toggle-active {
  background: #333;
  color: #fff;
  border-color: #333;
}

.toggle-btn.toggle-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Chord display area */
#voicings-section {
  min-height: 220px;
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

#chord-collection {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
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

<h2 id="background">Background</h2>

This tool started life as a simple transposition chart for my [Gold Tone BG-Mini](https://goldtonemusicgroup.com/goldtone/instruments/bg-mini) — a short-scale banjo tuned a perfect fourth higher than standard, so every chord shape produces a different chord than what you'd expect. The standard 5-string banjo is tuned to open G (**g D G B D**) while the mini gives you open C (**c G C E G**), which means a "G shape" on the mini sounds as C, a "D shape" sounds as G, and so on.

Once the voicing search was working for banjo, adding mandolin (GDAE) and guitar (EADGBE) was straightforward — the same search works on any tuning, you just change the string layout. Inversions came later, along with a rework that surfaces every voicing instead of guessing a single "best" one.

## How It Works

Given a set of chord tones and a tuning, it walks every fingering up the neck and keeps the ones that are **complete** — all chord tones sounding and nothing else — and **playable**: within a hand's fret span, and no more than four fingers, allowing for an index barre. The **Inversion** selector constrains which chord tone sits in the bass.

Earlier versions scored all those candidates and showed only the single highest-scoring fingering. This one drops the scoring entirely and shows them all. Shapes that differ only by muting a doubled string collapse into one, so you aren't wading through redundant variations. The results run from the nut upward — the **jump** chips skip you to a position on the neck, and **show all** lays every shape out at once for comparison.
