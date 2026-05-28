const VOICING_STYLES = {
  open: {
    coverage: 15, completeness: 48, rootBass: 6,
    openString: 21.6, openNonChordTone: -5, fretOverOpen: -8,
    wrongNote: -6, effort: -3.6, highFretEffort: -5,
    positionTight: -2.5, orientation: -1.4, stretch: -6, fingerGap: -1.1,
    doubledNote: 0, inversion: 0, maxStretch: 5,
    allowWrongNotes: true, allowMuting: true,
  },
  closed: {
    coverage: 11, completeness: 100, rootBass: 3,
    openString: -6.6, openNonChordTone: -2, fretOverOpen: 10,
    wrongNote: -1, effort: -2.5, highFretEffort: -0.5,
    positionTight: 0, orientation: 0, stretch: -3.1, fingerGap: -1,
    doubledNote: 0, inversion: 0, maxStretch: 5,
    allowWrongNotes: false, allowMuting: true,
  },
  'mandolin-chop': {
    coverage: 20, completeness: 100, rootBass: 0,
    openString: -28, openNonChordTone: -30, fretOverOpen: 15,
    wrongNote: -20, effort: 0, highFretEffort: 0,
    positionTight: 0, orientation: -0.3, stretch: 0, fingerGap: -0.5,
    doubledNote: 0, inversion: 3, maxStretch: 5,
    allowWrongNotes: false, allowMuting: false,
  },
};

class BanjoVoicer {
  constructor(theory, tunings) {
    this.theory = theory;
    this.tunings = tunings;
    this.maxFret = 12;
    this.maxSpan = 5;
  }

  findAvailablePositions(bassSemitone, tuningKey) {
    const tuning = this.tunings.get(tuningKey);
    const hasDrone = tuning.hasDrone !== false;
    const numFretted = hasDrone ? tuning.numStrings - 1 : tuning.numStrings;
    const frettedOffset = hasDrone ? 1 : 0;
    const bottomHalf = Math.floor(numFretted / 2);

    const positions = new Set();
    for (let s = 0; s < bottomHalf; s++) {
      const openSemitone = tuning.openSemitones[s + frettedOffset];
      for (let f = 0; f <= this.maxFret; f++) {
        if ((openSemitone + f) % 12 === bassSemitone) {
          positions.add(f);
        }
      }
    }
    return Array.from(positions).sort((a, b) => a - b);
  }

