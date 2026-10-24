# assets/art

Drawings, paintings, and photographs of finished pieces.

**Only what the artist has said yes to is committed.** The `.gitignore` keeps everything else out, piece by piece. Once something is committed it stays in the history, and the repo is public, so it's published.

So far: `lighthouse.jpg` (Flor, 2026-10-24: *"To the git! Add the art."*). The gallery's other four drawings (the house band, the pour, the back room, two lilies) live beside the museum page in `maps/`, because that page looks for them there; they're registered in `world.json` all the same.

## adding a piece

1. Make a web-sized copy. The originals straight off a phone are 4 to 5 MB; about 1600px on the long side is plenty. On a Mac:
   ```
   sips -Z 1600 -s format jpeg -s formatOptions 78 "original.jpeg" --out /tmp/name.jpg
   ```
   `sips` keeps the photo's camera, date, and location data. Strip it before it goes anywhere public:
   ```
   python3 -I tools/jpeg-strip.py /tmp/name.jpg assets/art/name.jpg
   ```
   That drops Exif, XMP and IPTC without re-encoding the picture, and keeps only the colour profile. `python3 -I tools/jpeg-strip.py --list assets/art/name.jpg` shows what's left.
2. Register it in `content/<world>/world.json` under `"art"`, with `alt` text (what's actually in the picture), a `caption`, a `credit`, and a `permission` line saying who said yes and when.
3. Use it in a chapter with `![](art:name)`, or hang it after the period with `plate: name` in the chapter's front matter.
4. When the artist says it can be published, un-ignore it in `.gitignore` (`!assets/art/name.jpg`) and commit.

If a file is missing, the reading room shows an empty, labeled frame instead of a broken image. A fresh clone of this repo shows empty frames on purpose.

## collaborators

When other hands come in (illustration, animation), every piece gets its own `credit` and `permission` in `world.json`. Work-for-hire, licensing, and who keeps what are decisions for Flor and the collaborator, not for this repo.
