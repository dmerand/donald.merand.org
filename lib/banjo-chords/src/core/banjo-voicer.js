/**
 * Algorithmic chord voicing finder for 5-string banjo
 *
 * Supports first-position (open) voicings and higher positions up the neck.
 * Position 0 = open/first position, position N = favor frets near fret N.
 */

const VOICING_STYLES = {
  easy: {
    coverage: 15, completeness: 20, rootBass: 6,
    openString: 10, openNonChordTone: -5, fretOverOpen: -8,
    wrongNote: -6, effort: -2, highFretEffort: -5,
    positionTight: -4, stretch: -3, fingerGap: -2,
    doubledNote: 0, inversion: 0, maxStretch: 4,
    allowWrongNotes: true,
  },
  clean: {
    coverage: 15, completeness: 25, rootBass: 10,
    openString: 6, openNonChordTone: 0, fretOverOpen: 0,
    wrongNote: 0, effort: -1, highFretEffort: -3,
    positionTight: -3, stretch: -3, fingerGap: -2,
    doubledNote: -3, inversion: 0, maxStretch: 4,
    allowWrongNotes: false,
  },
  rich: {
    coverage: 30, completeness: 80, rootBass: 0,
    openString: 3, openNonChordTone: -10, fretOverOpen: 0,
    wrongNote: -10, effort: -1, highFretEffort: -2,
    positionTight: -1, stretch: -2, fingerGap: -1,
    doubledNote: -8, inversion: 12, maxStretch: 5,
    allowWrongNotes: true,
  },
  closed: {
    coverage: 11, completeness: 100, rootBass: 3,
    openString: -10, openNonChordTone: -2, fretOverOpen: 10,
    wrongNote: -1, effort: -0.5, highFretEffort: -0.5,
    positionTight: -2, stretch: -3, fingerGap: -2,
    doubledNote: -15, inversion: 0, maxStretch: 7,
    allowWrongNotes: false,
  },
  chop: {
    coverage: 20, completeness: 60, rootBass: 0,
    openString: -30, openNonChordTone: -30, fretOverOpen: 15,
    wrongNote: -20, effort: 0, highFretEffort: 0,
    positionTight: -2, stretch: 2, fingerGap: 1,
    doubledNote: -12, inversion: 3, maxStretch: 6,
    allowWrongNotes: false,
  },
};

class BanjoVoicer {
  constructor(theory, tunings) {
    this.theory = theory;
    this.tunings = tunings;
    this.maxFret = 12;
    this.maxSpan = 4;
  }

  findBestVoicing(chordSemitones, rootSemitone, tuningKey, position = 0, spelling = null, style = 'easy') {
    const tuning = this.tunings.get(tuningKey);
    const weights = VOICING_STYLES[style] || VOICING_STYLES.easy;
    const hasDrone = tuning.hasDrone !== false;
    const numFretted = hasDrone ? tuning.numStrings - 1 : tuning.numStrings;
    const frettedOffset = hasDrone ? 1 : 0;

    let droneFret = -1;
    if (hasDrone) {
      const droneOpen = tuning.openSemitones[0];
      droneFret = (position === 0 && chordSemitones.includes(droneOpen)) ? 0 : -1;
    }

    const candidates = [];
    for (let s = 0; s < numFretted; s++) {
      const tuningIdx = s + frettedOffset;
      const stringCandidates = [];
      const openSemitone = tuning.openSemitones[tuningIdx];
      if (position === 0 && weights.allowWrongNotes !== false) {
        if (!chordSemitones.includes(openSemitone)) {
          stringCandidates.push({ fret: 0, semitone: openSemitone, nonChordTone: true });
        }
      }
      for (let f = 0; f <= this.maxFret; f++) {
        if (position > 0 && f === 0) continue;
        const semitone = (tuning.openSemitones[tuningIdx] + f) % 12;
        if (chordSemitones.includes(semitone)) {
          stringCandidates.push({ fret: f, semitone, nonChordTone: false });
        }
      }
      candidates.push(stringCandidates);
    }

    let bestVoicing = null;
    let bestScore = -Infinity;

    const search = (stringIdx, current) => {
      if (stringIdx === numFretted) {
        const score = this.scoreVoicing(current, chordSemitones, rootSemitone, tuning, hasDrone ? droneFret : null, position, frettedOffset, weights);
        if (score > bestScore) {
          bestScore = score;
          bestVoicing = [...current];
        }
        return;
      }
      for (const candidate of candidates[stringIdx]) {
        current[stringIdx] = candidate;
        search(stringIdx + 1, current);
      }
    };

    search(0, new Array(numFretted));

    const noteName = (semitone) =>
      (spelling && spelling[semitone]) || this.theory.semitoneToNote(semitone);

    if (!bestVoicing) {
      const frets = hasDrone
        ? [droneFret, ...new Array(numFretted).fill(0)]
        : new Array(numFretted).fill(0);
      return {
        frets,
        notes: tuning.openNotes.slice(),
        muted: frets.map(f => f === -1),
      };
    }

    let frets, notes;
    if (hasDrone) {
      frets = [droneFret, ...bestVoicing.map(c => c.fret)];
      notes = [
        droneFret >= 0 ? noteName(tuning.openSemitones[0]) : null,
        ...bestVoicing.map(c => noteName(c.semitone)),
      ];
    } else {
      frets = bestVoicing.map(c => c.fret);
      notes = bestVoicing.map(c => noteName(c.semitone));
    }

    return { frets, notes, muted: frets.map(f => f === -1) };
  }

