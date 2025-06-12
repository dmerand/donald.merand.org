---
layout: post
title: Interactive Guitar Scale Patterns
category: projects
---

<div class="noprint mb-10 italic text-sm">
  <p>
    An interactive version of the guitar scale pattern visualization from <a href="https://fretscience.com/2022/10/09/3nps-one-pattern-to-rule-them-all/">Fret Science's "3nps - One Pattern to Rule Them All"</a>. Select a scale and adjust the notes per string to see how the patterns adapt across the fretboard.
  </p>
  <p>
    -Donald
  </p>
</div>

<div id="instrument-visualizer" class="my-8">
  <div class="controls mb-6 p-4 bg-gray-100 rounded">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label for="tuning-preset" class="block text-sm font-medium mb-2">Tuning:</label>
        <select id="tuning-preset" class="border border-gray-300 rounded px-3 py-2 w-full">
          <option value="perfect-fourths" selected>Perfect Fourths (12-string)</option>
          <option value="standard-guitar">Standard Guitar (6-string)</option>
        </select>
      </div>
      
      <div>
        <label for="selected-scale-degree" class="block text-sm font-medium mb-2">Selected Scale Degree:</label>
        <input type="number" id="selected-scale-degree" class="border border-gray-300 rounded px-3 py-2 w-full" 
               min="1" max="7" value="1">
      </div>
      
      <div>
        <label for="notes-per-string" class="block text-sm font-medium mb-2">Notes per String: <span id="nps-value">3</span></label>
        <input type="range" id="notes-per-string" min="1" max="12" value="3" class="w-full">
      </div>
      
      <div class="md:col-span-2">
        <label for="scale-intervals" class="block text-sm font-medium mb-2">Intervals (semitones):</label>
        <input type="text" id="scale-intervals" class="border border-gray-300 rounded px-3 py-2 w-full" 
               placeholder="e.g., 2,2,1,2,2,2,1" value="2,2,1,2,2,2,1">
        <div class="text-xs text-gray-600 mt-1">
          Extended scale: <span id="extended-scale-info">21 notes (7 × 3 NPS)</span>
        </div>
      </div>
      
      <div>
        <label for="scale-type" class="block text-sm font-medium mb-2">Scale:</label>
        <select id="scale-type" class="border border-gray-300 rounded px-3 py-2 w-full">
          <option value="major" selected>Major</option>
          <option value="natural-minor">Natural Minor</option>
          <option value="harmonic-minor">Harmonic Minor</option>
          <option value="melodic-minor">Melodic Minor</option>
          <option value="major-pentatonic">Major Pentatonic</option>
          <option value="minor-pentatonic">Minor Pentatonic</option>
          <option value="dorian">Dorian</option>
          <option value="mixolydian">Mixolydian</option>
          <option value="blues">Blues</option>
          <option value="custom">Custom Scale</option>
        </select>
      </div>
      
      <div>
        <label for="root-note" class="block text-sm font-medium mb-2">Root Note:</label>
        <select id="root-note" class="border border-gray-300 rounded px-3 py-2 w-full">
          <option value="C" selected>C</option>
          <option value="C#">C#</option>
          <option value="D">D</option>
          <option value="D#">D#</option>
          <option value="E">E</option>
          <option value="F">F</option>
          <option value="F#">F#</option>
          <option value="G">G</option>
          <option value="G#">G#</option>
          <option value="A">A</option>
          <option value="A#">A#</option>
          <option value="B">B</option>
        </select>
      </div>
    </div>
  </div>
  
  <div id="visualization-title" class="text-center mb-4">
    <input type="text" id="custom-title" class="text-xl font-bold text-gray-800 text-center border-none bg-transparent w-full" 
           value="C Major Grand Unified Scale Pattern" style="outline: none;">
    <p class="text-sm text-gray-600">Perfect Fourths Tuning • 3 Notes per String • Starting from Scale Degree 1</p>
  </div>
  
  <div id="fretboard-container" class="overflow-x-auto">
    <svg id="fretboard" width="800" height="700"></svg>
  </div>
  
  <div class="text-center mt-4">
    <button id="print-button" class="px-4 py-2 border-2 rounded cursor-pointer" 
            style="border-color: #137752; color: #137752; background: transparent;">
      Print Visualization
    </button>
  </div>
