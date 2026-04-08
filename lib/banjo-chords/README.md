# Mini Banjo Chord Transposer

Algorithmic chord voicing tool for 5-string banjo, with transposition between standard G tuning and mini banjo C tuning.

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
├── widget.js                # UI controller + DOM integration
└── template.html            # Development preview template

tests/
├── core/
│   ├── banjo-voicer.test.js # Voicing regression tests
│   └── musical-theory.test.js
└── integration/

tools/
├── config.js    # Shared path configuration
├── build.js     # Combine modules into single browser file
├── deploy.js    # Update blog post with built code
└── dev-server.js
```

## Development

```bash
npm install
npm test          # Run regression tests
npm run build     # Combine into dist/
npm run deploy    # Update blog post
```

## Current Limitations / Future Development

### Position Toggle (planned)
The voicing algorithm currently favors **first-position voicings** — open strings, low frets, small spans near the nut. This produces the most common/comfortable chord shapes but misses useful voicings further up the neck.

A future "position" control could:
- Allow selecting a target fret range (e.g., frets 5-9)
- Show multiple voicings ranked by playability at each position
- Display inversions (root not necessarily in bass)
- Support capo positions

### Notes Input (planned)
The core is built from first principles around note sets. Chords are just one way to generate a set of notes. Future inputs:
- Raw note names (e.g., "C E G Bb") → visualize on fretboard
- Scale patterns (e.g., "C major pentatonic") → show all positions
- Interval patterns for custom voicings

### Shared Musical Theory
`MusicalTheory` is nearly identical to the guitar visualizer's version in `lib/unified-nps/`. These could eventually share a common music-theory package.
