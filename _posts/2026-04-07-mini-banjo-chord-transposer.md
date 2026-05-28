---
layout: post
title: Stringed Instrument Chord Finder
category: projects
---

<div class="text-sm">
  <p>
    An algorithmic chord voicing tool for banjo, mandolin, and guitar. Pick a tuning, root, and quality, then choose an inversion and position to explore voicings up and down the neck.
  </p>
  <p>
    <strong>Update:</strong> This started as a mini banjo transposition tool, and has since grown into a general-purpose chord finder with support for inversions, multiple instruments, and customizable voicing styles. See <a href="#background">below</a> for the full story.
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

<div class="mb-4 flex flex-wrap" style="gap: 2rem;">
<div>
<label class="block text-sm font-medium mb-2">Inversion:</label>
<div class="flex gap-2 flex-wrap" id="inversion-buttons">
</div>
</div>
<div>
<label class="block text-sm font-medium mb-2">Position:</label>
<div class="flex gap-2 flex-wrap" id="position-buttons">
</div>
</div>
</div>

<div class="mb-4">
<label class="block text-sm font-medium mb-2" for="style-select">Chord Style:</label>
<select id="style-select" class="style-select">
<option value="open">Open</option>
<option value="closed">Closed</option>
<option value="mandolin-chop">Mandolin Chop</option>
<option value="custom" disabled hidden>Custom</option>
</select>
</div>

<details id="style-advanced" class="mb-4">
<summary class="text-sm font-medium cursor-pointer select-none" style="color: #666;">Advanced Voicing Controls</summary>
<div class="slider-panel" id="slider-panel">
</div>
</details>

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
<p>Version 1.0.0 &bull; <a href="https://github.com/dmerand/donald.merand.org" class="text-gray-500 hover:text-gray-700 underline">Source code</a></p>
</div>

</div>

