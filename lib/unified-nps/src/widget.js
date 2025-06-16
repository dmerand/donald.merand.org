class StringedInstrumentVisualizer {
  constructor() {
    // Get DOM elements with error checking
    const requiredElements = {
      svg: 'fretboard',
      tuningPresetSelect: 'tuning-preset',
      rootNoteSelect: 'root-note',
      scaleTypeSelect: 'scale-type',
      scaleIntervalsInput: 'scale-intervals',
      notesPerStringInput: 'notes-per-string',
      selectedScaleDegreeInput: 'selected-scale-degree',
      saveSvgButton: 'save-svg-button',
      exportButton: 'export-button',
      savePresetButton: 'save-preset-button',
      updatePresetButton: 'update-preset-button',
      deletePresetButton: 'delete-preset-button',
      importFile: 'import-file',
      scaleTitleInput: 'scale-title'
    };

    // Initialize DOM elements with error checking
    for (const [property, elementId] of Object.entries(requiredElements)) {
      this[property] = document.getElementById(elementId);
      if (!this[property]) {
        throw new Error(`Required DOM element not found: ${elementId}`);
      }
    }
    
    // Initialize core modules
    this.musicalTheory = new (window.MusicalTheory || MusicalTheory)();
    this.scalePatterns = new (window.ScalePatterns || ScalePatterns)();
    this.fretboardAlgorithm = new (window.FretboardAlgorithm || FretboardAlgorithm)();
    
    // Initialize new core modules 
    // eslint-disable-next-line no-undef
    this.scaleVisualizer = new (window.ScaleVisualizer || ScaleVisualizer)(
      this.musicalTheory,
      this.scalePatterns,
      this.fretboardAlgorithm
    );
    // eslint-disable-next-line no-undef
    this.presetManager = new (window.PresetManager || PresetManager)();
    
    // Initialize UI Controller
    // eslint-disable-next-line no-undef
    this.uiController = new (window.UIController || UIController)(
      this,
      this.presetManager,
      this.scaleVisualizer,
      this.musicalTheory,
      this.scalePatterns
    );
    
    // Visualization settings
    this.fretSpacing = 60;
    this.stringSpacing = 40;
    this.margin = { top: 40, right: 20, bottom: 60, left: 80 };
    this.titleHeight = 60;
    this.noteCircleRadius = 18;
    
    this.selectedScaleDegree = 1;
    
    this.init();
  }

  // Getter for tuning presets (delegated to core)
  get tuningPresets() {
    return this.fretboardAlgorithm.constructor.TUNING_PRESETS;
  }

  // Getter for scale interval patterns (delegated to core)
  get scaleIntervalPatterns() {
    return this.scalePatterns.scaleIntervalPatterns;
  }

  // Getter for default scale preferences (delegated to core)
  get defaultScalePreferences() {
    return this.scalePatterns.defaultScalePreferences;
  }
  
  init() {
    // Initialize UI controller (handles all UI coordination)
    this.uiController.initialize();
    
    // Initial visualization
    this.updateVisualization();
  }
  
  destroy() {
    // Clean up UI controller
    this.uiController.cleanup();
    
    // Clear SVG content
    if (this.svg) this.svg.innerHTML = '';
  }
  
  // Note click handler - called by UI controller
  onNoteClick(clickedScaleDegree) {
    this.uiController.onNoteClick(clickedScaleDegree);
  }

  generateTitleInfo() {
    const scaleTitle = this.scaleTitleInput.value || 'Scale';
    const rootNote = this.rootNoteSelect.value;
    const tuningText = this.tuningPresetSelect.options[this.tuningPresetSelect.selectedIndex].text;
    const nps = this.notesPerStringInput.value;
    const scaleDegree = this.selectedScaleDegree;
    
    return {
      titleText: `${rootNote} ${scaleTitle} Unified Pattern`,
      subtitleText: `${tuningText} • ${nps} Notes per String • Starting from Scale Degree ${scaleDegree}`,
      filename: `${rootNote}_${scaleTitle}_Unified_Pattern`.replace(/[^a-zA-Z0-9]/g, '_'),
      tuning: tuningText.replace(/\s+/g, '_'),
      npsFormatted: `${nps}NPS`,
      degree: `Deg${scaleDegree}`,
      timestamp: new Date().toISOString().slice(0, 10)
    };
  }

  
  estimateTextWidth(text, fontSize) {
    // Rough estimation: average character width is about 0.6 * fontSize for most fonts
    return text.length * fontSize * 0.6;
  }
  
  calculateTitleDimensions() {
    const { titleText, subtitleText } = this.generateTitleInfo();
    const baseTitleSize = 18;
    const baseSubtitleSize = 12;
    const padding = 40; // Minimum padding on each side
    
    // Calculate required width for both texts at base sizes
    const titleWidth = this.estimateTextWidth(titleText, baseTitleSize);
    const subtitleWidth = this.estimateTextWidth(subtitleText, baseSubtitleSize);
    const maxTextWidth = Math.max(titleWidth, subtitleWidth);
    
    return {
      titleText,
      subtitleText,
      requiredWidth: maxTextWidth + (padding * 2),
      baseTitleSize,
      baseSubtitleSize
    };
  }
  
  addTitleToSvg(svgWidth) {
    const { titleText, subtitleText, requiredWidth, baseTitleSize, baseSubtitleSize } = this.calculateTitleDimensions();
    
    // Calculate scaling factor if text is too wide
    const availableWidth = svgWidth - 40; // Leave 20px padding on each side
    const scaleFactor = requiredWidth > availableWidth ? availableWidth / requiredWidth : 1;
    
    const titleSize = Math.max(12, baseTitleSize * scaleFactor); // Minimum 12px
    const subtitleSize = Math.max(10, baseSubtitleSize * scaleFactor); // Minimum 10px
    
    // Create title element
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', svgWidth / 2);
    title.setAttribute('y', 25);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', titleSize.toString());
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#1f2937'); // Gray-800
    title.textContent = titleText;
    this.svg.appendChild(title);
    
    // Create subtitle element
    const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    subtitle.setAttribute('x', svgWidth / 2);
    subtitle.setAttribute('y', 45);
    subtitle.setAttribute('text-anchor', 'middle');
    subtitle.setAttribute('font-size', subtitleSize.toString());
    subtitle.setAttribute('fill', '#4b5563'); // Gray-600
    subtitle.textContent = subtitleText;
    this.svg.appendChild(subtitle);
  }
  
  saveSvgVisualization() {
    // Get the current SVG content
    const svgElement = this.svg.cloneNode(true);
    
    // Add XML namespace and DOCTYPE for proper SVG file
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Create the SVG content with proper XML declaration
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgElement.outerHTML}`;
    
    // Generate filename based on current settings
    const { filename, tuning, npsFormatted, degree, timestamp } = this.generateTitleInfo();
    const svgFilename = `${filename}_${tuning}_${npsFormatted}_${degree}_${timestamp}.svg`;
    
    // Create and download the file
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = svgFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  updateVisualization() {
    try {
      // Collect configuration from UI
      const config = {
        rootNote: this.rootNoteSelect.value,
        scaleType: this.scaleTypeSelect.value,
        customIntervals: this.scaleIntervalsInput.value,
        tuningName: this.tuningPresetSelect.value,
        notesPerString: parseInt(this.notesPerStringInput.value),
        selectedScaleDegree: this.selectedScaleDegree
      };

      // Generate visualization data using ScaleVisualizer
      const visualizationData = this.scaleVisualizer.generateVisualizationData(config);
      
      // Render the fretboard with the generated data
      this.renderFretboard(visualizationData);
    } catch (error) {
      console.error('Error updating visualization:', error);
      // Clear the visualization on error to prevent broken display
      if (this.svg) {
        this.svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="red">Error: Unable to generate visualization</text>';
      }
    }
  }
  
  
  renderFretboard(visualizationData) {
    this.svg.innerHTML = '';
    
    const { notePositions, tuning, scaleLength, fretRange } = visualizationData;
    const stringCount = tuning.length;
    const [minFretToShow, maxFretToShow] = fretRange;
    
    const fretRangeSize = maxFretToShow - minFretToShow + 1;
    const fretboardWidth = fretRangeSize * this.fretSpacing + this.margin.left + this.margin.right;
    
    // Calculate minimum width needed for title text
    const { requiredWidth: titleWidth } = this.calculateTitleDimensions();
    
    // Use the larger of fretboard width or title width to ensure everything fits
    const width = Math.max(fretboardWidth, titleWidth);
    
    const titleHeight = this.titleHeight; // Space for title and subtitle
    const height = stringCount * this.stringSpacing + this.margin.top + this.margin.bottom + titleHeight;

    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Add title and subtitle to SVG
    this.addTitleToSvg(width);
    
    // Adjust margin.top to account for title space
    const adjustedMarginTop = this.margin.top + titleHeight;
    
    // Draw strings (horizontal lines) - reversed so lowest pitch is at bottom
    for (let string = 0; string < stringCount; string++) {
      const y = adjustedMarginTop + (stringCount - 1 - string) * this.stringSpacing;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', this.margin.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.margin.left + (fretRangeSize - 1) * this.fretSpacing);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#333');
      line.setAttribute('stroke-width', '2');
      this.svg.appendChild(line);
    }
    
    // Draw frets (vertical lines)
    for (let fret = minFretToShow; fret <= maxFretToShow; fret++) {
      const x = this.margin.left + (fret - minFretToShow) * this.fretSpacing;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', adjustedMarginTop);
      line.setAttribute('x2', x);
      line.setAttribute('y2', adjustedMarginTop + (stringCount - 1) * this.stringSpacing);
      line.setAttribute('stroke', fret === 0 ? '#000' : '#ccc');
      line.setAttribute('stroke-width', fret === 0 ? '4' : '1');
      this.svg.appendChild(line);
    }
    
    // Draw Y-axis string labels - reversed so lowest pitch is at bottom
    for (let string = 0; string < stringCount; string++) {
      const y = adjustedMarginTop + (stringCount - 1 - string) * this.stringSpacing;
      const stringName = this.musicalTheory.getNoteName(tuning[string]);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', this.margin.left - 20);
      text.setAttribute('y', y + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#333');
      text.textContent = stringName;
      this.svg.appendChild(text);
    }
    
    // Draw X-axis fret number labels
    for (let fret = minFretToShow + 1; fret <= maxFretToShow; fret++) {
      const x = this.margin.left + (fret - minFretToShow - 0.5) * this.fretSpacing;
      const y = adjustedMarginTop + (stringCount - 1) * this.stringSpacing + 30;
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#666');
      text.textContent = fret;
      this.svg.appendChild(text);
    }
    
    notePositions.forEach(([stringIndex, fret], index) => {
      const scaleDegree = this.scaleVisualizer.calculateScaleDegreeForPosition(
        index, 
        scaleLength, 
        this.selectedScaleDegree
      );
      this.drawNote(stringIndex, fret, scaleDegree, minFretToShow);
    });
  }
  
  drawNote(stringIndex, fret, scaleDegree, minFretToShow = 0) {
    const tuning = this.tuningPresets[this.tuningPresetSelect.value];
    const stringCount = tuning.length;
    
    const titleHeight = this.titleHeight; // Must match the titleHeight in renderFretboard
    const adjustedMarginTop = this.margin.top + titleHeight;
    const x = this.margin.left + (fret - minFretToShow - 0.5) * this.fretSpacing;
    const y = adjustedMarginTop + (stringCount - 1 - stringIndex) * this.stringSpacing;
    
    const openStringNote = tuning[stringIndex];
    const actualNoteName = this.musicalTheory.semitoneToNote(this.musicalTheory.parseNote(openStringNote) + fret);
    const isSelected = scaleDegree === this.selectedScaleDegree;
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', this.noteCircleRadius.toString());
    circle.setAttribute('fill', isSelected ? '#fff' : '#000');
    circle.setAttribute('stroke', isSelected ? '#000' : '#fff');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', 'note clickable-note');
    circle.setAttribute('data-note', actualNoteName);
    circle.setAttribute('data-scale-degree', scaleDegree);
    circle.style.cursor = 'pointer';
    
    circle.addEventListener('click', () => this.onNoteClick(scaleDegree));
    
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = this.musicalTheory.getNoteName(actualNoteName);
    circle.appendChild(title);
    
    this.svg.appendChild(circle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', isSelected ? '#000' : '#fff');
    text.setAttribute('class', 'note clickable-note');
    text.setAttribute('data-note', actualNoteName);
    text.setAttribute('data-scale-degree', scaleDegree);
    text.style.cursor = 'pointer';
    text.style.pointerEvents = 'none';
    text.textContent = scaleDegree;
    this.svg.appendChild(text);
  }
  
  exportCurrentPattern() {
    const pattern = {
      name: this.scaleTitleInput.value || `${this.rootNoteSelect.value} ${this.scaleTypeSelect.options[this.scaleTypeSelect.selectedIndex].text} Pattern`,
      intervals: this.musicalTheory.parseIntervals(this.scaleIntervalsInput.value),
      rootNote: this.rootNoteSelect.value,
      notesPerString: parseInt(this.notesPerStringInput.value),
      tuning: this.tuningPresetSelect.value,
      selectedScaleDegree: this.selectedScaleDegree,
      scaleType: this.scaleTypeSelect.value
    };
    
    const blob = new Blob([JSON.stringify(pattern, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pattern.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.visualizer = new StringedInstrumentVisualizer();
});