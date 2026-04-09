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

  describe('chordSpelling', () => {
    test('G minor uses Bb not A#', () => {
      const sp = theory.chordSpelling('G', [0, 3, 7]);
      expect(sp[10]).toBe('Bb');  // semitone 10 = Bb in G minor context
      expect(sp[7]).toBe('G');
      expect(sp[2]).toBe('D');
    });

    test('C minor uses Eb not D#', () => {
      const sp = theory.chordSpelling('C', [0, 3, 7]);
      expect(sp[3]).toBe('Eb');
      expect(sp[0]).toBe('C');
      expect(sp[7]).toBe('G');
    });

    test('D major is D F# A', () => {
      const sp = theory.chordSpelling('D', [0, 4, 7]);
      expect(sp[2]).toBe('D');
      expect(sp[6]).toBe('F#');
      expect(sp[9]).toBe('A');
    });

    test('F major is F A C', () => {
      const sp = theory.chordSpelling('F', [0, 4, 7]);
      expect(sp[5]).toBe('F');
      expect(sp[9]).toBe('A');
      expect(sp[0]).toBe('C');
    });

    test('A minor 7 uses C and G not B# and Fx', () => {
      const sp = theory.chordSpelling('A', [0, 3, 7, 10]);
      expect(sp[9]).toBe('A');
      expect(sp[0]).toBe('C');
      expect(sp[4]).toBe('E');
      expect(sp[7]).toBe('G');
    });

    test('G dominant 7 uses F not E#', () => {
      const sp = theory.chordSpelling('G', [0, 4, 7, 10]);
      expect(sp[5]).toBe('F');
    });
  });
});
