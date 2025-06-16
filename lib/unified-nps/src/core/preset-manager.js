/**
 * Preset Manager - Handle all preset and preference storage operations
 * Manages localStorage operations for scale preferences and custom presets
 */

class PresetManager {
  constructor() {
    // Storage keys
    this.SCALE_PREFERENCES_KEY = 'guitar-scale-visualizer-scale-preferences';
    this.GLOBAL_PREFERENCES_KEY = 'guitar-scale-visualizer-global-preferences';
    this.CUSTOM_PRESETS_KEY = 'guitar-scale-visualizer-custom-presets';
  }

  /**
   * Save preferences for a specific scale type
   * @param {string} scaleType - Scale type identifier
   * @param {Object} preferences - Preference object
   * @param {string} preferences.title - Scale title
   * @param {number} preferences.notesPerString - Notes per string setting
   * @param {number} preferences.selectedScaleDegree - Selected scale degree
   * @param {string} preferences.rootNote - Root note
   */
  saveScalePreferences(scaleType, preferences) {
    try {
      const allPreferences = this.getScalePreferences();
      allPreferences[scaleType] = {
        title: preferences.title,
        notesPerString: preferences.notesPerString,
        selectedScaleDegree: preferences.selectedScaleDegree,
        rootNote: preferences.rootNote
      };
      
      localStorage.setItem(this.SCALE_PREFERENCES_KEY, JSON.stringify(allPreferences));
    } catch (error) {
      console.warn('Failed to save scale preferences:', error);
    }
  }

  /**
   * Load preferences for a specific scale type
   * @param {string} scaleType - Scale type identifier
   * @returns {Object|null} Preference object or null if not found
   */
  loadScalePreferences(scaleType) {
    const allPreferences = this.getScalePreferences();
    return allPreferences[scaleType] || null;
  }

