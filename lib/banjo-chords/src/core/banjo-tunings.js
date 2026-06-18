/**
 * Banjo tuning definitions
 * Strings indexed 5(drone) -> 4 -> 3 -> 2 -> 1 (highest)
 */

class BanjoTunings {
  constructor(theory) {
    this.theory = theory;
    // maxStretch is the widest fretted span (highest − lowest fret) a hand can
    // comfortably grip. Shorter-scale instruments earn a little more than guitar
    // (closer frets), but only a little — past ~5 frets the limit is finger
    // independence, not reach, so the spread stays modest across instruments.
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
        maxStretch: 5, // ~19" short scale
      },
      'mandolin': {
        name: 'Mandolin (GDAE)',
        shortName: 'GDAE',
        openNotes: ['G', 'D', 'A', 'E'],
        openSemitones: [7, 2, 9, 4],
        numStrings: 4,
        hasDrone: false,
        maxStretch: 5, // ~14" scale
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BanjoTunings;
}
