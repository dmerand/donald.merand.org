---
layout: post
title: Scale Visualizer Now Supports Mandolin and Banjo
category: projects
---

I've updated the [unified scale pattern visualizer](/projects/2025/01/11/unified-guitar-scale-pattern-visualizer.html) with new instruments. Mandolin is tuned in fifths, so the patterns look quite different from guitar. I added a 12-string perfect-fifths tuning to visualize the full 7-string repeating pattern when using 4 note-per-string scales on mandolin. I also added open G and open C banjo because good resources for C-tuned banjo are surprisingly hard to find. The algorithm now picks the right octave automatically based on the tuning, so everything just works. [Give it a try.](/projects/2025/01/11/unified-guitar-scale-pattern-visualizer.html)

The [chord finder](/projects/2026/04/07/mini-banjo-chord-transposer.html) has also been updated — it now supports inversions with slash chord notation (C/E, G/B), position-based voicing anchored to where the bass note sits on the neck, and guitar alongside banjo and mandolin. The voicing algorithm is the same search, just with more knobs to turn.
