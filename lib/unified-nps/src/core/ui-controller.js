/**
 * UI Controller - Manages UI coordination, event handling, and form state
 * Separates UI logic from rendering concerns in the widget
 */

class UIController {
  constructor(widget, presetManager, scaleVisualizer, musicalTheory, scalePatterns) {
    this.widget = widget;
    this.presetManager = presetManager;
    this.scaleVisualizer = scaleVisualizer;
    this.musicalTheory = musicalTheory;
    this.scalePatterns = scalePatterns;
    
    // Store event handler references for cleanup
    this.eventHandlers = new Map();
    
    // UI state
    this.isInitialized = false;
  }

  /**
   * Initialize the UI controller and set up event listeners
   */
  initialize() {
    if (this.isInitialized) return;
    
    this.setupEventListeners();
    this.loadGlobalPreferences();
    this.updateScaleDropdown();
    this.loadScalePreferences(this.widget.scaleTypeSelect.value);
    this.updatePresetButtonVisibility();
    this.updateNPSConstraints();
    
    this.isInitialized = true;
  }

  /**
   * Clean up event listeners and resources
   */
  cleanup() {
    // Remove all event listeners
    for (const [element, handlers] of this.eventHandlers) {
      for (const [event, handler] of handlers) {
        element.removeEventListener(event, handler);
      }
    }
    this.eventHandlers.clear();
    this.isInitialized = false;
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Create and store event handlers
    const handlers = {
      tuningChange: () => {
        this.widget.updateVisualization();
        this.saveGlobalPreferences();
      },
      rootNoteChange: () => {
        this.widget.updateVisualization();
        this.saveScalePreferences();
      },
      scaleTypeChange: () => {
        this.loadScalePreferences(this.widget.scaleTypeSelect.value);
        this.updatePresetButtonVisibility();
        this.widget.updateVisualization();
      },
      scaleIntervalsChange: () => {
        this.updateScaleTypeFromIntervals();
        this.updateNPSConstraints();
        this.widget.updateVisualization();
        this.saveScalePreferences();
      },
      notesPerStringChange: () => {
        document.getElementById('nps-value').textContent = this.widget.notesPerStringInput.value;
        this.widget.updateVisualization();
        this.saveScalePreferences();
      },
      selectedScaleDegreeChange: () => {
        const newDegree = parseInt(this.widget.selectedScaleDegreeInput.value);
        if (newDegree >= 1 && newDegree <= this.musicalTheory.parseIntervals(this.widget.scaleIntervalsInput.value).length) {
          this.widget.selectedScaleDegree = newDegree;
          this.widget.updateVisualization();
          this.saveScalePreferences();
        }
      },
      scaleTitleChange: () => {
        this.saveScalePreferences();
      },
      saveSvgClick: () => this.widget.saveSvgVisualization(),
      exportClick: () => this.widget.exportCurrentPattern(),
      savePresetClick: () => this.promptSaveCustomPreset(),
      updatePresetClick: () => this.updateCurrentPreset(),
      deletePresetClick: () => this.deleteCurrentPreset(),
      importFileChange: (e) => this.handleImportFile(e)
    };

    // Add event listeners and store references
    this.addEventHandler(this.widget.tuningPresetSelect, 'change', handlers.tuningChange);
    this.addEventHandler(this.widget.rootNoteSelect, 'change', handlers.rootNoteChange);
    this.addEventHandler(this.widget.scaleTypeSelect, 'change', handlers.scaleTypeChange);
    this.addEventHandler(this.widget.scaleIntervalsInput, 'input', handlers.scaleIntervalsChange);
    this.addEventHandler(this.widget.notesPerStringInput, 'input', handlers.notesPerStringChange);
    this.addEventHandler(this.widget.selectedScaleDegreeInput, 'input', handlers.selectedScaleDegreeChange);
    this.addEventHandler(this.widget.scaleTitleInput, 'input', handlers.scaleTitleChange);
    this.addEventHandler(this.widget.saveSvgButton, 'click', handlers.saveSvgClick);
    this.addEventHandler(this.widget.exportButton, 'click', handlers.exportClick);
    this.addEventHandler(this.widget.savePresetButton, 'click', handlers.savePresetClick);
    this.addEventHandler(this.widget.updatePresetButton, 'click', handlers.updatePresetClick);
    this.addEventHandler(this.widget.deletePresetButton, 'click', handlers.deletePresetClick);
    this.addEventHandler(this.widget.importFile, 'change', handlers.importFileChange);
  }

