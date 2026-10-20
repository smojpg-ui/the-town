// doorway.js: the napkin's small live bits.
// Everything here is optional; with JavaScript off the door still opens.

import * as prefs from './prefs.js';
import { bindLamp } from './lamp.js';

prefs.apply();
bindLamp();

// drawn fresh every visit: the pen skips somewhere new each time the door is
// opened, the way a hand never draws the same line twice. (Her lighthouse is
// brushed like this.) The lake is the one exception: nobody redraws the lake.
// Without JavaScript, the strokes keep the fixed skips set in doorway.css.
//
// gaps are measured end to end, and round brush-ends eat about one stroke-width
// of each, so every gap starts a little wider than it looks
const HANDS = [
  { sel: '.door-frame',       dash: [24, 92], gap: [4.5, 8.5] },
  { sel: '.door-sill',        dash: [16, 50], gap: [5, 9] },
  { sel: '.creek-line path',  dash: [10, 28], gap: [5, 8] },
  { sel: '.road path',        dash: [7, 24],  gap: [6, 12], pairs: 9 }, // screen-space dashes; a short repeat is enough
];

const between = ([lo, hi]) => lo + Math.random() * (hi - lo);

function skips({ dash, gap, pairs }, length) {
  const out = [];
  let run = 0;
  while (pairs ? out.length < pairs * 2 : run < length) {
    const d = between(dash);
    // now and then the pen lifts a little longer
    const g = Math.random() < 0.15 ? between([gap[1], gap[1] * 1.6]) : between(gap);
    out.push(d.toFixed(1), g.toFixed(1));
    run += d + g;
  }
  return out.join(' ');
}

function redraw() {
  for (const hand of HANDS) {
    for (const stroke of document.querySelectorAll(hand.sel)) {
      const length = stroke.getTotalLength?.() || 400;
      stroke.style.strokeDasharray = skips(hand, length);
      stroke.style.strokeDashoffset = (Math.random() * 40).toFixed(1);
    }
  }
}

redraw();
// coming back to the door with the browser's back button is a new visit too
addEventListener('pageshow', (e) => { if (e.persisted) redraw(); });

// the creek: press it and one more note goes uphill
const creek = document.querySelector('.creek');
const bed = creek?.querySelector('.creek-bed');
const says = document.getElementById('creek-says');

creek?.addEventListener('click', () => {
  const note = document.createElement('span');
  note.className = 'do do-extra';
  note.textContent = 'do';
  bed.append(note);
  setTimeout(() => note.remove(), prefs.motionOn() ? 3400 : 1400);

  // clear then set, so pressing twice is announced twice
  says.textContent = '';
  requestAnimationFrame(() => { says.textContent = 'do, do, do.'; });
});
