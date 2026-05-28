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

  function getVoicing(root, qualityKey, tuningKey, bassFret = 0) {
    const chord = chordLib.getChord(root, qualityKey);
    const semitones = theory.chordSemitones(root, chord.intervals);
    const rootSemitone = theory.noteToSemitone(root);
    return voicer.findBestVoicing(semitones, rootSemitone, tuningKey, rootSemitone, bassFret);
  }

  function getVoicingInversion(root, qualityKey, tuningKey, inversionIdx, bassFret = 0) {
    const chord = chordLib.getChord(root, qualityKey);
    const semitones = theory.chordSemitones(root, chord.intervals);
    const rootSemitone = theory.noteToSemitone(root);
    const bassSemitone = semitones[inversionIdx];
    return voicer.findBestVoicing(semitones, rootSemitone, tuningKey, bassSemitone, bassFret);
  }

  function getVoicingStyled(root, qualityKey, tuningKey, bassFret, style) {
    const chord = chordLib.getChord(root, qualityKey);
    const semitones = theory.chordSemitones(root, chord.intervals);
    const rootSemitone = theory.noteToSemitone(root);
    return voicer.findBestVoicing(semitones, rootSemitone, tuningKey, rootSemitone, bassFret, null, style);
  }

  function fretString(voicing) {
    return voicing.frets.map(f => f === -1 ? 'x' : f).join('-');
  }

  // === Available positions ===

  describe('findAvailablePositions', () => {
    test('G root on standard banjo bottom-half (D, G strings)', () => {
      const gSemitone = theory.noteToSemitone('G'); // 7
      const positions = voicer.findAvailablePositions(gSemitone, 'standard');
      // D string (2): G at fret 5 (2+5=7)
      // G string (7): G at fret 0 and fret 12
      expect(positions).toEqual([0, 5, 12]);
    });

    test('C root on standard banjo', () => {
      const cSemitone = theory.noteToSemitone('C'); // 0
      const positions = voicer.findAvailablePositions(cSemitone, 'standard');
      // D string (2): C at fret 10
      // G string (7): C at fret 5
      expect(positions).toEqual([5, 10]);
    });

    test('A root on standard banjo', () => {
      const aSemitone = theory.noteToSemitone('A'); // 9
      const positions = voicer.findAvailablePositions(aSemitone, 'standard');
      // D string (2): A at fret 7
      // G string (7): A at fret 2
      expect(positions).toEqual([2, 7]);
    });

    test('C root on mini banjo', () => {
      const cSemitone = theory.noteToSemitone('C'); // 0
      const positions = voicer.findAvailablePositions(cSemitone, 'mini');
      // G string (7): C at fret 5
      // C string (0): C at fret 0 and 12
      expect(positions).toEqual([0, 5, 12]);
    });

    test('G root on guitar bottom-half (E, A, D strings)', () => {
      const gSemitone = theory.noteToSemitone('G'); // 7
      const positions = voicer.findAvailablePositions(gSemitone, 'guitar');
      // E string (4): G at fret 3
      // A string (9): G at fret 10
      // D string (2): G at fret 5
      expect(positions).toEqual([3, 5, 10]);
    });

    test('G root on mandolin bottom-half (G, D strings)', () => {
      const gSemitone = theory.noteToSemitone('G'); // 7
      const positions = voicer.findAvailablePositions(gSemitone, 'mandolin');
      // G string (7): G at fret 0 and 12
      // D string (2): G at fret 5
      expect(positions).toEqual([0, 5, 12]);
    });
  });

  // === Bass constraint tests ===

  describe('bass note constraint', () => {
    test('root position places root in bass', () => {
      // G major root position at fret 0 on standard banjo
      // G string (fretted idx 1) plays G open; D string below it muted
      const v = getVoicing('G', 'major', 'standard', 0);
      const tn = tunings.get('standard');
      const firstNonMuted = v.frets.findIndex((f, i) => i > 0 && f >= 0);
      const bassSemitone = (tn.openSemitones[firstNonMuted] + v.frets[firstNonMuted]) % 12;
      expect(bassSemitone).toBe(theory.noteToSemitone('G'));
    });

    test('first inversion places 3rd in bass', () => {
      // C major first inversion (bass = E) on mini banjo
      const v = getVoicingInversion('C', 'major', 'mini', 1, 4);
      // E is at semitone 4; G string (7) at fret 4 does NOT give E (7+4=11≠4)
      // C string (0) at fret 4 = 4 = E ✓
      const tn = tunings.get('mini');
      const firstNonMuted = v.frets.findIndex((f, i) => i > 0 && f >= 0);
      const bassSemitone = (tn.openSemitones[firstNonMuted] + v.frets[firstNonMuted]) % 12;
      expect(bassSemitone).toBe(theory.noteToSemitone('E'));
    });

    test('second inversion places 5th in bass', () => {
      // C major second inversion (bass = G) on mini banjo at fret 0
      // G string (idx 1, semitone 7) at fret 0 = G ✓
      const v = getVoicingInversion('C', 'major', 'mini', 2, 0);
      const tn = tunings.get('mini');
      const firstNonMuted = v.frets.findIndex((f, i) => i > 0 && f >= 0);
      const bassSemitone = (tn.openSemitones[firstNonMuted] + v.frets[firstNonMuted]) % 12;
      expect(bassSemitone).toBe(theory.noteToSemitone('G'));
    });

    test('mutes strings below bass string when needed', () => {
      // G root position on standard banjo at fret 0:
      // G is on fretted idx 1 (G string), so fretted idx 0 (D string) gets muted
      const v = getVoicing('G', 'major', 'standard', 0);
      expect(v.frets[1]).toBe(-1); // D string (overall idx 1) muted
      expect(v.frets[2]).toBe(0);  // G string (overall idx 2) plays G open
    });

    test('no muting needed when bass is on lowest string', () => {
      // D root position on standard banjo at fret 0:
      // D is on fretted idx 0 (D string open)
      const v = getVoicing('D', 'major', 'standard', 0);
      expect(v.frets[1]).toBe(0); // D string plays D open
    });
  });

  // === Chord name / display tests ===

  describe('chord display names', () => {
    test('root position shows plain name', () => {
      const chord = chordLib.getChord('C', 'major');
      expect(chord.displayName).toBe('C');
    });
  });

  // === Structural properties ===

  describe('voicing properties', () => {
    test('drone rings when open note is a chord tone', () => {
      const v = getVoicing('G', 'major', 'standard');
      expect(v.frets[0]).toBe(0); // drone G is in G major
    });

    test('drone is muted when open note is not a chord tone', () => {
      const v = getVoicing('A', 'major', 'standard', 2);
      expect(v.frets[0]).toBe(-1); // drone G is not in A major
    });

    test('all voicings have reasonable fret span', () => {
      const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const qualities = ['major', 'minor', 'dominant7', 'major7', 'minor7'];

      for (const tuning of ['standard', 'mini', 'mandolin']) {
        for (const root of roots) {
          for (const quality of qualities) {
            const rootSemitone = theory.noteToSemitone(root);
            const positions = voicer.findAvailablePositions(rootSemitone, tuning);
            if (positions.length === 0) continue;
            const v = getVoicing(root, quality, tuning, positions[0]);
            const fretted = v.frets.filter(f => f > 0);
            if (fretted.length > 0) {
              const span = Math.max(...fretted) - Math.min(...fretted);
              expect(span).toBeLessThanOrEqual(5);
            }
          }
        }
      }
    });

    test('banjo voicings produce arrays of length 5', () => {
      const v = getVoicing('C', 'major', 'standard', 5);
      expect(v.notes).toHaveLength(5);
      expect(v.frets).toHaveLength(5);
      expect(v.muted).toHaveLength(5);
    });

    test('mandolin voicings produce arrays of length 4', () => {
      const v = getVoicing('C', 'major', 'mandolin', 0);
      expect(v.notes).toHaveLength(4);
      expect(v.frets).toHaveLength(4);
      expect(v.muted).toHaveLength(4);
    });

    test('muted strings have null notes', () => {
      // G major root pos on standard: D string muted (bass is on G string)
      const v = getVoicing('G', 'major', 'standard', 0);
      if (v.muted[1]) {
        expect(v.notes[1]).toBeNull();
      }
    });

    test('span constraint holds for all styles', () => {
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const qualities = ['major', 'minor', 'dominant7'];
      const maxSpans = { open: 8, closed: 8, 'mandolin-chop': 8 };
      for (const style of ['open', 'closed', 'mandolin-chop']) {
        for (const tuning of ['standard', 'mini', 'mandolin']) {
          for (const root of roots) {
            for (const quality of qualities) {
              const rootSemitone = theory.noteToSemitone(root);
              const positions = voicer.findAvailablePositions(rootSemitone, tuning);
              if (positions.length === 0) continue;
              const chord = chordLib.getChord(root, quality);
              const sem = theory.chordSemitones(root, chord.intervals);
              const v = voicer.findBestVoicing(sem, rootSemitone, tuning, rootSemitone, positions[0], null, style);
              const fretted = v.frets.filter(f => f > 0);
              if (fretted.length > 0) {
                const span = Math.max(...fretted) - Math.min(...fretted);
                expect(span).toBeLessThanOrEqual(maxSpans[style]);
              }
            }
          }
        }
      }
    });
  });

  // === Higher position tests ===

  describe('higher position voicings', () => {
    test('higher positions use open strings only when they are chord tones', () => {
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      for (const root of roots) {
        const rootSemitone = theory.noteToSemitone(root);
        const chord = chordLib.getChord(root, 'major');
        const sem = theory.chordSemitones(root, chord.intervals);
        const tn = tunings.get('standard');
        const positions = voicer.findAvailablePositions(rootSemitone, 'standard');
        for (const pos of positions.filter(p => p > 0)) {
          const v = getVoicing(root, 'major', 'standard', pos);
          for (let i = 1; i < v.frets.length; i++) {
            if (v.frets[i] === 0) {
              const openSemitone = tn.openSemitones[i];
              expect(sem).toContain(openSemitone);
            }
          }
        }
      }
    });

    test('higher position frets cluster near bass fret', () => {
      const v = getVoicing('C', 'major', 'standard', 5);
      const fretted = v.frets.filter(f => f > 0);
      const avg = fretted.reduce((a, b) => a + b, 0) / fretted.length;
      expect(avg).toBeGreaterThanOrEqual(3);
      expect(avg).toBeLessThanOrEqual(8);
    });

    test('fretted (non-open) span constraint holds for higher positions', () => {
      const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const qualities = ['major', 'minor', 'dominant7'];
      for (const tuning of ['standard', 'mini', 'mandolin']) {
        for (const root of roots) {
          for (const quality of qualities) {
            const rootSemitone = theory.noteToSemitone(root);
            const positions = voicer.findAvailablePositions(rootSemitone, tuning);
            for (const pos of positions.filter(p => p > 0)) {
              const v = getVoicing(root, quality, tuning, pos);
              const fretted = v.frets.filter(f => f > 0);
              if (fretted.length > 0) {
                const span = Math.max(...fretted) - Math.min(...fretted);
                expect(span).toBeLessThanOrEqual(5);
              }
            }
          }
        }
      }
    });
  });

  // === Inversion position finding ===

  describe('inversion voicings', () => {
    test('all inversions of C major on mini banjo produce valid voicings', () => {
      const chord = chordLib.getChord('C', 'major');
      const semitones = theory.chordSemitones('C', chord.intervals);

      for (let inv = 0; inv < chord.intervals.length; inv++) {
        const bassSemitone = semitones[inv];
        const positions = voicer.findAvailablePositions(bassSemitone, 'mini');
        expect(positions.length).toBeGreaterThan(0);

        for (const pos of positions) {
          const v = voicer.findBestVoicing(semitones, theory.noteToSemitone('C'), 'mini', bassSemitone, pos);
          expect(v.frets.length).toBe(5);
          const nonMuted = v.frets.filter(f => f >= 0);
          expect(nonMuted.length).toBeGreaterThan(0);
        }
      }
    });

    test('all inversions of G7 on standard banjo produce valid voicings', () => {
      const chord = chordLib.getChord('G', 'dominant7');
      const semitones = theory.chordSemitones('G', chord.intervals);

      for (let inv = 0; inv < chord.intervals.length; inv++) {
        const bassSemitone = semitones[inv];
        const positions = voicer.findAvailablePositions(bassSemitone, 'standard');
        expect(positions.length).toBeGreaterThan(0);

        for (const pos of positions) {
          const v = voicer.findBestVoicing(semitones, theory.noteToSemitone('G'), 'standard', bassSemitone, pos);
          expect(v.frets.length).toBe(5);
        }
      }
    });

    test('every chord tone can serve as bass on mandolin', () => {
      const roots = ['C', 'D', 'G', 'A'];
      for (const root of roots) {
        const chord = chordLib.getChord(root, 'major');
        const semitones = theory.chordSemitones(root, chord.intervals);
        for (let inv = 0; inv < chord.intervals.length; inv++) {
          const bassSemitone = semitones[inv];
          const positions = voicer.findAvailablePositions(bassSemitone, 'mandolin');
          expect(positions.length).toBeGreaterThan(0);
        }
      }
    });
  });

  // === Style behavior ===

  describe('voicing styles', () => {
    test('closed style has no non-chord tones', () => {
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      for (const tuning of ['standard', 'mini', 'mandolin']) {
        const tn = tunings.get(tuning);
        for (const root of roots) {
          const chord = chordLib.getChord(root, 'major');
          const sem = theory.chordSemitones(root, chord.intervals);
          const rootSemitone = theory.noteToSemitone(root);
          const positions = voicer.findAvailablePositions(rootSemitone, tuning);
          if (positions.length === 0) continue;
          const v = voicer.findBestVoicing(sem, rootSemitone, tuning, rootSemitone, positions[0], null, 'closed');
          for (let i = 0; i < v.frets.length; i++) {
            if (v.frets[i] === -1) continue;
            const s = (tn.openSemitones[i] + v.frets[i]) % 12;
            expect(sem).toContain(s);
          }
        }
      }
    });

    test('open style matches default (no style argument)', () => {
      const roots = ['C', 'D', 'G', 'A'];
      for (const root of roots) {
        const rootSemitone = theory.noteToSemitone(root);
        const positions = voicer.findAvailablePositions(rootSemitone, 'standard');
        if (positions.length === 0) continue;
        const pos = positions[0];
        const def = getVoicing(root, 'major', 'standard', pos);
        const open = getVoicingStyled(root, 'major', 'standard', pos, 'open');
        expect(open.frets).toEqual(def.frets);
      }
    });
  });
});
