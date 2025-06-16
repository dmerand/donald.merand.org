const ScaleVisualizer = require('../../src/core/scale-visualizer.js');
const MusicalTheory = require('../../src/core/musical-theory.js');
const ScalePatterns = require('../../src/core/scale-patterns.js');
const FretboardAlgorithm = require('../../src/core/fretboard-algorithm.js');

describe('ScaleVisualizer', () => {
  let scaleVisualizer;
  let musicalTheory;
  let scalePatterns;
  let fretboardAlgorithm;

  beforeEach(() => {
    musicalTheory = new MusicalTheory();
    scalePatterns = new ScalePatterns();
    fretboardAlgorithm = new FretboardAlgorithm();
    scaleVisualizer = new ScaleVisualizer(musicalTheory, scalePatterns, fretboardAlgorithm);
  });

  describe('constructor', () => {
    test('should initialize with core modules', () => {
      expect(scaleVisualizer.musicalTheory).toBe(musicalTheory);
      expect(scaleVisualizer.scalePatterns).toBe(scalePatterns);
      expect(scaleVisualizer.fretboardAlgorithm).toBe(fretboardAlgorithm);
    });

    test('should have OCTAVE_2_NOTES defined', () => {
      expect(scaleVisualizer.OCTAVE_2_NOTES).toEqual(['F', 'F#', 'G', 'G#', 'A', 'A#', 'B']);
    });
  });

  describe('generateVisualizationData', () => {
    test('should generate complete visualization data for major scale', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'major',
        tuningName: 'standard-guitar',
        notesPerString: 3,
        selectedScaleDegree: 1
      };

      const result = scaleVisualizer.generateVisualizationData(config);

      expect(result).toHaveProperty('notePositions');
      expect(result).toHaveProperty('scaleNotes');
      expect(result).toHaveProperty('fretRange');
      expect(result).toHaveProperty('tuning');
      expect(result).toHaveProperty('intervals');
      expect(result).toHaveProperty('scaleLength');
      expect(result).toHaveProperty('metadata');

      expect(Array.isArray(result.notePositions)).toBe(true);
      expect(Array.isArray(result.scaleNotes)).toBe(true);
      expect(Array.isArray(result.fretRange)).toBe(true);
      expect(Array.isArray(result.tuning)).toBe(true);
      expect(Array.isArray(result.intervals)).toBe(true);
      expect(typeof result.scaleLength).toBe('number');
      expect(typeof result.metadata).toBe('object');
    });

    test('should generate data for custom scale', () => {
      const config = {
        rootNote: 'D',
        scaleType: 'custom',
        customIntervals: '2,1,2,2,1,3,1',
        tuningName: 'standard-guitar',
        notesPerString: 2,
        selectedScaleDegree: 1
      };

      const result = scaleVisualizer.generateVisualizationData(config);

      expect(result.intervals).toEqual([2, 1, 2, 2, 1, 3, 1]);
      expect(result.scaleLength).toBe(7);
      // This should detect as harmonic-minor since the intervals match
      expect(result.metadata.scaleType).toBe('harmonic-minor');
    });

    test('should generate data for truly custom scale', () => {
      const config = {
        rootNote: 'D',
        scaleType: 'custom',
        customIntervals: '3,1,1,3,1,1,2', // Unique intervals not matching any built-in scale
        tuningName: 'standard-guitar',
        notesPerString: 2,
        selectedScaleDegree: 1
      };

      const result = scaleVisualizer.generateVisualizationData(config);

      expect(result.intervals).toEqual([3, 1, 1, 3, 1, 1, 2]);
      expect(result.scaleLength).toBe(7);
      expect(result.metadata.scaleType).toBe('custom');
    });

    test('should throw error for invalid tuning', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'major',
        tuningName: 'invalid-tuning',
        notesPerString: 3,
        selectedScaleDegree: 1
      };

      expect(() => {
        scaleVisualizer.generateVisualizationData(config);
      }).toThrow('Invalid tuning: invalid-tuning');
    });
  });

  describe('getScaleIntervals', () => {
    test('should return intervals for built-in scale types', () => {
      const intervals = scaleVisualizer.getScaleIntervals('major');
      expect(intervals).toEqual([2, 2, 1, 2, 2, 2, 1]);
    });

    test('should parse custom intervals', () => {
      const intervals = scaleVisualizer.getScaleIntervals('custom', '2,1,2,2,1,3,1');
      expect(intervals).toEqual([2, 1, 2, 2, 1, 3, 1]);
    });

    test('should parse custom intervals for custom preset IDs', () => {
      const intervals = scaleVisualizer.getScaleIntervals('custom-123456789', '3,1,1,3,1,1,2');
      expect(intervals).toEqual([3, 1, 1, 3, 1, 1, 2]);
    });

    test('should throw error for unknown scale type', () => {
      expect(() => {
        scaleVisualizer.getScaleIntervals('unknown-scale');
      }).toThrow('Unknown scale type: unknown-scale');
    });
  });

  describe('getOptimalRootNote', () => {
    test('should add octave 2 for F-B notes', () => {
      expect(scaleVisualizer.getOptimalRootNote('F')).toBe('F2');
      expect(scaleVisualizer.getOptimalRootNote('G#')).toBe('G#2');
      expect(scaleVisualizer.getOptimalRootNote('B')).toBe('B2');
    });

    test('should add octave 3 for C-E notes', () => {
      expect(scaleVisualizer.getOptimalRootNote('C')).toBe('C3');
      expect(scaleVisualizer.getOptimalRootNote('D#')).toBe('D#3');
      expect(scaleVisualizer.getOptimalRootNote('E')).toBe('E3');
    });
  });

  describe('calculateScaleDegreeForPosition', () => {
    test('should calculate correct scale degree for position 0', () => {
      const degree = scaleVisualizer.calculateScaleDegreeForPosition(0, 7, 1);
      expect(degree).toBe(1);
    });

    test('should calculate correct scale degree for different starting degrees', () => {
      const degree = scaleVisualizer.calculateScaleDegreeForPosition(0, 7, 3);
      expect(degree).toBe(3);
    });

    test('should wrap around scale correctly', () => {
      const degree = scaleVisualizer.calculateScaleDegreeForPosition(7, 7, 1);
      expect(degree).toBe(1);
    });

    test('should handle different scale lengths', () => {
      const degree = scaleVisualizer.calculateScaleDegreeForPosition(2, 5, 1);
      expect(degree).toBe(3);
    });
  });

  describe('generateTuningDescription', () => {
    test('should generate description for 12-string', () => {
      const tuning = ['B1', 'E2', 'A2', 'D3', 'G3', 'C4', 'F4', 'Bb4', 'Eb5', 'Ab5', 'Db6', 'Gb6'];
      const description = scaleVisualizer.generateTuningDescription(tuning);
      expect(description).toBe('12-String Perfect 4ths');
    });

    test('should generate description for 6-string guitar', () => {
      const tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
      const description = scaleVisualizer.generateTuningDescription(tuning);
      expect(description).toBe('6-String Guitar');
    });

    test('should generate description for 5-string bass', () => {
      const tuning = ['B1', 'E2', 'A2', 'D3', 'G3'];
      const description = scaleVisualizer.generateTuningDescription(tuning);
      expect(description).toBe('5-String Bass');
    });

    test('should generate description for 4-string bass', () => {
      const tuning = ['E2', 'A2', 'D3', 'G3'];
      const description = scaleVisualizer.generateTuningDescription(tuning);
      expect(description).toBe('4-String Bass');
    });

    test('should generate generic description for custom tunings', () => {
      const tuning = ['C2', 'F2'];
      const description = scaleVisualizer.generateTuningDescription(tuning);
      expect(description).toBe('2-String (C-F)');
    });
  });

  describe('validateConfiguration', () => {
    test('should validate valid configuration', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'major',
        tuningName: 'standard-guitar',
        notesPerString: 3,
        selectedScaleDegree: 1
      };

      expect(() => {
        scaleVisualizer.validateConfiguration(config);
      }).not.toThrow();
    });

    test('should throw error for missing required fields', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'major'
      };

      expect(() => {
        scaleVisualizer.validateConfiguration(config);
      }).toThrow('Missing required field: tuningName');
    });

    test('should throw error for custom scale without intervals', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'custom',
        tuningName: 'standard-guitar',
        notesPerString: 3,
        selectedScaleDegree: 1
      };

      expect(() => {
        scaleVisualizer.validateConfiguration(config);
      }).toThrow('Custom intervals required when scaleType is "custom"');
    });

    test('should throw error for custom preset ID without intervals', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'custom-123456789',
        tuningName: 'standard-guitar',
        notesPerString: 3,
        selectedScaleDegree: 1
      };

      expect(() => {
        scaleVisualizer.validateConfiguration(config);
      }).toThrow('Custom intervals required when scaleType is "custom"');
    });

    test('should throw error for invalid notes per string', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'major',
        tuningName: 'standard-guitar',
        notesPerString: 0,
        selectedScaleDegree: 1
      };

      expect(() => {
        scaleVisualizer.validateConfiguration(config);
      }).toThrow('Notes per string must be between 1 and 12');
    });

    test('should throw error for invalid selected scale degree', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'major',
        tuningName: 'standard-guitar',
        notesPerString: 3,
        selectedScaleDegree: 0
      };

      expect(() => {
        scaleVisualizer.validateConfiguration(config);
      }).toThrow('Selected scale degree must be >= 1');
    });

    test('should throw error for invalid tuning', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'major',
        tuningName: 'invalid-tuning',
        notesPerString: 3,
        selectedScaleDegree: 1
      };

      expect(() => {
        scaleVisualizer.validateConfiguration(config);
      }).toThrow('Invalid tuning: invalid-tuning');
    });
  });

  describe('generateMetadata', () => {
    test('should generate metadata for built-in scale', () => {
      const config = {
        rootNote: 'C',
        scaleType: 'major',
        notesPerString: 3,
        selectedScaleDegree: 1
      };
      const intervals = [2, 2, 1, 2, 2, 2, 1];
      const tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
      const scaleNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];

      const metadata = scaleVisualizer.generateMetadata(config, intervals, tuning, scaleNotes);

      expect(metadata.rootNote).toBe('C');
      expect(metadata.scaleType).toBe('major');
      expect(metadata.intervals).toEqual(intervals);
      expect(metadata.tuning).toBe('6-String Guitar');
      expect(metadata.notesPerString).toBe(3);
      expect(metadata.selectedScaleDegree).toBe(1);
      expect(metadata.scaleNotes).toEqual(scaleNotes);
      expect(metadata.totalNotesGenerated).toBe(scaleNotes.length);
    });
  });
});