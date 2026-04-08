# Mini Banjo Chord Transposer

Algorithmic chord voicing tool for 5-string banjo, with transposition between standard G tuning and mini banjo C tuning. Supports open and higher-position voicings.

## Architecture

```
src/
├── core/                    # Pure logic, no DOM dependencies
│   ├── musical-theory.js    # Note/semitone math, transposition
│   ├── chord-library.js     # Chord formulas and qualities
│   ├── banjo-tunings.js     # Tuning definitions (standard G, mini C)
│   ├── banjo-voicer.js      # Algorithmic voicing search + scoring
│   └── storage-manager.js   # localStorage persistence
├── chord-diagram-renderer.js # SVG chord diagram rendering
└── widget.js                # UI controller + DOM integration

tests/core/
├── musical-theory.test.js
├── chord-library.test.js
├── banjo-tunings.test.js
├── banjo-voicer.test.js     # Voicing regression tests
└── storage-manager.test.js

tools/
├── config.js    # Shared path configuration
├── build.js     # Combine modules into single browser file
└── deploy.js    # Update blog post with built code
```

## Development

```bash
npm install
npm test          # Run regression tests (53 tests)
npm run build     # Combine into dist/
npm run deploy    # Update blog post
```

## Features

- Toggle between mini banjo (C tuning) and standard banjo (G tuning)
- All major/minor/diminished/augmented/7th chord qualities in all 12 keys
- Position selector (open, 3rd, 5th, 7th, 9th) with duplicate detection
- SVG and PNG export of chord collections
- Responsive layout (mobile full-width diagrams)
- localStorage persistence of UI state and chord collection
- Accessible (aria-pressed on toggles, role="img" on SVG diagrams)

## Future Development

### Notes Input
The core is built from first principles around note sets. Chords are just one way to generate a set of notes. Future inputs:
- Raw note names (e.g., "C E G Bb") → visualize on fretboard
- Scale patterns (e.g., "C major pentatonic") → show all positions
- Interval patterns for custom voicings

### Shared Musical Theory
`MusicalTheory` is nearly identical to the guitar visualizer's version in `lib/unified-nps/`. These could eventually share a common music-theory package.
