# assets/art

Drawings, paintings, and photographs of finished pieces.

**Nothing in this folder is committed except this README.** The `.gitignore` keeps the art out of git until its artist says yes, piece by piece. Once something is committed it stays in the history, and pushing to a public repo publishes it.

## adding a piece

1. Make a web-sized copy. The originals straight off a phone are 4 to 5 MB; about 1600px on the long side is plenty. On a Mac:
   ```
   sips -Z 1600 -s format jpeg -s formatOptions 78 "original.jpeg" --out assets/art/name.jpg
   ```
   (`sips` keeps some photo metadata. If a photo might carry a location, strip it before it goes anywhere public.)
2. Register it in `content/<world>/world.json` under `"art"`, with `alt` text (what's actually in the picture), a `caption`, a `credit`, and a `permission` line saying who said yes and when.
3. Use it in a chapter with `![](art:name)`, or hang it after the period with `plate: name` in the chapter's front matter.
4. When the artist says it can be published, un-ignore it in `.gitignore` (`!assets/art/name.jpg`) and commit.

If a file is missing, the reading room shows an empty, labeled frame instead of a broken image. A fresh clone of this repo shows empty frames on purpose.

## collaborators

When other hands come in (illustration, animation), every piece gets its own `credit` and `permission` in `world.json`. Work-for-hire, licensing, and who keeps what are decisions for Flor and the collaborator, not for this repo.
