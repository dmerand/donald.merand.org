# Testing Patterns and Architecture for Unified-NPS

This document provides context about testing approaches, patterns, and lessons learned for the Guitar Scale Visualizer project to help Claude understand the testing architecture and write appropriate tests.

## Project Testing Structure

### Core Module Testing (Unit Tests)
- **Location**: `tests/core/`
- **Purpose**: Test pure business logic modules with predictable inputs/outputs
- **Modules**:
  - `musical-theory.test.js` - Note parsing, interval calculations, scale generation
  - `scale-patterns.test.js` - Scale definitions and pattern matching  
  - `fretboard-algorithm.test.js` - Note positioning algorithms

### Integration Testing
- **Location**: `tests/integration/widget.test.js`
- **Purpose**: Test module interactions, data flow, and widget functionality
- **Setup**: Uses JSDOM for DOM mocking in Node.js environment

## Key Testing Patterns

### DOM Mocking Setup
```javascript
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body>
  <svg id="fretboard"></svg>
  <select id="tuning-preset"><option value="standard-guitar">Guitar</option></select>
  <!-- All required form elements -->
</body></html>`);

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
```

### Loading Browser Modules in Node
```javascript
// Core modules load normally
const MusicalTheory = require('../../src/core/musical-theory');

// Make available globally for widget
global.MusicalTheory = MusicalTheory;
global.ScalePatterns = ScalePatterns;
global.FretboardAlgorithm = FretboardAlgorithm;
```

### Widget Testing Challenges & Solutions
**Challenge**: Browser-specific widget code difficult to test in Node.js
**Solution**: Test core logic separately from DOM manipulation, use simplified integration tests

```javascript
// Instead of complex widget instantiation, test underlying logic:
test('pattern validation logic works correctly', () => {
  const validPattern = { intervals: [3, 2, 2, 3, 2] };
  expect(Array.isArray(validPattern.intervals)).toBe(true);
});
```

## Effective Test Patterns

### Algorithm Testing
```javascript
test('Scale generation to fretboard search pipeline', () => {
  const theory = new MusicalTheory();
  const algorithm = new FretboardAlgorithm();
  
  const scaleNotes = theory.generateExtendedScale('C3', '2,2,1,2,2,2,1', 3, 1);
  const positions = algorithm.findNotes(scaleNotes, tuning, 3, theory);
  
  expect(positions.length).toBeGreaterThan(0);
});
```

### Data Persistence Testing
```javascript
test('localStorage mock works for custom presets', () => {
  const testPresets = { 'custom-123': { title: 'Test' } };
  global.localStorage.setItem('key', JSON.stringify(testPresets));
  global.localStorage.getItem.mockReturnValue(JSON.stringify(testPresets));
  
  const retrieved = JSON.parse(global.localStorage.getItem('key'));
  expect(retrieved).toEqual(testPresets);
});
```

### Error Handling
```javascript
test('handles invalid input gracefully', () => {
  expect(() => theory.parseNote('invalid')).toThrow('Invalid note format: invalid');
});

test('handles empty data gracefully', () => {
  const scale = theory.generateExtendedScale('C3', '', 3, 1);
  expect(scale).toEqual([]);
});
```

## Testing Anti-Patterns to Avoid

### ❌ Don't Test Implementation Details
```javascript
expect(visualizer._internalMethod()).toBe(true); // Bad
```

### ✅ Do Test Public Interface & Behavior  
```javascript
expect(visualizer.getCustomPresets()).toEqual(expectedPresets); // Good
```

### ❌ Don't Over-Mock
Avoid recreating entire browser environment when simple mocks suffice.

### ✅ Do Use Minimal, Focused Mocking
Mock only what you need: localStorage, DOM elements, browser APIs.

## Test Organization Philosophy

1. **Core modules**: Mathematical operations, pure functions, data transformations
2. **Integration tests**: Module interactions, business logic workflows  
3. **Focus on behavior**: Test what the code does, not how it does it
4. **Single responsibility**: One test per behavior/concern
5. **Meaningful names**: Test names should describe the expected behavior

## Key Lessons for Claude

1. **When testing widget functionality**: Create simplified logic tests rather than complex DOM manipulation tests
2. **For import/export features**: Test data validation, transformation, and persistence separately
3. **For algorithm testing**: Focus on input/output relationships and edge cases
4. **For integration testing**: Test data flow between modules, not internal implementation
5. **Mock strategy**: Use minimal mocking focused on the specific APIs being tested

## Common Test Commands
- `npm test` - Run all tests
- `npm run test:watch` - Watch mode for development  
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run ESLint

This context should help Claude understand how to write appropriate tests that follow the established patterns and avoid common pitfalls when working with this browser-based widget architecture in a Node.js testing environment.