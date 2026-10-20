// lamp.js: the lamp, hung in every room.
// Light (follow my device / paper / night), text size where there's text to
// read, and the motion switch. The choice is remembered across the stage, so
// turning the lamp down in one room turns it down at the door too.

import * as prefs from './prefs.js';

export function bindLamp(lamp = document.getElementById('lamp')) {
  if (!lamp) return;

  const pick = (name, current, onChange) => {
    for (const r of lamp.querySelectorAll(`input[name="${name}"]`)) {
      r.checked = r.value === current;
      r.addEventListener('change', () => r.checked && onChange(r.value));
    }
  };
  pick('size', prefs.get('size') || 'normal', (v) => prefs.set('size', v === 'normal' ? null : v));
  pick('theme', prefs.get('theme') || 'auto', (v) => prefs.set('theme', v === 'auto' ? null : v));
  prefs.bindMotionToggle(lamp.querySelector('#motion-toggle'));

  const close = () => {
    lamp.open = false;
    lamp.querySelector('summary').focus();
  };
  lamp.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lamp.open) close();
  });
  document.addEventListener('click', (e) => {
    if (lamp.open && !lamp.contains(e.target)) lamp.open = false;
  });
}