  findBestVoicing(chordSemitones, rootSemitone, tuningKey, bassSemitone, bassFret = 0, spelling = null, style = 'open') {
    const tuning = this.tunings.get(tuningKey);
    const weights = VOICING_STYLES[style] || VOICING_STYLES.open;
    const hasDrone = tuning.hasDrone !== false;
    const numFretted = hasDrone ? tuning.numStrings - 1 : tuning.numStrings;
    const frettedOffset = hasDrone ? 1 : 0;
    const position = bassFret;

    let droneFret = -1;
    if (hasDrone) {
      const droneOpen = tuning.openSemitones[0];
      droneFret = (position === 0 && chordSemitones.includes(droneOpen)) ? 0 : -1;
    }

    const bottomHalf = Math.floor(numFretted / 2);
    let bassStringIdx = -1;
    for (let s = 0; s < bottomHalf; s++) {
      const tuningIdx = s + frettedOffset;
      if ((tuning.openSemitones[tuningIdx] + bassFret) % 12 === bassSemitone) {
        bassStringIdx = s;
        break;
      }
    }

    const canMute = weights.allowMuting !== false;
    const hardBass = bassStringIdx >= 0;

    const candidates = [];
    for (let s = 0; s < numFretted; s++) {
      const tuningIdx = s + frettedOffset;

      if (hardBass && s === bassStringIdx) {
        candidates.push([{ fret: bassFret, semitone: bassSemitone, nonChordTone: false }]);
        continue;
      }

      const stringCandidates = [];

      if (hardBass && s < bassStringIdx && canMute) {
        stringCandidates.push({ fret: -1, semitone: -1, nonChordTone: false, muted: true });
      }

      const openSemitone = tuning.openSemitones[tuningIdx];
      const allowOpen = weights.openString >= 0;
      if (allowOpen && weights.allowWrongNotes !== false) {
        if (!chordSemitones.includes(openSemitone)) {
          stringCandidates.push({ fret: 0, semitone: openSemitone, nonChordTone: true });
        }
      }

      for (let f = 0; f <= this.maxFret; f++) {
        if (f === 0 && !allowOpen) continue;
        const semitone = (openSemitone + f) % 12;
        if (chordSemitones.includes(semitone)) {
          stringCandidates.push({ fret: f, semitone, nonChordTone: false });
        }
      }

      if (stringCandidates.length === 0) {
        stringCandidates.push({ fret: 0, semitone: openSemitone, nonChordTone: true });
      }

      candidates.push(stringCandidates);
    }

    let bestVoicing = null;
    let bestScore = -Infinity;

    const search = (stringIdx, current) => {
      if (stringIdx === numFretted) {
        const score = this.scoreVoicing(current, chordSemitones, bassSemitone, tuning, droneFret, position, frettedOffset, weights, hardBass, canMute);
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
      frets = [droneFret, ...bestVoicing.map(c => c.muted ? -1 : c.fret)];
      notes = [
        droneFret >= 0 ? noteName(tuning.openSemitones[0]) : null,
        ...bestVoicing.map(c => c.muted ? null : noteName(c.semitone)),
      ];
    } else {
      frets = bestVoicing.map(c => c.muted ? -1 : c.fret);
      notes = bestVoicing.map(c => c.muted ? null : noteName(c.semitone));
    }

    return { frets, notes, muted: frets.map(f => f === -1) };
  }

  scoreVoicing(frettedStrings, chordSemitones, bassSemitone, tuning, droneFret, position, frettedOffset, w, hardBass, canMute) {
    const numFretted = frettedStrings.length;

    let firstActiveIdx = -1;
    for (let i = 0; i < numFretted; i++) {
      if (!frettedStrings[i].muted) {
        firstActiveIdx = i;
        break;
      }
    }
    if (firstActiveIdx === -1) return -1000;

    if (hardBass && canMute && frettedStrings[firstActiveIdx].semitone !== bassSemitone) return -1000;

    const activeFrets = [];
    const activeSemitones = [];
    const activeNonChordTones = [];
    let mutedCount = 0;

    for (let i = 0; i < numFretted; i++) {
      if (frettedStrings[i].muted) {
        mutedCount++;
      } else {
        activeFrets.push(frettedStrings[i].fret);
        activeSemitones.push(frettedStrings[i].semitone);
        activeNonChordTones.push(frettedStrings[i].nonChordTone || false);
      }
    }

    const frettedFrets = activeFrets.filter(f => f > 0);
    const span = frettedFrets.length > 0
      ? Math.max(...frettedFrets) - Math.min(...frettedFrets)
      : 0;

    if (span > (w.maxStretch || this.maxSpan)) return -1000;

    let score = 0;

    score -= mutedCount * 8;

    const chordToneSemitones = activeSemitones.filter((s, i) => !activeNonChordTones[i]);
    const allSemitones = [...chordToneSemitones];
    if (droneFret !== null && droneFret >= 0) allSemitones.push(tuning.openSemitones[0]);
    const uniqueTones = new Set(allSemitones.filter(s => chordSemitones.includes(s)));
    score += uniqueTones.size * w.coverage;
    if (uniqueTones.size === chordSemitones.length) score += w.completeness;

    for (let i = 0; i < numFretted; i++) {
      if (frettedStrings[i].muted) continue;
      const fret = frettedStrings[i].fret;
      const nonChordTone = frettedStrings[i].nonChordTone || false;
      if (fret === 0 && !nonChordTone) {
        score += w.openString;
      } else if (fret === 0 && nonChordTone) {
        score += w.openNonChordTone;
      } else if (fret > 0 && chordSemitones.includes(tuning.openSemitones[i + frettedOffset])) {
        score -= w.openString * 0.5;
      }
    }

    score += activeNonChordTones.filter(Boolean).length * w.wrongNote;

    if (position === 0) {
      score += activeFrets.reduce((a, b) => a + b, 0) * w.effort;
      const maxFret = activeFrets.length > 0 ? Math.max(...activeFrets) : 0;
      if (maxFret > 5) score += (maxFret - 5) * w.highFretEffort;
    } else {
      for (const f of frettedFrets) {
        score += Math.abs(f - position) * w.positionTight;
        if (w.orientation) score += (f - position) * w.orientation;
      }
    }

    score += span * w.stretch;

    const frettedPositions = activeFrets.map((f, i) => ({ fret: f, idx: i })).filter(p => p.fret > 0);
    for (let i = 1; i < frettedPositions.length; i++) {
      const gap = Math.abs(frettedPositions[i].fret - frettedPositions[i - 1].fret);
      if (gap > 2) score += gap * w.fingerGap;
    }

    if (w.doubledNote) {
      const pitchCounts = {};
      for (let i = 0; i < activeSemitones.length; i++) {
        if (!activeNonChordTones[i]) pitchCounts[activeSemitones[i]] = (pitchCounts[activeSemitones[i]] || 0) + 1;
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
