// markdown.js: a small, safe Markdown subset for story text.
//
// No raw HTML passes through. Everything is escaped first, then a short list
// of marks is turned back on. The full list (and what each one looks like on
// the page) is in README.md, under "writing a chapter".

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

const isSafeHref = (href) => !/^\s*(javascript|data|vbscript):/i.test(href);

// (( )) : a rest. Marks a passage held back from the stage. Reads as ( ).
const HELD =
  '<span class="held" title="held back for now">' +
  '<span aria-hidden="true">( )</span><span class="sr-only">(a passage held back)</span>' +
  '</span>';

/** Split "---\nkey: value\n---" front matter off the top of a file. */
export function frontMatter(text) {
  const m = String(text).match(/^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return { meta: {}, body: String(text) };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (/^\s*(#|$)/.test(line)) continue;
    const i = line.indexOf(':');
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    else if (value === 'true' || value === 'false') value = value === 'true';
    meta[key] = value;
  }
  return { meta, body: String(text).slice(m[0].length) };
}

/** Inline marks inside a paragraph. */
export function inline(src) {
  const codes = [];
  return esc(src)
    .replace(/`([^`\n]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`)
    .replace(/\(\(\s*\)\)/g, HELD)
    .replace(/==(?=\S)([^=\n]+?)==/g, '<mark>$1</mark>')
    .replace(/\*\*(?=\S)([\s\S]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\\])\*(?=\S)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_, text, href) =>
      isSafeHref(href) ? `<a href="${href}">${text}</a>` : text)
    .replace(/(?: {2,}|\\)\n/g, '<br>\n')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}

/** A framed piece of art. Missing files become labeled empty frames (see reader.js). */
export function figure({ src, alt = '', caption = '', credit = '' }) {
  const safe = isSafeHref(src) ? src : '';
  const cap = [caption && inline(caption), credit && `<span class="credit">${esc(credit)}</span>`]
    .filter(Boolean).join(' ');
  return (
    `<figure class="plate">` +
    `<img src="${esc(safe)}" alt="${esc(alt)}" loading="lazy" decoding="async">` +
    (cap ? `<figcaption>${cap}</figcaption>` : '') +
    `</figure>`
  );
}

function box(kind, title, inner) {
  const label = title || kind;
  return (
    `<aside class="box box-${esc(kind)}" aria-label="${esc(label)}">` +
    `<p class="box-title">${inline(label)}</p>${inner}</aside>`
  );
}

/**
 * Block-level rendering.
 * @param {string} md
 * @param {{ art?: Record<string, object> }} opts  art registry from world.json,
 *        so a chapter can say ![](art:lighthouse) instead of a file path.
 */
export function render(md, opts = {}) {
  const art = opts.art || {};
  const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join('\n'))}</p>`);
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;

    if (!line.trim()) { flush(); continue; }

    // ::: kind optional title   …   :::
    if ((m = line.match(/^:::\s*([\w-]+)\s*(.*)$/))) {
      flush();
      const body = [];
      while (++i < lines.length && !/^:::\s*$/.test(lines[i])) body.push(lines[i]);
      out.push(box(m[1], m[2].trim(), render(body.join('\n'), opts)));
      continue;
    }

    // # heading (the chapter's own title comes from world.json, so # and ## are both h2)
    if ((m = line.match(/^(#{1,4})\s+(.+)$/))) {
      flush();
      const n = Math.max(2, m[1].length);
      out.push(`<h${n}>${inline(m[2])}</h${n}>`);
      continue;
    }

    // * * *  or  ---  : a scene break
    if (/^\s*(?:\*\s*){3,}$/.test(line) || /^\s*-{3,}\s*$/.test(line)) {
      flush();
      out.push('<hr class="rest">');
      continue;
    }

    // (( )) alone on a line: a held-back passage between paragraphs
    if (/^\s*\(\(\s*\)\)\s*$/.test(line)) {
      flush();
      out.push(`<p class="held-line">${HELD}</p>`);
      continue;
    }

    // ![alt](src "caption")  or  ![](art:key)
    if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/))) {
      flush();
      const [, alt, src, caption] = m;
      const entry = src.startsWith('art:') ? art[src.slice(4)] : null;
      out.push(entry ? figure({ ...entry, ...(alt && { alt }), ...(caption && { caption }) })
                     : figure({ src, alt, caption }));
      continue;
    }

    // > quote
    if (line.startsWith('>')) {
      flush();
      const inner = [];
      while (i < lines.length && lines[i].startsWith('>')) inner.push(lines[i++].replace(/^>\s?/, ''));
      i--;
      out.push(`<blockquote>${render(inner.join('\n'), opts)}</blockquote>`);
      continue;
    }

    para.push(line);
  }
  flush();
  return out.join('\n');
}
