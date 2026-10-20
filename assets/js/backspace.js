// backspace.js: how you leave an inner room.
//
// You don't walk out. You leave through the backspace, one letter at a time,
// gentle, until you're just a cursor blinking where you stood. The ⌫ link in
// the rail does it, and so does the Backspace key (unless you're typing
// somewhere; keys pressed inside a map's own frame never reach this page).

import * as prefs from './prefs.js';

/**
 * @param {{ link: HTMLAnchorElement, erase?: HTMLElement | null }} opts
 *        link:  where leaving goes (its href)
 *        erase: the line of text that erases itself on the way out
 */
export function bindBackspace({ link, erase = null }) {
  let leaving = false;

  const leave = () => {
    if (leaving) return;
    leaving = true;
    const go = () => { location.href = link.href; };
    if (!erase || !prefs.motionOn()) return go();

    const text = erase.textContent;
    erase.dataset.text = text;
    erase.classList.add('is-erasing');
    let n = text.length;
    const step = Math.max(16, Math.min(45, 700 / Math.max(n, 1)));
    const tick = () => {
      n -= 1;
      erase.textContent = text.slice(0, Math.max(n, 0));
      if (n > 0) setTimeout(tick, step);
      else setTimeout(go, 420);
    };
    tick();
  };

  link.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!erase || !prefs.motionOn()) return;
    e.preventDefault();
    leave();
  });

  addEventListener('keydown', (e) => {
    if (e.key !== 'Backspace' || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    const t = e.target;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    e.preventDefault();
    leave();
  });

  // coming back with the browser's own back button: put the words back
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    if (erase?.dataset.text) erase.textContent = erase.dataset.text;
    erase?.classList.remove('is-erasing');
    leaving = false;
  });
}
