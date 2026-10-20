// content.js: where the words come from.
//
// One world per folder under content/. A page names its world on <html>
// (data-world="town"); nothing in one world's folder is ever read by another.

import { frontMatter } from './markdown.js';

export const WORLD = document.documentElement.dataset.world || 'town';
const base = `content/${WORLD}/`;

async function fetchText(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw Object.assign(new Error(`${res.status} fetching ${path}`), { code: 'fetch' });
  return res.text();
}

/** The world's manifest: chapter order, the art registry, the established elements. */
export async function loadWorld() {
  const world = JSON.parse(await fetchText(base + 'world.json'));
  world.chapters ??= [];
  world.art ??= {};
  return world;
}

/** Chapters that appear in the reading order (drafts and samples set "listed": false). */
export const listed = (world) => world.chapters.filter((c) => c.listed !== false);

/** One chapter: its manifest entry, its front matter, its body text. */
export async function loadChapter(world, slug) {
  const entry = world.chapters.find((c) => c.slug === slug);
  if (!entry) throw Object.assign(new Error(`no chapter called "${slug}"`), { code: 'missing' });
  const { meta, body } = frontMatter(await fetchText(base + entry.file));
  return { ...entry, meta: { title: entry.title, status: entry.status, ...meta }, body };
}
