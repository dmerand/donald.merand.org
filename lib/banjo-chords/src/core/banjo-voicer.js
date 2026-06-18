/**
 * Banjo/stringed-instrument voicer.
 *
 * Enumerates every distinct, playable voicing of a chord up the neck for a
 * given tuning, root, quality and inversion. There is no scoring or "best"
 * pick — each shape that is complete (all chord tones, no others) and
 * physically playable is returned, organized up the neck.
 */
class BanjoVoicer {
  constructor(theory, tunings) {
    this.theory = theory;
    this.tunings = tunings;
    this.maxFret = 12;
    this.maxStretch = 4;
  }

  /**
   * Is a set of frets physically playable?
   * Hard constraints that replace the old scoring penalties:
   *  - fretted span within reach (<= maxStretch)
   *  - at most four fingers, allowing one index barre across the lowest fret
   * Open (0) and muted (-1) strings cost no finger.
   */
  isPlayable(frets) {
    const fretted = frets.filter(f => f > 0);
    if (fretted.length === 0) return true;

    const minFret = Math.min(...fretted);
    const maxFret = Math.max(...fretted);
    if (maxFret - minFret > this.maxStretch) return false;

    const atLowest = fretted.filter(f => f === minFret).length;
    const barreSaving = atLowest >= 2 ? atLowest - 1 : 0;
    const fingers = fretted.length - barreSaving;
    return fingers <= 4;
  }

  /**
   * Every distinct playable voicing up the neck.
   *
   * @returns array of { frets, notes, muted } sorted from the nut upward.
   */
  enumerateVoicings(chordSemitones, rootSemitone, tuningKey, bassSemitone, spelling = null) {
    const tuning = this.tunings.get(tuningKey);
    const hasDrone = tuning.hasDrone !== false;
    const numFretted = hasDrone ? tuning.numStrings - 1 : tuning.numStrings;
    const frettedOffset = hasDrone ? 1 : 0;

    // The drone (5th string) is fixed open; it only rings if it is a chord tone.
    let droneFret = -1;
    if (hasDrone) {
      const droneOpen = tuning.openSemitones[0];
      droneFret = chordSemitones.includes(droneOpen) ? 0 : -1;
    }

    // Per fretted string: every chord-tone fret across the neck, plus "muted".
    const candidates = [];
    for (let s = 0; s < numFretted; s++) {
      const openSemitone = tuning.openSemitones[s + frettedOffset];
      const stringCandidates = [{ fret: -1, semitone: -1, muted: true }];
      for (let f = 0; f <= this.maxFret; f++) {
        const semitone = (openSemitone + f) % 12;
        if (chordSemitones.includes(semitone)) {
          stringCandidates.push({ fret: f, semitone, muted: false });
        }
      }
      candidates.push(stringCandidates);
    }

    const chordToneSet = new Set(chordSemitones);
    const results = [];
    const seen = new Set();

    const accept = (fretted) => {
      // Bass note (lowest-pitched non-muted fretted string) must match the inversion.
      const firstActive = fretted.find(c => !c.muted);
      if (!firstActive || firstActive.semitone !== bassSemitone) return;

      // Collect sounding pitch classes, including the drone when it rings.
      const sounding = new Set();
      for (const c of fretted) {
        if (!c.muted) sounding.add(c.semitone);
      }
      if (droneFret === 0) sounding.add(tuning.openSemitones[0]);

      // Complete: every chord tone present (no non-chord tones can occur — only
      // chord-tone frets are generated as candidates).
      if (sounding.size !== chordToneSet.size) return;

      const frets = hasDrone
        ? [droneFret, ...fretted.map(c => c.fret)]
        : fretted.map(c => c.fret);

      if (!this.isPlayable(frets)) return;

      const key = frets.join(',');
      if (seen.has(key)) return;
      seen.add(key);

      const noteName = (semitone) =>
        (spelling && spelling[semitone]) || this.theory.semitoneToNote(semitone);
      const notes = frets.map((f, i) => {
        if (f < 0) return null;
        return noteName((tuning.openSemitones[i] + f) % 12);
      });

      results.push({ frets, notes, muted: frets.map(f => f === -1) });
    };

    const current = new Array(numFretted);
    const search = (stringIdx) => {
      if (stringIdx === numFretted) {
        accept(current);
        return;
      }
      for (const candidate of candidates[stringIdx]) {
        current[stringIdx] = candidate;
        search(stringIdx + 1);
      }
    };
    search(0);

    const frettedOf = (v) => v.frets.filter(f => f > 0);
    const soundCount = (v) => v.frets.filter(f => f >= 0).length;
    const lowFret = (v) => { const f = frettedOf(v); return f.length ? Math.min(...f) : 0; };
    const fretSpan = (v) => { const f = frettedOf(v); return f.length ? Math.max(...f) - Math.min(...f) : 0; };

    // Collapse muting variants: a player can always mute a string, so a voicing
    // that is just a more-muted version of another (same frets where it sounds,
    // fewer strings ringing) adds no information — provided filling in the muted
    // strings keeps the same grip (the fretted span barely grows; that guard
    // avoids collapsing an iconic open shape into a fuller, neck-shifted one).
    const isMutedSubsetOf = (a, b) => {
      for (let i = 0; i < a.frets.length; i++) {
        if (a.frets[i] === -1) continue;        // `a` may mute where `b` rings
        if (a.frets[i] !== b.frets[i]) return false;
      }
      return soundCount(a) < soundCount(b) && fretSpan(b) <= fretSpan(a) + 1;
    };
    // Fullest-first, so a compact shape is only dropped for a superset we keep —
    // never for one that is itself collapsed away later in the pass.
    results.sort((a, b) => soundCount(b) - soundCount(a));
    const kept = [];
    for (const a of results) {
      if (!kept.some(b => isMutedSubsetOf(a, b))) kept.push(a);
    }

    // Up the neck: lowest fretted note first, then tighter shapes first.
    kept.sort((a, b) => lowFret(a) - lowFret(b) || fretSpan(a) - fretSpan(b) || a.frets.join().localeCompare(b.frets.join()));

    return kept;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BanjoVoicer;
}
