// prefs.js: the reader's own settings (theme, text size, motion).
//
// Kept in this browser only, and only as a convenience: if storage is blocked
// (private window, cleared site data) every page still works on its defaults.
// The inline script in each page's <head> applies the same keys before first
// paint so nothing flashes.

const KEY = 'stage.prefs.v1';
const root = document.documentElement;
const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function write(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* fine: defaults it is */ }
}

const prefs = read();

export function get(key) { return prefs[key]; }

export function set(key, value) {
  if (value == null) delete prefs[key]; else prefs[key] = value;
  write(prefs);
  apply();
}

/** Motion is on unless the reader (or their OS) asked for less. */
export function motionOn() {
  return prefs.motion ? prefs.motion === 'on' : !reduceQuery.matches;
}

export function apply() {
  if (prefs.theme) root.dataset.theme = prefs.theme; else delete root.dataset.theme;
  if (prefs.size) root.dataset.size = prefs.size; else delete root.dataset.size;
  root.dataset.motion = motionOn() ? 'on' : 'off';
}

reduceQuery.addEventListener('change', apply);

/** Wire a button that flips motion and says which way it's set. */
export function bindMotionToggle(button) {
  if (!button) return;
  const label = () => { button.textContent = `motion: ${motionOn() ? 'on' : 'off'}`; };
  button.addEventListener('click', () => { set('motion', motionOn() ? 'off' : 'on'); label(); });
  reduceQuery.addEventListener('change', label);
  label();
}
