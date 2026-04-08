/**
 * SVG chord diagram renderer
 * Produces vertical fretboard diagrams for 5-string banjo
 */

class ChordDiagramRenderer {
  constructor() {
    this.config = {
      stringSpacing: 28,
      fretSpacing: 32,
      numFrets: 5,
      numStrings: 5,
      topMargin: 58,
      bottomMargin: 24,
      leftMargin: 36,
      rightMargin: 18,
      dotRadius: 10,
      indicatorRadius: 7,
      nutWidth: 5,
      titleFontSize: 20,
    };
  }

  get diagramWidth() {
    const c = this.config;
    return c.leftMargin + (c.numStrings - 1) * c.stringSpacing + c.rightMargin;
  }

  get diagramHeight() {
    const c = this.config;
    return c.topMargin + c.numFrets * c.fretSpacing + c.bottomMargin;
  }

  render(voicing, chordName, tuningNotes) {
    const c = this.config;
    const w = this.diagramWidth;
    const h = this.diagramHeight;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `${chordName} chord diagram`);

    const frettedFrets = voicing.frets.filter(f => f > 0);
    const minFret = frettedFrets.length > 0 ? Math.min(...frettedFrets) : 0;
    const maxFret = frettedFrets.length > 0 ? Math.max(...frettedFrets) : 0;

    let startFret = 1;
    if (maxFret > c.numFrets) {
      startFret = Math.max(1, minFret);
      if (maxFret - startFret >= c.numFrets) {
        startFret = maxFret - c.numFrets + 1;
      }
    }
    const atNut = startFret === 1;

    // Chord name title
    svg.appendChild(this.svgText(w / 2, 16, chordName, {
      fontSize: c.titleFontSize, fontWeight: 'bold', textAnchor: 'middle',
    }));

    // Fretboard geometry
    const fretboardTop = c.topMargin;
    const fretboardLeft = c.leftMargin;
    const fretboardWidth = (c.numStrings - 1) * c.stringSpacing;

    // Fret lines
    for (let i = 0; i <= c.numFrets; i++) {
      const y = fretboardTop + i * c.fretSpacing;
      svg.appendChild(this.svgLine(fretboardLeft, y, fretboardLeft + fretboardWidth, y, {
        stroke: '#333',
        strokeWidth: i === 0 && atNut ? c.nutWidth : 1,
      }));
    }

    // String lines
    for (let i = 0; i < c.numStrings; i++) {
      const x = fretboardLeft + i * c.stringSpacing;
      svg.appendChild(this.svgLine(x, fretboardTop, x, fretboardTop + c.numFrets * c.fretSpacing, {
        stroke: '#333',
        strokeWidth: i === 0 ? 1.5 : 1,
      }));
    }

    // Fret numbers on the left
    for (let i = 0; i < c.numFrets; i++) {
      const y = fretboardTop + (i + 0.5) * c.fretSpacing + 5;
      svg.appendChild(this.svgText(
        fretboardLeft - 16, y,
        String(startFret + i),
        { fontSize: 11, textAnchor: 'middle', fill: '#999' }
      ));
    }

    // Indicator Y position: vertically centered between title and nut
    const indicatorY = fretboardTop - c.indicatorRadius - 6;

    // Open / muted indicators and finger dots
    for (let s = 0; s < c.numStrings; s++) {
      const x = fretboardLeft + s * c.stringSpacing;
      const fret = voicing.frets[s];

      if (fret === -1) {
        const r = c.indicatorRadius * 0.7;
        const cx = x;
        const cy = indicatorY;
        svg.appendChild(this.svgLine(cx - r, cy - r, cx + r, cy + r, {
          stroke: '#666', strokeWidth: 2,
        }));
        svg.appendChild(this.svgLine(cx - r, cy + r, cx + r, cy - r, {
          stroke: '#666', strokeWidth: 2,
        }));
      } else if (fret === 0) {
        svg.appendChild(this.svgCircle(x, indicatorY, c.indicatorRadius, {
          fill: 'none', stroke: '#333', strokeWidth: 1.5,
        }));
      } else {
        const displayFret = fret - startFret + 1;
        if (displayFret >= 1 && displayFret <= c.numFrets) {
          const y = fretboardTop + (displayFret - 0.5) * c.fretSpacing;
          svg.appendChild(this.svgCircle(x, y, c.dotRadius, {
            fill: '#333', stroke: 'none',
          }));
          svg.appendChild(this.svgText(x, y + 4, voicing.notes[s], {
            fontSize: 11, textAnchor: 'middle', fill: '#fff', fontWeight: 'bold',
          }));
        }
      }
    }

    // String labels at bottom
    for (let s = 0; s < c.numStrings; s++) {
      const x = fretboardLeft + s * c.stringSpacing;
      svg.appendChild(this.svgText(
        x, fretboardTop + c.numFrets * c.fretSpacing + 18,
        tuningNotes[s],
        { fontSize: 12, textAnchor: 'middle', fill: '#999' }
      ));
    }

    return svg;
  }

  svgLine(x1, y1, x2, y2, attrs = {}) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    for (const [key, val] of Object.entries(attrs)) {
      line.setAttribute(key === 'strokeWidth' ? 'stroke-width' : key, val);
    }
    return line;
  }

  svgCircle(cx, cy, r, attrs = {}) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    for (const [key, val] of Object.entries(attrs)) {
      circle.setAttribute(key === 'strokeWidth' ? 'stroke-width' : key, val);
    }
    return circle;
  }

  svgText(x, y, text, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.textContent = text;
    const attrMap = {
      fontSize: 'font-size', fontWeight: 'font-weight',
      textAnchor: 'text-anchor', strokeWidth: 'stroke-width',
    };
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(attrMap[key] || key, val);
    }
    return el;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChordDiagramRenderer;
}
