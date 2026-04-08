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

  findBestVoicing(chordSemitones, rootSemitone, tuningKey, position = 0) {
    const tuning = this.tunings.get(tuningKey);

    const drone5open = tuning.openSemitones[0];
    const string5 = (position === 0 && chordSemitones.includes(drone5open)) ? 0 : -1;

    // Include open string as candidate even if not a chord tone (conventional compromise)
    const candidates = [];
    for (let s = 1; s <= 4; s++) {
      const stringCandidates = [];
      const openSemitone = tuning.openSemitones[s];
      if (position === 0) {
        if (!chordSemitones.includes(openSemitone)) {
          stringCandidates.push({ fret: 0, semitone: openSemitone, nonChordTone: true });
        }
      }
      for (let f = 0; f <= this.maxFret; f++) {
        if (position > 0 && f === 0) continue; // skip open strings for higher positions
        const semitone = (tuning.openSemitones[s] + f) % 12;
        if (chordSemitones.includes(semitone)) {
          stringCandidates.push({ fret: f, semitone, nonChordTone: false });
        }
      }
      candidates.push(stringCandidates);
    }

    let bestVoicing = null;
    let bestScore = -Infinity;

    const search = (stringIdx, current) => {
      if (stringIdx === 4) {
        const score = this.scoreVoicing(current, chordSemitones, rootSemitone, tuning, string5, position);
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

    search(0, new Array(4));

    if (!bestVoicing) {
      return {
        frets: [string5, 0, 0, 0, 0],
        notes: tuning.openNotes.slice(),
        muted: [string5 === -1, false, false, false, false],
      };
    }

    const frets = [string5, ...bestVoicing.map(c => c.fret)];
    const notes = [
      string5 >= 0 ? this.theory.semitoneToNote(drone5open) : null,
      ...bestVoicing.map(c => this.theory.semitoneToNote(c.semitone)),
    ];
    const muted = frets.map(f => f === -1);

    return { frets, notes, muted };
  }

  scoreVoicing(strings4to1, chordSemitones, rootSemitone, tuning, string5Fret, position = 0) {
    const frets = strings4to1.map(c => c.fret);
    const semitones = strings4to1.map(c => c.semitone);
    const nonChordTones = strings4to1.map(c => c.nonChordTone || false);

    // Fret span (exclude open strings)
    const frettedFrets = frets.filter(f => f > 0);
    const span = frettedFrets.length > 0
      ? Math.max(...frettedFrets) - Math.min(...frettedFrets)
      : 0;

    if (span > this.maxSpan) return -1000;

    let score = 0;

    // Chord tone coverage (only count actual chord tones)
    const chordToneSemitones = semitones.filter((s, i) => !nonChordTones[i]);
    const allSemitones = [...chordToneSemitones];
    if (string5Fret >= 0) allSemitones.push(tuning.openSemitones[0]);
    const uniqueTones = new Set(allSemitones.filter(s => chordSemitones.includes(s)));
    score += uniqueTones.size * 15;
    if (uniqueTones.size === chordSemitones.length) score += 20;

    // Root in bass (string 4, index 0) - modest bonus
    if (!nonChordTones[0] && semitones[0] === rootSemitone) score += 6;

    // Open string handling (only relevant for first position)
    if (position === 0) {
      for (let i = 0; i < 4; i++) {
        if (frets[i] === 0 && !nonChordTones[i]) {
          score += 10;
        } else if (frets[i] === 0 && nonChordTones[i]) {
          score -= 5;
        } else if (frets[i] > 0 && chordSemitones.includes(tuning.openSemitones[i + 1])) {
          score -= 8;
        }
      }
    }

    // Penalize non-chord tones
    const nctCount = nonChordTones.filter(Boolean).length;
    score -= nctCount * 6;

    if (position === 0) {
      // First position: prefer lower frets
      const totalFrets = frets.reduce((a, b) => a + b, 0);
      score -= totalFrets * 2;

      // Penalize high frets
      const maxFret = Math.max(...frets);
      if (maxFret > 5) score -= (maxFret - 5) * 5;
    } else {
      // Higher positions: prefer frets near the target position
      for (const f of frettedFrets) {
        score -= Math.abs(f - position) * 3;
      }
    }

    // Penalize span
    score -= span * 3;

    // Penalize large gaps between adjacent fretted strings (awkward hand positions)
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
