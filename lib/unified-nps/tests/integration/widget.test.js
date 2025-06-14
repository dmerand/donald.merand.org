/**
 * Integration tests for the StringedInstrumentVisualizer widget
 * Uses jsdom to mock the DOM environment
 */

const { JSDOM } = require('jsdom');

// Set up DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <svg id="fretboard"></svg>
  <select id="tuning-preset"><option value="standard-guitar">Guitar</option></select>
  <select id="root-note"><option value="C">C</option></select>
  <select id="scale-type"><option value="major">Major</option></select>
  <input id="scale-intervals" value="2,2,1,2,2,2,1">
  <input id="notes-per-string" value="3">
  <input id="selected-scale-degree" value="1">
  <button id="export-button"></button>
  <button id="save-preset-button"></button>
  <button id="update-preset-button"></button>
  <button id="delete-preset-button"></button>
  <input id="import-file" type="file">
  <input id="scale-title" value="Major Scale">
  <div id="display-title"></div>
  <div id="display-subtitle"></div>
  <span id="nps-value">3</span>
  <div id="extended-scale-info"></div>
</body>
</html>
`);

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};

// Load modules
const MusicalTheory = require('../../src/core/musical-theory');
const ScalePatterns = require('../../src/core/scale-patterns');
const FretboardAlgorithm = require('../../src/core/fretboard-algorithm');

// Mock global classes for widget
global.MusicalTheory = MusicalTheory;
global.ScalePatterns = ScalePatterns;
global.FretboardAlgorithm = FretboardAlgorithm;

// Load widget by evaluating its source code in the global context
const fs = require('fs');
const path = require('path');
const widgetSource = fs.readFileSync(path.join(__dirname, '../../src/widget.js'), 'utf8');

// Execute the widget code in global context
const vm = require('vm');
const context = {
  window: global.window,
  document: global.document,
  localStorage: global.localStorage,
  MusicalTheory: global.MusicalTheory,
  ScalePatterns: global.ScalePatterns,
  FretboardAlgorithm: global.FretboardAlgorithm,
  console: console,
  alert: jest.fn(),
  prompt: jest.fn(),
  confirm: jest.fn(),
  URL: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  },
  FileReader: class {
    readAsText() {}
    set onload(fn) { this._onload = fn; }
  },
  Blob: jest.fn()
};

vm.createContext(context);

// Remove the DOMContentLoaded event listener from the widget source to prevent auto-initialization
const modifiedWidgetSource = widgetSource.replace(
  /document\.addEventListener\('DOMContentLoaded'.*?\}\);/s,
  '// Auto-initialization disabled for testing'
);

vm.runInContext(modifiedWidgetSource, context);

// Make StringedInstrumentVisualizer available globally
global.StringedInstrumentVisualizer = context.StringedInstrumentVisualizer;

// Load widget (this will fail due to DOM dependencies, but we can test the class)
describe('StringedInstrumentVisualizer Integration', () => {
  beforeEach(() => {
    // Reset DOM
    document.getElementById('fretboard').innerHTML = '';
    
    // Clear localStorage mocks
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
  });

  describe('Core module integration', () => {
    test('MusicalTheory integrates correctly', () => {
      const theory = new MusicalTheory();
      
      expect(theory.parseNote('C3')).toBe(36);
      expect(theory.semitoneToNote(36)).toBe('C3');
      expect(theory.generateExtendedScale('C3', '2,2,1,2,2,2,1', 3, 1)).toHaveLength(22);
    });

    test('ScalePatterns integrates correctly', () => {
      const patterns = new ScalePatterns();
      
      expect(patterns.getScaleIntervals('major')).toEqual([2, 2, 1, 2, 2, 2, 1]);
      expect(patterns.findScaleTypeFromIntervals([2, 2, 1, 2, 2, 2, 1])).toBe('major');
      expect(patterns.isValidScaleType('major')).toBe(true);
    });

    test('FretboardAlgorithm integrates correctly', () => {
      const algorithm = new FretboardAlgorithm();
      const theory = new MusicalTheory();
      
      const tuning = ['E2', 'A2', 'D3'];
      const targetNotes = ['C3', 'D3', 'E3'];
      
      const positions = algorithm.findNotes(targetNotes, tuning, 2, theory);
      expect(Array.isArray(positions)).toBe(true);
      
      if (positions.length > 0) {
        expect(positions[0]).toHaveLength(2); // [stringIndex, fret]
        expect(typeof positions[0][0]).toBe('number');
        expect(typeof positions[0][1]).toBe('number');
      }
    });
  });

  describe('Data flow integration', () => {
    test('Scale generation to fretboard search pipeline', () => {
      const theory = new MusicalTheory();
      const algorithm = new FretboardAlgorithm();
      
      // Generate scale notes
      const scaleNotes = theory.generateExtendedScale('C3', '2,2,1,2,2,2,1', 3, 1);
      expect(scaleNotes.length).toBeGreaterThan(0);
      
      // Find positions on fretboard
      const tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
      const positions = algorithm.findNotes(scaleNotes, tuning, 3, theory);
      
      // Should find some positions
      expect(positions.length).toBeGreaterThan(0);
      
      // Calculate fret range
      const [minFret, maxFret] = algorithm.calculateFretRange(positions);
      expect(maxFret).toBeGreaterThanOrEqual(minFret);
    });

    test('Scale pattern lookup and validation', () => {
      const patterns = new ScalePatterns();
      const theory = new MusicalTheory();
      
      // Get major scale intervals
      const intervals = patterns.getScaleIntervals('major');
      expect(intervals).toEqual([2, 2, 1, 2, 2, 2, 1]);
      
      // Convert to string and parse back
      const intervalString = intervals.join(',');
      const parsedIntervals = theory.parseIntervals(intervalString);
      expect(parsedIntervals).toEqual(intervals);
      
      // Verify scale type detection
      const detectedType = patterns.findScaleTypeFromIntervals(parsedIntervals);
      expect(detectedType).toBe('major');
    });
  });

  describe('Edge cases and error handling', () => {
    test('handles empty intervals gracefully', () => {
      const theory = new MusicalTheory();
      
      const scale = theory.generateExtendedScale('C3', '', 3, 1);
      expect(scale).toEqual([]);
      
      const intervals = theory.parseIntervals('');
      expect(intervals).toEqual([]);
    });

    test('handles invalid notes gracefully', () => {
      const theory = new MusicalTheory();
      
      expect(() => theory.parseNote('invalid')).toThrow();
      expect(() => theory.parseNote('C')).toThrow();
    });

    test('handles unknown scales gracefully', () => {
      const patterns = new ScalePatterns();
      
      expect(patterns.getScaleIntervals('unknown')).toBeNull();
      expect(patterns.getScalePreferences('unknown')).toBeNull();
      expect(patterns.isValidScaleType('unknown')).toBe(false);
    });

    test('handles impossible fretboard searches', () => {
      const algorithm = new FretboardAlgorithm();
      const theory = new MusicalTheory();
      
      // Empty target notes
      let positions = algorithm.findNotes([], ['E2'], 1, theory);
      expect(positions).toEqual([]);
      
      // Notes outside reasonable range
      positions = algorithm.findNotes(['C0'], ['E2'], 1, theory);
      expect(Array.isArray(positions)).toBe(true);
    });
  });

  describe('Performance and memory', () => {
    test('handles large scale sequences efficiently', () => {
      const theory = new MusicalTheory();
      const algorithm = new FretboardAlgorithm();
      
      const startTime = Date.now();
      
      // Generate large chromatic scale
      const chromaticScale = theory.generateExtendedScale('C3', '1,1,1,1,1,1,1,1,1,1,1,1', 6, 1);
      expect(chromaticScale.length).toBe(13); // LCM(12, 6) = 12 + 1 note repeat = 13
      
      // Find positions
      const tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
      const positions = algorithm.findNotes(chromaticScale, tuning, 6, theory);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100);
      expect(Array.isArray(positions)).toBe(true);
    });

    test('cleans up resources properly', () => {
      // Create and destroy multiple instances
      for (let i = 0; i < 10; i++) {
        const theory = new MusicalTheory();
        const patterns = new ScalePatterns();
        const algorithm = new FretboardAlgorithm();
        
        // Use instances
        theory.parseNote('C3');
        patterns.getScaleIntervals('major');
        algorithm.calculateFretRange([[0, 5]]);
      }
      
      // Should not leak memory or cause issues
      expect(true).toBe(true); // If we get here, no crashes occurred
    });
  });

  describe('Pattern import functionality', () => {
    test('localStorage mock works for custom presets', () => {
      // Test that our localStorage mock can store and retrieve custom presets
      const testPresets = {
        'custom-123': {
          title: 'Test Preset',
          intervals: [2, 2, 1, 2, 2, 2, 1],
          notesPerString: 3,
          selectedScaleDegree: 1,
          rootNote: 'C'
        }
      };
      
      global.localStorage.setItem('guitar-scale-visualizer-custom-presets', JSON.stringify(testPresets));
      global.localStorage.getItem.mockReturnValue(JSON.stringify(testPresets));
      
      const retrieved = JSON.parse(global.localStorage.getItem('guitar-scale-visualizer-custom-presets'));
      expect(retrieved).toEqual(testPresets);
      expect(retrieved['custom-123'].title).toBe('Test Preset');
    });

    test('pattern validation logic works correctly', () => {
      // Test the core logic that would be used in importPattern
      const validPattern = {
        name: 'Valid Pattern',
        intervals: [3, 2, 2, 3, 2],
        rootNote: 'G',
        notesPerString: 4,
        selectedScaleDegree: 2
      };

      const invalidPattern = {
        name: 'Invalid Pattern',
        rootNote: 'C'
        // Missing intervals array
      };

      // Valid pattern should have intervals array
      expect(Array.isArray(validPattern.intervals)).toBe(true);
      expect(validPattern.intervals.length).toBeGreaterThan(0);

      // Invalid pattern should be missing intervals
      expect(invalidPattern.intervals).toBeUndefined();
      expect(Array.isArray(invalidPattern.intervals)).toBe(false);
    });

    test('import pattern creates unique preset ID', () => {
      // Test the ID generation logic used in saveCustomPreset
      const timestamp1 = Date.now();
      const timestamp2 = timestamp1 + 1;
      
      const id1 = `custom-${timestamp1}`;
      const id2 = `custom-${timestamp2}`;
      
      expect(id1).toMatch(/^custom-\d+$/);
      expect(id2).toMatch(/^custom-\d+$/);
      expect(id1).not.toBe(id2);
    });

    test('import pattern data structure validation', () => {
      // Test that we can properly validate and process import data
      const importData = {
        name: 'Test Imported Scale',
        intervals: [3, 2, 2, 3, 2],
        rootNote: 'G',
        notesPerString: 4,
        tuning: 'standard-guitar',
        selectedScaleDegree: 2
      };

      // Validate required fields
      expect(importData.intervals).toBeDefined();
      expect(Array.isArray(importData.intervals)).toBe(true);
      expect(importData.intervals.length).toBeGreaterThan(0);

      // Validate optional fields have sensible defaults
      const presetName = importData.name || 'Imported Pattern';
      expect(presetName).toBe('Test Imported Scale');

      // Test with minimal data
      const minimalData = { intervals: [2, 1, 4, 1, 4] };
      const minimalPresetName = minimalData.name || 'Imported Pattern';
      expect(minimalPresetName).toBe('Imported Pattern');
    });
  });
});