<!-- banjo-chord-script -->
<script>
/*
 * Mini Banjo Chord Transposer
 * Version: 1.0.0
 * Built: 2026-05-27T23:40:00.894Z
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
    this.tunings = {
      'standard': {
        name: 'Standard Banjo (G)',
        shortName: 'G Tuning',
        openNotes: ['G', 'D', 'G', 'B', 'D'],
        openSemitones: [7, 2, 7, 11, 2],
        numStrings: 5,
        hasDrone: true,
      },
      'mini': {
        name: 'Mini Banjo (C)',
        shortName: 'C Tuning',
        openNotes: ['C', 'G', 'C', 'E', 'G'],
        openSemitones: [0, 7, 0, 4, 7],
        numStrings: 5,
        hasDrone: true,
      },
      'mandolin': {
        name: 'Mandolin (GDAE)',
        shortName: 'GDAE',
        openNotes: ['G', 'D', 'A', 'E'],
        openSemitones: [7, 2, 9, 4],
        numStrings: 4,
        hasDrone: false,
      },
      'guitar': {
        name: 'Guitar (EADGBE)',
        shortName: 'EADGBE',
        openNotes: ['E', 'A', 'D', 'G', 'B', 'E'],
        openSemitones: [4, 9, 2, 7, 11, 4],
        numStrings: 6,
        hasDrone: false,
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
const VOICING_STYLES = {
  open: {
    coverage: 15, completeness: 48, rootBass: 6,
    openString: 21.6, openNonChordTone: -5, fretOverOpen: -8,
    wrongNote: -6, effort: -3.6, highFretEffort: -5,
    positionTight: -2.5, orientation: -1.4, stretch: -6, fingerGap: -1.1,
    doubledNote: 0, inversion: 0, maxStretch: 5,
    allowWrongNotes: true, allowMuting: true,
  },
  closed: {
    coverage: 11, completeness: 100, rootBass: 3,
    openString: -6.6, openNonChordTone: -2, fretOverOpen: 10,
    wrongNote: -1, effort: -2.5, highFretEffort: -0.5,
    positionTight: 0, orientation: 0, stretch: -3.1, fingerGap: -1,
    doubledNote: 0, inversion: 0, maxStretch: 5,
    allowWrongNotes: false, allowMuting: true,
  },
  'mandolin-chop': {
    coverage: 20, completeness: 100, rootBass: 0,
    openString: -28, openNonChordTone: -30, fretOverOpen: 15,
    wrongNote: -20, effort: 0, highFretEffort: 0,
    positionTight: 0, orientation: -0.3, stretch: 0, fingerGap: -0.5,
    doubledNote: 0, inversion: 3, maxStretch: 5,
    allowWrongNotes: false, allowMuting: false,
  },
};

class BanjoVoicer {
  constructor(theory, tunings) {
    this.theory = theory;
    this.tunings = tunings;
    this.maxFret = 12;
    this.maxSpan = 5;
  }

  findAvailablePositions(bassSemitone, tuningKey) {
    const tuning = this.tunings.get(tuningKey);
    const hasDrone = tuning.hasDrone !== false;
    const numFretted = hasDrone ? tuning.numStrings - 1 : tuning.numStrings;
    const frettedOffset = hasDrone ? 1 : 0;
    const bottomHalf = Math.floor(numFretted / 2);

    const positions = new Set();
    for (let s = 0; s < bottomHalf; s++) {
      const openSemitone = tuning.openSemitones[s + frettedOffset];
      for (let f = 0; f <= this.maxFret; f++) {
        if ((openSemitone + f) % 12 === bassSemitone) {
          positions.add(f);
        }
      }
    }
    return Array.from(positions).sort((a, b) => a - b);
  }

  findBestVoicing(chordSemitones, rootSemitone, tuningKey, bassSemitone, bassFret = 0, spelling = null, style = 'open') {
    const tuning = this.tunings.get(tuningKey);
    const weights = VOICING_STYLES[style] || VOICING_STYLES.open;
    const hasDrone = tuning.hasDrone !== false;
    const numFretted = hasDrone ? tuning.numStrings - 1 : tuning.numStrings;
    const frettedOffset = hasDrone ? 1 : 0;
    const position = bassFret;

    let droneFret = -1;
    if (hasDrone) {
      const droneOpen = tuning.openSemitones[0];
      droneFret = (position === 0 && chordSemitones.includes(droneOpen)) ? 0 : -1;
    }

    const bottomHalf = Math.floor(numFretted / 2);
    let bassStringIdx = -1;
    for (let s = 0; s < bottomHalf; s++) {
      const tuningIdx = s + frettedOffset;
      if ((tuning.openSemitones[tuningIdx] + bassFret) % 12 === bassSemitone) {
        bassStringIdx = s;
        break;
      }
    }

    const canMute = weights.allowMuting !== false;
    const hardBass = bassStringIdx >= 0;

    const candidates = [];
    for (let s = 0; s < numFretted; s++) {
      const tuningIdx = s + frettedOffset;

      if (hardBass && s === bassStringIdx) {
        candidates.push([{ fret: bassFret, semitone: bassSemitone, nonChordTone: false }]);
        continue;
      }

      const stringCandidates = [];

      if (hardBass && s < bassStringIdx && canMute) {
        stringCandidates.push({ fret: -1, semitone: -1, nonChordTone: false, muted: true });
      }

      const openSemitone = tuning.openSemitones[tuningIdx];
      const allowOpen = weights.openString >= 0;
      if (allowOpen && weights.allowWrongNotes !== false) {
        if (!chordSemitones.includes(openSemitone)) {
          stringCandidates.push({ fret: 0, semitone: openSemitone, nonChordTone: true });
        }
      }

      for (let f = 0; f <= this.maxFret; f++) {
        if (f === 0 && !allowOpen) continue;
        const semitone = (openSemitone + f) % 12;
        if (chordSemitones.includes(semitone)) {
          stringCandidates.push({ fret: f, semitone, nonChordTone: false });
        }
      }

      if (stringCandidates.length === 0) {
        stringCandidates.push({ fret: 0, semitone: openSemitone, nonChordTone: true });
      }

      candidates.push(stringCandidates);
    }

    let bestVoicing = null;
    let bestScore = -Infinity;

    const search = (stringIdx, current) => {
      if (stringIdx === numFretted) {
        const score = this.scoreVoicing(current, chordSemitones, bassSemitone, tuning, droneFret, position, frettedOffset, weights, hardBass, canMute);
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

    search(0, new Array(numFretted));

    const noteName = (semitone) =>
      (spelling && spelling[semitone]) || this.theory.semitoneToNote(semitone);

    if (!bestVoicing) {
      const frets = hasDrone
        ? [droneFret, ...new Array(numFretted).fill(0)]
        : new Array(numFretted).fill(0);
      return {
        frets,
        notes: tuning.openNotes.slice(),
        muted: frets.map(f => f === -1),
      };
    }

    let frets, notes;
    if (hasDrone) {
      frets = [droneFret, ...bestVoicing.map(c => c.muted ? -1 : c.fret)];
      notes = [
        droneFret >= 0 ? noteName(tuning.openSemitones[0]) : null,
        ...bestVoicing.map(c => c.muted ? null : noteName(c.semitone)),
      ];
    } else {
      frets = bestVoicing.map(c => c.muted ? -1 : c.fret);
      notes = bestVoicing.map(c => c.muted ? null : noteName(c.semitone));
    }

    return { frets, notes, muted: frets.map(f => f === -1) };
  }

  scoreVoicing(frettedStrings, chordSemitones, bassSemitone, tuning, droneFret, position, frettedOffset, w, hardBass, canMute) {
    const numFretted = frettedStrings.length;

    let firstActiveIdx = -1;
    for (let i = 0; i < numFretted; i++) {
      if (!frettedStrings[i].muted) {
        firstActiveIdx = i;
        break;
      }
    }
    if (firstActiveIdx === -1) return -1000;

    if (hardBass && canMute && frettedStrings[firstActiveIdx].semitone !== bassSemitone) return -1000;

    const activeFrets = [];
    const activeSemitones = [];
    const activeNonChordTones = [];
    let mutedCount = 0;

    for (let i = 0; i < numFretted; i++) {
      if (frettedStrings[i].muted) {
        mutedCount++;
      } else {
        activeFrets.push(frettedStrings[i].fret);
        activeSemitones.push(frettedStrings[i].semitone);
        activeNonChordTones.push(frettedStrings[i].nonChordTone || false);
      }
    }

    const frettedFrets = activeFrets.filter(f => f > 0);
    const span = frettedFrets.length > 0
      ? Math.max(...frettedFrets) - Math.min(...frettedFrets)
      : 0;

    if (span > (w.maxStretch || this.maxSpan)) return -1000;

    let score = 0;

    score -= mutedCount * 8;

    const chordToneSemitones = activeSemitones.filter((s, i) => !activeNonChordTones[i]);
    const allSemitones = [...chordToneSemitones];
    if (droneFret !== null && droneFret >= 0) allSemitones.push(tuning.openSemitones[0]);
    const uniqueTones = new Set(allSemitones.filter(s => chordSemitones.includes(s)));
    score += uniqueTones.size * w.coverage;
    if (uniqueTones.size === chordSemitones.length) score += w.completeness;

    for (let i = 0; i < numFretted; i++) {
      if (frettedStrings[i].muted) continue;
      const fret = frettedStrings[i].fret;
      const nonChordTone = frettedStrings[i].nonChordTone || false;
      if (fret === 0 && !nonChordTone) {
        score += w.openString;
      } else if (fret === 0 && nonChordTone) {
        score += w.openNonChordTone;
      } else if (fret > 0 && chordSemitones.includes(tuning.openSemitones[i + frettedOffset])) {
        score -= w.openString * 0.5;
      }
    }

    score += activeNonChordTones.filter(Boolean).length * w.wrongNote;

    if (position === 0) {
      score += activeFrets.reduce((a, b) => a + b, 0) * w.effort;
      const maxFret = activeFrets.length > 0 ? Math.max(...activeFrets) : 0;
      if (maxFret > 5) score += (maxFret - 5) * w.highFretEffort;
    } else {
      for (const f of frettedFrets) {
        score += Math.abs(f - position) * w.positionTight;
        if (w.orientation) score += (f - position) * w.orientation;
      }
    }

    score += span * w.stretch;

    const frettedPositions = activeFrets.map((f, i) => ({ fret: f, idx: i })).filter(p => p.fret > 0);
    for (let i = 1; i < frettedPositions.length; i++) {
      const gap = Math.abs(frettedPositions[i].fret - frettedPositions[i - 1].fret);
      if (gap > 2) score += gap * w.fingerGap;
    }

    if (w.doubledNote) {
      const pitchCounts = {};
      for (let i = 0; i < activeSemitones.length; i++) {
        if (!activeNonChordTones[i]) pitchCounts[activeSemitones[i]] = (pitchCounts[activeSemitones[i]] || 0) + 1;
      }
      if (droneFret !== null && droneFret >= 0) {
        const dp = tuning.openSemitones[0];
        pitchCounts[dp] = (pitchCounts[dp] || 0) + 1;
      }
      for (const count of Object.values(pitchCounts)) {
        if (count > 1) score += (count - 1) * w.doubledNote;
      }
    }

    return score;
  }
}

BanjoVoicer.STYLES = VOICING_STYLES;

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


</script>

<style>
/* Style dropdown */
.style-select {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 2px solid #d1d5db;
  background: #fff;
  color: #333;
  font-family: ui-sans-serif, system-ui, sans-serif;
  cursor: pointer;
}