  /**
   * Helper method to add event listener and store reference for cleanup
   */
  addEventHandler(element, event, handler) {
    if (!this.eventHandlers.has(element)) {
      this.eventHandlers.set(element, new Map());
    }
    this.eventHandlers.get(element).set(event, handler);
    element.addEventListener(event, handler);
  }

  /**
   * Update scale type based on current intervals
   */
  updateScaleTypeFromIntervals() {
    const inputArray = this.musicalTheory.parseIntervals(this.widget.scaleIntervalsInput.value);
    const matchingScale = this.scalePatterns.findScaleTypeFromIntervals(inputArray);
    this.widget.scaleTypeSelect.value = matchingScale || 'custom';
  }

  /**
   * Update notes per string constraints based on current scale
   */
  updateNPSConstraints() {
    const scaleLength = this.musicalTheory.parseIntervals(this.widget.scaleIntervalsInput.value).length;
    
    // Handle case where scale has no valid notes (empty or invalid intervals)
    if (scaleLength === 0) {
      this.widget.notesPerStringInput.max = 1;
      this.widget.notesPerStringInput.value = 1;
      document.getElementById('nps-value').textContent = 1;
      this.widget.selectedScaleDegreeInput.max = 1;
      this.widget.selectedScaleDegree = 1;
      this.widget.selectedScaleDegreeInput.value = 1;
      return;
    }
    
    this.widget.notesPerStringInput.max = scaleLength;
    const currentNPS = parseInt(this.widget.notesPerStringInput.value);
    if (currentNPS > scaleLength) {
      this.widget.notesPerStringInput.value = scaleLength;
      document.getElementById('nps-value').textContent = scaleLength;
    }
    
    this.widget.selectedScaleDegreeInput.max = scaleLength;
    if (this.widget.selectedScaleDegree > scaleLength) {
      this.widget.selectedScaleDegree = 1;
      this.widget.selectedScaleDegreeInput.value = 1;
    }
  }

  /**
   * Handle note click from the visualization
   */
  onNoteClick(clickedScaleDegree) {
    this.widget.selectedScaleDegree = clickedScaleDegree;
    this.widget.selectedScaleDegreeInput.value = clickedScaleDegree;
    this.widget.updateVisualization();
  }

  /**
   * Save preferences for the current scale type
   */
  saveScalePreferences() {
    const scaleType = this.widget.scaleTypeSelect.value;
    const preferences = {
      title: this.widget.scaleTitleInput.value,
      notesPerString: parseInt(this.widget.notesPerStringInput.value),
      selectedScaleDegree: this.widget.selectedScaleDegree,
      rootNote: this.widget.rootNoteSelect.value
    };
    
    this.presetManager.saveScalePreferences(scaleType, preferences);
  }

  /**
   * Load preferences for a specific scale type
   */
  loadScalePreferences(scaleType) {
    // Check if it's a custom preset first
    const customPreset = this.presetManager.loadCustomPreset(scaleType);
    if (customPreset) {
      this.widget.scaleIntervalsInput.value = customPreset.intervals.join(',');
      this.widget.scaleTitleInput.value = customPreset.title;
      this.widget.notesPerStringInput.value = customPreset.notesPerString;
      document.getElementById('nps-value').textContent = customPreset.notesPerString;
      this.widget.selectedScaleDegree = customPreset.selectedScaleDegree;
      this.widget.selectedScaleDegreeInput.value = customPreset.selectedScaleDegree;
      this.widget.rootNoteSelect.value = customPreset.rootNote;
      this.updateNPSConstraints();
      return;
    }
    
    // Handle built-in scales
    const scalePrefs = this.presetManager.loadScalePreferences(scaleType) || this.widget.defaultScalePreferences[scaleType];
    
    if (scalePrefs) {
      // Load intervals from built-in pattern
      const intervals = this.widget.scaleIntervalPatterns[scaleType];
      if (intervals) {
        this.widget.scaleIntervalsInput.value = intervals.join(',');
      }
      
      // Load scale-specific preferences
      this.widget.scaleTitleInput.value = scalePrefs.title;
      this.widget.notesPerStringInput.value = scalePrefs.notesPerString;
      document.getElementById('nps-value').textContent = scalePrefs.notesPerString;
      this.widget.selectedScaleDegree = scalePrefs.selectedScaleDegree;
      this.widget.selectedScaleDegreeInput.value = scalePrefs.selectedScaleDegree;
      this.widget.rootNoteSelect.value = scalePrefs.rootNote;
      
      this.updateNPSConstraints();
    }
  }

