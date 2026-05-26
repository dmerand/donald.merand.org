/**
 * Algorithmic chord voicing finder for 5-string banjo
 *
 * Supports first-position (open) voicings and higher positions up the neck.
 * Position 0 = open/first position, position N = favor frets near fret N.
 */

class BanjoVoicer {
  constructor(theory, tunings) {
    this.theory = theory;
    this.tunings = tunings;
    this.maxFret = 12;
    this.maxSpan = 4;
  }

  findBestVoicing(chordSemitones, rootSemitone, tuningKey, position = 0, spelling = null) {
    const tuning = this.tunings.get(tuningKey);
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
      if (position === 0) {
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
        const score = this.scoreVoicing(current, chordSemitones, rootSemitone, tuning, hasDrone ? droneFret : null, position, frettedOffset);
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

  scoreVoicing(frettedStrings, chordSemitones, rootSemitone, tuning, droneFret, position = 0, frettedOffset = 1) {
    const frets = frettedStrings.map(c => c.fret);
    const semitones = frettedStrings.map(c => c.semitone);
    const nonChordTones = frettedStrings.map(c => c.nonChordTone || false);
    const numFretted = frettedStrings.length;

    const frettedFrets = frets.filter(f => f > 0);
    const span = frettedFrets.length > 0
      ? Math.max(...frettedFrets) - Math.min(...frettedFrets)
      : 0;

    if (span > this.maxSpan) return -1000;

    let score = 0;

    const chordToneSemitones = semitones.filter((s, i) => !nonChordTones[i]);
    const allSemitones = [...chordToneSemitones];
    if (droneFret !== null && droneFret >= 0) allSemitones.push(tuning.openSemitones[0]);
    const uniqueTones = new Set(allSemitones.filter(s => chordSemitones.includes(s)));
    score += uniqueTones.size * 15;
    if (uniqueTones.size === chordSemitones.length) score += 20;

    if (!nonChordTones[0] && semitones[0] === rootSemitone) score += 6;

    if (position === 0) {
      for (let i = 0; i < numFretted; i++) {
        if (frets[i] === 0 && !nonChordTones[i]) {
          score += 10;
        } else if (frets[i] === 0 && nonChordTones[i]) {
          score -= 5;
        } else if (frets[i] > 0 && chordSemitones.includes(tuning.openSemitones[i + frettedOffset])) {
          score -= 8;
        }
      }
    }

    const nctCount = nonChordTones.filter(Boolean).length;
    score -= nctCount * 6;

    if (position === 0) {
      const totalFrets = frets.reduce((a, b) => a + b, 0);
      score -= totalFrets * 2;

      const maxFret = Math.max(...frets);
      if (maxFret > 5) score -= (maxFret - 5) * 5;
    } else {
      for (const f of frettedFrets) {
        score -= Math.abs(f - position) * 3;
      }
    }

    score -= span * 3;

    const frettedPositions = frets.map((f, i) => ({ fret: f, idx: i })).filter(p => p.fret > 0);
    for (let i = 1; i < frettedPositions.length; i++) {
      const gap = Math.abs(frettedPositions[i].fret - frettedPositions[i - 1].fret);
      if (gap > 2) score -= gap * 2;
    }

    return score;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BanjoVoicer;
}
