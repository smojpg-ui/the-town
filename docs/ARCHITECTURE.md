# architecture

A static site: plain HTML, CSS, and a few small ES modules. No framework, no build step, no package manager, and nothing to install. The only outside request is Google Fonts.

## the rules it's built on

1. **Her files are never edited here.** The napkins in `maps/` are copies of hers; the stage frames them and doesn't touch them. One exception, at her ask (2026-10-29): her letters are sealed in every napkin, so the envelopes show and the letters don't (APPROVALS 31). Chapter text keeps her typos. Where something is held back, it's marked (`( )`), not silently cut.
2. **Words and pictures live in `content/` and `maps/`. Code lives in `assets/`.** Adding a napkin or a chapter is a file and a line in a JSON list, never a code change.
3. **One world per folder (borders).** The town's words are in `content/town/` and its look is in `assets/css/worlds/town.css`. A page names its world on `<html data-world="town">`, and the scripts only ever read that world's folder. `base.css` and the JS modules are world-neutral furniture: rails, motion switches, a Markdown reader. They carry no places, people, or motifs.
4. **It works without the extras.** No JavaScript: the door still opens and the napkin still loads. Reduced motion: everything holds still. Storage blocked: the default settings apply.

## how a page loads

```
<head>
  inline script ── reads saved settings (theme, size, motion) and sets them on <html>
                   before first paint, so nothing flashes
  worlds/town.css ─ tokens: the napkin's palette and type
  base.css ──────── shared: reset, focus, motion switch, the rail, popovers
  <room>.css
  <room>.js ─────── a module; imports prefs.js / content.js / markdown.js / backspace.js as needed
```

| module | job |
|---|---|
| `prefs.js` | theme, text size, motion. `localStorage` is used only as a convenience (`stage.prefs.v1`) |
| `content.js` | fetches `content/<world>/world.json` and chapter files |
| `markdown.js` | a small, safe Markdown subset (everything is escaped first; no raw HTML) |
| `backspace.js` | leaving a room: the ⌫ link or the Backspace key erases a line letter by letter, then goes |
| `lamp.js` | the lamp in every room: light, text size (where there's reading), motion |
| `doorway.js`, `map.js`, `reader.js` | one per room |

## the map room

`map.html` lays a napkin in a full-height `<iframe>` under a thin rail. A frame is the right tool here:

- Each napkin is a complete, self-contained page with its own scripts, layers, and saved state. A frame lets it run exactly as Flor made it, with nothing of the stage leaking in.
- Keys pressed inside the napkin (the typo garden takes typing) stay inside it. The stage's Backspace shortcut only listens on the rail.
- Links inside a napkin (the museum) navigate within the frame. The museum's link back to `the-town-off-the-edge-map.html` works because the current napkin keeps that exact filename.

All napkins share one origin, so **they share `localStorage`**. The older napkins use the same keys as the newer ones (stamps sent, rindu, the wonder machine), so state carries between them. That's probably fine (it's one town), but it's worth knowing.

## the reading room (built, closed)

`read.html?c=<slug>` → `world.json` (reading order, titles, art registry) → `chapters/<slug>.md` (front matter + text) → rendered. Drafts and samples set `"listed": false`. The red string along the top fills as you read; a single period ends every piece; art named in `plate:` hangs after it; a missing image becomes an empty, labeled frame. Nothing links to it yet.

## room left for later (accommodated, not built)

| later | where it goes | what's already in place |
|---|---|---|
| **Art and animation with collaborators** (Grey/Lumi) | `assets/art/` for stills; an `assets/anim/` folder for animation files (SVG, CSS, video, Lottie) when there are any | Every art entry in `world.json` carries `credit` and `permission`. Ambient motion already has one on/off switch (`data-motion`). A napkin can be replaced wholesale by a newer one without touching the stage. |
| **Wattpad** (the finalized opening) | `content/town/chapters/` | Chapters are plain Markdown, so the same file the reading room shows can be pasted into Wattpad's editor. Wattpad has no Markdown import, so italics need re-applying by hand, or a small export script later. |
| **Kickstarter** | its own page (e.g. `campaign.html`) or an external link from the doorway | Nothing structural needs to change. Where its door goes on the napkin is a creative call, not a technical one. |
| **GLITCH** | `content/glitch/`, `assets/css/worlds/glitch.css`, its own doorway page with `data-world="glitch"` | Content loading is already keyed by world. GLITCH gets its own palette and folder and reads nothing of the town's, and the town reads nothing of GLITCH's. If the worlds ever cross, Flor opens that door. |

## known limits

- **Local viewing needs a server** (`python3 -m http.server`), because the pages fetch their content. GitHub Pages is a server, so nothing changes there.
- **Google Fonts** is the one third-party request. Self-hosting the three families in `assets/fonts/` would remove it.
- **Page-to-page crossfades** use cross-document View Transitions (recent Chrome, Edge, and Safari); other browsers just navigate. Rapid navigation logs a harmless "transition was skipped" in the console.
- **Size.** The drawer holds about 6 MB of napkins. Only the one on the table loads.
