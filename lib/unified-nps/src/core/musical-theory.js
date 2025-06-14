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

// Export for both CommonJS (Node.js tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MusicalTheory;
} else {
  window.MusicalTheory = MusicalTheory;
}