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

// Export for both CommonJS (Node.js tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FretboardAlgorithm;
} else {
  window.FretboardAlgorithm = FretboardAlgorithm;
}