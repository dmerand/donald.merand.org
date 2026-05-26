const MusicalTheory = require('../../src/core/musical-theory');
const BanjoTunings = require('../../src/core/banjo-tunings');

describe('BanjoTunings', () => {
  let theory, tunings;

  beforeEach(() => {
    theory = new MusicalTheory();
    tunings = new BanjoTunings(theory);
  });

  test('get returns standard tuning', () => {
    const t = tunings.get('standard');
    expect(t.openNotes).toEqual(['G', 'D', 'G', 'B', 'D']);
    expect(t.openSemitones).toEqual([7, 2, 7, 11, 2]);
    expect(t.shortName).toBe('G Tuning');
  });

  test('get returns mini tuning', () => {
    const t = tunings.get('mini');
    expect(t.openNotes).toEqual(['C', 'G', 'C', 'E', 'G']);
    expect(t.openSemitones).toEqual([0, 7, 0, 4, 7]);
    expect(t.shortName).toBe('C Tuning');
  });

  test('get returns mandolin tuning', () => {
    const t = tunings.get('mandolin');
    expect(t.openNotes).toEqual(['G', 'D', 'A', 'E']);
    expect(t.openSemitones).toEqual([7, 2, 9, 4]);
    expect(t.shortName).toBe('GDAE');
    expect(t.numStrings).toBe(4);
    expect(t.hasDrone).toBe(false);
  });

  test('get returns undefined for unknown tuning', () => {
    expect(tunings.get('unknown')).toBeUndefined();
  });

  test('banjo tunings have 5 strings with drone', () => {
    for (const key of ['standard', 'mini']) {
      const t = tunings.get(key);
      expect(t.openNotes).toHaveLength(5);
      expect(t.openSemitones).toHaveLength(5);
      expect(t.numStrings).toBe(5);
      expect(t.hasDrone).toBe(true);
    }
  });

  test('mandolin tuning has 4 strings without drone', () => {
    const t = tunings.get('mandolin');
    expect(t.openNotes).toHaveLength(4);
    expect(t.openSemitones).toHaveLength(4);
    expect(t.numStrings).toBe(4);
    expect(t.hasDrone).toBe(false);
  });

  test('openSemitones match openNotes', () => {
    for (const key of ['standard', 'mini', 'mandolin']) {
      const t = tunings.get(key);
      for (let i = 0; i < t.numStrings; i++) {
        expect(theory.noteToSemitone(t.openNotes[i])).toBe(t.openSemitones[i]);
      }
    }
  });

  test('noteAtFret returns correct note', () => {
    // Standard tuning, string 1 (D), fret 2 = E
    expect(tunings.noteAtFret('standard', 4, 2)).toBe('E');
    // Mini tuning, string 4 (G), fret 5 = C
    expect(tunings.noteAtFret('mini', 1, 5)).toBe('C');
  });

  test('semitoneAtFret returns correct semitone', () => {
    // Standard tuning, string 0 (G=7), fret 5 = 0 (C)
    expect(tunings.semitoneAtFret('standard', 0, 5)).toBe(0);
  });
});
