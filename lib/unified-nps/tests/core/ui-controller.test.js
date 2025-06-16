const UIController = require('../../src/core/ui-controller.js');

// Mock DOM environment (currently unused but available for future DOM testing)
// const mockDOM = {
//   getElementById: jest.fn(),
//   createElementNS: jest.fn(),
//   createElement: jest.fn(),
//   addEventListener: jest.fn(),
//   removeEventListener: jest.fn(),
//   querySelector: jest.fn()
// };

// Mock DOM elements
const createMockElement = (id) => ({
  id,
  value: '',
  textContent: '',
  style: {},
  max: '',
  min: '',
  options: [],
  selectedIndex: 0,
  innerHTML: '',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  appendChild: jest.fn(),
  setAttribute: jest.fn(),
  getAttribute: jest.fn()
});

// Mock dependencies
const mockWidget = {
  svg: createMockElement('fretboard'),
  tuningPresetSelect: createMockElement('tuning-preset'),
  rootNoteSelect: createMockElement('root-note'),
  scaleTypeSelect: createMockElement('scale-type'),
  scaleIntervalsInput: createMockElement('scale-intervals'),
  notesPerStringInput: createMockElement('notes-per-string'),
  selectedScaleDegreeInput: createMockElement('selected-scale-degree'),
  saveSvgButton: createMockElement('save-svg-button'),
  exportButton: createMockElement('export-button'),
  savePresetButton: createMockElement('save-preset-button'),
  updatePresetButton: createMockElement('update-preset-button'),
  deletePresetButton: createMockElement('delete-preset-button'),
  importFile: createMockElement('import-file'),
  scaleTitleInput: createMockElement('scale-title'),
  selectedScaleDegree: 1,
  tuningPresets: {
    'standard-guitar': ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
  },
  scaleIntervalPatterns: {
    'major': [2, 2, 1, 2, 2, 2, 1],
    'minor': [2, 1, 2, 2, 1, 2, 2]
  },
  defaultScalePreferences: {
    'major': { title: 'Major Scale', notesPerString: 3, selectedScaleDegree: 1, rootNote: 'C' }
  },
  updateVisualization: jest.fn(),
  saveSvgVisualization: jest.fn(),
  exportCurrentPattern: jest.fn()
};

const mockPresetManager = {
  saveScalePreferences: jest.fn(),
  loadScalePreferences: jest.fn(() => null),
  saveGlobalPreferences: jest.fn(),
  getGlobalPreferences: jest.fn(() => ({})),
  saveCustomPreset: jest.fn(),
  loadCustomPreset: jest.fn(() => null),
  deleteCustomPreset: jest.fn(() => true),
  isCustomPreset: jest.fn(() => false),
  getCustomPresets: jest.fn(() => ({}))
};

const mockScaleVisualizer = {
  generateVisualizationData: jest.fn()
};

const mockMusicalTheory = {
  parseIntervals: jest.fn((str) => str.split(',').map(n => parseInt(n))),
  parseNote: jest.fn(),
  semitoneToNote: jest.fn(),
  getNoteName: jest.fn()
};

const mockScalePatterns = {
  findScaleTypeFromIntervals: jest.fn(() => null),
  scaleIntervalPatterns: {
    'major': [2, 2, 1, 2, 2, 2, 1]
  }
};

// Mock global functions
global.document = {
  getElementById: jest.fn((id) => {
    if (id === 'nps-value') {
      return { textContent: '3' };
    }
    return mockWidget[id] || createMockElement(id);
  }),
  createElement: jest.fn(() => createMockElement('mock')),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

global.alert = jest.fn();
global.prompt = jest.fn();
global.confirm = jest.fn();
global.FileReader = jest.fn(() => ({
  readAsText: jest.fn(),
  onload: null
}));
global.Blob = jest.fn();
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
};