  /**
   * Save global preferences (tuning, last scale type)
   */
  saveGlobalPreferences() {
    const globalPrefs = {
      tuning: this.widget.tuningPresetSelect.value,
      lastScaleType: this.widget.scaleTypeSelect.value
    };
    
    this.presetManager.saveGlobalPreferences(globalPrefs);
  }

  /**
   * Load global preferences
   */
  loadGlobalPreferences() {
    const globalPrefs = this.presetManager.getGlobalPreferences();
    if (globalPrefs.tuning) this.widget.tuningPresetSelect.value = globalPrefs.tuning;
    if (globalPrefs.lastScaleType) this.widget.scaleTypeSelect.value = globalPrefs.lastScaleType;
  }

  /**
   * Handle file import
   */
  handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const pattern = JSON.parse(e.target.result);
        this.importPattern(pattern);
      } catch (error) {
        alert('Error reading file: Invalid JSON format');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }

  /**
   * Import a pattern from JSON data
   */
  importPattern(pattern) {
    try {
      // Validate required fields
      if (!pattern.intervals || !Array.isArray(pattern.intervals)) {
        throw new Error('Invalid pattern: missing or invalid intervals');
      }
      
      // Apply pattern to UI
      if (pattern.rootNote) this.widget.rootNoteSelect.value = pattern.rootNote;
      if (pattern.tuning && this.widget.tuningPresets[pattern.tuning]) {
        this.widget.tuningPresetSelect.value = pattern.tuning;
      }
      if (pattern.notesPerString) {
        this.widget.notesPerStringInput.value = pattern.notesPerString;
        document.getElementById('nps-value').textContent = pattern.notesPerString;
      }
      if (pattern.selectedScaleDegree) {
        this.widget.selectedScaleDegree = pattern.selectedScaleDegree;
        this.widget.selectedScaleDegreeInput.value = pattern.selectedScaleDegree;
      }
      
      // Set intervals and update scale type
      this.widget.scaleIntervalsInput.value = pattern.intervals.join(',');
      this.updateScaleTypeFromIntervals();
      
      // Set scale title if provided
      if (pattern.name) {
        this.widget.scaleTitleInput.value = pattern.name;
      }
      
      // Save as custom preset to make it persistent
      const presetName = pattern.name || 'Imported Pattern';
      this.saveCustomPreset(presetName, pattern.intervals);
      
      // Update constraints and visualization
      this.updateNPSConstraints();
      this.widget.updateVisualization();
      this.saveScalePreferences();
      this.saveGlobalPreferences();
      
    } catch (error) {
      alert(`Error importing pattern: ${error.message}`);
      console.error('Import pattern error:', error);
    }
  }

  /**
   * Save a custom preset
   */
  saveCustomPreset(name, intervals) {
    const presetId = `custom-${Date.now()}`;
    
    const preset = {
      title: name,
      intervals: intervals || this.musicalTheory.parseIntervals(this.widget.scaleIntervalsInput.value),
      notesPerString: parseInt(this.widget.notesPerStringInput.value),
      selectedScaleDegree: this.widget.selectedScaleDegree,
      rootNote: this.widget.rootNoteSelect.value
    };
    
    try {
      this.presetManager.saveCustomPreset(presetId, preset);
      this.updateScaleDropdown();
      this.widget.scaleTypeSelect.value = presetId; // Select the newly created preset
      this.updatePresetButtonVisibility(); // Update button visibility for the new preset
      return presetId;
    } catch (e) {
      alert('Failed to save preset. Please try again.');
      return null;
    }
  }

  /**
   * Prompt user to save current settings as a custom preset
   */
  promptSaveCustomPreset() {
    const currentTitle = this.widget.scaleTitleInput.value || 'Custom Scale';
    const presetName = prompt('Save current pattern as preset:', currentTitle);
    
    if (presetName && presetName.trim()) {
      this.saveCustomPreset(presetName.trim());
    }
  }

  /**
   * Update the current custom preset
   */
  updateCurrentPreset() {
    const scaleType = this.widget.scaleTypeSelect.value;
    
    if (this.presetManager.isCustomPreset(scaleType)) {
      const currentPreset = this.presetManager.loadCustomPreset(scaleType);
      const currentTitle = this.widget.scaleTitleInput.value || currentPreset.title;
      
      const updatedPreset = {
        title: currentTitle,
        intervals: this.musicalTheory.parseIntervals(this.widget.scaleIntervalsInput.value),
        notesPerString: parseInt(this.widget.notesPerStringInput.value),
        selectedScaleDegree: this.widget.selectedScaleDegree,
        rootNote: this.widget.rootNoteSelect.value
      };
      
      try {
        this.presetManager.saveCustomPreset(scaleType, updatedPreset);
        this.updateScaleDropdown();
        this.widget.scaleTypeSelect.value = scaleType; // Keep current preset selected
      } catch (e) {
        alert('Failed to update preset. Please try again.');
      }
    }
  }

  /**
   * Delete the current custom preset
   */
  deleteCurrentPreset() {
    const scaleType = this.widget.scaleTypeSelect.value;
    
    if (this.presetManager.isCustomPreset(scaleType)) {
      const preset = this.presetManager.loadCustomPreset(scaleType);
      const presetTitle = preset.title;
      
      if (confirm(`Are you sure you want to delete the preset "${presetTitle}"? This action cannot be undone.`)) {
        if (this.presetManager.deleteCustomPreset(scaleType)) {
          this.updateScaleDropdown();
          this.widget.scaleTypeSelect.value = 'major'; // Switch to default preset
          this.loadScalePreferences('major');
          this.updatePresetButtonVisibility();
          this.widget.updateVisualization();
        } else {
          alert('Failed to delete preset. Please try again.');
        }
      }
    }
  }

  /**
   * Update visibility of preset management buttons
   */
  updatePresetButtonVisibility() {
    const scaleType = this.widget.scaleTypeSelect.value;
    const isCustomPreset = this.presetManager.isCustomPreset(scaleType);
    
    this.widget.updatePresetButton.style.display = isCustomPreset ? 'block' : 'none';
    this.widget.deletePresetButton.style.display = isCustomPreset ? 'block' : 'none';
  }

  /**
   * Update the scale dropdown with built-in and custom presets
   */
  updateScaleDropdown() {
    const currentValue = this.widget.scaleTypeSelect.value;
    
    // Clear existing options
    this.widget.scaleTypeSelect.innerHTML = '';
    
    // Add built-in scales from existing scale definitions
    Object.keys(this.widget.defaultScalePreferences).forEach(scaleKey => {
      const option = document.createElement('option');
      option.value = scaleKey;
      option.textContent = this.widget.defaultScalePreferences[scaleKey].title.replace(' Scale', '').replace(' Mode', '');
      this.widget.scaleTypeSelect.appendChild(option);
    });
    
    // Add custom presets
    const customPresets = this.presetManager.getCustomPresets();
    const customPresetIds = Object.keys(customPresets);
    
    if (customPresetIds.length > 0) {
      // Add separator
      const separator = document.createElement('option');
      separator.disabled = true;
      separator.textContent = '────── Custom Presets ──────';
      this.widget.scaleTypeSelect.appendChild(separator);
      
      // Add custom presets
      customPresetIds.forEach(presetId => {
        const preset = customPresets[presetId];
        const option = document.createElement('option');
        option.value = presetId;
        option.textContent = `⭐ ${preset.title}`;
        this.widget.scaleTypeSelect.appendChild(option);
      });
    }
    
    // Restore previous selection if it still exists
    if (currentValue) {
      const optionExists = Array.from(this.widget.scaleTypeSelect.options).some(opt => opt.value === currentValue);
      if (optionExists) {
        this.widget.scaleTypeSelect.value = currentValue;
      } else {
        this.widget.scaleTypeSelect.value = 'major'; // Default fallback
      }
    }
    
    // Update button visibility after dropdown rebuild
    this.updatePresetButtonVisibility();
  }
}

// Export for both CommonJS (Node.js tests) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIController;
} else {
  window.UIController = UIController;
}