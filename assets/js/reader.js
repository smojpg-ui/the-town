// reader.js: the reading room.
// read.html?c=<slug> shows one chapter from content/<world>/world.json.

import * as prefs from './prefs.js';
import { loadWorld, loadChapter, listed } from './content.js';
import { render, figure, inline } from './markdown.js';
import { bindBackspace } from './backspace.js';
import { bindLamp } from './lamp.js';

const $ = (id) => document.getElementById(id);

prefs.apply();
bindLamp();
bindBackspace({ link: $('back'), erase: $('title') });
main();

async function main() {
  const article = $('chapter');
  try {
    const world = await loadWorld();
    const order = listed(world);
    const slug = new URLSearchParams(location.search).get('c') || order[0]?.slug;
    const chapter = await loadChapter(world, slug);
    show(world, chapter, order);
  } catch (err) {
    showError(err);
  } finally {
    article.removeAttribute('aria-busy');
  }
}

// --- showing a chapter -------------------------------------------------------

function show(world, ch, order) {
  const m = ch.meta;
  document.title = `${m.title} · ${world.title}`;
  $('title').textContent = m.title;
  setLine('hand', m.hand);
  setLine('sub', m.subtitle);
  if (m.status) document.body.dataset.status = m.status;

  $('prose').innerHTML = render(ch.body, { art: world.art });
  $('last-call').hidden = false;

  const plate = m.plate && world.art[m.plate];
  if (plate) $('plate').innerHTML = figure(plate);

  colophon(m);
  onward(ch, order);
  framesWaiting();
  redString();
}

function setLine(id, text) {
  const el = $(id);
  el.hidden = !text;
  if (text) el.innerHTML = inline(text);
}

function colophon(m) {
  const el = $('colophon');
  const parts = [];
  if (m.source) parts.push(`<p><span class="colophon-label">from</span> ${inline(m.source)}</p>`);
  if (m.note) parts.push(`<p><span class="colophon-label">a note from the desk</span> ${inline(m.note)}</p>`);
  el.hidden = !parts.length;
  el.innerHTML = parts.join('');
}

function onward(ch, order) {
  const nav = $('onward');
  const i = order.findIndex((c) => c.slug === ch.slug);
  const link = (c, rel) => {
    const tag = c.status === 'placeholder' ? ' <span class="mono">(placeholder)</span>' : '';
    return `<a href="read.html?c=${encodeURIComponent(c.slug)}" rel="${rel}">` +
      `<span class="onward-dir mono">${rel === 'prev' ? 'before this' : 'next'}</span>` +
      `<span class="onward-title">${inline(c.title)}${tag}</span></a>`;
  };
  const prev = i > 0 ? link(order[i - 1], 'prev') : '<a href="index.html"><span class="onward-dir mono">before this</span><span class="onward-title">the door</span></a>';
  const next = i >= 0 && i < order.length - 1
    ? link(order[i + 1], 'next')
    : '<p class="onward-edge"><span class="onward-dir mono">next</span><span class="onward-title">the road keeps going. not drawn yet.</span></p>';
  nav.innerHTML = prev + next;
  nav.hidden = false;
}

// A drawing whose file isn't in this copy of the stage becomes an empty, labeled frame.
function framesWaiting() {
  for (const img of document.querySelectorAll('.plate img')) {
    const empty = () => {
      const fig = img.closest('figure');
      if (fig.classList.contains('is-empty')) return;
      fig.classList.add('is-empty');
      img.hidden = true;
      const note = document.createElement('p');
      note.className = 'frame-note';
      note.innerHTML =
        '<span class="mono">a frame, waiting</span>' +
        `<span>${img.alt ? escapeText(img.alt) : 'a drawing hangs here.'}</span>` +
        '<span class="mono">the file isn’t in this copy of the stage yet.</span>';
      fig.prepend(note);
    };
    img.addEventListener('error', empty, { once: true });
    if (img.complete && img.naturalWidth === 0) empty();
  }
}

function escapeText(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// The red string along the top fills as you read down.
function redString() {
  const fill = document.querySelector('.string-fill');
  const article = $('chapter');
  let queued = false;
  const update = () => {
    queued = false;
    const r = article.getBoundingClientRect();
    const run = r.height - innerHeight;
    const p = run <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / run));
    fill.style.transform = `scaleX(${p})`;
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
}

function showError(err) {
  const local = location.protocol === 'file:';
  $('title').textContent = 'the words didn’t arrive';
  $('prose').innerHTML =
    `<aside class="box box-error" role="alert"><p class="box-title">couldn’t open this page</p>` +
    (local
      ? '<p>This file was opened straight from the folder, and browsers won’t let a page fetch its own words that way. ' +
        'Start the little server instead (see the README), then open <code>http://localhost:8737</code>.</p>'
      : err.code === 'missing'
        ? `<p>There’s no chapter by that name in the manifest. <a href="read.html">Go to the first one</a>, or back to <a href="index.html">the door</a>.</p>`
        : `<p>Something went wrong fetching the chapter (${escapeText(err.message)}). <a href="index.html">Back to the door</a>.</p>`) +
    '</aside>';
  console.error(err);
}
