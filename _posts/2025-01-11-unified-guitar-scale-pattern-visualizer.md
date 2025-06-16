---
layout: post
title: Unified Guitar Scale Pattern Visualizer
category: projects
---

<div class="text-sm">
  <p>
    Here's an interactive unified scale pattern visualizer which can be used to find the best "unified" single pattern on guitar or bass for any scale. 
  </p>
  <p>
    Select a scale and adjust the notes per string to see how the patterns adapt across the fretboard. See below for an explanation.
  </p>
</div>

<div id="instrument-visualizer" class="bg-white rounded-lg shadow-lg p-6 mt-8">
<div id="controls" class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pt-4">
<div>
<label for="tuning-preset" class="block text-sm font-medium mb-2">Tuning:</label>
<select id="tuning-preset" class="border border-gray-300 rounded px-3 py-2 w-full form-input-styled" style="font-size: 1rem; font-family: ui-sans-serif, system-ui, sans-serif;">
<option value="perfect-fourths" selected>12-String Perfect 4ths</option>
<option value="standard-guitar">6-String Guitar</option>
<option value="bass-5-string">5-String Bass</option>
<option value="bass-4-string">4-String Bass</option>
</select>
</div>

<div>
<label for="selected-scale-degree" class="block text-sm font-medium mb-2">Selected Scale Degree:</label>
<input type="number" id="selected-scale-degree" class="border border-gray-300 rounded px-3 py-2 w-full" 
min="1" max="12" value="1" style="font-size: 1rem; font-family: ui-sans-serif, system-ui, sans-serif;">
</div>

<div>
<label for="notes-per-string" class="block text-sm font-medium mb-2">Notes per String: <span id="nps-value">3</span></label>
<input type="range" id="notes-per-string" class="w-full" min="1" max="12" value="3">
</div>

<div class="md:col-span-2">
<label for="scale-intervals" class="block text-sm font-medium mb-2">Scale Intervals:</label>
<input type="text" id="scale-intervals" class="border border-gray-300 rounded px-3 py-2 w-full" 
value="2,2,1,2,2,2,1" placeholder="Comma-separated intervals (e.g., 2,2,1,2,2,2,1)" style="font-size: 1rem; font-family: ui-sans-serif, system-ui, sans-serif;">
</div>

<div>
<label for="scale-title" class="block text-sm font-medium mb-2">Scale Title:</label>
<input type="text" id="scale-title" class="border border-gray-300 rounded px-3 py-2 w-full" 
value="Major Scale" placeholder="Custom scale name" style="font-size: 1rem; font-family: ui-sans-serif, system-ui, sans-serif;">
</div>

<div>
<label for="scale-type" class="block text-sm font-medium mb-2">Select a scale:</label>
<select id="scale-type" class="border border-gray-300 rounded px-3 py-2 w-full form-input-styled" style="font-size: 1rem; font-family: ui-sans-serif, system-ui, sans-serif;">
<option value="major" selected>Major</option>
<option value="natural-minor">Natural Minor</option>
<option value="harmonic-minor">Harmonic Minor</option>
<option value="melodic-minor">Melodic Minor</option>
<option value="pentatonic">Pentatonic</option>
<option value="whole-tone">Whole Tone</option>
<option value="chromatic">Chromatic</option>
<option value="blues">Blues</option>
<option value="custom">Custom Scale</option>
</select>
</div>

<div>
<label for="root-note" class="block text-sm font-medium mb-2">Root Note:</label>
<select id="root-note" class="border border-gray-300 rounded px-3 py-2 w-full form-input-styled" style="font-size: 1rem; font-family: ui-sans-serif, system-ui, sans-serif;">
<option value="C" selected>C</option>
<option value="C#">C#</option>
<option value="D">D</option>
<option value="D#">D#</option>
<option value="E">E</option>
<option value="F">F</option>
<option value="F#">F#</option>
<option value="G">G</option>
<option value="G#">G#</option>
<option value="A">A</option>
<option value="A#">A#</option>
<option value="B">B</option>
</select>
</div>

<div class="flex items-end gap-2">
<button id="update-preset-button" class="text-2xl cursor-pointer px-3 py-2 hover:opacity-70 transition-opacity transparent-button"
title="Update current preset"
aria-label="Update current preset">
💾
</button>
<button id="delete-preset-button" class="text-2xl cursor-pointer px-3 py-2 hover:opacity-70 transition-opacity transparent-button"
title="Delete current preset"
aria-label="Delete current preset">
🗑️
</button>
</div>
</div>

<div class="text-left mt-4">
<button id="save-preset-button" class="text-sm mr-4 cursor-pointer hover:opacity-70 transition-opacity green-text-button">
Save as new preset
</button>
<button id="export-button" class="text-sm mr-4 cursor-pointer hover:opacity-70 transition-opacity green-text-button">
Export Pattern
</button>
<label for="import-file" class="text-sm cursor-pointer hover:opacity-70 transition-opacity green-text-button">
Import Pattern
</label>
<input type="file" id="import-file" accept=".json" style="display: none;">
</div>
</div>

<div class="text-right mt-4 mb-2">
<button id="save-svg-button" class="text-sm cursor-pointer hover:opacity-70 transition-opacity green-text-button">
Save as SVG
</button>
</div>

<div id="fretboard-container" class="relative overflow-x-auto mt-2 mb-4">
<svg id="fretboard" width="800" height="700" 
viewBox="0 0 800 700" 
xmlns="http://www.w3.org/2000/svg"
aria-label="Guitar fretboard visualization"></svg>
</div>


<div class="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
<p>Version 1.3.0 • Last updated: June 16, 2025 • <a href="https://github.com/dmerand/donald.merand.org/tree/master/lib/unified-nps" class="text-gray-500 hover:text-gray-700 underline">Source code</a></p>
</div>

<script>
/*
 * Guitar Scale Visualizer
 * Version: 1.3.0
 * Built: 2025-06-16T21:33:59.717Z
 * Generated automatically - do not edit directly
 */
// === core/musical-theory.js ===
/**
 * Core musical theory utilities for the guitar scale visualizer
 * Pure functions with no DOM dependencies - fully testable
 */

class MusicalTheory {
  constructor() {
    this.noteValues = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  }

