const ScalePatterns = require('../../src/core/scale-patterns');

describe('ScalePatterns', () => {
  let patterns;
  
  beforeEach(() => {
    patterns = new ScalePatterns();
  });

  describe('getScaleIntervals', () => {
    test('returns correct intervals for major scale', () => {
      expect(patterns.getScaleIntervals('major')).toEqual([2, 2, 1, 2, 2, 2, 1]);
    });

    test('returns correct intervals for pentatonic scale', () => {
      expect(patterns.getScaleIntervals('pentatonic')).toEqual([2, 2, 3, 2, 3]);
    });

    test('returns correct intervals for chromatic scale', () => {
      expect(patterns.getScaleIntervals('chromatic')).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    });

    test('returns null for unknown scale', () => {
      expect(patterns.getScaleIntervals('unknown')).toBeNull();
    });
  });

  describe('getScalePreferences', () => {
    test('returns correct preferences for major scale', () => {
      const prefs = patterns.getScalePreferences('major');
      expect(prefs.title).toBe('Major Scale');
      expect(prefs.notesPerString).toBe(3);
      expect(prefs.rootNote).toBe('C');
    });

    test('returns correct preferences for chromatic scale', () => {
      const prefs = patterns.getScalePreferences('chromatic');
      expect(prefs.title).toBe('Chromatic Scale');
      expect(prefs.notesPerString).toBe(4);
      expect(prefs.rootNote).toBe('D');
    });

    test('returns null for unknown scale', () => {
      expect(patterns.getScalePreferences('unknown')).toBeNull();
    });
  });

  describe('findScaleTypeFromIntervals', () => {
    test('identifies major scale from intervals', () => {
      expect(patterns.findScaleTypeFromIntervals([2, 2, 1, 2, 2, 2, 1])).toBe('major');
    });

    test('identifies pentatonic scale from intervals', () => {
      expect(patterns.findScaleTypeFromIntervals([2, 2, 3, 2, 3])).toBe('pentatonic');
    });

    test('identifies blues scale from intervals', () => {
      expect(patterns.findScaleTypeFromIntervals([3, 2, 1, 1, 3, 2])).toBe('blues');
    });

    test('returns null for unknown intervals', () => {
      expect(patterns.findScaleTypeFromIntervals([1, 2, 3, 4, 5])).toBeNull();
    });

    test('returns null for partial matches', () => {
      expect(patterns.findScaleTypeFromIntervals([2, 2, 1])).toBeNull(); // Partial major scale
    });
  });

  describe('getAvailableScales', () => {
    test('returns all scale types', () => {
      const scales = patterns.getAvailableScales();
      expect(scales).toContain('major');
      expect(scales).toContain('natural-minor');
      expect(scales).toContain('pentatonic');
      expect(scales).toContain('chromatic');
      expect(scales).toContain('custom');
      expect(scales.length).toBeGreaterThan(5);
    });
  });

  describe('isValidScaleType', () => {
    test('validates existing scales', () => {
      expect(patterns.isValidScaleType('major')).toBe(true);
      expect(patterns.isValidScaleType('pentatonic')).toBe(true);
      expect(patterns.isValidScaleType('custom')).toBe(true);
    });

    test('rejects unknown scales', () => {
      expect(patterns.isValidScaleType('unknown')).toBe(false);
      expect(patterns.isValidScaleType('')).toBe(false);
    });
  });

  describe('scale completeness', () => {
    test('all scales have both intervals and preferences', () => {
      const scaleTypes = patterns.getAvailableScales();
      
      scaleTypes.forEach(scaleType => {
        if (scaleType !== 'custom') { // Custom doesn't have predefined intervals
          expect(patterns.getScaleIntervals(scaleType)).not.toBeNull();
        }
        expect(patterns.getScalePreferences(scaleType)).not.toBeNull();
      });
    });

    test('specific scale interval counts', () => {
      expect(patterns.getScaleIntervals('major')).toHaveLength(7);
      expect(patterns.getScaleIntervals('pentatonic')).toHaveLength(5);
      expect(patterns.getScaleIntervals('whole-tone')).toHaveLength(6);
      expect(patterns.getScaleIntervals('chromatic')).toHaveLength(12);
      expect(patterns.getScaleIntervals('blues')).toHaveLength(6);
    });
  });
});