/* Accordion */
#style-advanced {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0;
}
#style-advanced summary {
  padding: 8px 12px;
  list-style: none;
}
#style-advanced summary::-webkit-details-marker { display: none; }
#style-advanced summary::before {
  content: '▸ ';
}
#style-advanced[open] summary::before {
  content: '▾ ';
}

/* Slider panel */
.slider-panel {
  padding: 6px 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 16px;
}
.slider-group {
  display: flex;
  flex-direction: column;
}
.slider-group label {
  font-size: 0.65rem;
  font-weight: 500;
  color: #555;
  cursor: help;
  margin-bottom: -2px;
}
.slider-group input[type=range] {
  width: 100%;
  accent-color: #333;
  height: 16px;
}
.slider-type-hint {
  font-size: 0.55rem;
  color: #bbb;
}
.slider-extremes {
  display: flex;
  justify-content: space-between;
  font-size: 0.55rem;
  color: #888;
  margin-top: -4px;
  margin-bottom: 2px;
}

.slider-group .slider-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  color: #555;
  margin-top: 2px;
}
.slider-save-row {
  grid-column: 1 / -1;
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
}
.preset-name-input {
  flex: 1;
  padding: 3px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: inherit;
}
.preset-btn {
  padding: 3px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.65rem;
  font-family: inherit;
  cursor: pointer;
  background: #fff;
  color: #555;
}
.preset-btn:hover { background: #f3f4f6; }
.preset-btn-danger { color: #b91c1c; }
.preset-btn-danger:hover { background: #fef2f2; }

@media (max-width: 640px) {
  .slider-panel {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

#banjo-tool {
  max-width: 100%;
  overflow: hidden;
}

/* Ensure flex-wrap works regardless of Tailwind build */
#banjo-tool .flex-wrap,
#root-buttons,
#quality-buttons,
#position-buttons {
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

<h2 id="background">Background</h2>

This tool started life as a simple transposition chart for my [Gold Tone BG-Mini](https://goldtonemusicgroup.com/goldtone/instruments/bg-mini) — a short-scale banjo tuned a perfect fourth higher than standard, so every chord shape produces a different chord than what you'd expect. The standard 5-string banjo is tuned to open G (**g D G B D**) while the mini gives you open C (**c G C E G**), which means a "G shape" on the mini sounds as C, a "D shape" sounds as G, and so on.

Once the voicing algorithm was working for banjo, adding mandolin (GDAE) and guitar (EADGBE) was straightforward — the same search works on any tuning, you just change the string layout. Inversions and position-based voicing came later.

## How It Works

Given a set of chord tones and a tuning, it searches for the most playable fingering. It scores each candidate voicing on completeness, fret span, open string usage, and finger effort, then picks the winner. The **Inversion** selector constrains which chord tone appears in the bass, and **Position** determines where on the neck to anchor that bass note.

The **Chord Style** presets (Open, Closed, Mandolin Chop) are just named bundles of scoring weights. Open the **Advanced Voicing Controls** to tweak them directly, or save your own presets.
