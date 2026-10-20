// doorway.js: the napkin's small live bits.
// Everything here is optional; with JavaScript off the door still opens.

import * as prefs from './prefs.js';

prefs.apply();
prefs.bindMotionToggle(document.getElementById('motion-toggle'));

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
