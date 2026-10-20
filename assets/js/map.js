// map.js: the map room.
// map.html shows one napkin from content/<world>/maps.json in a frame;
// map.html?v=0.9.14 opens an older one from the drawer. The napkins themselves
// are Flor's files, untouched; this page only lays them on the table.

import * as prefs from './prefs.js';
import { WORLD } from './content.js';
import { bindBackspace } from './backspace.js';

const $ = (id) => document.getElementById(id);
const frame = $('napkin');
const onTable = $('on-table');
const drawer = $('drawer');

prefs.apply();
bindBackspace({ link: $('back'), erase: onTable });
main();

async function main() {
  let napkins;
  try {
    const res = await fetch(`content/${WORLD}/maps.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    ({ napkins } = await res.json());
  } catch (err) {
    // the frame already holds the current napkin; the drawer just stays shut
    console.error('the drawer is stuck:', err);
    drawer.hidden = true;
    return;
  }

  const wanted = new URLSearchParams(location.search).get('v');
  const current = napkins[0];
  const start = napkins.find((n) => n.version === wanted) || current;

  $('napkins').innerHTML = napkins.map((n) =>
    `<li><a href="map.html?v=${encodeURIComponent(n.version)}" data-v="${n.version}">` +
    `<span class="v">v${n.version}</span>` +
    `<span class="n">${escape(n.name || 'untitled')}${n === current ? ' <em>(on the table)</em>' : ''}</span>` +
    `<span class="d">${shortDate(n.date)}</span>` +
    `</a></li>`).join('');

  $('napkins').addEventListener('click', (e) => {
    const a = e.target.closest('a[data-v]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    lay(napkins.find((n) => n.version === a.dataset.v), current);
    drawer.open = false;
    drawer.querySelector('summary').focus();
  });

  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.open) {
      drawer.open = false;
      drawer.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (drawer.open && !drawer.contains(e.target)) drawer.open = false;
  });

  lay(start, current, { replace: true });
}

// put one napkin on the table
function lay(n, current, { replace = false } = {}) {
  const label = [n.napkin && `napkin no. ${n.napkin}`, `v${n.version}`, n.name].filter(Boolean).join(' · ');
  onTable.textContent = label;
  frame.title = `the napkin map, v${n.version}${n.name ? `: ${n.name}` : ''}`;
  if (!frame.src.endsWith(n.file)) frame.src = n.file;
  $('alone').href = n.file;
  document.body.classList.toggle('is-older', n !== current);

  for (const a of document.querySelectorAll('#napkins a')) {
    if (a.dataset.v === n.version) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }

  const url = n === current ? 'map.html' : `map.html?v=${encodeURIComponent(n.version)}`;
  if (replace) history.replaceState(null, '', url + location.hash);
  else history.pushState(null, '', url);
}

addEventListener('popstate', () => location.reload());

function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();
}

function escape(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
