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

// Export for both CommonJS (tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MusicalTheory;
}
