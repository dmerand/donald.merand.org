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

// Export for both CommonJS (Node.js tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScaleVisualizer;
} else {
  window.ScaleVisualizer = ScaleVisualizer;
}