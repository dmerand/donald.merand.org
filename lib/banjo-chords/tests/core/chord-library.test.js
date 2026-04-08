const ChordLibrary = require('../../src/core/chord-library');

describe('ChordLibrary', () => {
  let lib;

  beforeEach(() => {
    lib = new ChordLibrary();
  });

  test('getChord returns correct intervals for major', () => {
    const chord = lib.getChord('C', 'major');
    expect(chord.intervals).toEqual([0, 4, 7]);
    expect(chord.displayName).toBe('C');
    expect(chord.fullName).toBe('C Major');
  });

  test('getChord returns correct intervals for minor', () => {
    const chord = lib.getChord('A', 'minor');
    expect(chord.intervals).toEqual([0, 3, 7]);
    expect(chord.displayName).toBe('Am');
  });

  test('getChord returns correct intervals for dominant7', () => {
    const chord = lib.getChord('G', 'dominant7');
    expect(chord.intervals).toEqual([0, 4, 7, 10]);
    expect(chord.displayName).toBe('G7');
  });

  test('getChord returns correct suffix for all qualities', () => {
    expect(lib.getChord('C', 'major').displayName).toBe('C');
    expect(lib.getChord('C', 'minor').displayName).toBe('Cm');
    expect(lib.getChord('C', 'diminished').displayName).toBe('Cdim');
    expect(lib.getChord('C', 'augmented').displayName).toBe('Caug');
    expect(lib.getChord('C', 'dominant7').displayName).toBe('C7');
    expect(lib.getChord('C', 'major7').displayName).toBe('Cmaj7');
    expect(lib.getChord('C', 'minor7').displayName).toBe('Cm7');
  });

  test('getChord preserves root with sharps', () => {
    const chord = lib.getChord('F#', 'minor');
    expect(chord.displayName).toBe('F#m');
    expect(chord.root).toBe('F#');
  });

  test('getChord throws for unknown quality', () => {
    expect(() => lib.getChord('C', 'invalid')).toThrow('Unknown quality: invalid');
  });
});
