// Mock localStorage for Node.js environment
global.localStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

const PresetManager = require('../../src/core/preset-manager.js');

describe('PresetManager', () => {
  let presetManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    presetManager = new PresetManager();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('constructor', () => {
    test('should initialize with correct storage keys', () => {
      expect(presetManager.SCALE_PREFERENCES_KEY).toBe('guitar-scale-visualizer-scale-preferences');
      expect(presetManager.GLOBAL_PREFERENCES_KEY).toBe('guitar-scale-visualizer-global-preferences');
      expect(presetManager.CUSTOM_PRESETS_KEY).toBe('guitar-scale-visualizer-custom-presets');
    });
  });

  describe('Scale Preferences', () => {
    test('should save and load scale preferences', () => {
      const preferences = {
        title: 'Test Scale',
        notesPerString: 3,
        selectedScaleDegree: 2,
        rootNote: 'D'
      };

      presetManager.saveScalePreferences('major', preferences);
      const loaded = presetManager.loadScalePreferences('major');

      expect(loaded).toEqual(preferences);
    });

    test('should return null for non-existent scale preferences', () => {
      const loaded = presetManager.loadScalePreferences('nonexistent');
      expect(loaded).toBeNull();
    });

    test('should return empty object when no preferences saved', () => {
      const all = presetManager.getScalePreferences();
      expect(all).toEqual({});
    });

    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const spy = jest.spyOn(console, 'warn').mockImplementation();

      presetManager.saveScalePreferences('major', { title: 'Test' });

      expect(spy).toHaveBeenCalledWith('Failed to save scale preferences:', expect.any(Error));

      // Restore
      localStorage.setItem = originalSetItem;
      spy.mockRestore();
    });
  });

  describe('Global Preferences', () => {
    test('should save and load global preferences', () => {
      const preferences = {
        tuning: 'standard-guitar',
        lastScaleType: 'minor'
      };

      presetManager.saveGlobalPreferences(preferences);
      const loaded = presetManager.getGlobalPreferences();

      expect(loaded).toEqual(preferences);
    });

    test('should merge global preferences when saving', () => {
      presetManager.saveGlobalPreferences({ tuning: 'bass-5-string' });
      presetManager.saveGlobalPreferences({ lastScaleType: 'major' });

      const loaded = presetManager.getGlobalPreferences();
      expect(loaded).toEqual({
        tuning: 'bass-5-string',
        lastScaleType: 'major'
      });
    });

    test('should return empty object when no global preferences saved', () => {
      const loaded = presetManager.getGlobalPreferences();
      expect(loaded).toEqual({});
    });
  });

  describe('Custom Presets', () => {
    const testPreset = {
      title: 'My Custom Scale',
      intervals: [2, 1, 2, 2, 1, 3, 1],
      notesPerString: 4,
      selectedScaleDegree: 1,
      rootNote: 'E'
    };

    test('should save and load custom presets', () => {
      presetManager.saveCustomPreset('test-preset', testPreset);
      const loaded = presetManager.loadCustomPreset('test-preset');

      expect(loaded.title).toBe(testPreset.title);
      expect(loaded.intervals).toEqual(testPreset.intervals);
      expect(loaded.notesPerString).toBe(testPreset.notesPerString);
      expect(loaded.selectedScaleDegree).toBe(testPreset.selectedScaleDegree);
      expect(loaded.rootNote).toBe(testPreset.rootNote);
      expect(loaded.isCustom).toBe(true);
      expect(loaded.createdAt).toBeDefined();
    });

    test('should return null for non-existent custom preset', () => {
      const loaded = presetManager.loadCustomPreset('nonexistent');
      expect(loaded).toBeNull();
    });

    test('should delete custom presets', () => {
      presetManager.saveCustomPreset('test-preset', testPreset);
      
      const deleteResult = presetManager.deleteCustomPreset('test-preset');
      expect(deleteResult).toBe(true);

      const loaded = presetManager.loadCustomPreset('test-preset');
      expect(loaded).toBeNull();
    });

    test('should return false when deleting non-existent preset', () => {
      const deleteResult = presetManager.deleteCustomPreset('nonexistent');
      expect(deleteResult).toBe(false);
    });

    test('should identify custom presets correctly', () => {
      presetManager.saveCustomPreset('test-preset', testPreset);

      expect(presetManager.isCustomPreset('test-preset')).toBe(true);
      expect(presetManager.isCustomPreset('major')).toBe(false);
      expect(presetManager.isCustomPreset('nonexistent')).toBe(false);
    });

    test('should get all custom presets', () => {
      presetManager.saveCustomPreset('preset1', testPreset);
      presetManager.saveCustomPreset('preset2', { ...testPreset, title: 'Second Preset' });

      const allPresets = presetManager.getCustomPresets();

      expect(Object.keys(allPresets)).toHaveLength(2);
      expect(allPresets['preset1'].title).toBe('My Custom Scale');
      expect(allPresets['preset2'].title).toBe('Second Preset');
    });

    test('should throw error when saving fails', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => {
        presetManager.saveCustomPreset('test-preset', testPreset);
      }).toThrow('Failed to save preset');

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('getAllPresetNames', () => {
    test('should return combined list of built-in and custom preset names', () => {
      const builtInScalePatterns = {
        'major': [2, 2, 1, 2, 2, 2, 1],
        'minor': [2, 1, 2, 2, 1, 2, 2]
      };

      presetManager.saveCustomPreset('custom1', {
        title: 'Custom 1',
        intervals: [1, 1, 1],
        notesPerString: 3,
        selectedScaleDegree: 1,
        rootNote: 'C'
      });

      const allNames = presetManager.getAllPresetNames(builtInScalePatterns);

      expect(allNames).toContain('major');
      expect(allNames).toContain('minor');
      expect(allNames).toContain('custom1');
      expect(allNames).toHaveLength(3);
    });
  });

  describe('Import/Export', () => {
    const testData = {
      scalePreferences: {
        'major': { title: 'Major Scale', notesPerString: 3, selectedScaleDegree: 1, rootNote: 'C' }
      },
      globalPreferences: {
        tuning: 'standard-guitar',
        lastScaleType: 'major'
      },
      customPresets: {
        'custom1': {
          title: 'Custom Scale',
          intervals: [2, 1, 2],
          notesPerString: 3,
          selectedScaleDegree: 1,
          rootNote: 'D',
          isCustom: true,
          createdAt: '2023-01-01T00:00:00.000Z'
        }
      }
    };

    test('should export all data', () => {
      // Set up some data
      presetManager.saveScalePreferences('major', testData.scalePreferences.major);
      presetManager.saveGlobalPreferences(testData.globalPreferences);
      presetManager.saveCustomPreset('custom1', testData.customPresets.custom1);

      const exported = presetManager.exportAllData();

      expect(exported.scalePreferences).toEqual(testData.scalePreferences);
      expect(exported.globalPreferences).toEqual(testData.globalPreferences);
      expect(exported.customPresets.custom1.title).toBe(testData.customPresets.custom1.title);
      expect(exported.version).toBe('1.0');
      expect(exported.exportedAt).toBeDefined();
    });

    test('should import all data with overwrite', () => {
      const result = presetManager.importAllData(testData, { overwrite: true });

      expect(result.scalePreferences).toBe(1);
      expect(result.customPresets).toBe(1);
      expect(result.globalPreferences).toBe(2);
      expect(result.errors).toHaveLength(0);

      // Verify data was imported
      const scalePrefs = presetManager.loadScalePreferences('major');
      expect(scalePrefs.title).toBe('Major Scale');

      const globalPrefs = presetManager.getGlobalPreferences();
      expect(globalPrefs.tuning).toBe('standard-guitar');

      const customPreset = presetManager.loadCustomPreset('custom1');
      expect(customPreset.title).toBe('Custom Scale');
    });

    test('should import all data without overwrite (merge)', () => {
      // Set up existing data
      presetManager.saveScalePreferences('minor', { title: 'Existing Minor', notesPerString: 2, selectedScaleDegree: 1, rootNote: 'A' });

      const result = presetManager.importAllData(testData, { overwrite: false });

      expect(result.errors).toHaveLength(0);

      // Verify both existing and imported data exist
      const majorPrefs = presetManager.loadScalePreferences('major');
      expect(majorPrefs.title).toBe('Major Scale');

      const minorPrefs = presetManager.loadScalePreferences('minor');
      expect(minorPrefs.title).toBe('Existing Minor');
    });

    test('should handle invalid import data', () => {
      const result = presetManager.importAllData(null);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('Invalid import data format');
    });
  });

  describe('clearAllData', () => {
    test('should clear all data by default', () => {
      // Set up some data
      presetManager.saveScalePreferences('major', { title: 'Test' });
      presetManager.saveGlobalPreferences({ tuning: 'test' });
      presetManager.saveCustomPreset('test', { title: 'Test' });

      presetManager.clearAllData();

      expect(presetManager.getScalePreferences()).toEqual({});
      expect(presetManager.getGlobalPreferences()).toEqual({});
      expect(presetManager.getCustomPresets()).toEqual({});
    });

    test('should clear only specified data types', () => {
      // Set up some data
      presetManager.saveScalePreferences('major', { title: 'Test' });
      presetManager.saveGlobalPreferences({ tuning: 'test' });
      presetManager.saveCustomPreset('test', { title: 'Test' });

      presetManager.clearAllData({ scalePreferences: true, globalPreferences: false, customPresets: false });

      expect(presetManager.getScalePreferences()).toEqual({});
      expect(presetManager.getGlobalPreferences().tuning).toBe('test');
      expect(Object.keys(presetManager.getCustomPresets())).toHaveLength(1);
    });
  });

  describe('validatePreset', () => {
    test('should validate correct preset structure', () => {
      const validPreset = {
        title: 'Test',
        intervals: [2, 2, 1],
        notesPerString: 3,
        selectedScaleDegree: 1,
        rootNote: 'C'
      };

      expect(presetManager.validatePreset(validPreset)).toBe(true);
    });

    test('should reject invalid preset structures', () => {
      expect(presetManager.validatePreset(null)).toBe(false);
      expect(presetManager.validatePreset({})).toBe(false);
      expect(presetManager.validatePreset({ title: 'Test' })).toBe(false);
    });
  });
});