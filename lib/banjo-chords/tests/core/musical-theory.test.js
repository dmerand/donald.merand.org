const MusicalTheory = require('../../src/core/musical-theory');

describe('MusicalTheory', () => {
  let theory;

  beforeEach(() => {
    theory = new MusicalTheory();
  });

  test('noteToSemitone converts standard notes', () => {
    expect(theory.noteToSemitone('C')).toBe(0);
    expect(theory.noteToSemitone('G')).toBe(7);
    expect(theory.noteToSemitone('B')).toBe(11);
  });

  test('noteToSemitone throws for unknown notes', () => {
    expect(() => theory.noteToSemitone('H')).toThrow();
  });

  test('semitoneToNote round-trips', () => {
    for (let i = 0; i < 12; i++) {
      expect(theory.noteToSemitone(theory.semitoneToNote(i))).toBe(i);
    }
  });

  test('semitoneToNote handles negative values', () => {
    expect(theory.semitoneToNote(-1)).toBe('B');
    expect(theory.semitoneToNote(-12)).toBe('C');
  });

  test('transpose works correctly', () => {
    expect(theory.transpose('C', 7)).toBe('G');
    expect(theory.transpose('G', 5)).toBe('C');
    expect(theory.transpose('D', 5)).toBe('G');
  });

  test('chordSemitones for major chord', () => {
    expect(theory.chordSemitones('C', [0, 4, 7])).toEqual([0, 4, 7]);
    expect(theory.chordSemitones('G', [0, 4, 7])).toEqual([7, 11, 2]);
  });

  test('chordNotes for G major', () => {
    expect(theory.chordNotes('G', [0, 4, 7])).toEqual(['G', 'B', 'D']);
  });
});
