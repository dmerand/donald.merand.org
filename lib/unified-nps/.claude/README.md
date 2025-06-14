# Guitar Scale Visualizer - Development Context

## Overview

This project contains the testable, modular implementation of the interactive guitar scale visualizer. The code is structured to separate core musical logic from DOM manipulation, enabling comprehensive testing and maintainable development.

See also @testing

## Architecture

### Core Modules (Pure Logic - Fully Testable)

**`src/core/musical-theory.js`**
- Note parsing and conversion (`parseNote`, `semitoneToNote`)
- Scale generation with modal exploration (`generateExtendedScale`)
- Mathematical utilities (`gcd`, `lcm`, `parseIntervals`)
- Octave optimization for visualization (`getOptimalRootNote`)

**`src/core/scale-patterns.js`**
- Scale interval definitions (major, minor, pentatonic, etc.)
- Default preferences per scale type
- Scale type detection from intervals
- Scale validation and metadata

**`src/core/fretboard-algorithm.js`**
- Tuning preset definitions
- Grid-based note search algorithm with hand position optimization
- Notes-per-string constraint enforcement
- Fret range calculation for focused visualization

### Widget Layer (DOM Integration)

**`src/widget.js`**
- DOM element management and event handling
- SVG fretboard rendering and interaction
- localStorage preference management
- Import/export functionality
- Integration between core modules and UI

## Project Structure

```
lib/unified-nps/
├── src/
│   ├── core/                    # Pure logic modules
│   │   ├── musical-theory.js    # Note math and scale generation
│   │   ├── scale-patterns.js    # Scale definitions and metadata
│   │   └── fretboard-algorithm.js # Note positioning algorithm
│   ├── widget.js                # DOM integration layer
│   └── template.html           # Development preview template
├── tests/
│   └── core/                   # Unit tests for core modules
│       ├── musical-theory.test.js
│       ├── scale-patterns.test.js
│       └── fretboard-algorithm.test.js
├── tools/
│   ├── dev-server.js           # Development preview server
│   ├── build.js                # Production build tool
│   └── deploy.js               # Blog post deployment tool
├── dist/                       # Built artifacts
├── backups/                    # Blog post backups
├── package.json                # Dependencies and scripts
└── .claude/
    └── README.md              # This file
```

## Development Workflow

### 1. **Local Development**
```bash
npm run dev
```
- Starts preview server at http://localhost:3000
- Serves template.html with all core modules
- Enables rapid iteration on widget functionality
- No build step required for development