</div>

<script>
class StringedInstrumentVisualizer {
  constructor() {
    this.svg = document.getElementById('fretboard');
    this.tuningPresetSelect = document.getElementById('tuning-preset');
    this.rootNoteSelect = document.getElementById('root-note');
    this.scaleTypeSelect = document.getElementById('scale-type');
    this.scaleIntervalsInput = document.getElementById('scale-intervals');
    this.notesPerStringInput = document.getElementById('notes-per-string');
    this.selectedScaleDegreeInput = document.getElementById('selected-scale-degree');
    this.printButton = document.getElementById('print-button');
    this.customTitleInput = document.getElementById('custom-title');
    
    // Tuning presets
    this.tuningPresets = {
      'perfect-fourths': ["B1", "E2", "A2", "D3", "G3", "C4", "F4", "Bb4", "Eb5", "Ab5", "Db6", "Gb6"],
      'standard-guitar': ["E2", "A2", "D3", "G3", "B3", "E4"]
    };
    
    // Scale interval patterns (semitones between consecutive notes)
    this.scaleIntervalPatterns = {
      'major': [2, 2, 1, 2, 2, 2, 1],
      'natural-minor': [2, 1, 2, 2, 1, 2, 2],
      'harmonic-minor': [2, 1, 2, 2, 1, 3, 1],
      'melodic-minor': [2, 1, 2, 2, 2, 2, 1],
      'major-pentatonic': [2, 2, 3, 2, 3],
      'minor-pentatonic': [3, 2, 2, 3, 2],
      'dorian': [2, 1, 2, 2, 2, 1, 2],
      'mixolydian': [2, 2, 1, 2, 2, 1, 2],
      'blues': [3, 2, 1, 1, 3, 2]
    };
    
    // Visual constants
    this.fretSpacing = 60;
    this.stringSpacing = 40;
    this.margin = { top: 40, right: 20, bottom: 60, left: 80 };
    this.maxFret = 24;
    this.maxInterval = 6; // Max frets for note finding
    
    // Modal exploration state
    this.selectedScaleDegree = 1; // Default to scale degree 1
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateIntervalsFromScale(); // Auto-populate intervals on initial load
    this.updateNPSConstraints(); // Set initial NPS constraints
    this.updateVisualization();
  }
  
  setupEventListeners() {
    this.tuningPresetSelect.addEventListener('change', () => this.updateVisualization());
    this.rootNoteSelect.addEventListener('change', () => this.updateVisualization());
    this.scaleTypeSelect.addEventListener('change', () => {
      this.updateIntervalsFromScale();
      this.updateVisualization();
    });
    this.scaleIntervalsInput.addEventListener('input', () => {
      this.updateScaleTypeFromIntervals();
      this.updateNPSConstraints();
      this.updateVisualization();
    });
    this.notesPerStringInput.addEventListener('input', () => {
      document.getElementById('nps-value').textContent = this.notesPerStringInput.value;
      this.updateVisualization();
    });
    this.selectedScaleDegreeInput.addEventListener('input', () => {
      const newDegree = parseInt(this.selectedScaleDegreeInput.value);
      if (newDegree >= 1 && newDegree <= this.getMaxScaleDegree()) {
        this.selectedScaleDegree = newDegree;
        this.updateVisualization();
      }
    });
    this.printButton.addEventListener('click', () => this.printVisualization());
  }
  
  // Calculate greatest common divisor
  gcd(a, b) {
    return b === 0 ? a : this.gcd(b, a % b);
  }
  
  // Calculate least common multiple
  lcm(a, b) {
    return (a * b) / this.gcd(a, b);
  }
  
