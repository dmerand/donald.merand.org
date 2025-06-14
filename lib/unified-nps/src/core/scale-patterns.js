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

// Export for both CommonJS (Node.js tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScalePatterns;
} else {
  window.ScalePatterns = ScalePatterns;
}