  /**
   * Parse a note string (e.g., "C3", "F#2") into semitone value
   * @param {string} noteStr - Note in format like "C3" or "F#2"
   * @returns {number} Semitone value
   */
  parseNote(noteStr) {
    const noteMatch = noteStr.match(/^([A-G])(b|#?)(\d+)$/);
    if (!noteMatch) throw new Error(`Invalid note format: ${noteStr}`);
    
    const [, noteName, accidental, octave] = noteMatch;
    const accidentalOffset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
    
    return this.noteValues[noteName] + accidentalOffset + parseInt(octave) * 12;
  }

  /**
   * Convert semitone value back to note string
   * @param {number} semitone - Semitone value
   * @returns {string} Note string like "C3" or "F#2"
   */
  semitoneToNote(semitone) {
    return `${this.noteNames[semitone % 12]}${Math.floor(semitone / 12)}`;
  }

  /**
   * Extract just the note name from a full note string
   * @param {string} noteStr - Full note string like "C3"
   * @returns {string} Just note name like "C" or "F#"
   */
  getNoteName(noteStr) {
    const match = noteStr.match(/^([A-G])(b|#?)/);
    return match ? match[1] + (match[2] || '') : noteStr;
  }

  /**
   * Parse interval string into array of integers
   * @param {string} intervalString - Comma-separated intervals like "2,2,1,2,2,2,1"
   * @returns {number[]} Array of interval values
   */
  parseIntervals(intervalString) {
    return intervalString.split(',').map(str => parseInt(str.trim())).filter(n => !isNaN(n));
  }

  /**
   * Calculate greatest common divisor
   * @param {number} a 
   * @param {number} b 
   * @returns {number}
   */
  gcd(a, b) {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * Calculate least common multiple
   * @param {number} a 
   * @param {number} b 
   * @returns {number}
   */
  lcm(a, b) {
    return (a * b) / this.gcd(a, b);
  }

  /**
   * Generate extended scale sequence starting from selected scale degree
   * @param {string} rootNote - Root note like "C3"
   * @param {string} intervalString - Comma-separated intervals
   * @param {number} notesPerString - Notes per string constraint
   * @param {number} selectedScaleDegree - Starting scale degree (1-based)
   * @returns {string[]} Array of note strings
   */
  generateExtendedScale(rootNote, intervalString, notesPerString, selectedScaleDegree = 1) {
    const rootSemitone = this.parseNote(rootNote);
    const intervals = this.parseIntervals(intervalString);
    
    if (intervals.length === 0) return [];

    // Calculate LCM for extended sequence length + one extra note (first note repeat)
    const patternLength = intervals.length;
    const baseExtendedLength = this.lcm(patternLength, notesPerString);
    const extendedLength = baseExtendedLength + 1;
    
    // Calculate starting semitone for the selected scale degree
    let startingSemitone = rootSemitone;
    for (let i = 0; i < selectedScaleDegree - 1; i++) {
      startingSemitone += intervals[i % intervals.length];
    }
    
    // Generate the extended scale sequence starting from the selected degree
    const scaleNotes = [];
    let currentSemitone = startingSemitone;
    
    scaleNotes.push(this.semitoneToNote(currentSemitone));
    
    // Start interval rotation from the selected scale degree
    const startIntervalIndex = (selectedScaleDegree - 1) % intervals.length;
    for (let i = 0; i < extendedLength - 1; i++) {
      const intervalIndex = (startIntervalIndex + i) % intervals.length;
      currentSemitone += intervals[intervalIndex];
      scaleNotes.push(this.semitoneToNote(currentSemitone));
    }
    
    return scaleNotes;
  }

}



// === core/scale-patterns.js ===
/**
 * Scale pattern definitions and management
 * Contains all built-in scales and their default preferences
 */

class ScalePatterns {
  constructor() {
    // Scale interval patterns (semitones between consecutive notes)
    this.scaleIntervalPatterns = {
      'major': [2, 2, 1, 2, 2, 2, 1],
      'natural-minor': [2, 1, 2, 2, 1, 2, 2],
      'harmonic-minor': [2, 1, 2, 2, 1, 3, 1],
      'melodic-minor': [2, 1, 2, 2, 2, 2, 1],
      'pentatonic': [2, 2, 3, 2, 3],
      'whole-tone': [2, 2, 2, 2, 2, 2],
      'chromatic': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      'blues': [3, 2, 1, 1, 3, 2]
    };

    // Default scale preferences
    this.defaultScalePreferences = {
      'major': { title: 'Major Scale', notesPerString: 3, selectedScaleDegree: 1, rootNote: 'C' },
      'natural-minor': { title: 'Natural Minor Scale', notesPerString: 3, selectedScaleDegree: 1, rootNote: 'A' },
      'harmonic-minor': { title: 'Harmonic Minor Scale', notesPerString: 3, selectedScaleDegree: 1, rootNote: 'A' },
      'melodic-minor': { title: 'Melodic Minor Scale', notesPerString: 3, selectedScaleDegree: 1, rootNote: 'A' },
      'pentatonic': { title: 'Pentatonic Scale', notesPerString: 2, selectedScaleDegree: 1, rootNote: 'C' },
      'whole-tone': { title: 'Whole Tone Scale', notesPerString: 2, selectedScaleDegree: 1, rootNote: 'D' },
      'chromatic': { title: 'Chromatic Scale', notesPerString: 4, selectedScaleDegree: 1, rootNote: 'D' },
      'blues': { title: 'Blues Scale', notesPerString: 2, selectedScaleDegree: 1, rootNote: 'A' },
      'custom': { title: 'Custom Scale', notesPerString: 3, selectedScaleDegree: 1, rootNote: 'C' }
    };
  }

  /**
   * Get intervals for a scale type
   * @param {string} scaleType - Scale identifier
   * @returns {number[]|null} Array of intervals or null if not found
   */
  getScaleIntervals(scaleType) {
    return this.scaleIntervalPatterns[scaleType] || null;
  }

  /**
   * Get default preferences for a scale type
   * @param {string} scaleType - Scale identifier
   * @returns {Object|null} Preferences object or null if not found
   */
  getScalePreferences(scaleType) {
    return this.defaultScalePreferences[scaleType] || null;
  }

  /**
   * Find scale type from interval pattern
   * @param {number[]} intervals - Array of intervals
   * @returns {string|null} Scale type or null if no match
   */
  findScaleTypeFromIntervals(intervals) {
    const matchingScale = Object.entries(this.scaleIntervalPatterns).find(([_, scaleIntervals]) =>
      scaleIntervals.length === intervals.length && 
      scaleIntervals.every((interval, index) => interval === intervals[index])
    );
    
    return matchingScale ? matchingScale[0] : null;
  }

  /**
   * Get all available scale types
   * @returns {string[]} Array of scale type identifiers
   */
  getAvailableScales() {
    return Object.keys(this.defaultScalePreferences);
  }

  /**
   * Validate if a scale type exists
   * @param {string} scaleType - Scale identifier to check
   * @returns {boolean} True if scale type exists
   */
  isValidScaleType(scaleType) {
    return scaleType in this.defaultScalePreferences;
  }
}



// === core/fretboard-algorithm.js ===
/**
 * Fretboard note-finding algorithm
 * Pure algorithmic logic for finding optimal note positions on stringed instruments
 */

class FretboardAlgorithm {
  constructor(options = {}) {
    this.maxFret = options.maxFret || 24;
    this.maxInterval = options.maxInterval || 6;  // Hand span limit
    this.FRET_PADDING_BELOW = options.fretPaddingBelow || 2;
    this.FRET_PADDING_ABOVE = options.fretPaddingAbove || 1;
  }

  /**
   * Tuning preset definitions
   */
  static get TUNING_PRESETS() {
    return {
      'perfect-fourths': ['B1', 'E2', 'A2', 'D3', 'G3', 'C4', 'F4', 'Bb4', 'Eb5', 'Ab5', 'Db6', 'Gb6'],
      'standard-guitar': ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
      'bass-5-string': ['B1', 'E2', 'A2', 'D3', 'G3'],
      'bass-4-string': ['E2', 'A2', 'D3', 'G3']
    };
  }

  /**
   * Find optimal note positions for a scale on the fretboard
   * @param {string[]} targetNotes - Array of note strings to find
   * @param {string[]} tuning - Array of open string notes
   * @param {number} notesPerString - Maximum notes per string
   * @param {MusicalTheory} musicalTheory - Musical theory instance for note parsing
   * @returns {Array[]} Array of [stringIndex, fret] positions
   */
  findNotes(targetNotes, tuning, notesPerString, musicalTheory) {
    const tuningValues = tuning.map(note => musicalTheory.parseNote(note));
    const targetValues = targetNotes.map(note => musicalTheory.parseNote(note));
    
    if (targetValues.length === 0) return [];
    
    let bestPattern = [];
    
    // Try multiple starting positions to find the longest pattern
    for (let startFret = 1; startFret <= this.maxFret; startFret += this.maxInterval) {
      const pattern = this.findSinglePattern(targetNotes, targetValues, tuning, tuningValues, notesPerString, startFret);
      
      if (pattern.length > bestPattern.length) {
        bestPattern = pattern;
        if (bestPattern.length === targetValues.length) break;
      }
    }
    return bestPattern;
  }

  /**
   * Find a single pattern starting from a specific fret position
   * @param {string[]} targetNotes - Target note strings
   * @param {number[]} targetValues - Target semitone values
   * @param {string[]} tuning - Tuning note strings
   * @param {number[]} tuningValues - Tuning semitone values
   * @param {number} notesPerString - Notes per string limit
   * @param {number} minStartFret - Minimum starting fret
   * @returns {Array[]} Array of [stringIndex, fret] positions
   */
  findSinglePattern(targetNotes, targetValues, tuning, tuningValues, notesPerString, minStartFret = 1) {
    const foundNotes = [];
    
    if (targetValues.length === 0) return foundNotes;
    
    // Step 1: Find the first note using grid-based search
    const firstTargetValue = targetValues[0];
    let firstNoteFound = false;
    let currentStringIndex = 0;
    let currentFret = minStartFret;
    
    // Search for first note in grids, starting from minStartFret
    for (let gridStart = minStartFret; gridStart <= this.maxFret && !firstNoteFound; gridStart += this.maxInterval) {
      const gridEnd = Math.min(gridStart + this.maxInterval - 1, this.maxFret);
      
      // Search all strings in this grid before moving to next grid
      for (let stringIndex = 0; stringIndex < tuning.length && !firstNoteFound; stringIndex++) {
        const openStringValue = tuningValues[stringIndex];
        
        for (let fret = Math.max(gridStart, minStartFret); fret <= gridEnd; fret++) {
          const fretValue = openStringValue + fret;
          
          if (fretValue === firstTargetValue) {
            foundNotes.push([stringIndex, fret]);
            currentStringIndex = stringIndex;
            currentFret = fret;
            firstNoteFound = true;
            break;
          }
        }
      }
    }
    
    if (!firstNoteFound) return foundNotes;
    
    // Step 2: Continue finding remaining notes using sequential string approach
    let targetIndex = 1;
    let notesOnCurrentString = 1;
    
    while (targetIndex < targetValues.length && currentStringIndex < tuning.length) {
      const targetValue = targetValues[targetIndex];
      const openStringValue = tuningValues[currentStringIndex];
      let noteFound = false;
      
      // Look for next note on current string (up to reasonable fret limit)
      if (notesOnCurrentString < notesPerString) {
        for (let fret = currentFret + 1; fret <= this.maxFret; fret++) {
          const fretValue = openStringValue + fret;
          
          if (fretValue === targetValue) {
            foundNotes.push([currentStringIndex, fret]);
            currentFret = fret;
            notesOnCurrentString++;
            targetIndex++;
            noteFound = true;
            break;
          }
        }
      }
      
      // If note not found on current string or string is full, move to next string
      if (!noteFound || notesOnCurrentString >= notesPerString) {
        currentStringIndex++;
        notesOnCurrentString = 0;
        // Reset current fret to allow finding notes at lower positions on new string
        currentFret = Math.max(0, currentFret - 6);
        
        // Search for current target on new string
        if (currentStringIndex < tuning.length) {
          const newOpenStringValue = tuningValues[currentStringIndex];
          const currentTargetValue = targetValues[targetIndex];
          const startFret = Math.max(1, currentFret - 3);
          
          for (let fret = startFret; fret <= this.maxFret; fret++) {
            const fretValue = newOpenStringValue + fret;
            
            if (fretValue === currentTargetValue) {
              foundNotes.push([currentStringIndex, fret]);
              currentFret = fret;
              notesOnCurrentString = 1;
              targetIndex++;
              noteFound = true;
              break;
            }
          }
        }
        
        // If still not found, skip this target
        if (!noteFound) {
          targetIndex++;
        }
      }
    }
    
    return foundNotes;
  }

  /**
   * Calculate optimal fret range for visualization
   * @param {Array[]} notePositions - Array of [stringIndex, fret] positions
   * @returns {number[]} [minFret, maxFret] range for display
   */
  calculateFretRange(notePositions) {
    if (notePositions.length === 0) {
      return [0, 4]; // Default range when no notes
    }

    const frets = notePositions.map(([, fret]) => fret);
    const minFret = Math.max(0, Math.min(...frets) - this.FRET_PADDING_BELOW);
    const maxFret = Math.max(...frets) + this.FRET_PADDING_ABOVE;
    
    return [minFret, maxFret];
  }

  /**
   * Validate tuning preset
   * @param {string} tuningName - Name of tuning preset
   * @returns {boolean} True if valid tuning
   */
  static isValidTuning(tuningName) {
    return tuningName in FretboardAlgorithm.TUNING_PRESETS;
  }

  /**
   * Get tuning by name
   * @param {string} tuningName - Name of tuning preset
   * @returns {string[]|null} Array of note strings or null if not found
   */
  static getTuning(tuningName) {
    return FretboardAlgorithm.TUNING_PRESETS[tuningName] || null;
  }
}



// === core/scale-visualizer.js ===
/**
 * Scale Visualizer - Core orchestration for scale generation and visualization
 * Coordinates between musical theory, scale patterns, and fretboard algorithm
 */

class ScaleVisualizer {
  constructor(musicalTheory, scalePatterns, fretboardAlgorithm) {
    this.musicalTheory = musicalTheory;
    this.scalePatterns = scalePatterns;
    this.fretboardAlgorithm = fretboardAlgorithm;
    
    // Octave selection logic moved from widget
    this.OCTAVE_2_NOTES = ['F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  }

  /**
   * Generate complete visualization data for a scale configuration
   * @param {Object} config - Scale configuration
   * @param {string} config.rootNote - Root note (e.g., 'C', 'F#')
   * @param {string} config.scaleType - Scale type key or 'custom'
   * @param {string} config.customIntervals - Comma-separated intervals for custom scales
   * @param {string} config.tuningName - Tuning preset name
   * @param {number} config.notesPerString - Notes per string constraint
   * @param {number} config.selectedScaleDegree - Starting scale degree (1-based)
   * @returns {Object} Visualization data
   */
  generateVisualizationData(config) {
    const {
      rootNote,
      scaleType,
      customIntervals,
      tuningName,
      notesPerString,
      selectedScaleDegree
    } = config;

    // Get scale intervals
    const intervals = this.getScaleIntervals(scaleType, customIntervals);
    
    // Get tuning
    const tuning = this.fretboardAlgorithm.constructor.getTuning(tuningName);
    if (!tuning) {
      throw new Error(`Invalid tuning: ${tuningName}`);
    }

    // Apply octave optimization for root note
    const optimizedRootNote = this.getOptimalRootNote(rootNote);
    
    // Generate scale notes
    const scaleNotes = this.musicalTheory.generateExtendedScale(
      optimizedRootNote,
      intervals.join(','),
      notesPerString,
      selectedScaleDegree
    );
    
    // Find note positions on fretboard
    const notePositions = this.fretboardAlgorithm.findNotes(
      scaleNotes,
      tuning,
      notesPerString,
      this.musicalTheory
    );
    
    // Calculate fret range for visualization
    const fretRange = this.fretboardAlgorithm.calculateFretRange(notePositions);
    
    // Generate metadata
    const metadata = this.generateMetadata(config, intervals, tuning, scaleNotes);
    
    return {
      notePositions,
      scaleNotes,
      fretRange,
      tuning,
      intervals,
      scaleLength: intervals.length,
      metadata
    };
  }

  /**
   * Get scale intervals from type or custom input
   * @param {string} scaleType - Scale type key
   * @param {string} customIntervals - Custom intervals string
   * @returns {number[]} Array of interval numbers
   */
  getScaleIntervals(scaleType, customIntervals) {
    // Handle custom scales and custom preset IDs
    if (scaleType === 'custom' || scaleType.startsWith('custom-')) {
      return this.musicalTheory.parseIntervals(customIntervals);
    }
    
    const pattern = this.scalePatterns.scaleIntervalPatterns[scaleType];
    if (!pattern) {
      throw new Error(`Unknown scale type: ${scaleType}`);
    }
    
    return pattern;
  }

  /**
   * Apply octave optimization to root note
   * @param {string} rootNote - Base root note (e.g., 'C', 'F#')
   * @returns {string} Octave-optimized root note (e.g., 'C3', 'F#2')
   */
  getOptimalRootNote(rootNote) {
    const octave = this.OCTAVE_2_NOTES.includes(rootNote) ? '2' : '3';
    return rootNote + octave;
  }

  /**
   * Calculate scale degree for a position in the note sequence
   * @param {number} index - Position index in the note sequence
   * @param {number} scaleLength - Length of the scale
   * @param {number} selectedScaleDegree - Starting scale degree
   * @returns {number} Scale degree (1-based)
   */
  calculateScaleDegreeForPosition(index, scaleLength, selectedScaleDegree) {
    const rotatedDegree = (index % scaleLength) + 1;
    return ((rotatedDegree - 1 + selectedScaleDegree - 1) % scaleLength) + 1;
  }

  /**
   * Generate metadata for the visualization
   * @param {Object} config - Original configuration
   * @param {number[]} intervals - Scale intervals
   * @param {string[]} tuning - Tuning notes
   * @param {string[]} scaleNotes - Generated scale notes
   * @returns {Object} Metadata object
   */
  generateMetadata(config, intervals, tuning, scaleNotes) {
    const { rootNote, scaleType, notesPerString, selectedScaleDegree } = config;
    
    // Detect scale type from intervals if custom
    const detectedScaleType = (scaleType === 'custom' || scaleType.startsWith('custom-'))
      ? this.scalePatterns.findScaleTypeFromIntervals(intervals) || 'custom'
      : scaleType;
    
    // Generate tuning description
    const tuningDescription = this.generateTuningDescription(tuning);
    
    return {
      rootNote,
      scaleType: detectedScaleType,
      intervals,
      tuning: tuningDescription,
      notesPerString,
      selectedScaleDegree,
      scaleNotes: scaleNotes.slice(0, intervals.length), // First iteration only
      totalNotesGenerated: scaleNotes.length
    };
  }

  /**
   * Generate human-readable tuning description
   * @param {string[]} tuning - Array of tuning notes
   * @returns {string} Tuning description
   */
  generateTuningDescription(tuning) {
    const stringCount = tuning.length;
    const noteNames = tuning.map(note => this.musicalTheory.getNoteName(note));
    
    if (stringCount === 12) return '12-String Perfect 4ths';
    if (stringCount === 6) return '6-String Guitar';
    if (stringCount === 5) return '5-String Bass';
    if (stringCount === 4) return '4-String Bass';
    
    return `${stringCount}-String (${noteNames.join('-')})`;
  }

  /**
   * Validate configuration object
   * @param {Object} config - Configuration to validate
   * @throws {Error} If configuration is invalid
   */
  validateConfiguration(config) {
    const required = ['rootNote', 'scaleType', 'tuningName', 'notesPerString', 'selectedScaleDegree'];
    
    for (const field of required) {
      if (config[field] === undefined || config[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if ((config.scaleType === 'custom' || config.scaleType.startsWith('custom-')) && !config.customIntervals) {
      throw new Error('Custom intervals required when scaleType is "custom"');
    }
    
    if (config.notesPerString < 1 || config.notesPerString > 12) {
      throw new Error('Notes per string must be between 1 and 12');
    }
    
    if (config.selectedScaleDegree < 1) {
      throw new Error('Selected scale degree must be >= 1');
    }
    
    // Validate tuning exists
    if (!this.fretboardAlgorithm.constructor.isValidTuning(config.tuningName)) {
      throw new Error(`Invalid tuning: ${config.tuningName}`);
    }
  }
}



// === core/preset-manager.js ===
/**
 * Preset Manager - Handle all preset and preference storage operations
 * Manages localStorage operations for scale preferences and custom presets
 */

class PresetManager {
  constructor() {
    // Storage keys
    this.SCALE_PREFERENCES_KEY = 'guitar-scale-visualizer-scale-preferences';
    this.GLOBAL_PREFERENCES_KEY = 'guitar-scale-visualizer-global-preferences';
    this.CUSTOM_PRESETS_KEY = 'guitar-scale-visualizer-custom-presets';
  }

  /**
   * Save preferences for a specific scale type
   * @param {string} scaleType - Scale type identifier
   * @param {Object} preferences - Preference object
   * @param {string} preferences.title - Scale title
   * @param {number} preferences.notesPerString - Notes per string setting
   * @param {number} preferences.selectedScaleDegree - Selected scale degree
   * @param {string} preferences.rootNote - Root note
   */
  saveScalePreferences(scaleType, preferences) {
    try {
      const allPreferences = this.getScalePreferences();
      allPreferences[scaleType] = {
        title: preferences.title,
        notesPerString: preferences.notesPerString,
        selectedScaleDegree: preferences.selectedScaleDegree,
        rootNote: preferences.rootNote
      };
      
      localStorage.setItem(this.SCALE_PREFERENCES_KEY, JSON.stringify(allPreferences));
    } catch (error) {
      console.warn('Failed to save scale preferences:', error);
    }
  }

  /**
   * Load preferences for a specific scale type
   * @param {string} scaleType - Scale type identifier
   * @returns {Object|null} Preference object or null if not found
   */
  loadScalePreferences(scaleType) {
    const allPreferences = this.getScalePreferences();
    return allPreferences[scaleType] || null;
  }

  /**
   * Get all scale preferences
   * @returns {Object} All scale preferences object
   */
  getScalePreferences() {
    try {
      const stored = localStorage.getItem(this.SCALE_PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load scale preferences:', error);
      return {};
    }
  }

  /**
   * Save global preferences (tuning, last scale, etc.)
   * @param {Object} preferences - Global preference object
   * @param {string} preferences.tuning - Selected tuning
   * @param {string} preferences.lastScaleType - Last selected scale type
   */
  saveGlobalPreferences(preferences) {
    try {
      const current = this.getGlobalPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.GLOBAL_PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save global preferences:', error);
    }
  }

  /**
   * Load global preferences
   * @returns {Object} Global preferences object
   */
  getGlobalPreferences() {
    try {
      const stored = localStorage.getItem(this.GLOBAL_PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load global preferences:', error);
      return {};
    }
  }

  /**
   * Save a custom preset
   * @param {string} presetName - Unique preset name
   * @param {Object} preset - Preset data
   * @param {string} preset.title - Display title
   * @param {number[]} preset.intervals - Scale intervals
   * @param {number} preset.notesPerString - Notes per string
   * @param {number} preset.selectedScaleDegree - Selected scale degree
   * @param {string} preset.rootNote - Root note
   */
  saveCustomPreset(presetName, preset) {
    try {
      const customPresets = this.getCustomPresets();
      customPresets[presetName] = {
        title: preset.title,
        intervals: preset.intervals,
        notesPerString: preset.notesPerString,
        selectedScaleDegree: preset.selectedScaleDegree,
        rootNote: preset.rootNote,
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
    } catch (error) {
      console.warn('Failed to save custom preset:', error);
      throw new Error('Failed to save preset');
    }
  }

  /**
   * Load a custom preset
   * @param {string} presetName - Preset name
   * @returns {Object|null} Preset data or null if not found
   */
  loadCustomPreset(presetName) {
    const customPresets = this.getCustomPresets();
    return customPresets[presetName] || null;
  }

  /**
   * Get all custom presets
   * @returns {Object} All custom presets object
   */
  getCustomPresets() {
    try {
      const stored = localStorage.getItem(this.CUSTOM_PRESETS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load custom presets:', error);
      return {};
    }
  }

  /**
   * Delete a custom preset
   * @param {string} presetName - Preset name to delete
   * @returns {boolean} True if deleted successfully
   */
  deleteCustomPreset(presetName) {
    try {
      const customPresets = this.getCustomPresets();
      if (customPresets[presetName]) {
        delete customPresets[presetName];
        localStorage.setItem(this.CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to delete custom preset:', error);
      return false;
    }
  }

  /**
   * Check if a preset name is a custom preset
   * @param {string} presetName - Preset name to check
   * @returns {boolean} True if it's a custom preset
   */
  isCustomPreset(presetName) {
    const customPresets = this.getCustomPresets();
    return presetName in customPresets;
  }

  /**
   * Get all preset names (built-in + custom)
   * @param {Object} builtInScalePatterns - Built-in scale patterns object
   * @returns {string[]} Array of all preset names
   */
  getAllPresetNames(builtInScalePatterns) {
    const builtInNames = Object.keys(builtInScalePatterns);
    const customNames = Object.keys(this.getCustomPresets());
    return [...builtInNames, ...customNames];
  }

  /**
   * Export all presets and preferences to JSON
   * @returns {Object} Complete export data
   */
  exportAllData() {
    return {
      scalePreferences: this.getScalePreferences(),
      globalPreferences: this.getGlobalPreferences(),
      customPresets: this.getCustomPresets(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import presets and preferences from JSON data
   * @param {Object} data - Import data object
   * @param {Object} options - Import options
   * @param {boolean} options.overwrite - Whether to overwrite existing data
   * @returns {Object} Import result summary
   */
  importAllData(data, options = { overwrite: false }) {
    const result = {
      scalePreferences: 0,
      customPresets: 0,
      globalPreferences: 0,
      errors: []
    };

    try {
      // Validate import data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid import data format');
      }

      // Import scale preferences
      if (data.scalePreferences) {
        if (options.overwrite) {
          localStorage.setItem(this.SCALE_PREFERENCES_KEY, JSON.stringify(data.scalePreferences));
        } else {
          const current = this.getScalePreferences();
          const merged = { ...current, ...data.scalePreferences };
          localStorage.setItem(this.SCALE_PREFERENCES_KEY, JSON.stringify(merged));
        }
        result.scalePreferences = Object.keys(data.scalePreferences).length;
      }

      // Import custom presets
      if (data.customPresets) {
        if (options.overwrite) {
          localStorage.setItem(this.CUSTOM_PRESETS_KEY, JSON.stringify(data.customPresets));
        } else {
          const current = this.getCustomPresets();
          const merged = { ...current, ...data.customPresets };
          localStorage.setItem(this.CUSTOM_PRESETS_KEY, JSON.stringify(merged));
        }
        result.customPresets = Object.keys(data.customPresets).length;
      }

      // Import global preferences
      if (data.globalPreferences) {
        if (options.overwrite) {
          localStorage.setItem(this.GLOBAL_PREFERENCES_KEY, JSON.stringify(data.globalPreferences));
        } else {
          const current = this.getGlobalPreferences();
          const merged = { ...current, ...data.globalPreferences };
          localStorage.setItem(this.GLOBAL_PREFERENCES_KEY, JSON.stringify(merged));
        }
        result.globalPreferences = Object.keys(data.globalPreferences).length;
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Clear all stored data (useful for testing or reset)
   * @param {Object} options - Clear options
   * @param {boolean} options.scalePreferences - Clear scale preferences
   * @param {boolean} options.globalPreferences - Clear global preferences  
   * @param {boolean} options.customPresets - Clear custom presets
   */
  clearAllData(options = { scalePreferences: true, globalPreferences: true, customPresets: true }) {
    try {
      if (options.scalePreferences) {
        localStorage.removeItem(this.SCALE_PREFERENCES_KEY);
      }
      if (options.globalPreferences) {
        localStorage.removeItem(this.GLOBAL_PREFERENCES_KEY);
      }
      if (options.customPresets) {
        localStorage.removeItem(this.CUSTOM_PRESETS_KEY);
      }
    } catch (error) {
      console.warn('Failed to clear data:', error);
    }
  }

  /**
   * Validate preset data structure
   * @param {Object} preset - Preset to validate
   * @returns {boolean} True if valid
   */
  validatePreset(preset) {
    if (!preset || typeof preset !== 'object') return false;
    
    const required = ['title', 'intervals', 'notesPerString', 'selectedScaleDegree', 'rootNote'];
    return required.every(field => Object.prototype.hasOwnProperty.call(preset, field));
  }
}



// === widget.js ===
class StringedInstrumentVisualizer {
  constructor() {
    // Get DOM elements with error checking
    const requiredElements = {
      svg: 'fretboard',
      tuningPresetSelect: 'tuning-preset',
      rootNoteSelect: 'root-note',
      scaleTypeSelect: 'scale-type',
      scaleIntervalsInput: 'scale-intervals',
      notesPerStringInput: 'notes-per-string',
      selectedScaleDegreeInput: 'selected-scale-degree',
      saveSvgButton: 'save-svg-button',
      exportButton: 'export-button',
      savePresetButton: 'save-preset-button',
      updatePresetButton: 'update-preset-button',
      deletePresetButton: 'delete-preset-button',
      importFile: 'import-file',
      scaleTitleInput: 'scale-title'
    };

    // Initialize DOM elements with error checking
    for (const [property, elementId] of Object.entries(requiredElements)) {
      this[property] = document.getElementById(elementId);
      if (!this[property]) {
        throw new Error(`Required DOM element not found: ${elementId}`);
      }
    }
    
    // Initialize core modules
    this.musicalTheory = new (window.MusicalTheory || MusicalTheory)();
    this.scalePatterns = new (window.ScalePatterns || ScalePatterns)();
    this.fretboardAlgorithm = new (window.FretboardAlgorithm || FretboardAlgorithm)();
    
    // Initialize new core modules 
    // eslint-disable-next-line no-undef
    this.scaleVisualizer = new (window.ScaleVisualizer || ScaleVisualizer)(
      this.musicalTheory,
      this.scalePatterns,
      this.fretboardAlgorithm
    );
    // eslint-disable-next-line no-undef
    this.presetManager = new (window.PresetManager || PresetManager)();
    
    // Visualization settings
    this.fretSpacing = 60;
    this.stringSpacing = 40;
    this.margin = { top: 40, right: 20, bottom: 60, left: 80 };
    this.titleHeight = 60;
    this.noteCircleRadius = 18;
    
    this.selectedScaleDegree = 1;
    
    this.init();
  }

  // Getter for tuning presets (delegated to core)
  get tuningPresets() {
    return this.fretboardAlgorithm.constructor.TUNING_PRESETS;
  }

  // Getter for scale interval patterns (delegated to core)
  get scaleIntervalPatterns() {
    return this.scalePatterns.scaleIntervalPatterns;
  }

  // Getter for default scale preferences (delegated to core)
  get defaultScalePreferences() {
    return this.scalePatterns.defaultScalePreferences;
  }
  
  init() {
    this.loadGlobalPreferences(); // Load global settings (tuning, last scale)
    this.updateScaleDropdown(); // Build dropdown with built-in + custom presets
    this.setupEventListeners();
    this.loadScalePreferences(this.scaleTypeSelect.value); // Load scale preferences and intervals
    this.updatePresetButtonVisibility(); // Set initial button visibility
    this.updateNPSConstraints(); // Set initial NPS constraints
    this.updateVisualization();
  }
  
  setupEventListeners() {
    // Store handler references for cleanup
    this.tuningChangeHandler = () => {
      this.updateVisualization();
      this.saveGlobalPreferences();
    };
    this.rootNoteChangeHandler = () => {
      this.updateVisualization();
      this.saveScalePreferences();
    };
    this.scaleTypeChangeHandler = () => {
      this.loadScalePreferences(this.scaleTypeSelect.value);
      this.updatePresetButtonVisibility();
      this.updateVisualization();
    };
    this.scaleIntervalsChangeHandler = () => {
      this.updateScaleTypeFromIntervals();
      this.updateNPSConstraints();
      this.updateVisualization();
      this.saveScalePreferences();
    };
    this.notesPerStringChangeHandler = () => {
      document.getElementById('nps-value').textContent = this.notesPerStringInput.value;
      this.updateVisualization();
      this.saveScalePreferences();
    };
    this.selectedScaleDegreeChangeHandler = () => {
      const newDegree = parseInt(this.selectedScaleDegreeInput.value);
      if (newDegree >= 1 && newDegree <= this.musicalTheory.parseIntervals(this.scaleIntervalsInput.value).length) {
        this.selectedScaleDegree = newDegree;
        this.updateVisualization();
        this.saveScalePreferences();
      }
    };
    this.scaleTitleChangeHandler = () => {
      this.saveScalePreferences();
    };
    this.saveSvgClickHandler = () => this.saveSvgVisualization();
    this.exportClickHandler = () => this.exportCurrentPattern();
    this.savePresetClickHandler = () => this.promptSaveCustomPreset();
    this.updatePresetClickHandler = () => this.updateCurrentPreset();
    this.deletePresetClickHandler = () => this.deleteCurrentPreset();
    this.importFileChangeHandler = (e) => this.handleImportFile(e);
    
    // Add event listeners
    this.tuningPresetSelect.addEventListener('change', this.tuningChangeHandler);
    this.rootNoteSelect.addEventListener('change', this.rootNoteChangeHandler);
    this.scaleTypeSelect.addEventListener('change', this.scaleTypeChangeHandler);
    this.scaleIntervalsInput.addEventListener('input', this.scaleIntervalsChangeHandler);
    this.notesPerStringInput.addEventListener('input', this.notesPerStringChangeHandler);
    this.selectedScaleDegreeInput.addEventListener('input', this.selectedScaleDegreeChangeHandler);
    this.scaleTitleInput.addEventListener('input', this.scaleTitleChangeHandler);
    this.saveSvgButton.addEventListener('click', this.saveSvgClickHandler);
    this.exportButton.addEventListener('click', this.exportClickHandler);
    this.savePresetButton.addEventListener('click', this.savePresetClickHandler);
    this.updatePresetButton.addEventListener('click', this.updatePresetClickHandler);
    this.deletePresetButton.addEventListener('click', this.deletePresetClickHandler);
    this.importFile.addEventListener('change', this.importFileChangeHandler);
  }
  
  destroy() {
    // Clean up event listeners to prevent memory leaks
    if (this.tuningChangeHandler) this.tuningPresetSelect.removeEventListener('change', this.tuningChangeHandler);
    if (this.rootNoteChangeHandler) this.rootNoteSelect.removeEventListener('change', this.rootNoteChangeHandler);
    if (this.scaleTypeChangeHandler) this.scaleTypeSelect.removeEventListener('change', this.scaleTypeChangeHandler);
    if (this.scaleIntervalsChangeHandler) this.scaleIntervalsInput.removeEventListener('input', this.scaleIntervalsChangeHandler);
    if (this.notesPerStringChangeHandler) this.notesPerStringInput.removeEventListener('input', this.notesPerStringChangeHandler);
    if (this.selectedScaleDegreeChangeHandler) this.selectedScaleDegreeInput.removeEventListener('input', this.selectedScaleDegreeChangeHandler);
    if (this.scaleTitleChangeHandler) this.scaleTitleInput.removeEventListener('input', this.scaleTitleChangeHandler);
    if (this.saveSvgClickHandler) this.saveSvgButton.removeEventListener('click', this.saveSvgClickHandler);
    if (this.exportClickHandler) this.exportButton.removeEventListener('click', this.exportClickHandler);
    if (this.savePresetClickHandler) this.savePresetButton.removeEventListener('click', this.savePresetClickHandler);
    if (this.updatePresetClickHandler) this.updatePresetButton.removeEventListener('click', this.updatePresetClickHandler);
    if (this.deletePresetClickHandler) this.deletePresetButton.removeEventListener('click', this.deletePresetClickHandler);
    if (this.importFileChangeHandler) this.importFile.removeEventListener('change', this.importFileChangeHandler);
    
    // Clear SVG content
    if (this.svg) this.svg.innerHTML = '';
  }
  
  updateScaleTypeFromIntervals() {
    const inputArray = this.musicalTheory.parseIntervals(this.scaleIntervalsInput.value);
    const matchingScale = this.scalePatterns.findScaleTypeFromIntervals(inputArray);
    this.scaleTypeSelect.value = matchingScale || 'custom';
  }
  
  updateNPSConstraints() {
    const scaleLength = this.musicalTheory.parseIntervals(this.scaleIntervalsInput.value).length;
    
    // Handle case where scale has no valid notes (empty or invalid intervals)
    if (scaleLength === 0) {
      this.notesPerStringInput.max = 1;
      this.notesPerStringInput.value = 1;
      document.getElementById('nps-value').textContent = 1;
      this.selectedScaleDegreeInput.max = 1;
      this.selectedScaleDegree = 1;
      this.selectedScaleDegreeInput.value = 1;
      return;
    }
    
    this.notesPerStringInput.max = scaleLength;
    const currentNPS = parseInt(this.notesPerStringInput.value);
    if (currentNPS > scaleLength) {
      this.notesPerStringInput.value = scaleLength;
      document.getElementById('nps-value').textContent = scaleLength;
    }
    
    this.selectedScaleDegreeInput.max = scaleLength;
    if (this.selectedScaleDegree > scaleLength) {
      this.selectedScaleDegree = 1;
      this.selectedScaleDegreeInput.value = 1;
    }
  }
  
  onNoteClick(clickedScaleDegree) {
    this.selectedScaleDegree = clickedScaleDegree;
    this.selectedScaleDegreeInput.value = clickedScaleDegree;
    this.updateVisualization();
  }

  generateTitleInfo() {
    const scaleTitle = this.scaleTitleInput.value || 'Scale';
    const rootNote = this.rootNoteSelect.value;
    const tuningText = this.tuningPresetSelect.options[this.tuningPresetSelect.selectedIndex].text;
    const nps = this.notesPerStringInput.value;
    const scaleDegree = this.selectedScaleDegree;
    
    return {
      titleText: `${rootNote} ${scaleTitle} Unified Pattern`,
      subtitleText: `${tuningText} • ${nps} Notes per String • Starting from Scale Degree ${scaleDegree}`,
      filename: `${rootNote}_${scaleTitle}_Unified_Pattern`.replace(/[^a-zA-Z0-9]/g, '_'),
      tuning: tuningText.replace(/\s+/g, '_'),
      npsFormatted: `${nps}NPS`,
      degree: `Deg${scaleDegree}`,
      timestamp: new Date().toISOString().slice(0, 10)
    };
  }

  
  estimateTextWidth(text, fontSize) {
    // Rough estimation: average character width is about 0.6 * fontSize for most fonts
    return text.length * fontSize * 0.6;
  }
  
  calculateTitleDimensions() {
    const { titleText, subtitleText } = this.generateTitleInfo();
    const baseTitleSize = 18;
    const baseSubtitleSize = 12;
    const padding = 40; // Minimum padding on each side
    
    // Calculate required width for both texts at base sizes
    const titleWidth = this.estimateTextWidth(titleText, baseTitleSize);
    const subtitleWidth = this.estimateTextWidth(subtitleText, baseSubtitleSize);
    const maxTextWidth = Math.max(titleWidth, subtitleWidth);
    
    return {
      titleText,
      subtitleText,
      requiredWidth: maxTextWidth + (padding * 2),
      baseTitleSize,
      baseSubtitleSize
    };
  }
  
  addTitleToSvg(svgWidth) {
    const { titleText, subtitleText, requiredWidth, baseTitleSize, baseSubtitleSize } = this.calculateTitleDimensions();
    
    // Calculate scaling factor if text is too wide
    const availableWidth = svgWidth - 40; // Leave 20px padding on each side
    const scaleFactor = requiredWidth > availableWidth ? availableWidth / requiredWidth : 1;
    
    const titleSize = Math.max(12, baseTitleSize * scaleFactor); // Minimum 12px
    const subtitleSize = Math.max(10, baseSubtitleSize * scaleFactor); // Minimum 10px
    
    // Create title element
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', svgWidth / 2);
    title.setAttribute('y', 25);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', titleSize.toString());
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#1f2937'); // Gray-800
    title.textContent = titleText;
    this.svg.appendChild(title);
    
    // Create subtitle element
    const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    subtitle.setAttribute('x', svgWidth / 2);
    subtitle.setAttribute('y', 45);
    subtitle.setAttribute('text-anchor', 'middle');
    subtitle.setAttribute('font-size', subtitleSize.toString());
    subtitle.setAttribute('fill', '#4b5563'); // Gray-600
    subtitle.textContent = subtitleText;
    this.svg.appendChild(subtitle);
  }
  
  saveSvgVisualization() {
    // Get the current SVG content
    const svgElement = this.svg.cloneNode(true);
    
    // Add XML namespace and DOCTYPE for proper SVG file
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Create the SVG content with proper XML declaration
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgElement.outerHTML}`;
    
    // Generate filename based on current settings
    const { filename, tuning, npsFormatted, degree, timestamp } = this.generateTitleInfo();
    const svgFilename = `${filename}_${tuning}_${npsFormatted}_${degree}_${timestamp}.svg`;
    
    // Create and download the file
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = svgFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  updateVisualization() {
    try {
      // Collect configuration from UI
      const config = {
        rootNote: this.rootNoteSelect.value,
        scaleType: this.scaleTypeSelect.value,
        customIntervals: this.scaleIntervalsInput.value,
        tuningName: this.tuningPresetSelect.value,
        notesPerString: parseInt(this.notesPerStringInput.value),
        selectedScaleDegree: this.selectedScaleDegree
      };

      // Generate visualization data using ScaleVisualizer
      const visualizationData = this.scaleVisualizer.generateVisualizationData(config);
      
      // Render the fretboard with the generated data
      this.renderFretboard(visualizationData);
    } catch (error) {
      console.error('Error updating visualization:', error);
      // Clear the visualization on error to prevent broken display
      if (this.svg) {
        this.svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="red">Error: Unable to generate visualization</text>';
      }
    }
  }
  
  
  renderFretboard(visualizationData) {
    this.svg.innerHTML = '';
    
    const { notePositions, tuning, scaleLength, fretRange } = visualizationData;
    const stringCount = tuning.length;
    const [minFretToShow, maxFretToShow] = fretRange;
    
    const fretRangeSize = maxFretToShow - minFretToShow + 1;
    const fretboardWidth = fretRangeSize * this.fretSpacing + this.margin.left + this.margin.right;
    
    // Calculate minimum width needed for title text
    const { requiredWidth: titleWidth } = this.calculateTitleDimensions();
    
    // Use the larger of fretboard width or title width to ensure everything fits
    const width = Math.max(fretboardWidth, titleWidth);
    
    const titleHeight = this.titleHeight; // Space for title and subtitle
    const height = stringCount * this.stringSpacing + this.margin.top + this.margin.bottom + titleHeight;

    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Add title and subtitle to SVG
    this.addTitleToSvg(width);
    
    // Adjust margin.top to account for title space
    const adjustedMarginTop = this.margin.top + titleHeight;
    
    // Draw strings (horizontal lines) - reversed so lowest pitch is at bottom
    for (let string = 0; string < stringCount; string++) {
      const y = adjustedMarginTop + (stringCount - 1 - string) * this.stringSpacing;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', this.margin.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.margin.left + (fretRangeSize - 1) * this.fretSpacing);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#333');
      line.setAttribute('stroke-width', '2');
      this.svg.appendChild(line);
    }
    
    // Draw frets (vertical lines)
    for (let fret = minFretToShow; fret <= maxFretToShow; fret++) {
      const x = this.margin.left + (fret - minFretToShow) * this.fretSpacing;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', adjustedMarginTop);
      line.setAttribute('x2', x);
      line.setAttribute('y2', adjustedMarginTop + (stringCount - 1) * this.stringSpacing);
      line.setAttribute('stroke', fret === 0 ? '#000' : '#ccc');
      line.setAttribute('stroke-width', fret === 0 ? '4' : '1');
      this.svg.appendChild(line);
    }
    
    // Draw Y-axis string labels - reversed so lowest pitch is at bottom
    for (let string = 0; string < stringCount; string++) {
      const y = adjustedMarginTop + (stringCount - 1 - string) * this.stringSpacing;
      const stringName = this.musicalTheory.getNoteName(tuning[string]);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', this.margin.left - 20);
      text.setAttribute('y', y + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#333');
      text.textContent = stringName;
      this.svg.appendChild(text);
    }
    
    // Draw X-axis fret number labels
    for (let fret = minFretToShow + 1; fret <= maxFretToShow; fret++) {
      const x = this.margin.left + (fret - minFretToShow - 0.5) * this.fretSpacing;
      const y = adjustedMarginTop + (stringCount - 1) * this.stringSpacing + 30;
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#666');
      text.textContent = fret;
      this.svg.appendChild(text);
    }
    
    notePositions.forEach(([stringIndex, fret], index) => {
      const scaleDegree = this.scaleVisualizer.calculateScaleDegreeForPosition(
        index, 
        scaleLength, 
        this.selectedScaleDegree
      );
      this.drawNote(stringIndex, fret, scaleDegree, minFretToShow);
    });
  }
  
  drawNote(stringIndex, fret, scaleDegree, minFretToShow = 0) {
    const tuning = this.tuningPresets[this.tuningPresetSelect.value];
    const stringCount = tuning.length;
    
    const titleHeight = this.titleHeight; // Must match the titleHeight in renderFretboard
    const adjustedMarginTop = this.margin.top + titleHeight;
    const x = this.margin.left + (fret - minFretToShow - 0.5) * this.fretSpacing;
    const y = adjustedMarginTop + (stringCount - 1 - stringIndex) * this.stringSpacing;
    
    const openStringNote = tuning[stringIndex];
    const actualNoteName = this.musicalTheory.semitoneToNote(this.musicalTheory.parseNote(openStringNote) + fret);
    const isSelected = scaleDegree === this.selectedScaleDegree;
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', this.noteCircleRadius.toString());
    circle.setAttribute('fill', isSelected ? '#fff' : '#000');
    circle.setAttribute('stroke', isSelected ? '#000' : '#fff');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', 'note clickable-note');
    circle.setAttribute('data-note', actualNoteName);
    circle.setAttribute('data-scale-degree', scaleDegree);
    circle.style.cursor = 'pointer';
    
    circle.addEventListener('click', () => this.onNoteClick(scaleDegree));
    
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = this.musicalTheory.getNoteName(actualNoteName);
    circle.appendChild(title);
    
    this.svg.appendChild(circle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', isSelected ? '#000' : '#fff');
    text.setAttribute('class', 'note clickable-note');
    text.setAttribute('data-note', actualNoteName);
    text.setAttribute('data-scale-degree', scaleDegree);
    text.style.cursor = 'pointer';
    text.style.pointerEvents = 'none';
    text.textContent = scaleDegree;
    this.svg.appendChild(text);
  }
  
  // Per-Scale Preferences and Global Settings
  saveScalePreferences() {
    const scaleType = this.scaleTypeSelect.value;
    const preferences = {
      title: this.scaleTitleInput.value,
      notesPerString: parseInt(this.notesPerStringInput.value),
      selectedScaleDegree: this.selectedScaleDegree,
      rootNote: this.rootNoteSelect.value
    };
    
    this.presetManager.saveScalePreferences(scaleType, preferences);
  }
  
  loadScalePreferences(scaleType) {
    // Check if it's a custom preset first
    const customPreset = this.presetManager.loadCustomPreset(scaleType);
    if (customPreset) {
      this.scaleIntervalsInput.value = customPreset.intervals.join(',');
      this.scaleTitleInput.value = customPreset.title;
      this.notesPerStringInput.value = customPreset.notesPerString;
      document.getElementById('nps-value').textContent = customPreset.notesPerString;
      this.selectedScaleDegree = customPreset.selectedScaleDegree;
      this.selectedScaleDegreeInput.value = customPreset.selectedScaleDegree;
      this.rootNoteSelect.value = customPreset.rootNote;
      this.updateNPSConstraints();
      return;
    }
    
    // Handle built-in scales
    const scalePrefs = this.presetManager.loadScalePreferences(scaleType) || this.defaultScalePreferences[scaleType];
    
    if (scalePrefs) {
      // Load intervals from built-in pattern
      const intervals = this.scaleIntervalPatterns[scaleType];
      if (intervals) {
        this.scaleIntervalsInput.value = intervals.join(',');
      }
      
      // Load scale-specific preferences
      this.scaleTitleInput.value = scalePrefs.title;
      this.notesPerStringInput.value = scalePrefs.notesPerString;
      document.getElementById('nps-value').textContent = scalePrefs.notesPerString;
      this.selectedScaleDegree = scalePrefs.selectedScaleDegree;
      this.selectedScaleDegreeInput.value = scalePrefs.selectedScaleDegree;
      this.rootNoteSelect.value = scalePrefs.rootNote;
      
      this.updateNPSConstraints();
    }
  }
  
  
  saveGlobalPreferences() {
    const globalPrefs = {
      tuning: this.tuningPresetSelect.value,
      lastScaleType: this.scaleTypeSelect.value
    };
    
    this.presetManager.saveGlobalPreferences(globalPrefs);
  }
  
  loadGlobalPreferences() {
    const globalPrefs = this.presetManager.getGlobalPreferences();
    if (globalPrefs.tuning) this.tuningPresetSelect.value = globalPrefs.tuning;
    if (globalPrefs.lastScaleType) this.scaleTypeSelect.value = globalPrefs.lastScaleType;
  }
  
  
  exportCurrentPattern() {
    const pattern = {
      name: this.scaleTitleInput.value || `${this.rootNoteSelect.value} ${this.scaleTypeSelect.options[this.scaleTypeSelect.selectedIndex].text} Pattern`,
      intervals: this.musicalTheory.parseIntervals(this.scaleIntervalsInput.value),
      rootNote: this.rootNoteSelect.value,
      notesPerString: parseInt(this.notesPerStringInput.value),
      tuning: this.tuningPresetSelect.value,
      selectedScaleDegree: this.selectedScaleDegree,
      scaleType: this.scaleTypeSelect.value
    };
    
    const blob = new Blob([JSON.stringify(pattern, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pattern.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const pattern = JSON.parse(e.target.result);
        this.importPattern(pattern);
      } catch (error) {
        alert('Error reading file: Invalid JSON format');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }
  
  importPattern(pattern) {
    try {
      // Validate required fields
      if (!pattern.intervals || !Array.isArray(pattern.intervals)) {
        throw new Error('Invalid pattern: missing or invalid intervals');
      }
      
      // Apply pattern to UI
      if (pattern.rootNote) this.rootNoteSelect.value = pattern.rootNote;
      if (pattern.tuning && this.tuningPresets[pattern.tuning]) {
        this.tuningPresetSelect.value = pattern.tuning;
      }
      if (pattern.notesPerString) {
        this.notesPerStringInput.value = pattern.notesPerString;
        document.getElementById('nps-value').textContent = pattern.notesPerString;
      }
      if (pattern.selectedScaleDegree) {
        this.selectedScaleDegree = pattern.selectedScaleDegree;
        this.selectedScaleDegreeInput.value = pattern.selectedScaleDegree;
      }
      
      // Set intervals and update scale type
      this.scaleIntervalsInput.value = pattern.intervals.join(',');
      this.updateScaleTypeFromIntervals();
      
      // Set scale title if provided
      if (pattern.name) {
        this.scaleTitleInput.value = pattern.name;
      }
      
      // Save as custom preset to make it persistent
      const presetName = pattern.name || 'Imported Pattern';
      this.saveCustomPreset(presetName, pattern.intervals);
      
      // Update constraints and visualization
      this.updateNPSConstraints();
      this.updateVisualization();
      this.saveScalePreferences();
      this.saveGlobalPreferences();
      
    } catch (error) {
      alert(`Error importing pattern: ${error.message}`);
      console.error('Import pattern error:', error);
    }
  }
  
  
  saveCustomPreset(name, intervals) {
    const presetId = `custom-${Date.now()}`;
    
    const preset = {
      title: name,
      intervals: intervals || this.musicalTheory.parseIntervals(this.scaleIntervalsInput.value),
      notesPerString: parseInt(this.notesPerStringInput.value),
      selectedScaleDegree: this.selectedScaleDegree,
      rootNote: this.rootNoteSelect.value
    };
    
    try {
      this.presetManager.saveCustomPreset(presetId, preset);
      this.updateScaleDropdown();
      this.scaleTypeSelect.value = presetId; // Select the newly created preset
      this.updatePresetButtonVisibility(); // Update button visibility for the new preset
      return presetId;
    } catch (e) {
      alert('Failed to save preset. Please try again.');
      return null;
    }
  }
  
  promptSaveCustomPreset() {
    const currentTitle = this.scaleTitleInput.value || 'Custom Scale';
    const presetName = prompt('Save current pattern as preset:', currentTitle);
    
    if (presetName && presetName.trim()) {
      this.saveCustomPreset(presetName.trim());
    }
  }
  
  updateCurrentPreset() {
    const scaleType = this.scaleTypeSelect.value;
    
    if (this.presetManager.isCustomPreset(scaleType)) {
      const currentPreset = this.presetManager.loadCustomPreset(scaleType);
      const currentTitle = this.scaleTitleInput.value || currentPreset.title;
      
      const updatedPreset = {
        title: currentTitle,
        intervals: this.musicalTheory.parseIntervals(this.scaleIntervalsInput.value),
        notesPerString: parseInt(this.notesPerStringInput.value),
        selectedScaleDegree: this.selectedScaleDegree,
        rootNote: this.rootNoteSelect.value
      };
      
      try {
        this.presetManager.saveCustomPreset(scaleType, updatedPreset);
        this.updateScaleDropdown();
        this.scaleTypeSelect.value = scaleType; // Keep current preset selected
      } catch (e) {
        alert('Failed to update preset. Please try again.');
      }
    }
  }
  
  deleteCurrentPreset() {
    const scaleType = this.scaleTypeSelect.value;
    
    if (this.presetManager.isCustomPreset(scaleType)) {
      const preset = this.presetManager.loadCustomPreset(scaleType);
      const presetTitle = preset.title;
      
      if (confirm(`Are you sure you want to delete the preset "${presetTitle}"? This action cannot be undone.`)) {
        if (this.presetManager.deleteCustomPreset(scaleType)) {
          this.updateScaleDropdown();
          this.scaleTypeSelect.value = 'major'; // Switch to default preset
          this.loadScalePreferences('major');
          this.updatePresetButtonVisibility();
          this.updateVisualization();
        } else {
          alert('Failed to delete preset. Please try again.');
        }
      }
    }
  }
  
  updatePresetButtonVisibility() {
    const scaleType = this.scaleTypeSelect.value;
    const isCustomPreset = this.presetManager.isCustomPreset(scaleType);
    
    this.updatePresetButton.style.display = isCustomPreset ? 'block' : 'none';
    this.deletePresetButton.style.display = isCustomPreset ? 'block' : 'none';
  }
  
  updateScaleDropdown() {
    const currentValue = this.scaleTypeSelect.value;
    
    // Clear existing options
    this.scaleTypeSelect.innerHTML = '';
    
    // Add built-in scales from existing scale definitions
    Object.keys(this.defaultScalePreferences).forEach(scaleKey => {
      const option = document.createElement('option');
      option.value = scaleKey;
      option.textContent = this.defaultScalePreferences[scaleKey].title.replace(' Scale', '').replace(' Mode', '');
      this.scaleTypeSelect.appendChild(option);
    });
    
    // Add custom presets
    const customPresets = this.presetManager.getCustomPresets();
    const customPresetIds = Object.keys(customPresets);
    
    if (customPresetIds.length > 0) {
      // Add separator
      const separator = document.createElement('option');
      separator.disabled = true;
      separator.textContent = '────── Custom Presets ──────';
      this.scaleTypeSelect.appendChild(separator);
      
      // Add custom presets
      customPresetIds.forEach(presetId => {
        const preset = customPresets[presetId];
        const option = document.createElement('option');
        option.value = presetId;
        option.textContent = `⭐ ${preset.title}`;
        this.scaleTypeSelect.appendChild(option);
      });
    }
    
    // Restore previous selection if it still exists
    if (currentValue) {
      const optionExists = Array.from(this.scaleTypeSelect.options).some(opt => opt.value === currentValue);
      if (optionExists) {
        this.scaleTypeSelect.value = currentValue;
      } else {
        this.scaleTypeSelect.value = 'major'; // Default fallback
      }
    }
    
    // Update button visibility after dropdown rebuild
    this.updatePresetButtonVisibility();
  }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.visualizer = new StringedInstrumentVisualizer();
});

</script>

<style>
#instrument-visualizer {
  max-width: 100%;
}

#fretboard-container {
  border: 2px solid #333;
  border-radius: 8px;
  background: #fff;
  padding: 20px;
}


.controls select {
  font-family: inherit;
}

.note {
  cursor: pointer;
}

.note:hover {
  opacity: 0.8;
}

.clickable-note {
  transition: opacity 0.2s ease;
}

.clickable-note:hover {
  opacity: 0.7;
}

/* Match the grid-like appearance from the provided image */
#fretboard {
  background: #fff;
}

/* Print styles */
@media print {
  /* Force portrait orientation */
  @page {
    size: portrait;
    margin: 0.5in;
  }
  
  /* Hide everything except visualization and title */
  .noprint,
  .controls,
  footer,
  #print-button,
  #export-button,
  #save-preset-button,
  #import-file,
  label[for="import-file"] {
    display: none !important;
  }
  
  /* Hide the intro text */
  .noprint {
    display: none !important;
  }
  
  /* Hide site title and page title when printing */
  body > div > div:first-child,
  body > div > .text-2xl,
  h1 {
    display: none !important;
  }
  
  /* Make visualization fill the page */
  body {
    margin: 0;
    padding: 0;
  }
  
  #instrument-visualizer {
    max-width: none;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  #visualization-title {
    margin-bottom: 20px;
    page-break-inside: avoid;
    page-break-after: avoid;
    text-align: center;
  }
  
  #fretboard-container {
    border: none !important;
    padding: 0;
    margin: 0;
    overflow: visible;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    page-break-before: avoid;
  }
  
  /* Scale the fretboard to use full width */
  #fretboard {
    width: 100%;
    height: auto;
    max-width: none;
  }
}
</style>

## Explanation

Most guitarists are taught scales in a horribly complicated way. It's typical to memorize scales in "boxes" with combinations of 2 or three notes per string. When you divide scales this way you have to memorize 4 or 5 or six "boxes" up the neck for each scale type. That's too many shapes to memorize, which is too easy to give up.

I've been experimenting with easier ways to remember scales over the last year and independently came to a thing that metal guitarists have known for years called the [Grand Unified Pattern](https://fretscience.com/2022/10/09/3nps-one-pattern-to-rule-them-all/). It's absolutely worth reading that article, it'll save you years of scale anguish. The **tl;dr** is: for any musical scale on any stringed instrument, if you limit yourself to a consistent number of notes per string, a symmetry arises ~~at the least common multiple of 1) #notes in the scale and 2) #notes per string.~~ at the `least common multiple(notes in scale, notes per string) / notes per string`. Therefore there's a single "box" you can learn for any scale that applies across the entire neck.

<p class="text-sm i">I was corrected on the formula here by Keith Martin of Fret Science. --D</p>

Let me say that again: **for any scale that exists you can learn a single "box" and it'll work acros the entire neck of your instrument.** The article I linked above walks through it for the major scale and also shows how to derive modes from that same shape, which is a bonus.

## Notes on the Method

1. For seven-note scales, the "unified" scale box is seven strings wide. Your guitar is only six strings wide -- that's why it seems like you have to learn a bunch of different shapes! But you don't! Just figure out which note you're on in the pattern and go from there.
  - Side note: One reason pentatonic scales are so easy on guitar is because they're 5-note scales typically played in 2NPS. Played this way, they're symmetrical over 5 strings, which fits nicely. The unified pattern still applies - the other "box" shapes you learn for a pentatonic are the _same pattern_, just starting on a different note. Learn the pattern, you don't have to memorize the boxes.
  - This is also true of major/minor pentatonics: same pattern but minor starts on the 5th interval of the major shape. Try it yourself!
2. I've defaulted to a fictional many-stringed instrument tuned in perfect 4ths (like the bottom four strings of a guitar) because I find it helpful to think of the pattern symmetrically. On a guitar in standard tuning, this means that when moving up from the G to B string you need to shift the pattern one fret left, or one fret right when moving down. I've added a selector for standard guitar/bass tuning if it helps to visualize how the pattern shifts.
3. Modes are just scale patterns starting on a different note. This is easy in the visualizer - just click on a note or type the starting interval and the pattern will shift to start with that note but keep the NPS the same. It's a handy way to help learn how the "shifting" works. But *remember*: modes are the same exact pattern! Just starting at a different place.

## Next Steps

There are plenty of next steps you can take with this tool. For example, with traditional 7-note scales, you can learn to leverage the fact that the pattern natually moves you up the neck on guitar, combined with the fact that the high and low E strings are the same piece of the pattern, and you can move all the way up the neck "rotating" the pattern. 

Another next step you can take is to learn the scales on one string (i.e. 7NPS for a 7-note scale). Then learn how to pick a random spot on the scale and start moving up strings instead of up the neck. The visualizer allows you to pick any NPS you want up to the number of notes in the scale pattern, so you can see what this looks like if that helps.


## Notes on the Visualizer Tool

This tool was "vibe-coded" with Claude Code. This is my first greenfield coding project done in this way, and I have to say it was actually a blast. I never would have made the tool this polished if I'd had to write all the code - not from inability, but from lack of time or desire.

The current version of the [source](https://github.com/dmerand/donald.merand.org/tree/master/lib/unified-nps) will be linked below the diagram. I've designed the repo to leave lots of breadcrumbs for Claude to pick up work so that I can work between sessions. If you're interested in that workflow, check out the [TODO.md](https://github.com/dmerand/donald.merand.org/blob/master/lib/unified-nps/TODO.md) and [.claude/README.md](https://github.com/dmerand/donald.merand.org/blob/master/lib/unified-nps/.claude/README.md), which are designed to provide agent context when working with the repo.
