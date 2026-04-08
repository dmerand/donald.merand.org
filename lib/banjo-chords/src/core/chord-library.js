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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChordLibrary;
}