  scoreVoicing(frettedStrings, chordSemitones, rootSemitone, tuning, droneFret, position = 0, frettedOffset = 1, w = VOICING_STYLES.easy) {
    const frets = frettedStrings.map(c => c.fret);
    const semitones = frettedStrings.map(c => c.semitone);
    const nonChordTones = frettedStrings.map(c => c.nonChordTone || false);
    const numFretted = frettedStrings.length;

    const frettedFrets = frets.filter(f => f > 0);
    const span = frettedFrets.length > 0
      ? Math.max(...frettedFrets) - Math.min(...frettedFrets)
      : 0;

    if (span > (w.maxStretch || this.maxSpan)) return -1000;

    let score = 0;

    const chordToneSemitones = semitones.filter((s, i) => !nonChordTones[i]);
    const allSemitones = [...chordToneSemitones];
    if (droneFret !== null && droneFret >= 0) allSemitones.push(tuning.openSemitones[0]);
    const uniqueTones = new Set(allSemitones.filter(s => chordSemitones.includes(s)));
    score += uniqueTones.size * w.coverage;
    if (uniqueTones.size === chordSemitones.length) score += w.completeness;

    if (!nonChordTones[0] && semitones[0] === rootSemitone) score += w.rootBass;
    if (w.inversion && !nonChordTones[0] && semitones[0] !== rootSemitone && chordSemitones.includes(semitones[0])) {
      score += w.inversion;
    }

    if (position === 0) {
      for (let i = 0; i < numFretted; i++) {
        if (frets[i] === 0 && !nonChordTones[i]) {
          score += w.openString;
        } else if (frets[i] === 0 && nonChordTones[i]) {
          score += w.openNonChordTone;
        } else if (frets[i] > 0 && chordSemitones.includes(tuning.openSemitones[i + frettedOffset])) {
          score += w.fretOverOpen;
        }
      }
    }

    score += nonChordTones.filter(Boolean).length * w.wrongNote;

    if (position === 0) {
      score += frets.reduce((a, b) => a + b, 0) * w.effort;
      const maxFret = Math.max(...frets);
      if (maxFret > 5) score += (maxFret - 5) * w.highFretEffort;
    } else {
      for (const f of frettedFrets) {
        score += Math.abs(f - position) * w.positionTight;
      }
    }

    score += span * w.stretch;

    const frettedPositions = frets.map((f, i) => ({ fret: f, idx: i })).filter(p => p.fret > 0);
    for (let i = 1; i < frettedPositions.length; i++) {
      const gap = Math.abs(frettedPositions[i].fret - frettedPositions[i - 1].fret);
      if (gap > 2) score += gap * w.fingerGap;
    }

    if (w.doubledNote) {
      const pitchCounts = {};
      for (let i = 0; i < numFretted; i++) {
        if (!nonChordTones[i]) pitchCounts[semitones[i]] = (pitchCounts[semitones[i]] || 0) + 1;
      }
      if (droneFret !== null && droneFret >= 0) {
        const dp = tuning.openSemitones[0];
        pitchCounts[dp] = (pitchCounts[dp] || 0) + 1;
      }
      for (const count of Object.values(pitchCounts)) {
        if (count > 1) score += (count - 1) * w.doubledNote;
      }
    }

    return score;
  }
}

BanjoVoicer.STYLES = VOICING_STYLES;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BanjoVoicer;
}