  // Update intervals input based on scale selection
  updateIntervalsFromScale() {
    const scaleType = this.scaleTypeSelect.value;
    const intervals = this.scaleIntervalPatterns[scaleType];
    if (intervals) {
      this.scaleIntervalsInput.value = intervals.join(',');
      this.selectedScaleDegree = 1; // Reset to scale degree 1 when changing scales
      this.updateNPSConstraints(); // Update NPS max based on new scale
    }
  }
  
  // Update scale type based on manually entered intervals
  updateScaleTypeFromIntervals() {
    const inputIntervals = this.scaleIntervalsInput.value;
    const inputArray = inputIntervals.split(',').map(str => parseInt(str.trim())).filter(n => !isNaN(n));
    
    // Check if the input matches any predefined scale
    for (const [scaleKey, scaleIntervals] of Object.entries(this.scaleIntervalPatterns)) {
      if (scaleIntervals.length === inputArray.length && 
          scaleIntervals.every((interval, index) => interval === inputArray[index])) {
        this.scaleTypeSelect.value = scaleKey;
        return;
      }
    }
    
    // If no match found, set to custom
    this.scaleTypeSelect.value = 'custom';
  }
  
  // Update NPS input constraints based on current interval pattern
  updateNPSConstraints() {
    const intervalString = this.scaleIntervalsInput.value;
    const intervals = intervalString.split(',').map(str => parseInt(str.trim())).filter(n => !isNaN(n));
    const scaleLength = intervals.length;
    
    if (scaleLength > 0) {
      // Set max to the number of notes in the scale
      this.notesPerStringInput.max = scaleLength;
      
      // If current value exceeds new max, adjust it
      const currentValue = parseInt(this.notesPerStringInput.value);
      if (currentValue > scaleLength) {
        this.notesPerStringInput.value = scaleLength;
        document.getElementById('nps-value').textContent = scaleLength;
      }
      
      // Update selected scale degree input constraints
      this.selectedScaleDegreeInput.max = scaleLength;
      if (this.selectedScaleDegree > scaleLength) {
        this.selectedScaleDegree = 1;
        this.selectedScaleDegreeInput.value = 1;
      }
    }
  }
  
  // Get maximum scale degree for current pattern
  getMaxScaleDegree() {
    const intervalString = this.scaleIntervalsInput.value;
    const intervals = intervalString.split(',').map(str => parseInt(str.trim())).filter(n => !isNaN(n));
    return intervals.length;
  }
  
  
  // Handle note click to change modal center
  onNoteClick(clickedScaleDegree) {
    this.selectedScaleDegree = clickedScaleDegree;
    this.selectedScaleDegreeInput.value = clickedScaleDegree; // Sync the input
    this.updateVisualization();
  }
  
  // Update the visualization title with current settings
  updateTitle() {
    const rootNote = this.rootNoteSelect.value;
    const scaleType = this.scaleTypeSelect.options[this.scaleTypeSelect.selectedIndex].text;
    const tuningType = this.tuningPresetSelect.options[this.tuningPresetSelect.selectedIndex].text;
    const notesPerString = this.notesPerStringInput.value;
    const selectedDegree = this.selectedScaleDegree;
    
    // Only update if user hasn't manually edited the title
    const currentTitle = this.customTitleInput.value;
    const autoGeneratedTitle = `${rootNote} ${scaleType} Grand Unified Scale Pattern`;
    
    // Check if current title matches the previous auto-generated pattern
    const previousPattern = /^[A-G]#?\s+\w+.*Grand Unified Scale Pattern$/;
    if (previousPattern.test(currentTitle) || currentTitle === autoGeneratedTitle) {
      this.customTitleInput.value = autoGeneratedTitle;
    }
    
    const subtitle = `${tuningType} • ${notesPerString} Notes per String • Starting from Scale Degree ${selectedDegree}`;
    document.querySelector('#visualization-title p').textContent = subtitle;
  }
  
