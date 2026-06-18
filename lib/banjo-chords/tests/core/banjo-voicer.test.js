const MusicalTheory = require('../../src/core/musical-theory');
const ChordLibrary = require('../../src/core/chord-library');
const BanjoTunings = require('../../src/core/banjo-tunings');
const BanjoVoicer = require('../../src/core/banjo-voicer');

describe('BanjoVoicer', () => {
  let theory, chordLib, tunings, voicer;

  beforeEach(() => {
    theory = new MusicalTheory();
    chordLib = new ChordLibrary();
    tunings = new BanjoTunings(theory);
    voicer = new BanjoVoicer(theory, tunings);
  });

  function enumerate(root, qualityKey, tuningKey, inversionIdx = 0) {
    const chord = chordLib.getChord(root, qualityKey);
    const semitones = theory.chordSemitones(root, chord.intervals);
    const rootSemitone = theory.noteToSemitone(root);
    const spelling = theory.chordSpelling(root, chord.intervals);
    const bassSemitone = semitones[inversionIdx];
    return {
      semitones,
      voicings: voicer.enumerateVoicings(semitones, rootSemitone, tuningKey, bassSemitone, spelling),
    };
  }

  const TUNINGS = ['standard', 'mini', 'mandolin', 'guitar'];
  const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const QUALITIES = ['major', 'minor', 'diminished', 'augmented', 'dominant7', 'major7', 'minor7'];

  // Recompute the lowest-pitched non-drone fretted note's semitone.
  function bassOf(voicing, tuningKey) {
    const tn = tunings.get(tuningKey);
    const offset = tn.hasDrone !== false ? 1 : 0;
    for (let i = offset; i < voicing.frets.length; i++) {
      if (voicing.frets[i] >= 0) return (tn.openSemitones[i] + voicing.frets[i]) % 12;
    }
    return null;
  }

  // === Playability ===

  describe('isPlayable', () => {
    test('open / barre shapes are playable', () => {
      expect(voicer.isPlayable([0, 0, 0, 0, 0])).toBe(true);
      expect(voicer.isPlayable([3, 3, 3, 3, 3])).toBe(true); // index barre, one finger
      expect(voicer.isPlayable([-1, 1, 2, 3, 4])).toBe(true); // four fingers, span 3
    });

    test('rejects over-wide stretches', () => {
      expect(voicer.isPlayable([-1, 1, 2, 3, 6])).toBe(false); // span 5
    });

    test('rejects shapes needing more than four fingers', () => {
      expect(voicer.isPlayable([1, 2, 3, 4, 5])).toBe(false); // five distinct frets
    });

    test('counts a barre at the lowest fret as one finger', () => {
      // frets 1,1,1,3,4 -> barre at 1 (saves 2) + two fingers = 3 total, span 3
      expect(voicer.isPlayable([1, 1, 1, 3, 4])).toBe(true);
    });

    test('span limit honors the per-instrument maxStretch', () => {
      // A 6-fret span: out of reach on guitar (4), within reach on mandolin (7).
      expect(voicer.isPlayable([-1, 2, 5, 8, 8], 4)).toBe(false);
      expect(voicer.isPlayable([-1, 2, 5, 8, 8], 7)).toBe(true);
    });

    test('shorter-scale instruments expose wider voicings than guitar', () => {
      const widest = (tuning) => {
        let max = 0;
        for (const root of ROOTS) {
          for (const quality of QUALITIES) {
            for (const v of enumerate(root, quality, tuning, 0).voicings) {
              const f = v.frets.filter(x => x > 0);
              if (f.length) max = Math.max(max, Math.max(...f) - Math.min(...f));
            }
          }
        }
        return max;
      };
      // Mandolin's looser reach should surface at least one voicing wider than
      // anything guitar permits.
      expect(widest('mandolin')).toBeGreaterThan(widest('guitar'));
    });
  });

  // === Enumeration invariants (the core guarantees) ===

  describe('enumerateVoicings invariants', () => {
    test('every returned voicing is playable, complete, and bass-correct', () => {
      for (const tuning of TUNINGS) {
        for (const root of ROOTS) {
          for (const quality of QUALITIES) {
            for (let inv = 0; inv < chordLib.getChord(root, quality).intervals.length; inv++) {
              const { semitones, voicings } = enumerate(root, quality, tuning, inv);
              const tn = tunings.get(tuning);
              const chordSet = new Set(semitones);
              const bassSemitone = semitones[inv];

              for (const v of voicings) {
                // Playable within this instrument's reach
                expect(voicer.isPlayable(v.frets, tn.maxStretch)).toBe(true);

                // No non-chord tones, and complete
                const sounding = new Set();
                for (let i = 0; i < v.frets.length; i++) {
                  if (v.frets[i] < 0) continue;
                  const s = (tn.openSemitones[i] + v.frets[i]) % 12;
                  expect(chordSet.has(s)).toBe(true);
                  sounding.add(s);
                }
                expect(sounding.size).toBe(chordSet.size);

                // Bass matches the requested inversion
                expect(bassOf(v, tuning)).toBe(bassSemitone);
              }
            }
          }
        }
      }
    });

    test('results are deduped and sorted up the neck', () => {
      for (const tuning of TUNINGS) {
        for (const root of ['C', 'E', 'G', 'A']) {
          const { voicings } = enumerate(root, 'major', tuning, 0);

          const keys = voicings.map(v => v.frets.join(','));
          expect(new Set(keys).size).toBe(keys.length); // unique

          const lowFret = (v) => {
            const f = v.frets.filter(x => x > 0);
            return f.length ? Math.min(...f) : 0;
          };
          for (let i = 1; i < voicings.length; i++) {
            expect(lowFret(voicings[i])).toBeGreaterThanOrEqual(lowFret(voicings[i - 1]));
          }
        }
      }
    });

    test('no voicing is a compact muted-subset of another (collapse applied)', () => {
      const soundCount = (v) => v.frets.filter(f => f >= 0).length;
      const fretSpan = (v) => {
        const f = v.frets.filter(x => x > 0);
        return f.length ? Math.max(...f) - Math.min(...f) : 0;
      };
      const isMutedSubsetOf = (a, b) => {
        for (let i = 0; i < a.frets.length; i++) {
          if (a.frets[i] === -1) continue;
          if (a.frets[i] !== b.frets[i]) return false;
        }
        return soundCount(a) < soundCount(b) && fretSpan(b) <= fretSpan(a) + 1;
      };
      for (const tuning of TUNINGS) {
        for (const root of ['C', 'D', 'G', 'A']) {
          const { voicings } = enumerate(root, 'major', tuning, 0);
          for (const a of voicings) {
            expect(voicings.some(b => a !== b && isMutedSubsetOf(a, b))).toBe(false);
          }
        }
      }
    });

    test('iconic open guitar shapes survive the collapse', () => {
      const has = (root, fretStr) =>
        enumerate(root, 'major', 'guitar', 0).voicings.some(v => v.frets.join(',') === fretStr);
      expect(has('D', '-1,-1,0,2,3,2')).toBe(true); // open D
      expect(has('E', '0,2,2,1,0,0')).toBe(true);   // open E
      expect(has('G', '3,2,0,0,0,3')).toBe(true);   // open G
    });

    test('common chords yield at least one voicing', () => {
      for (const tuning of TUNINGS) {
        const { voicings } = enumerate('G', 'major', tuning, 0);
        expect(voicings.length).toBeGreaterThan(0);
      }
    });

    test('voicing arrays match the string count of the tuning', () => {
      expect(enumerate('C', 'major', 'standard').voicings[0].frets).toHaveLength(5);
      expect(enumerate('C', 'major', 'mandolin').voicings[0].frets).toHaveLength(4);
      expect(enumerate('C', 'major', 'guitar').voicings[0].frets).toHaveLength(6);
    });

    test('muted strings have null notes; rung strings are named', () => {
      const { voicings } = enumerate('A', 'major', 'standard', 0);
      for (const v of voicings) {
        for (let i = 0; i < v.frets.length; i++) {
          if (v.frets[i] === -1) expect(v.notes[i]).toBeNull();
          else expect(typeof v.notes[i]).toBe('string');
        }
      }
    });
  });

  // === Inversions ===

  describe('inversions', () => {
    test('each inversion of C major on mini banjo puts the right note in the bass', () => {
      const chord = chordLib.getChord('C', 'major');
      const semitones = theory.chordSemitones('C', chord.intervals); // [0,4,7] = C,E,G
      for (let inv = 0; inv < semitones.length; inv++) {
        const { voicings } = enumerate('C', 'major', 'mini', inv);
        expect(voicings.length).toBeGreaterThan(0);
        for (const v of voicings) {
          expect(bassOf(v, 'mini')).toBe(semitones[inv]);
        }
      }
    });
  });
});
