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

// Export for both CommonJS (tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MusicalTheory;
}
