const MusicalTheory = require('../../src/core/musical-theory');

describe('MusicalTheory', () => {
  let theory;
  
  beforeEach(() => {
    theory = new MusicalTheory();
  });

  describe('parseNote', () => {
    test('parses simple notes correctly', () => {
      expect(theory.parseNote('C3')).toBe(36); // C3 = 0 + 3*12 = 36
      expect(theory.parseNote('A2')).toBe(33); // A2 = 9 + 2*12 = 33
      expect(theory.parseNote('E4')).toBe(52); // E4 = 4 + 4*12 = 52
    });

    test('parses sharp notes correctly', () => {
      expect(theory.parseNote('C#3')).toBe(37); // C#3 = 1 + 3*12 = 37
      expect(theory.parseNote('F#2')).toBe(30); // F#2 = 6 + 2*12 = 30
    });

    test('parses flat notes correctly', () => {
      expect(theory.parseNote('Db3')).toBe(37); // Db3 = 1 + 3*12 = 37 (same as C#3)
      expect(theory.parseNote('Bb2')).toBe(34); // Bb2 = 10 + 2*12 = 34
    });

    test('throws error for invalid format', () => {
      expect(() => theory.parseNote('invalid')).toThrow('Invalid note format: invalid');
      expect(() => theory.parseNote('C')).toThrow('Invalid note format: C');
      expect(() => theory.parseNote('C3b')).toThrow('Invalid note format: C3b');
    });
  });

  describe('semitoneToNote', () => {
    test('converts semitones to notes correctly', () => {
      expect(theory.semitoneToNote(36)).toBe('C3');
      expect(theory.semitoneToNote(37)).toBe('C#3');
      expect(theory.semitoneToNote(33)).toBe('A2');
      expect(theory.semitoneToNote(52)).toBe('E4');
    });

    test('handles octave boundaries correctly', () => {
      expect(theory.semitoneToNote(12)).toBe('C1');
      expect(theory.semitoneToNote(24)).toBe('C2');
      expect(theory.semitoneToNote(35)).toBe('B2');
    });
  });

  describe('getNoteName', () => {
    test('extracts note names correctly', () => {
      expect(theory.getNoteName('C3')).toBe('C');
      expect(theory.getNoteName('F#2')).toBe('F#');
      expect(theory.getNoteName('Bb4')).toBe('Bb');
    });
  });

  describe('parseIntervals', () => {
    test('parses valid interval strings', () => {
      expect(theory.parseIntervals('2,2,1,2,2,2,1')).toEqual([2, 2, 1, 2, 2, 2, 1]);
      expect(theory.parseIntervals('3,2,2,3,2')).toEqual([3, 2, 2, 3, 2]);
      expect(theory.parseIntervals('1')).toEqual([1]);
    });

    test('handles spaces and invalid values', () => {
      expect(theory.parseIntervals('2, 2, 1, 2')).toEqual([2, 2, 1, 2]);
      expect(theory.parseIntervals('2,invalid,1')).toEqual([2, 1]);
      expect(theory.parseIntervals('')).toEqual([]);
    });
  });

  describe('gcd and lcm', () => {
    test('calculates GCD correctly', () => {
      expect(theory.gcd(12, 8)).toBe(4);
      expect(theory.gcd(15, 25)).toBe(5);
      expect(theory.gcd(7, 3)).toBe(1);
    });

    test('calculates LCM correctly', () => {
      expect(theory.lcm(12, 8)).toBe(24);
      expect(theory.lcm(15, 25)).toBe(75);
      expect(theory.lcm(7, 3)).toBe(21);
    });
  });

  describe('generateExtendedScale', () => {
    test('generates major scale from C3', () => {
      const scale = theory.generateExtendedScale('C3', '2,2,1,2,2,2,1', 3, 1);
      
      // Should generate enough notes for 3 NPS with 7-note scale (LCM = 21) + 1 note repeat = 22
      expect(scale).toHaveLength(22);
      expect(scale[0]).toBe('C3'); // First note should be root
      expect(scale[1]).toBe('D3'); // Second note (C + 2 semitones)
      expect(scale[2]).toBe('E3'); // Third note (D + 2 semitones)
    });

    test('starts from different scale degrees', () => {
      // Start from 3rd degree (E) of C major
      const scale = theory.generateExtendedScale('C3', '2,2,1,2,2,2,1', 2, 3);
      
      expect(scale[0]).toBe('E3'); // Should start from E (3rd degree)
      expect(scale[1]).toBe('F3'); // Next note in pattern
    });

    test('handles empty intervals', () => {
      const scale = theory.generateExtendedScale('C3', '', 3, 1);
      expect(scale).toEqual([]);
    });

    test('handles pentatonic scale', () => {
      const scale = theory.generateExtendedScale('C3', '2,2,3,2,3', 2, 1);
      
      // LCM of 5 (scale length) and 2 (NPS) = 10 + 1 note repeat = 11
      expect(scale).toHaveLength(11);
      expect(scale[0]).toBe('C3');
    });
  });

});