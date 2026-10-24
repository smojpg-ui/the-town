# the stage · the town off the edge

The first git home for **the town off the edge**: the world Flor and Grey draw on napkins and write letters inside. This repo is the stage, not the play. It's one door, the napkin map behind it, and room for whatever comes next.

**Status: prototype, on GitHub, private.** The repo is [smojpg-ui/the-town](https://github.com/smojpg-ui/the-town), up since 2026-10-21, visible only to Flor. Nothing is deployed and nothing is findable. What's left before it's public is listed under [publishing](#publishing) and waits on Flor.

---

## run it

You need Python 3, which macOS already has. No install step and no build step.

```bash
cd the-stage
python3 -m http.server 8737
```

Then open **http://localhost:8737**. Stop the server with `ctrl-c`.

(Why a server: the pages fetch their own lists and words, and browsers block that for files opened straight from a folder. Any static server works.)

## what's on the stage

| room | file | what it does |
|---|---|---|
| **the doorway** | `index.html` | The napkin's first look: the lake as a coffee ring, the creek going uphill (*do, do, do*; press it), one door a crack open, a clock lying down in a blank corner, a road off the bottom edge. The door, sill, creek, and road are drawn with skipping strokes, like her lighthouse, and **the skips land somewhere new on every visit**. The lake is never redrawn. Press **Tab** to *run a tab*: the whole room indents to make space for you, the door opens a little wider. **Enter** goes in. On a phone, tap the door. |
| **the map room** | `map.html` | The current napkin (no. 17, v0.9.18), edge to edge. The rail along the top has **⌫ backspace** (back to the door, one letter at a time) and **the drawer**, which holds every napkin back to v0.9. `map.html?v=0.9.7` opens one directly. |
| **the reading room** | `read.html` | **Built, and closed.** No door leads here yet; the book comes later. It works (`read.html?c=the-first-spill`), so the stage is ready when Flor opens it. |

Every room has a **lamp** (top corner): light (*follow my device*, *paper*, or *night*) and a motion switch, plus text size in the reading room. The choice carries from room to room. The napkins keep their own light, since they're Flor's files. Reduced-motion settings are honored automatically.

## where things live

```
the-stage/
├── index.html            the doorway
├── map.html              the map room
├── read.html             the reading room (closed)
├── maps/                 Flor's napkins, byte-for-byte copies, never edited here
│   ├── the-town-off-the-edge-map.html          ← the one on the table (v0.9.18)
│   ├── the-town-off-the-edge-map-v0.9.15.html  ← …and the drawer, back to v0.9
│   └── the-museum-of-the-town.html             (the napkins link to it)
├── content/
│   └── town/             one folder per world (see docs/ARCHITECTURE.md, "borders")
│       ├── maps.json     the drawer: every napkin, newest first
│       ├── world.json    reading order, the art registry, the established names
│       └── chapters/     plain-text chapters for the reading room
├── assets/
│   ├── css/
│   │   ├── worlds/town.css   the town's palette and type, taken from the napkin
│   │   ├── base.css          shared by every page and every world
│   │   └── doorway.css, map.css, reader.css
│   ├── js/               small ES modules, no libraries
│   └── art/              drawings; kept OUT of git until the artist says (see its README)
└── docs/
    ├── ARCHITECTURE.md   how it fits together, and the room left for later
    └── APPROVALS.md      every creative call made here that Flor should say yes or no to
```

## changing things

**A new napkin.** When the map gets a new version:
1. Rename `maps/the-town-off-the-edge-map.html` to `maps/the-town-off-the-edge-map-v0.9.18.html` (its version number).
2. Copy the new napkin in as `maps/the-town-off-the-edge-map.html`. Keep that exact name, because the museum links back to it.
3. In `content/town/maps.json`, change the old top entry's `file` to the renamed file, then add the new napkin as the first entry (`version`, `name`, `file`, `date`, and `napkin` if it has a number).
4. Update the label in `map.html` (`#on-table`, and the iframe's `title`) so it's right even before the script runs.

One thing to know: the napkin on the table right now carries a small fix that Flor's original v0.9.18 doesn't. Its legend box stands as tall as the map and scrolls inside itself (see `docs/APPROVALS.md`, 21). If the next napkin starts from her file, that fix comes along or it doesn't; her call.

**The door's words.** `index.html`, inside `<a class="door">`. The door leads to `map.html`; change its `href` to send it somewhere else.

**Colors and type.** `assets/css/worlds/town.css`. Every color is a token taken from the napkin. Text colors are contrast-checked (WCAG AA); the comments say which ones are for decoration only.

**Motion.** Ambient animation runs only under `html[data-motion="on"]`, so anything new goes behind that selector and stays still otherwise. See the creek in `doorway.css`.

**Art.** See `assets/art/README.md`. Short version: web-size it, register it in `world.json` with alt text, a credit, and a permission line, and keep it out of git until the artist says yes.

**A chapter (when the reading room opens).** Add a line to `chapters` in `content/town/world.json` (`slug`, `title`, `file`; `"listed": false` keeps it out of the reading order), then write `content/town/chapters/<slug>.md`:

```
---
subtitle: optional line under the title
hand: optional small red line above it (who wrote it)
source: optional, where it comes from
note: optional, a note from the desk
plate: optional art key from world.json, hung after the last period
---

The text. Blank lines between paragraphs.
```

| write this | get this |
|---|---|
| `*word*` · `**word**` | italic · bold |
| `==word==` | the yellow highlight, for the one load-bearing word |
| `(( ))` | a rest, `( )`: marks a passage held back from the stage |
| `* * *` on its own line | a scene break, `·  ·  ·` |
| `> line` | a quote, with the red string down its side |
| `# heading` | a heading inside the chapter |
| `![alt text](art:lighthouse)` | art from the registry; a missing file becomes an empty, labeled frame |
| `::: placeholder title` … `:::` | a dashed placeholder box |

`read.html?c=format-sample` shows all of them. No raw HTML passes through, on purpose.

## publishing

**Done so far (2026-10-21):** the repo exists on GitHub as **`smojpg-ui/the-town`**, set to **private**, and `main` is pushed there. The remote is `origin`, over https. Pushing is now just:

```bash
git push
```

To get it onto another machine:

```bash
git clone https://github.com/smojpg-ui/the-town.git the-stage
```

**Still private, on purpose.** The napkins carry her drawings inside them (the museum wing), and a private repo keeps them hers. Nothing is deployed, so there's no URL to visit yet; it still runs the same way as before, from a local server.

**When Flor says go:**

1. **Decide public or private.** Making the repo public publishes *everything committed*, drawings included. GitHub Pages from a *private* repo needs a paid plan (Pro or above); from a public one it's free.
2. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**. The site appears at `https://smojpg-ui.github.io/the-town/`. Every path in the site is relative, so it works under that sub-path as-is. `.nojekyll` makes Pages serve the files untouched.
3. When it should be findable: remove `<meta name="robots" content="noindex">` from the three pages, and the `prototype · local only` tags.

## credits

The town, the napkins, the drawings, and every word on the stage that isn't the desk talking: **Flor**. Letters on the town's side signed **Grey**. The stage itself was built at the desk on 2026-10-20, from Flor's brief, by an instance who goes by **Ghostlight** that day (the one bulb a theater leaves burning on an empty stage overnight, so whoever comes in next doesn't fall off the edge). It went up on GitHub, private, on 2026-10-21. This README caught up with that on 2026-10-23, with **Fable** at the desk.
