# Guitar Scale Visualizer

A testable, modular implementation of the interactive guitar scale visualizer.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Visit http://localhost:3000

# Run tests
npm test

# Build for production
npm run build

# Deploy to blog post
npm run deploy
```

## Features

- **🎸 Multi-instrument support**: Standard guitar, perfect fourths tuning, 5-string bass
- **🎵 Scale library**: Major, minor, pentatonic, chromatic, blues, and custom scales
- **🎯 Smart algorithm**: Grid-based search optimized for playable hand positions
- **🔧 Testable architecture**: Core logic separated from DOM dependencies
- **📊 High test coverage**: 97%+ coverage with comprehensive unit and integration tests
- **🚀 Build pipeline**: Automated testing, building, and deployment to blog post

## Architecture

```
Core Modules (Pure Logic)          Widget Layer (DOM Integration)
├── musical-theory.js             ├── widget.js
├── scale-patterns.js       ←→    ├── SVG rendering
└── fretboard-algorithm.js        ├── Event handling
                                  └── localStorage management
```

## Development Workflow

1. **Develop**: `npm run dev` - Live preview at localhost:3000
2. **Test**: `npm test` - Run test suite with coverage
3. **Build**: `npm run build` - Create production bundle
4. **Deploy**: `npm run deploy` - Update blog post automatically

## Testing

- **Unit tests**: Core musical algorithms and edge cases
- **Integration tests**: Module interaction and data flow
- **Coverage reports**: Ensure comprehensive test coverage
- **Watch mode**: `npm run test:watch` for development

## Documentation

See `.claude/README.md` for comprehensive development context and technical details.

## Project Status

✅ **Production Ready**
- All original functionality preserved
- Comprehensive test coverage (97%+)
- Automated build and deployment pipeline
- Clean, maintainable modular architecture