### 2. **Testing**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage reports
```

**Test Coverage Goals:**
- Core modules: 90%+ coverage
- Focus on musical algorithms and edge cases
- Mock DOM elements for widget integration tests

### 3. **Building**
```bash
npm run build         # Production build (explicitly not minified)
npm run build:minify  # Production minified build if desired
```
- Combines all core modules + widget into single file
- Removes CommonJS exports for browser compatibility
- Minifies code and adds build metadata
- Output: `dist/guitar-scale-visualizer.js`

### 4. **Deployment**
```bash
npm run deploy        # Deploy to blog post (explicitly not minified)
npm run deploy:minify # Deploy minified version if desired
```

**What the deploy script does:**
- Automatically builds latest JavaScript code
- **Extracts HTML structure from `src/template.html`**
- **Updates both HTML and JavaScript in the blog post**
- Creates timestamped backup of current blog post
- Validates deployment with comprehensive checks
- Ensures UI components (emoji buttons, form elements) stay synchronized

**Important:** The deploy script now synchronizes the blog post HTML structure with the development template. When you update UI components in `src/template.html`, running deploy will automatically update the blog post to match, ensuring consistency between development and production.

## Key Design Principles

### **Separation of Concerns**
- **Core modules**: Pure functions, no DOM dependencies, fully testable
- **Widget layer**: DOM manipulation, event handling, UI state management
- **Clean interfaces**: Core modules expose simple, focused APIs

### **Musical Algorithm Design**
- **Grid-based search**: Optimizes for playable hand positions (6-fret spans)
- **Multi-pattern search**: Finds longest consecutive scale sequences
- **Modal exploration**: Supports starting from any scale degree
- **Extensible tunings**: Easy to add new instrument tunings

### **Testing Strategy**
- See @testing-context.md

## Musical Theory Implementation

### **Scale Generation Algorithm**
1. Parse root note and interval pattern
2. Calculate starting semitone for selected scale degree
3. Generate extended sequence using LCM(scale_length, notes_per_string)
4. Apply interval rotation from selected degree

### **Fretboard Search Algorithm**
1. **Grid search**: Find first note in 6-fret intervals across all strings
2. **Sequential placement**: Continue pattern respecting NPS constraints
3. **String transitions**: Reset fret position for optimal hand placement
4. **Multi-start optimization**: Try multiple starting positions, keep longest pattern

### **Tuning System**
- **Standard guitar**: E2-A2-D3-G3-B3-E4 (6 strings)
- **Perfect fourths**: B1-E2-A2-D3-G3-C4-F4-Bb4-Eb5-Ab5-Db6-Gb6 (12 strings)
- **5-string bass**: B1-E2-A2-D3-G3 (optimized octave range)

## Adding New Features

### **New Scale Types**
1. Add intervals to `ScalePatterns.scaleIntervalPatterns`
2. Add preferences to `ScalePatterns.defaultScalePreferences`
3. Update HTML template dropdown options
4. Write tests for new scale behavior

### **New Tunings**
1. Add to `FretboardAlgorithm.TUNING_PRESETS`
2. Update HTML template dropdown
3. Test with various scale patterns
4. Verify algorithm performance

### **Algorithm Improvements**
1. Modify core modules (maintain API compatibility)
2. Add comprehensive tests for changes
3. Run full test suite to catch regressions
4. Update documentation for new behavior

## Deployment Pipeline

### **Automatic Integration**
- Build tool combines modules into single script
- Deploy tool handles blog post updates automatically
- **HTML template synchronization** keeps blog post UI current
- Backup system prevents data loss
- Validation ensures deployed code functions correctly

### **Blog Post Integration**
- JavaScript is embedded directly in markdown
- **HTML structure synchronized with `src/template.html`**
- No external dependencies required
- Maintains full functionality in blog context
- Version comments track deployment history

### **Deploy Script Maintenance**

**When UI changes are made to `src/template.html`:**
- The deploy script automatically extracts the updated HTML structure
- Blog post HTML is synchronized to match the development template
- New form elements, buttons, and styling are preserved
- No manual blog post editing required

**If deploy script needs updates:**
1. **HTML structure changes**: Update `extractTemplateVisualizer()` function in `tools/deploy.js`
2. **New validation requirements**: Add checks to `validateDeployment()` function
3. **Blog post structure changes**: Update `extractCurrentSections()` if blog post format changes
4. **Test deploy script**: Always run `npm run deploy:debug` first to verify changes

**Key deploy script functions:**
- `extractTemplateVisualizer()`: Extracts HTML from development template
- `extractCurrentSections()`: Parses blog post to find HTML and script sections  
- `updateBlogPost()`: Replaces both HTML and JavaScript in blog post
- `validateDeployment()`: Ensures all required elements are present

## Troubleshooting

### **Common Issues**
- **Tests failing**: Check for missing dependencies or API changes
- **Build errors**: Verify all core modules export correctly
- **Deploy failures**: Ensure blog post has proper `<script>` tags
- **Widget not loading**: Check browser console for JavaScript errors

### **Debug Builds**
Use `--no-minify` flag for readable deployed code:
```bash
npm run deploy:debug
```

### **Local Testing**
- Use dev server for rapid iteration
- Check browser developer tools for errors
- Run tests after each change
- Verify localStorage functionality

## Performance Considerations

### **Algorithm Efficiency**
- Grid search reduces computation from O(strings × frets) to O(grids × strings)
- Multi-pattern search limited to reasonable starting positions
- Early termination when perfect pattern found

### **Code Size**
- Minified build optimizes for blog embedding
- Core modules designed for tree-shaking
- No external dependencies in production

### **Memory Usage**
- Algorithms operate on simple arrays and numbers
- No large data structures retained between calculations
- SVG elements recycled on each render

## Future Enhancements

### **Planned Features**
- Additional scale types (diminished, augmented, exotic scales)
- More instrument tunings (mandolin, banjo, etc.)
- Advanced visualization options (chord shapes, arpeggio patterns)
- Export to tablature format

### **Technical Improvements**
- Web Workers for heavy computation
- Canvas rendering for performance
- MIDI input/output support
- Audio playback integration

## Context for Claude Code

This codebase demonstrates several important patterns:

1. **Testable Architecture**: Core logic separated from DOM dependencies
2. **Modular Design**: Small, focused modules with clear responsibilities  
3. **Build Pipeline**: Automated testing, building, and deployment
4. **Documentation**: Comprehensive context for future development
5. **Musical Domain Knowledge**: Complex algorithms implemented clearly

The project showcases how to transform a monolithic widget into a maintainable, testable library while preserving all original functionality and enabling future enhancements.
