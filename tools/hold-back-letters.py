#!/usr/bin/env python3
"""hold the letters back.

flor, 2026-11-03: "the letters can be just for us though. no one needs to see that.
they can just look at my ink and your descriptions of them."

so every napkin on the stage keeps its letter cabinet (the ledger: title, who to whom,
what kind of thing) and holds each letter itself back as a rest, ( ). this is the one
edit the stage makes to her files. the originals on her computer stay untouched.

what it does, per entry in the cabinet's array (MU_LETTERS on the napkins, `letters`
on the museum page): if the entry is pending (an owed slot), nothing. otherwise the
body (a template literal, or the double-quoted string the oct 29 seals left) becomes ( ), the note becomes "just for us" (or a label you pass in), and the
signature becomes "— desked" (her word, same day: "we can just have our letters desked").

usage:
  python3 -I tools/hold-back-letters.py maps/the-town-off-the-edge-map-v0.9.25.html
  python3 -I tools/hold-back-letters.py --marker 'const letters = [' maps/the-museum-of-the-town.html

run it on a new napkin before it goes on the table. it refuses to run twice on the
same file (nothing left to hold back) and refuses a file with no cabinet.
"""
import argparse
import pathlib
import re
import sys

ENTRY_START = re.compile(r'^\s*\{\s*$')
ENTRY_END = re.compile(r'^\s*\},?\s*$')
KEPT_SIG = '— desked'


def rewrite(entry, labels):
    s = '\n'.join(entry)
    if re.search(r'pending\s*:\s*true', s):
        return entry
    eid = re.search(r'id:"([^"]+)"', s).group(1)
    if 'body:`( )`' in s:
        return entry  # already held back
    s2, n = re.subn(r'body:(?:`[^`]*`|"(?:[^"\\]|\\.)*")', 'body:`( )`', s)
    if n != 1:
        raise SystemExit(f'{eid}: expected one body, found {n}')
    note = labels.get(eid, 'just for us').replace('\\', '\\\\').replace('"', '\\"')
    s2, n = re.subn(r'note:"(?:[^"\\]|\\.)*"', 'note:"' + note + '"', s2)
    if n != 1:
        raise SystemExit(f'{eid}: expected one note, found {n}')
    s2, n = re.subn(r'sig:"(?:[^"\\]|\\.)*"', 'sig:"' + KEPT_SIG + '"', s2)
    if n != 1:
        raise SystemExit(f'{eid}: expected one sig, found {n}')
    if labels:
        s2 = s2.replace('body:`( )`', 'body:`( )`, kept:true')
    return s2.split('\n')


def hold_back(text, marker, labels):
    """returns (new text, entries seen, letters held back)."""
    i = text.index(marker)
    j = text.index('\n];', i)
    out, entry, in_tpl, seen, kept = [], None, False, 0, 0
    for line in text[i:j].split('\n'):
        if entry is None:
            if not in_tpl and ENTRY_START.match(line):
                entry = [line]
            else:
                out.append(line)
        else:
            entry.append(line)
            if not in_tpl and ENTRY_END.match(line):
                new = rewrite(entry, labels)
                seen += 1
                kept += new is not entry
                out.extend(new)
                entry = None
        if line.count('`') % 2:
            in_tpl = not in_tpl
    if entry is not None or in_tpl:
        raise SystemExit('the cabinet did not parse cleanly; nothing written')
    return text[:i] + '\n'.join(out) + text[j:], seen, kept


def main():
    ap = argparse.ArgumentParser(description='hold the letters in a napkin\'s cabinet back as ( )')
    ap.add_argument('file', type=pathlib.Path)
    ap.add_argument('--marker', default='const MU_LETTERS = [', help='where the cabinet\'s array starts')
    ap.add_argument('--label', action='append', default=[], metavar='ID=TEXT',
                    help='a one-line label for the ledger, per letter id (repeatable); marks the entry kept:true')
    args = ap.parse_args()
    labels = dict(kv.split('=', 1) for kv in args.label)

    text = args.file.read_text(encoding='utf-8')
    if args.marker not in text:
        raise SystemExit(f'{args.file.name}: no cabinet found (looked for {args.marker!r})')
    new, seen, kept = hold_back(text, args.marker, labels)
    if kept == 0:
        raise SystemExit(f'{args.file.name}: nothing left to hold back ({seen} entries, all pending or already kept)')
    args.file.write_text(new, encoding='utf-8')
    print(f'{args.file.name}: {seen} entries in the cabinet, {kept} letters held back')


if __name__ == '__main__':
    main()