  /**
   * Get all scale preferences
   * @returns {Object} All scale preferences object
   */
  getScalePreferences() {
    try {
      const stored = localStorage.getItem(this.SCALE_PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load scale preferences:', error);
      return {};
    }
  }

  /**
   * Save global preferences (tuning, last scale, etc.)
   * @param {Object} preferences - Global preference object
   * @param {string} preferences.tuning - Selected tuning
   * @param {string} preferences.lastScaleType - Last selected scale type
   */
  saveGlobalPreferences(preferences) {
    try {
      const current = this.getGlobalPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.GLOBAL_PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save global preferences:', error);
    }
  }

  /**
   * Load global preferences
   * @returns {Object} Global preferences object
   */
  getGlobalPreferences() {
    try {
      const stored = localStorage.getItem(this.GLOBAL_PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load global preferences:', error);
      return {};
    }
  }

  /**
   * Save a custom preset
   * @param {string} presetName - Unique preset name
   * @param {Object} preset - Preset data
   * @param {string} preset.title - Display title
   * @param {number[]} preset.intervals - Scale intervals
   * @param {number} preset.notesPerString - Notes per string
   * @param {number} preset.selectedScaleDegree - Selected scale degree
   * @param {string} preset.rootNote - Root note
   */
  saveCustomPreset(presetName, preset) {
    try {
      const customPresets = this.getCustomPresets();
      customPresets[presetName] = {
        title: preset.title,
        intervals: preset.intervals,
        notesPerString: preset.notesPerString,
        selectedScaleDegree: preset.selectedScaleDegree,
        rootNote: preset.rootNote,
        isCustom: true,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
    } catch (error) {
      console.warn('Failed to save custom preset:', error);
      throw new Error('Failed to save preset');
    }
  }

  /**
   * Load a custom preset
   * @param {string} presetName - Preset name
   * @returns {Object|null} Preset data or null if not found
   */
  loadCustomPreset(presetName) {
    const customPresets = this.getCustomPresets();
    return customPresets[presetName] || null;
  }

  /**
   * Get all custom presets
   * @returns {Object} All custom presets object
   */
  getCustomPresets() {
    try {
      const stored = localStorage.getItem(this.CUSTOM_PRESETS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load custom presets:', error);
      return {};
    }
  }

  /**
   * Delete a custom preset
   * @param {string} presetName - Preset name to delete
   * @returns {boolean} True if deleted successfully
   */
  deleteCustomPreset(presetName) {
    try {
      const customPresets = this.getCustomPresets();
      if (customPresets[presetName]) {
        delete customPresets[presetName];
        localStorage.setItem(this.CUSTOM_PRESETS_KEY, JSON.stringify(customPresets));
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to delete custom preset:', error);
      return false;
    }
  }

  /**
   * Check if a preset name is a custom preset
   * @param {string} presetName - Preset name to check
   * @returns {boolean} True if it's a custom preset
   */
  isCustomPreset(presetName) {
    const customPresets = this.getCustomPresets();
    return presetName in customPresets;
  }

  /**
   * Get all preset names (built-in + custom)
   * @param {Object} builtInScalePatterns - Built-in scale patterns object
   * @returns {string[]} Array of all preset names
   */
  getAllPresetNames(builtInScalePatterns) {
    const builtInNames = Object.keys(builtInScalePatterns);
    const customNames = Object.keys(this.getCustomPresets());
    return [...builtInNames, ...customNames];
  }

  /**
   * Export all presets and preferences to JSON
   * @returns {Object} Complete export data
   */
  exportAllData() {
    return {
      scalePreferences: this.getScalePreferences(),
      globalPreferences: this.getGlobalPreferences(),
      customPresets: this.getCustomPresets(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import presets and preferences from JSON data
   * @param {Object} data - Import data object
   * @param {Object} options - Import options
   * @param {boolean} options.overwrite - Whether to overwrite existing data
   * @returns {Object} Import result summary
   */
  importAllData(data, options = { overwrite: false }) {
    const result = {
      scalePreferences: 0,
      customPresets: 0,
      globalPreferences: 0,
      errors: []
    };

    try {
      // Validate import data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid import data format');
      }

      // Import scale preferences
      if (data.scalePreferences) {
        if (options.overwrite) {
          localStorage.setItem(this.SCALE_PREFERENCES_KEY, JSON.stringify(data.scalePreferences));
        } else {
          const current = this.getScalePreferences();
          const merged = { ...current, ...data.scalePreferences };
          localStorage.setItem(this.SCALE_PREFERENCES_KEY, JSON.stringify(merged));
        }
        result.scalePreferences = Object.keys(data.scalePreferences).length;
      }

      // Import custom presets
      if (data.customPresets) {
        if (options.overwrite) {
          localStorage.setItem(this.CUSTOM_PRESETS_KEY, JSON.stringify(data.customPresets));
        } else {
          const current = this.getCustomPresets();
          const merged = { ...current, ...data.customPresets };
          localStorage.setItem(this.CUSTOM_PRESETS_KEY, JSON.stringify(merged));
        }
        result.customPresets = Object.keys(data.customPresets).length;
      }

      // Import global preferences
      if (data.globalPreferences) {
        if (options.overwrite) {
          localStorage.setItem(this.GLOBAL_PREFERENCES_KEY, JSON.stringify(data.globalPreferences));
        } else {
          const current = this.getGlobalPreferences();
          const merged = { ...current, ...data.globalPreferences };
          localStorage.setItem(this.GLOBAL_PREFERENCES_KEY, JSON.stringify(merged));
        }
        result.globalPreferences = Object.keys(data.globalPreferences).length;
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Clear all stored data (useful for testing or reset)
   * @param {Object} options - Clear options
   * @param {boolean} options.scalePreferences - Clear scale preferences
   * @param {boolean} options.globalPreferences - Clear global preferences  
   * @param {boolean} options.customPresets - Clear custom presets
   */
  clearAllData(options = { scalePreferences: true, globalPreferences: true, customPresets: true }) {
    try {
      if (options.scalePreferences) {
        localStorage.removeItem(this.SCALE_PREFERENCES_KEY);
      }
      if (options.globalPreferences) {
        localStorage.removeItem(this.GLOBAL_PREFERENCES_KEY);
      }
      if (options.customPresets) {
        localStorage.removeItem(this.CUSTOM_PRESETS_KEY);
      }
    } catch (error) {
      console.warn('Failed to clear data:', error);
    }
  }

  /**
   * Validate preset data structure
   * @param {Object} preset - Preset to validate
   * @returns {boolean} True if valid
   */
  validatePreset(preset) {
    if (!preset || typeof preset !== 'object') return false;
    
    const required = ['title', 'intervals', 'notesPerString', 'selectedScaleDegree', 'rootNote'];
    return required.every(field => Object.prototype.hasOwnProperty.call(preset, field));
  }
}

// Export for both CommonJS (Node.js tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PresetManager;
} else {
  window.PresetManager = PresetManager;
}