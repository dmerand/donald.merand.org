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

  function getVoicing(root, qualityKey, tuningKey, position = 0) {
    const chord = chordLib.getChord(root, qualityKey);
    const semitones = theory.chordSemitones(root, chord.intervals);
    const rootSemitone = theory.noteToSemitone(root);
    return voicer.findBestVoicing(semitones, rootSemitone, tuningKey, position);
  }

  function getVoicingStyled(root, qualityKey, tuningKey, position, style) {
    const chord = chordLib.getChord(root, qualityKey);
    const semitones = theory.chordSemitones(root, chord.intervals);
    const rootSemitone = theory.noteToSemitone(root);
    return voicer.findBestVoicing(semitones, rootSemitone, tuningKey, position, null, style);
  }

  function fretString(voicing) {
    return voicing.frets.map(f => f === -1 ? 'x' : f).join('-');
  }

  // === Standard G tuning regression tests ===
  // These voicings were verified by brute-force search and manual review.

  describe('standard tuning - major chords', () => {
    test('G major: all open strings', () => {
      expect(fretString(getVoicing('G', 'major', 'standard'))).toBe('0-0-0-0-0');
    });

    test('C major', () => {
      expect(fretString(getVoicing('C', 'major', 'standard'))).toBe('0-2-0-1-2');
    });

    test('D major', () => {
      expect(fretString(getVoicing('D', 'major', 'standard'))).toBe('x-0-2-3-4');
    });

    test('A major: barre chord', () => {
      expect(fretString(getVoicing('A', 'major', 'standard'))).toBe('x-2-2-2-2');
    });

    test('E major', () => {
      expect(fretString(getVoicing('E', 'major', 'standard'))).toBe('x-2-1-0-2');
    });

    test('F major', () => {
      expect(fretString(getVoicing('F', 'major', 'standard'))).toBe('x-3-2-1-3');
    });
  });

  describe('standard tuning - minor chords', () => {
    test('G minor', () => {
      expect(fretString(getVoicing('G', 'minor', 'standard'))).toBe('0-0-3-3-0');
    });

    test('A minor', () => {
      expect(fretString(getVoicing('A', 'minor', 'standard'))).toBe('x-2-2-1-2');
    });

    test('E minor', () => {
      expect(fretString(getVoicing('E', 'minor', 'standard'))).toBe('0-2-0-0-2');
    });

    test('D minor', () => {
      expect(fretString(getVoicing('D', 'minor', 'standard'))).toBe('x-0-2-3-3');
    });
  });

  describe('standard tuning - dominant 7th chords', () => {
    test('G7', () => {
      expect(fretString(getVoicing('G', 'dominant7', 'standard'))).toBe('0-0-0-0-3');
    });

    test('C7', () => {
      expect(fretString(getVoicing('C', 'dominant7', 'standard'))).toBe('0-2-3-1-2');
    });
  });

  // === Mini C tuning regression tests ===
  // Mini tuning transposes standard shapes up a perfect 4th.

  describe('mini tuning - major chords', () => {
    test('C major on mini: all open strings (like G on standard)', () => {
      expect(fretString(getVoicing('C', 'major', 'mini'))).toBe('0-0-0-0-0');
    });

    test('F major on mini (like C on standard)', () => {
      expect(fretString(getVoicing('F', 'major', 'mini'))).toBe('0-2-0-1-2');
    });

    test('G major on mini (like D on standard)', () => {
      expect(fretString(getVoicing('G', 'major', 'mini'))).toBe('x-0-2-3-4');
    });

    test('D major on mini (like A on standard)', () => {
      expect(fretString(getVoicing('D', 'major', 'mini'))).toBe('x-2-2-2-2');
    });
  });

  // === Mandolin GDAE tuning regression tests ===

  describe('mandolin tuning - major chords', () => {
    test('G major: open G and D, fretted B and G', () => {
      expect(fretString(getVoicing('G', 'major', 'mandolin'))).toBe('0-0-2-3');
    });

    test('C major', () => {
      expect(fretString(getVoicing('C', 'major', 'mandolin'))).toBe('0-2-3-0');
    });

    test('D major', () => {
      expect(fretString(getVoicing('D', 'major', 'mandolin'))).toBe('2-0-0-2');
    });

    test('E major', () => {
      expect(fretString(getVoicing('E', 'major', 'mandolin'))).toBe('1-2-2-0');
    });

    test('F major', () => {
      expect(fretString(getVoicing('F', 'major', 'mandolin'))).toBe('5-3-0-1');
    });
  });

  describe('mandolin tuning - minor chords', () => {
    test('E minor', () => {
      expect(fretString(getVoicing('E', 'minor', 'mandolin'))).toBe('0-2-2-0');
    });

    test('D minor', () => {
      expect(fretString(getVoicing('D', 'minor', 'mandolin'))).toBe('2-0-0-1');
    });
  });

  describe('mandolin tuning - dominant 7th chords', () => {
    test('G7', () => {
      expect(fretString(getVoicing('G', 'dominant7', 'mandolin'))).toBe('0-0-2-1');
    });

    test('A7', () => {
      expect(fretString(getVoicing('A', 'dominant7', 'mandolin'))).toBe('0-2-0-0');
    });
  });

  // === Position voicing tests ===

  describe('higher position voicings', () => {
    test('higher positions never use open strings', () => {
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      for (const root of roots) {
        for (const pos of [3, 5, 7, 9]) {
          const v = getVoicing(root, 'major', 'standard', pos);
          const nonMuted = v.frets.filter(f => f !== -1);
          expect(nonMuted.every(f => f > 0)).toBe(true);
        }
      }
    });

    test('higher positions produce different frets than open position', () => {
      // G major open is all zeros; higher positions must differ
      const open = getVoicing('G', 'major', 'standard', 0);
      for (const pos of [3, 5, 7, 9]) {
        const higher = getVoicing('G', 'major', 'standard', pos);
        expect(higher.frets).not.toEqual(open.frets);
      }
    });

    test('5th string is muted for higher positions', () => {
      const v = getVoicing('G', 'major', 'standard', 5);
      expect(v.frets[0]).toBe(-1);
    });

    test('higher position frets cluster near target position', () => {
      const v = getVoicing('C', 'major', 'standard', 7);
      const fretted = v.frets.filter(f => f > 0);
      const avg = fretted.reduce((a, b) => a + b, 0) / fretted.length;
      expect(avg).toBeGreaterThanOrEqual(5);
      expect(avg).toBeLessThanOrEqual(10);
    });

    test('span constraint holds for higher positions', () => {
      const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const qualities = ['major', 'minor', 'dominant7'];
      for (const tuning of ['standard', 'mini', 'mandolin']) {
        for (const root of roots) {
          for (const quality of qualities) {
            for (const pos of [3, 5, 7, 9]) {
              const v = getVoicing(root, quality, tuning, pos);
              const fretted = v.frets.filter(f => f > 0);
              if (fretted.length > 0) {
                const span = Math.max(...fretted) - Math.min(...fretted);
                expect(span).toBeLessThanOrEqual(4);
              }
            }
          }
        }
      }
    });

    test('mandolin higher positions never use open strings', () => {
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      for (const root of roots) {
        for (const pos of [3, 5, 7, 9]) {
          const v = getVoicing(root, 'major', 'mandolin', pos);
          expect(v.frets.every(f => f > 0)).toBe(true);
        }
      }
    });
  });

  // === Structural properties ===

  describe('voicing properties', () => {
    test('5th string is open when open note is a chord tone', () => {
      const v = getVoicing('G', 'major', 'standard');
      expect(v.frets[0]).toBe(0); // G is in G major
    });

    test('5th string is muted when open note is not a chord tone', () => {
      const v = getVoicing('A', 'major', 'standard');
      expect(v.frets[0]).toBe(-1); // G is not in A major
    });

    test('all voicings have fret span <= 4', () => {
      const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const qualities = ['major', 'minor', 'diminished', 'augmented', 'dominant7', 'major7', 'minor7'];

      for (const tuning of ['standard', 'mini', 'mandolin']) {
        for (const root of roots) {
          for (const quality of qualities) {
            const v = getVoicing(root, quality, tuning);
            const fretted = v.frets.filter(f => f > 0);
            if (fretted.length > 0) {
              const span = Math.max(...fretted) - Math.min(...fretted);
              expect(span).toBeLessThanOrEqual(4);
            }
          }
        }
      }
    });

    test('banjo voicings produce arrays of length 5', () => {
      const v = getVoicing('C', 'major', 'standard');
      expect(v.notes).toHaveLength(5);
      expect(v.frets).toHaveLength(5);
      expect(v.muted).toHaveLength(5);
    });

    test('mandolin voicings produce arrays of length 4', () => {
      const v = getVoicing('C', 'major', 'mandolin');
      expect(v.notes).toHaveLength(4);
      expect(v.frets).toHaveLength(4);
      expect(v.muted).toHaveLength(4);
    });

    test('mandolin voicings have no drone string (no -1 frets in open position)', () => {
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      for (const root of roots) {
        const v = getVoicing(root, 'major', 'mandolin');
        expect(v.frets.every(f => f >= 0)).toBe(true);
        expect(v.muted.every(m => m === false)).toBe(true);
      }
    });

    test('muted strings have null notes', () => {
      const v = getVoicing('A', 'major', 'standard'); // 5th string muted
      expect(v.muted[0]).toBe(true);
      expect(v.notes[0]).toBeNull();
    });

    test('span constraint holds for all styles', () => {
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const qualities = ['major', 'minor', 'dominant7'];
      const maxSpans = { easy: 4, clean: 4, rich: 5, closed: 7, chop: 6 };
      for (const style of ['easy', 'clean', 'rich', 'closed', 'chop']) {
        for (const tuning of ['standard', 'mini', 'mandolin']) {
          for (const root of roots) {
            for (const quality of qualities) {
              const v = getVoicingStyled(root, quality, tuning, 0, style);
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

  // === Voicing style tests ===

  describe('voicing styles', () => {
    test('clean style avoids non-chord tones on mandolin A major', () => {
      const easy = getVoicingStyled('A', 'major', 'mandolin', 0, 'easy');
      const clean = getVoicingStyled('A', 'major', 'mandolin', 0, 'clean');
      expect(fretString(easy)).toBe('6-0-0-0');
      expect(fretString(clean)).toBe('2-2-4-0');
      // easy has open D (non-chord tone); clean replaces it
      const aChord = [9, 1, 4]; // A, C#, E
      const cleanNotes = clean.frets.map((f, i) => (tunings.get('mandolin').openSemitones[i] + f) % 12);
      expect(cleanNotes.every(s => aChord.includes(s))).toBe(true);
    });

    test('clean style avoids non-chord tones on mandolin Am', () => {
      const easy = getVoicingStyled('A', 'minor', 'mandolin', 0, 'easy');
      const clean = getVoicingStyled('A', 'minor', 'mandolin', 0, 'clean');
      expect(fretString(easy)).not.toBe(fretString(clean));
      const amChord = [9, 0, 4]; // A, C, E
      const cleanNotes = clean.frets.map((f, i) => (tunings.get('mandolin').openSemitones[i] + f) % 12);
      expect(cleanNotes.every(s => amChord.includes(s))).toBe(true);
    });

    test('rich style differs from clean on mandolin F major', () => {
      const clean = getVoicingStyled('F', 'major', 'mandolin', 0, 'clean');
      const rich = getVoicingStyled('F', 'major', 'mandolin', 0, 'rich');
      expect(fretString(clean)).not.toBe(fretString(rich));
    });

    test('rich style finds inversions in higher positions', () => {
      const easy = getVoicingStyled('A', 'major', 'standard', 5, 'easy');
      const rich = getVoicingStyled('A', 'major', 'standard', 5, 'rich');
      expect(fretString(easy)).not.toBe(fretString(rich));
    });

    test('closed style avoids open strings on mandolin', () => {
      const easy = getVoicingStyled('C', 'major', 'mandolin', 0, 'easy');
      const closed = getVoicingStyled('C', 'major', 'mandolin', 0, 'closed');
      expect(fretString(easy)).not.toBe(fretString(closed));
      expect(closed.frets.every(f => f > 0)).toBe(true);
    });

    test('closed style differs from all others on mandolin Am', () => {
      const easy = fretString(getVoicingStyled('A', 'minor', 'mandolin', 0, 'easy'));
      const clean = fretString(getVoicingStyled('A', 'minor', 'mandolin', 0, 'clean'));
      const rich = fretString(getVoicingStyled('A', 'minor', 'mandolin', 0, 'rich'));
      const closed = fretString(getVoicingStyled('A', 'minor', 'mandolin', 0, 'closed'));
      expect(closed).not.toBe(easy);
      expect(closed).not.toBe(clean);
      expect(closed).not.toBe(rich);
    });

    test('closed style has no non-chord tones', () => {
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      for (const tuning of ['standard', 'mini', 'mandolin']) {
        const tn = tunings.get(tuning);
        for (const root of roots) {
          const chord = chordLib.getChord(root, 'major');
          const sem = theory.chordSemitones(root, chord.intervals);
          const v = getVoicingStyled(root, 'major', tuning, 0, 'closed');
          for (let i = 0; i < v.frets.length; i++) {
            if (v.frets[i] === -1) continue;
            const s = (tn.openSemitones[i] + v.frets[i]) % 12;
            expect(sem).toContain(s);
          }
        }
      }
    });

    test('chop style produces wide mandolin voicings with no open strings', () => {
      const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      for (const root of roots) {
        const v = getVoicingStyled(root, 'major', 'mandolin', 0, 'chop');
        expect(v.frets.every(f => f > 0)).toBe(true);
      }
    });

    test('easy style matches default (no style argument)', () => {
      const roots = ['C', 'D', 'G', 'A'];
      for (const root of roots) {
        const def = getVoicing(root, 'major', 'standard');
        const easy = getVoicingStyled(root, 'major', 'standard', 0, 'easy');
        expect(easy.frets).toEqual(def.frets);
      }
    });
  });
});
