const FretboardAlgorithm = require('../../src/core/fretboard-algorithm');
const MusicalTheory = require('../../src/core/musical-theory');

describe('FretboardAlgorithm', () => {
  let algorithm;
  let theory;
  
  beforeEach(() => {
    algorithm = new FretboardAlgorithm();
    theory = new MusicalTheory();
  });

  describe('TUNING_PRESETS', () => {
    test('contains expected tunings', () => {
      const presets = FretboardAlgorithm.TUNING_PRESETS;
      
      expect(presets['standard-guitar']).toEqual(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
      expect(presets['bass-5-string']).toEqual(['B1', 'E2', 'A2', 'D3', 'G3']);
      expect(presets['perfect-fourths']).toHaveLength(12);
    });

    test('isValidTuning works correctly', () => {
      expect(FretboardAlgorithm.isValidTuning('standard-guitar')).toBe(true);
      expect(FretboardAlgorithm.isValidTuning('bass-5-string')).toBe(true);
      expect(FretboardAlgorithm.isValidTuning('invalid-tuning')).toBe(false);
    });

    test('getTuning returns correct arrays', () => {
      expect(FretboardAlgorithm.getTuning('standard-guitar')).toHaveLength(6);
      expect(FretboardAlgorithm.getTuning('bass-5-string')).toHaveLength(5);
      expect(FretboardAlgorithm.getTuning('invalid')).toBeNull();
    });
  });

  describe('findNotes', () => {
    test('finds simple C major triad on guitar', () => {
      const tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
      const targetNotes = ['C3', 'E3', 'G3']; // C major triad
      
      const positions = algorithm.findNotes(targetNotes, tuning, 1, theory);
      
      expect(positions).toHaveLength(3);
      expect(positions[0]).toHaveLength(2); // [stringIndex, fret]
      expect(positions[1]).toHaveLength(2);
      expect(positions[2]).toHaveLength(2);
    });

    test('respects notes per string limit', () => {
      const tuning = ['E2', 'A2', 'D3'];
      const targetNotes = ['E2', 'F2', 'G2', 'A2', 'B2']; // 5 consecutive notes
      
      const positions = algorithm.findNotes(targetNotes, tuning, 2, theory);
      
      // Check that no string has more than 2 notes
      const notesPerString = [0, 0, 0];
      positions.forEach(([stringIndex]) => {
        notesPerString[stringIndex]++;
      });
      
      expect(Math.max(...notesPerString)).toBeLessThanOrEqual(2);
    });

    test('handles empty target notes', () => {
      const tuning = ['E2', 'A2', 'D3'];
      const positions = algorithm.findNotes([], tuning, 3, theory);
      
      expect(positions).toEqual([]);
    });

    test('handles impossible patterns gracefully', () => {
      const tuning = ['C3']; // Single string
      const targetNotes = ['C3', 'C5']; // Notes too far apart
      
      const positions = algorithm.findNotes(targetNotes, tuning, 1, theory);
      
      // May find some notes or none, depending on fret range
      expect(positions.length).toBeGreaterThanOrEqual(0);
      expect(positions.length).toBeLessThanOrEqual(targetNotes.length);
    });
  });

  describe('findSinglePattern', () => {
    test('finds pattern starting from specific fret', () => {
      const tuning = ['E2', 'A2'];
      const tuningValues = tuning.map(note => theory.parseNote(note));
      const targetNotes = ['G2', 'A2'];
      const targetValues = targetNotes.map(note => theory.parseNote(note));
      
      const positions = algorithm.findSinglePattern(
        targetNotes, targetValues, tuning, tuningValues, 2, 3
      );
      
      expect(positions.length).toBeGreaterThan(0);
      // All frets should be >= 3 (minStartFret)
      positions.forEach(([, fret]) => {
        expect(fret).toBeGreaterThanOrEqual(3);
      });
    });

    test('returns empty array for impossible patterns', () => {
      const tuning = ['C6']; // Very high string
      const tuningValues = [theory.parseNote('C6')];
      const targetNotes = ['C1']; // Very low note
      const targetValues = [theory.parseNote('C1')];
      
      const positions = algorithm.findSinglePattern(
        targetNotes, targetValues, tuning, tuningValues, 1, 1
      );
      
      expect(positions).toEqual([]);
    });
  });

  describe('calculateFretRange', () => {
    test('calculates range for normal positions', () => {
      const positions = [[0, 3], [1, 5], [2, 7]]; // String-fret pairs
      const [minFret, maxFret] = algorithm.calculateFretRange(positions);
      
      expect(minFret).toBe(1); // 3 - 2 (padding below)
      expect(maxFret).toBe(8); // 7 + 1 (padding above)
    });

    test('handles edge case at fret 0', () => {
      const positions = [[0, 0], [1, 1]]; // Notes at very low frets
      const [minFret, maxFret] = algorithm.calculateFretRange(positions);
      
      expect(minFret).toBe(0); // Math.max(0, 0-2) = 0
      expect(maxFret).toBe(2); // 1 + 1
    });

    test('returns default range for empty positions', () => {
      const [minFret, maxFret] = algorithm.calculateFretRange([]);
      
      expect(minFret).toBe(0);
      expect(maxFret).toBe(4);
    });

    test('handles single note', () => {
      const positions = [[0, 5]];
      const [minFret, maxFret] = algorithm.calculateFretRange(positions);
      
      expect(minFret).toBe(3); // 5 - 2
      expect(maxFret).toBe(6); // 5 + 1
    });
  });

  describe('constructor options', () => {
    test('accepts custom options', () => {
      const customAlgorithm = new FretboardAlgorithm({
        maxFret: 12,
        maxInterval: 4,
        fretPaddingBelow: 1,
        fretPaddingAbove: 2
      });
      
      expect(customAlgorithm.maxFret).toBe(12);
      expect(customAlgorithm.maxInterval).toBe(4);
      expect(customAlgorithm.FRET_PADDING_BELOW).toBe(1);
      expect(customAlgorithm.FRET_PADDING_ABOVE).toBe(2);
    });

    test('uses defaults when no options provided', () => {
      expect(algorithm.maxFret).toBe(24);
      expect(algorithm.maxInterval).toBe(6);
      expect(algorithm.FRET_PADDING_BELOW).toBe(2);
      expect(algorithm.FRET_PADDING_ABOVE).toBe(1);
    });
  });
});