describe('UIController', () => {
  let uiController;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mockWidget selectedScaleDegree
    mockWidget.selectedScaleDegree = 1;
    
    uiController = new UIController(
      mockWidget,
      mockPresetManager,
      mockScaleVisualizer,
      mockMusicalTheory,
      mockScalePatterns
    );
  });

  describe('constructor', () => {
    test('should initialize with dependencies', () => {
      expect(uiController.widget).toBe(mockWidget);
      expect(uiController.presetManager).toBe(mockPresetManager);
      expect(uiController.scaleVisualizer).toBe(mockScaleVisualizer);
      expect(uiController.musicalTheory).toBe(mockMusicalTheory);
      expect(uiController.scalePatterns).toBe(mockScalePatterns);
    });

    test('should initialize event handlers map', () => {
      expect(uiController.eventHandlers).toBeInstanceOf(Map);
      expect(uiController.eventHandlers.size).toBe(0);
    });

    test('should not be initialized initially', () => {
      expect(uiController.isInitialized).toBe(false);
    });
  });

  describe('initialize', () => {
    test('should set up UI controller', () => {
      uiController.initialize();

      expect(uiController.isInitialized).toBe(true);
      expect(mockPresetManager.getGlobalPreferences).toHaveBeenCalled();
    });

    test('should not reinitialize if already initialized', () => {
      uiController.initialize();
      jest.clearAllMocks();
      
      uiController.initialize();
      
      expect(mockPresetManager.getGlobalPreferences).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    test('should remove all event listeners', () => {
      uiController.initialize();
      
      uiController.cleanup();
      
      expect(uiController.isInitialized).toBe(false);
      expect(uiController.eventHandlers.size).toBe(0);
    });
  });

  describe('addEventHandler', () => {
    test('should add event listener and store reference', () => {
      const element = createMockElement('test');
      const handler = jest.fn();
      
      uiController.addEventHandler(element, 'click', handler);
      
      expect(element.addEventListener).toHaveBeenCalledWith('click', handler);
      expect(uiController.eventHandlers.has(element)).toBe(true);
      expect(uiController.eventHandlers.get(element).get('click')).toBe(handler);
    });
  });

  describe('updateScaleTypeFromIntervals', () => {
    test('should update scale type based on intervals', () => {
      mockWidget.scaleIntervalsInput.value = '2,2,1,2,2,2,1';
      mockScalePatterns.findScaleTypeFromIntervals.mockReturnValue('major');
      
      uiController.updateScaleTypeFromIntervals();
      
      expect(mockWidget.scaleTypeSelect.value).toBe('major');
    });

    test('should default to custom if no matching scale found', () => {
      mockWidget.scaleIntervalsInput.value = '1,1,1';
      mockScalePatterns.findScaleTypeFromIntervals.mockReturnValue(null);
      
      uiController.updateScaleTypeFromIntervals();
      
      expect(mockWidget.scaleTypeSelect.value).toBe('custom');
    });
  });

  describe('updateNPSConstraints', () => {
    test('should update constraints for valid scale', () => {
      mockWidget.scaleIntervalsInput.value = '2,2,1,2,2,2,1';
      mockMusicalTheory.parseIntervals.mockReturnValue([2, 2, 1, 2, 2, 2, 1]);
      
      uiController.updateNPSConstraints();
      
      expect(mockWidget.notesPerStringInput.max).toBe(7);
      expect(mockWidget.selectedScaleDegreeInput.max).toBe(7);
    });

    test('should handle empty scale gracefully', () => {
      mockWidget.scaleIntervalsInput.value = '';
      mockMusicalTheory.parseIntervals.mockReturnValue([]);
      
      uiController.updateNPSConstraints();
      
      expect(mockWidget.notesPerStringInput.max).toBe(1);
      expect(mockWidget.notesPerStringInput.value).toBe(1);
      expect(mockWidget.selectedScaleDegree).toBe(1);
    });
  });

  describe('onNoteClick', () => {
    test('should update selected scale degree and trigger visualization', () => {
      uiController.onNoteClick(5);
      
      expect(mockWidget.selectedScaleDegree).toBe(5);
      expect(mockWidget.selectedScaleDegreeInput.value).toBe(5);
      expect(mockWidget.updateVisualization).toHaveBeenCalled();
    });
  });

  describe('saveScalePreferences', () => {
    test('should save current scale preferences', () => {
      mockWidget.scaleTypeSelect.value = 'major';
      mockWidget.scaleTitleInput.value = 'Test Scale';
      mockWidget.notesPerStringInput.value = '3';
      mockWidget.selectedScaleDegree = 2;
      mockWidget.rootNoteSelect.value = 'D';
      
      uiController.saveScalePreferences();
      
      expect(mockPresetManager.saveScalePreferences).toHaveBeenCalledWith('major', {
        title: 'Test Scale',
        notesPerString: 3,
        selectedScaleDegree: 2,
        rootNote: 'D'
      });
    });
  });

  describe('loadScalePreferences', () => {
    test('should load custom preset if available', () => {
      const customPreset = {
        intervals: [2, 1, 2],
        title: 'Custom Scale',
        notesPerString: 2,
        selectedScaleDegree: 2, // Set to 2 instead of 3 to be within scale length
        rootNote: 'F'
      };
      mockPresetManager.loadCustomPreset.mockReturnValue(customPreset);
      
      // Make sure parseIntervals returns the expected array
      mockMusicalTheory.parseIntervals.mockReturnValue([2, 1, 2]);
      
      uiController.loadScalePreferences('custom-123');
      
      expect(mockWidget.scaleIntervalsInput.value).toBe('2,1,2');
      expect(mockWidget.scaleTitleInput.value).toBe('Custom Scale');
      expect(mockWidget.selectedScaleDegree).toBe(2);
    });

    test('should load built-in scale preferences', () => {
      mockPresetManager.loadCustomPreset.mockReturnValue(null);
      
      uiController.loadScalePreferences('major');
      
      expect(mockWidget.scaleIntervalsInput.value).toBe('2,2,1,2,2,2,1');
      expect(mockWidget.scaleTitleInput.value).toBe('Major Scale');
    });
  });

  describe('saveGlobalPreferences', () => {
    test('should save global preferences', () => {
      mockWidget.tuningPresetSelect.value = 'standard-guitar';
      mockWidget.scaleTypeSelect.value = 'minor';
      
      uiController.saveGlobalPreferences();
      
      expect(mockPresetManager.saveGlobalPreferences).toHaveBeenCalledWith({
        tuning: 'standard-guitar',
        lastScaleType: 'minor'
      });
    });
  });

  describe('loadGlobalPreferences', () => {
    test('should load global preferences', () => {
      mockPresetManager.getGlobalPreferences.mockReturnValue({
        tuning: 'bass-4-string',
        lastScaleType: 'pentatonic'
      });
      
      uiController.loadGlobalPreferences();
      
      expect(mockWidget.tuningPresetSelect.value).toBe('bass-4-string');
      expect(mockWidget.scaleTypeSelect.value).toBe('pentatonic');
    });
  });

  describe('saveCustomPreset', () => {
    test('should save custom preset successfully', () => {
      mockWidget.scaleTitleInput.value = 'My Scale';
      mockWidget.notesPerStringInput.value = '4';
      mockWidget.selectedScaleDegree = 2;
      mockWidget.rootNoteSelect.value = 'G';
      
      const presetId = uiController.saveCustomPreset('Test Preset', [1, 2, 3]);
      
      expect(mockPresetManager.saveCustomPreset).toHaveBeenCalled();
      expect(presetId).toMatch(/^custom-\d+$/);
    });

    test('should handle save error gracefully', () => {
      mockPresetManager.saveCustomPreset.mockImplementation(() => {
        throw new Error('Save failed');
      });
      
      const presetId = uiController.saveCustomPreset('Test Preset');
      
      expect(global.alert).toHaveBeenCalledWith('Failed to save preset. Please try again.');
      expect(presetId).toBeNull();
    });
  });

  describe('promptSaveCustomPreset', () => {
    test('should prompt user and save preset', () => {
      global.prompt.mockReturnValue('New Preset');
      mockWidget.scaleTitleInput.value = 'Current Scale';
      
      uiController.promptSaveCustomPreset();
      
      expect(global.prompt).toHaveBeenCalledWith('Save current pattern as preset:', 'Current Scale');
      expect(mockPresetManager.saveCustomPreset).toHaveBeenCalled();
    });

    test('should not save if user cancels', () => {
      global.prompt.mockReturnValue(null);
      
      uiController.promptSaveCustomPreset();
      
      expect(mockPresetManager.saveCustomPreset).not.toHaveBeenCalled();
    });
  });

  describe('updateCurrentPreset', () => {
    test('should update custom preset', () => {
      mockWidget.scaleTypeSelect.value = 'custom-123';
      mockPresetManager.isCustomPreset.mockReturnValue(true);
      mockPresetManager.loadCustomPreset.mockReturnValue({ title: 'Old Title' });
      mockWidget.scaleTitleInput.value = 'New Title';
      
      uiController.updateCurrentPreset();
      
      expect(mockPresetManager.saveCustomPreset).toHaveBeenCalledWith('custom-123', expect.objectContaining({
        title: 'New Title'
      }));
    });

    test('should not update non-custom preset', () => {
      mockWidget.scaleTypeSelect.value = 'major';
      mockPresetManager.isCustomPreset.mockReturnValue(false);
      
      uiController.updateCurrentPreset();
      
      expect(mockPresetManager.saveCustomPreset).not.toHaveBeenCalled();
    });
  });

  describe('deleteCurrentPreset', () => {
    test('should delete custom preset after confirmation', () => {
      mockWidget.scaleTypeSelect.value = 'custom-123';
      mockPresetManager.isCustomPreset.mockReturnValue(true);
      mockPresetManager.loadCustomPreset.mockReturnValue({ 
        title: 'Test Preset',
        intervals: [2, 1, 2],
        notesPerString: 3,
        selectedScaleDegree: 1,
        rootNote: 'C'
      });
      global.confirm.mockReturnValue(true);
      
      uiController.deleteCurrentPreset();
      
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete the preset "Test Preset"? This action cannot be undone.');
      expect(mockPresetManager.deleteCustomPreset).toHaveBeenCalledWith('custom-123');
      expect(mockWidget.scaleTypeSelect.value).toBe('major');
    });

    test('should not delete if user cancels', () => {
      mockWidget.scaleTypeSelect.value = 'custom-123';
      mockPresetManager.isCustomPreset.mockReturnValue(true);
      mockPresetManager.loadCustomPreset.mockReturnValue({ title: 'Test Preset' });
      global.confirm.mockReturnValue(false);
      
      uiController.deleteCurrentPreset();
      
      expect(mockPresetManager.deleteCustomPreset).not.toHaveBeenCalled();
    });
  });

  describe('updatePresetButtonVisibility', () => {
    test('should show buttons for custom presets', () => {
      mockWidget.scaleTypeSelect.value = 'custom-123';
      mockPresetManager.isCustomPreset.mockReturnValue(true);
      
      uiController.updatePresetButtonVisibility();
      
      expect(mockWidget.updatePresetButton.style.display).toBe('block');
      expect(mockWidget.deletePresetButton.style.display).toBe('block');
    });

    test('should hide buttons for built-in scales', () => {
      mockWidget.scaleTypeSelect.value = 'major';
      mockPresetManager.isCustomPreset.mockReturnValue(false);
      
      uiController.updatePresetButtonVisibility();
      
      expect(mockWidget.updatePresetButton.style.display).toBe('none');
      expect(mockWidget.deletePresetButton.style.display).toBe('none');
    });
  });

  describe('handleImportFile', () => {
    test('should handle file import', () => {
      const mockFile = { name: 'test.json' };
      const event = { target: { files: [mockFile], value: 'test.json' } };
      const mockReader = {
        readAsText: jest.fn(),
        onload: null
      };
      global.FileReader.mockReturnValue(mockReader);
      
      uiController.handleImportFile(event);
      
      expect(mockReader.readAsText).toHaveBeenCalledWith(mockFile);
      expect(event.target.value).toBe('');
    });

    test('should handle empty file selection', () => {
      const event = { target: { files: [] } };
      
      uiController.handleImportFile(event);
      
      expect(global.FileReader).not.toHaveBeenCalled();
    });
  });

  describe('importPattern', () => {
    test('should import valid pattern', () => {
      const pattern = {
        intervals: [2, 1, 2],
        name: 'Imported Scale',
        rootNote: 'F#',
        notesPerString: 3,
        selectedScaleDegree: 2,
        tuning: 'standard-guitar'
      };
      
      uiController.importPattern(pattern);
      
      expect(mockWidget.scaleIntervalsInput.value).toBe('2,1,2');
      expect(mockWidget.scaleTitleInput.value).toBe('Imported Scale');
      expect(mockWidget.rootNoteSelect.value).toBe('F#');
      expect(mockPresetManager.saveCustomPreset).toHaveBeenCalled();
    });

    test('should handle invalid pattern', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const pattern = { name: 'Invalid' }; // Missing intervals
      
      uiController.importPattern(pattern);
      
      expect(global.alert).toHaveBeenCalledWith('Error importing pattern: Invalid pattern: missing or invalid intervals');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});