  // Print the visualization
  printVisualization() {
    // Store original dimensions
    const originalWidth = this.svg.getAttribute('width');
    const originalHeight = this.svg.getAttribute('height');
    
    // Set larger dimensions for printing (portrait)
    this.svg.setAttribute('width', '800');
    this.svg.setAttribute('height', '1000');
    
    // Print
    window.print();
    
    // Restore original dimensions after a delay
    setTimeout(() => {
      this.svg.setAttribute('width', originalWidth);
      this.svg.setAttribute('height', originalHeight);
    }, 1000);
  }
  
  // Parse note name to semitone value (C=0, C#/Db=1, etc.)
  parseNote(noteStr) {
    const noteMatch = noteStr.match(/^([A-G])(b|#?)(\d+)$/);
    if (!noteMatch) throw new Error(`Invalid note format: ${noteStr}`);
    
    const [, noteName, accidental, octave] = noteMatch;
    
    // Base semitone values for natural notes
    const noteValues = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
    let semitone = noteValues[noteName];
    
    // Apply accidental
    if (accidental === '#') semitone += 1;
    if (accidental === 'b') semitone -= 1;
    
    // Add octave (C4 = middle C at semitone 48)
    semitone += parseInt(octave) * 12;
    
    return semitone;
  }
  
  // Find notes on fretboard by trying multiple starting positions to get longest consecutive pattern
  findNotes(targetNotes, tuning, notesPerString) {
    const tuningValues = tuning.map(note => this.parseNote(note));
    const targetValues = targetNotes.map(note => this.parseNote(note));
    
    if (targetValues.length === 0) return [];
    
    let bestPattern = [];
    let bestPatternLength = 0;
    
    // Try different starting positions to find the longest consecutive pattern
    for (let startFret = 1; startFret <= this.maxFret; startFret += this.maxInterval) {
      const pattern = this.findSinglePattern(targetNotes, targetValues, tuning, tuningValues, notesPerString, startFret);
      
      if (pattern.length > bestPatternLength) {
        bestPattern = pattern;
        bestPatternLength = pattern.length;
        
        // If we found all scale degrees, we can stop searching
        if (bestPatternLength === targetValues.length) {
          break;
        }
      }
      
      // If we found a complete pattern, no need to continue
      if (bestPatternLength === targetValues.length) break;
    }
    return bestPattern;
  }
  
  // Find a single pattern starting from a specific fret position
  findSinglePattern(targetNotes, targetValues, tuning, tuningValues, notesPerString, minStartFret = 1) {
    const foundNotes = [];
    
    if (targetValues.length === 0) return foundNotes;
    
    // Step 1: Find the first note using grid-based search starting from minStartFret
    const firstTargetValue = targetValues[0];
    let firstNoteFound = false;
    let currentStringIndex = 0;
    let currentFret = minStartFret;
    
    // Search for first note in grids, starting from minStartFret
    for (let gridStart = minStartFret; gridStart <= this.maxFret && !firstNoteFound; gridStart += this.maxInterval) {
      const gridEnd = Math.min(gridStart + this.maxInterval - 1, this.maxFret);
      
      // Search all strings in this grid before moving to next grid
      for (let stringIndex = 0; stringIndex < tuning.length && !firstNoteFound; stringIndex++) {
        const openStringValue = tuningValues[stringIndex];
        
        for (let fret = Math.max(gridStart, minStartFret); fret <= gridEnd; fret++) {
          const fretValue = openStringValue + fret;
          
          if (fretValue === firstTargetValue) {
            foundNotes.push([stringIndex, fret]);
            currentStringIndex = stringIndex;
            currentFret = fret;
            firstNoteFound = true;
            break;
          }
        }
      }
    }
    
    if (!firstNoteFound) return foundNotes;
    
    // Step 2: Continue finding remaining notes using sequential string approach
    let targetIndex = 1;
    let notesOnCurrentString = 1;
    
    while (targetIndex < targetValues.length && currentStringIndex < tuning.length) {
      const targetValue = targetValues[targetIndex];
      const openStringValue = tuningValues[currentStringIndex];
      let noteFound = false;
      
      // Look for next note on current string (up to reasonable fret limit)
      if (notesOnCurrentString < notesPerString) {
        for (let fret = currentFret + 1; fret <= this.maxFret; fret++) {
          const fretValue = openStringValue + fret;
          
          if (fretValue === targetValue) {
            foundNotes.push([currentStringIndex, fret]);
            currentFret = fret;
            notesOnCurrentString++;
            targetIndex++;
            noteFound = true;
            break;
          }
        }
      }
      
      // If note not found on current string or string is full, move to next string
      if (!noteFound || notesOnCurrentString >= notesPerString) {
        currentStringIndex++;
        notesOnCurrentString = 0;
        // Reset current fret to allow finding notes at lower positions on new string
        currentFret = Math.max(0, currentFret - 6);
        
        // Search for current target on new string
        if (currentStringIndex < tuning.length) {
          const newOpenStringValue = tuningValues[currentStringIndex];
          // Recalculate target value for current target index
          const currentTargetValue = targetValues[targetIndex];
          // Start search from a few frets back from previous position for better hand position
          const startFret = Math.max(1, currentFret - 3);
          
          for (let fret = startFret; fret <= this.maxFret; fret++) {
            const fretValue = newOpenStringValue + fret;
            
            if (fretValue === currentTargetValue) {
              foundNotes.push([currentStringIndex, fret]);
              currentFret = fret;
              notesOnCurrentString = 1;
              targetIndex++;
              noteFound = true;
              break;
            }
          }
        }
        
        // If still not found, skip this target
        if (!noteFound) {
          targetIndex++;
        }
      }
    }
    
    return foundNotes;
  }
  
  // Parse interval string and generate extended scale sequence starting from selected scale degree
  generateExtendedScale(rootNote, intervalString, notesPerString, selectedScaleDegree = 1) {
    const rootSemitone = this.parseNote(rootNote);
    
    // Parse intervals from input string
    const intervals = intervalString.split(',').map(str => parseInt(str.trim())).filter(n => !isNaN(n));
    if (intervals.length === 0) return [];
    
    // Calculate LCM for extended sequence length
    const patternLength = intervals.length;
    const extendedLength = this.lcm(patternLength, notesPerString);
    
    // Calculate starting semitone for the selected scale degree
    let startingSemitone = rootSemitone;
    for (let i = 0; i < selectedScaleDegree - 1; i++) {
      startingSemitone += intervals[i % intervals.length];
    }
    
    // Generate the extended scale sequence starting from the selected degree
    const scaleNotes = [];
    let currentSemitone = startingSemitone;
    
    scaleNotes.push(this.semitoneToNote(currentSemitone));
    
    // Start interval rotation from the selected scale degree
    const startIntervalIndex = (selectedScaleDegree - 1) % intervals.length;
    for (let i = 0; i < extendedLength - 1; i++) {
      const intervalIndex = (startIntervalIndex + i) % intervals.length;
      currentSemitone += intervals[intervalIndex];
      scaleNotes.push(this.semitoneToNote(currentSemitone));
    }
    
    return scaleNotes;
  }
  
  // Convert semitone back to note name (for debugging/display)
  semitoneToNote(semitone) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(semitone / 12);
    const noteIndex = semitone % 12;
    return `${noteNames[noteIndex]}${octave}`;
  }
  
  // Extract note name without octave for string labels
  getNoteName(noteStr) {
    const noteMatch = noteStr.match(/^([A-G])(b|#?)(\d+)$/);
    if (!noteMatch) return noteStr;
    
    const [, noteName, accidental] = noteMatch;
    return noteName + (accidental || '');
  }
  
  updateVisualization() {
    const tuningPreset = this.tuningPresetSelect.value;
    const tuning = this.tuningPresets[tuningPreset];
    const stringCount = tuning.length;
    const notesPerString = parseInt(this.notesPerStringInput.value);
    // Use octave 2 for F-B to keep visualization lower on fretboard, octave 3 for C-E
    const selectedNote = this.rootNoteSelect.value;
    const useOctave2 = ['F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].includes(selectedNote);
    const rootNote = selectedNote + (useOctave2 ? "2" : "3");
    const intervalString = this.scaleIntervalsInput.value;
    
    // Parse intervals to get original pattern length
    const intervals = intervalString.split(',').map(str => parseInt(str.trim())).filter(n => !isNaN(n));
    const originalPatternLength = intervals.length;
    
    // Generate extended scale notes starting from selected scale degree
    const scaleNotes = this.generateExtendedScale(rootNote, intervalString, notesPerString, this.selectedScaleDegree);
    
    // Find note positions using generated scale
    const notePositions = this.findNotes(scaleNotes, tuning, notesPerString);
    
    // Update extended scale info display
    this.updateExtendedScaleInfo(intervalString, notesPerString);
    
    // Update the title with current settings
    this.updateTitle();
    
    this.renderFretboard(stringCount, notePositions, originalPatternLength);
  }
  
  // Update the extended scale information display
  updateExtendedScaleInfo(intervalString, notesPerString) {
    const intervals = intervalString.split(',').map(str => parseInt(str.trim())).filter(n => !isNaN(n));
    if (intervals.length === 0) {
      document.getElementById('extended-scale-info').textContent = 'Invalid intervals';
      return;
    }
    
    const patternLength = intervals.length;
    const extendedLength = this.lcm(patternLength, notesPerString);
    
    document.getElementById('extended-scale-info').textContent = 
      `${extendedLength} notes (${patternLength} × ${notesPerString} NPS)`;
  }
  
  renderFretboard(stringCount, notePositions, originalPatternLength) {
    // Clear existing content
    this.svg.innerHTML = '';
    
    // Get current tuning for string labels
    const tuningPreset = this.tuningPresetSelect.value;
    const tuning = this.tuningPresets[tuningPreset].slice(0, stringCount);
    
    // Calculate focused fret range based on note positions
    let minFretToShow, maxFretToShow;
    if (notePositions.length > 0) {
      const noteFrets = notePositions.map(([s, f]) => f);
      minFretToShow = Math.max(0, Math.min(...noteFrets) - 2);
      maxFretToShow = Math.max(...noteFrets) + 1;
    } else {
      // Fallback if no notes found
      minFretToShow = 0;
      maxFretToShow = 4;
    }
    
    const fretRange = maxFretToShow - minFretToShow + 1;
    const width = fretRange * this.fretSpacing + this.margin.left + this.margin.right;
    const height = stringCount * this.stringSpacing + this.margin.top + this.margin.bottom;
    
    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    
    // Draw strings (horizontal lines) - reversed so lowest pitch is at bottom
    for (let string = 0; string < stringCount; string++) {
      const y = this.margin.top + (stringCount - 1 - string) * this.stringSpacing;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', this.margin.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.margin.left + (fretRange - 1) * this.fretSpacing);
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
      line.setAttribute('y1', this.margin.top);
      line.setAttribute('x2', x);
      line.setAttribute('y2', this.margin.top + (stringCount - 1) * this.stringSpacing);
      line.setAttribute('stroke', fret === 0 ? '#000' : '#ccc');
      line.setAttribute('stroke-width', fret === 0 ? '4' : '1');
      this.svg.appendChild(line);
    }
    
    // Draw Y-axis string labels - reversed so lowest pitch is at bottom
    for (let string = 0; string < stringCount; string++) {
      const y = this.margin.top + (stringCount - 1 - string) * this.stringSpacing;
      const stringName = this.getNoteName(tuning[string]);
      
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
      const y = this.margin.top + (stringCount - 1) * this.stringSpacing + 30;
      
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
    
    // Draw note positions
    notePositions.forEach(([stringIndex, fret], index) => {
      // Calculate the original scale degree accounting for rotation
      const rotatedDegree = (index % originalPatternLength) + 1;
      const originalScaleDegree = ((rotatedDegree - 1 + this.selectedScaleDegree - 1) % originalPatternLength) + 1;
      this.drawNote(stringIndex, fret, originalScaleDegree, minFretToShow);
    });
  }
  
  drawNote(stringIndex, fret, scaleNumber, minFretToShow = 0) {
    const x = this.margin.left + (fret - minFretToShow - 0.5) * this.fretSpacing;
    // Get current string count for proper Y positioning (reversed)
    const tuningPreset = this.tuningPresetSelect.value;
    const tuning = this.tuningPresets[tuningPreset];
    const stringCount = tuning.length;
    const y = this.margin.top + (stringCount - 1 - stringIndex) * this.stringSpacing;
    
    // Calculate actual note name for debugging
    const openStringNote = tuning[stringIndex];
    const openStringSemitone = this.parseNote(openStringNote);
    const actualNoteSemitone = openStringSemitone + fret;
    const actualNoteName = this.semitoneToNote(actualNoteSemitone);
    
    // Determine if this is the selected scale degree
    const isSelected = scaleNumber === this.selectedScaleDegree;
    
    // Draw note circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '18');
    circle.setAttribute('fill', isSelected ? '#fff' : '#000');
    circle.setAttribute('stroke', '#000');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', 'note clickable-note');
    circle.setAttribute('data-note', actualNoteName);
    circle.setAttribute('data-scale-degree', scaleNumber);
    circle.style.cursor = 'pointer';
    
    // Add click event listener
    circle.addEventListener('click', () => this.onNoteClick(scaleNumber));
    
    // Add tooltip with note name
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = this.getNoteName(actualNoteName);
    circle.appendChild(title);
    
    this.svg.appendChild(circle);
    
    // Scale degree number
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', isSelected ? '#000' : '#fff');
    text.setAttribute('class', 'note clickable-note');
    text.setAttribute('data-note', actualNoteName);
    text.setAttribute('data-scale-degree', scaleNumber);
    text.style.cursor = 'pointer';
    text.style.pointerEvents = 'none'; // Let clicks pass through to circle
    text.textContent = scaleNumber;
    this.svg.appendChild(text);
  }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.visualizer = new StringedInstrumentVisualizer();
});
</script>

<style>
#instrument-visualizer {
  max-width: 100%;
}

#fretboard-container {
  border: 2px solid #333;
  border-radius: 8px;
  background: #fff;
  padding: 20px;
}


.controls select {
  font-family: inherit;
}

.note {
  cursor: pointer;
}

.note:hover {
  opacity: 0.8;
}

.clickable-note {
  transition: opacity 0.2s ease;
}

.clickable-note:hover {
  opacity: 0.7;
}

/* Match the grid-like appearance from the provided image */
#fretboard {
  background: #fff;
}

/* Print styles */
@media print {
  /* Force portrait orientation */
  @page {
    size: portrait;
    margin: 0.5in;
  }
  
  /* Hide everything except visualization and title */
  .noprint,
  .controls,
  footer,
  #print-button {
    display: none !important;
  }
  
  /* Hide the intro text */
  .noprint {
    display: none !important;
  }
  
  /* Hide site title and page title when printing */
  body > div > div:first-child,
  body > div > .text-2xl,
  h1 {
    display: none !important;
  }
  
  /* Make visualization fill the page */
  body {
    margin: 0;
    padding: 0;
  }
  
  #instrument-visualizer {
    max-width: none;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  #visualization-title {
    margin-bottom: 20px;
    page-break-inside: avoid;
    page-break-after: avoid;
    text-align: center;
  }
  
  #fretboard-container {
    border: none !important;
    padding: 0;
    margin: 0;
    overflow: visible;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    page-break-before: avoid;
  }
  
  /* Scale the fretboard to use full width */
  #fretboard {
    width: 100%;
    height: auto;
    max-width: none;
  }
}
</style>
