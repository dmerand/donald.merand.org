/*
 * Guitar Scale Visualizer
 * Version: 1.0.0
 * Built: 2025-06-14T20:00:06.730Z
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
      'bass-5-string': ['B1', 'E2', 'A2', 'D3', 'G3']
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

  calculateScaleDegreeForPosition(index, scaleLength) {
    const rotatedDegree = (index % scaleLength) + 1;
    return ((rotatedDegree - 1 + this.selectedScaleDegree - 1) % scaleLength) + 1;
  }
  
  addTitleToSvg(svgWidth) {
    const { titleText, subtitleText } = this.generateTitleInfo();
    
    // Create title element
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', svgWidth / 2);
    title.setAttribute('y', 25);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '18');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#1f2937'); // Gray-800
    title.textContent = titleText;
    this.svg.appendChild(title);
    
    // Create subtitle element
    const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    subtitle.setAttribute('x', svgWidth / 2);
    subtitle.setAttribute('y', 45);
    subtitle.setAttribute('text-anchor', 'middle');
    subtitle.setAttribute('font-size', '12');
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
      const tuning = this.tuningPresets[this.tuningPresetSelect.value];
      const notesPerString = parseInt(this.notesPerStringInput.value);
      const selectedNote = this.rootNoteSelect.value;
      const octave2Notes = ['F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const rootNote = selectedNote + (octave2Notes.includes(selectedNote) ? '2' : '3');
      const intervalString = this.scaleIntervalsInput.value;
      const scaleLength = this.musicalTheory.parseIntervals(intervalString).length;
      
      const scaleNotes = this.musicalTheory.generateExtendedScale(rootNote, intervalString, notesPerString, this.selectedScaleDegree);
      const notePositions = this.fretboardAlgorithm.findNotes(scaleNotes, tuning, notesPerString, this.musicalTheory);

      this.renderFretboard(tuning.length, notePositions, scaleLength);
    } catch (error) {
      console.error('Error updating visualization:', error);
      // Clear the visualization on error to prevent broken display
      if (this.svg) {
        this.svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="red">Error: Unable to generate visualization</text>';
      }
    }
  }
  
  
  renderFretboard(stringCount, notePositions, scaleLength) {
    this.svg.innerHTML = '';
    
    const tuning = this.tuningPresets[this.tuningPresetSelect.value].slice(0, stringCount);
    
    const [minFretToShow, maxFretToShow] = notePositions.length > 0 
      ? [Math.max(0, Math.min(...notePositions.map(([, f]) => f)) - this.fretboardAlgorithm.FRET_PADDING_BELOW), 
        Math.max(...notePositions.map(([, f]) => f)) + this.fretboardAlgorithm.FRET_PADDING_ABOVE]
      : [0, 4];
    
    const fretRange = maxFretToShow - minFretToShow + 1;
    const width = fretRange * this.fretSpacing + this.margin.left + this.margin.right;
    const titleHeight = this.titleHeight; // Space for title and subtitle
    const height = stringCount * this.stringSpacing + this.margin.top + this.margin.bottom + titleHeight;

    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    
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
      line.setAttribute('x2', this.margin.left + (fretRange - 1) * this.fretSpacing);
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
      const scaleDegree = this.calculateScaleDegreeForPosition(index, scaleLength);
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
    circle.setAttribute('stroke', '#000');
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
    const preferences = this.getScalePreferences();
    
    preferences[scaleType] = {
      title: this.scaleTitleInput.value,
      notesPerString: parseInt(this.notesPerStringInput.value),
      selectedScaleDegree: this.selectedScaleDegree,
      rootNote: this.rootNoteSelect.value
    };
    
    try {
      localStorage.setItem('guitar-scale-visualizer-scale-preferences', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save scale preferences:', e);
    }
  }
  
  loadScalePreferences(scaleType) {
    // Check if it's a custom preset first
    const customPresets = this.getCustomPresets();
    if (customPresets[scaleType]) {
      const customPreset = customPresets[scaleType];
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
    const preferences = this.getScalePreferences();
    const scalePrefs = preferences[scaleType] || this.defaultScalePreferences[scaleType];
    
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
  
  getScalePreferences() {
    try {
      const saved = localStorage.getItem('guitar-scale-visualizer-scale-preferences');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('Failed to load scale preferences:', e);
      return {};
    }
  }
  
  saveGlobalPreferences() {
    const globalPrefs = {
      tuning: this.tuningPresetSelect.value,
      lastScaleType: this.scaleTypeSelect.value
    };
    
    try {
      localStorage.setItem('guitar-scale-visualizer-global', JSON.stringify(globalPrefs));
    } catch (e) {
      console.warn('Failed to save global preferences:', e);
    }
  }
  
  loadGlobalPreferences() {
    try {
      const saved = localStorage.getItem('guitar-scale-visualizer-global');
      if (saved) {
        const globalPrefs = JSON.parse(saved);
        if (globalPrefs.tuning) this.tuningPresetSelect.value = globalPrefs.tuning;
        if (globalPrefs.lastScaleType) this.scaleTypeSelect.value = globalPrefs.lastScaleType;
      }
    } catch (e) {
      console.warn('Failed to load global preferences:', e);
    }
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
  
  // Custom Preset Management
  getCustomPresets() {
    try {
      const saved = localStorage.getItem('guitar-scale-visualizer-custom-presets');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('Failed to load custom presets:', e);
      return {};
    }
  }
  
  saveCustomPreset(name, intervals) {
    const presetId = `custom-${Date.now()}`;
    const customPresets = this.getCustomPresets();
    
    customPresets[presetId] = {
      title: name,
      intervals: intervals || this.musicalTheory.parseIntervals(this.scaleIntervalsInput.value),
      notesPerString: parseInt(this.notesPerStringInput.value),
      selectedScaleDegree: this.selectedScaleDegree,
      rootNote: this.rootNoteSelect.value
    };
    
    try {
      localStorage.setItem('guitar-scale-visualizer-custom-presets', JSON.stringify(customPresets));
      this.updateScaleDropdown();
      this.scaleTypeSelect.value = presetId; // Select the newly created preset
      this.updatePresetButtonVisibility(); // Update button visibility for the new preset
      return presetId;
    } catch (e) {
      console.warn('Failed to save custom preset:', e);
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
    const customPresets = this.getCustomPresets();
    
    if (customPresets[scaleType]) {
      const currentTitle = this.scaleTitleInput.value || customPresets[scaleType].title;
      
      customPresets[scaleType] = {
        title: currentTitle,
        intervals: this.musicalTheory.parseIntervals(this.scaleIntervalsInput.value),
        notesPerString: parseInt(this.notesPerStringInput.value),
        selectedScaleDegree: this.selectedScaleDegree,
        rootNote: this.rootNoteSelect.value
      };
      
      try {
        localStorage.setItem('guitar-scale-visualizer-custom-presets', JSON.stringify(customPresets));
        this.updateScaleDropdown();
        this.scaleTypeSelect.value = scaleType; // Keep current preset selected
      } catch (e) {
        console.warn('Failed to update custom preset:', e);
        alert('Failed to update preset. Please try again.');
      }
    }
  }
  
  deleteCurrentPreset() {
    const scaleType = this.scaleTypeSelect.value;
    const customPresets = this.getCustomPresets();
    
    if (customPresets[scaleType]) {
      const presetTitle = customPresets[scaleType].title;
      
      if (confirm(`Are you sure you want to delete the preset "${presetTitle}"? This action cannot be undone.`)) {
        delete customPresets[scaleType];
        
        try {
          localStorage.setItem('guitar-scale-visualizer-custom-presets', JSON.stringify(customPresets));
          this.updateScaleDropdown();
          this.scaleTypeSelect.value = 'major'; // Switch to default preset
          this.loadScalePreferences('major');
          this.updatePresetButtonVisibility();
          this.updateVisualization();
        } catch (e) {
          console.warn('Failed to delete custom preset:', e);
          alert('Failed to delete preset. Please try again.');
        }
      }
    }
  }
  
  updatePresetButtonVisibility() {
    const scaleType = this.scaleTypeSelect.value;
    const customPresets = this.getCustomPresets();
    const isCustomPreset = customPresets[scaleType];
    
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
    const customPresets = this.getCustomPresets();
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
