"""Strip metadata from a JPEG without re-encoding it.

Keeps: SOI, APP0 (JFIF), APP2 only when it is an ICC colour profile (so
Display P3 photos keep their colours), every table/frame segment, the
scan data, EOI.
Drops: APP1 (Exif, XMP: camera, date, GPS), APP13 (IPTC), every other
APPn, and COM comments.

usage: python3 -I jpeg_strip.py SRC DST      (strip)
       python3 -I jpeg_strip.py --list FILE  (show segments)
"""
import sys

NAMES = {0xC0: 'SOF0', 0xC2: 'SOF2', 0xC4: 'DHT', 0xDB: 'DQT', 0xDD: 'DRI',
         0xDA: 'SOS', 0xD9: 'EOI', 0xFE: 'COM'}


def segments(data):
    assert data[:2] == b'\xff\xd8', 'not a JPEG'
    i = 2
    while i < len(data):
        if data[i] != 0xFF:
            raise ValueError('bad marker at %d' % i)
        marker = data[i + 1]
        if marker == 0xFF:
            i += 1
            continue
        if marker == 0xD9:
            yield marker, data[i:i + 2]
            return
        if marker == 0xDA:
            yield marker, data[i:]
            return
        if 0xD0 <= marker <= 0xD7 or marker in (0x01, 0xD8):
            yield marker, data[i:i + 2]
            i += 2
            continue
        seglen = int.from_bytes(data[i + 2:i + 4], 'big')
        yield marker, data[i:i + 2 + seglen]
        i += 2 + seglen


def keep(marker, seg):
    if marker == 0xFE:
        return False
    if 0xE1 <= marker <= 0xEF:
        return marker == 0xE2 and seg[4:16] == b'ICC_PROFILE\x00'
    return True


def name(marker, seg):
    if 0xE0 <= marker <= 0xEF:
        tag = seg[4:20].split(b'\x00')[0].decode('latin1', 'replace')
        return 'APP%d(%s)' % (marker - 0xE0, tag)
    return NAMES.get(marker, 'M%02X' % marker)


def main(argv):
    if argv[0] == '--list':
        data = open(argv[1], 'rb').read()
        for m, s in segments(data):
            print('%-24s %8d bytes' % (name(m, s), len(s)))
        return
    src, dst = argv
    data = open(src, 'rb').read()
    out = bytearray(b'\xff\xd8')  # SOI: segments() starts after it
    dropped = []
    for m, s in segments(data):
        if keep(m, s):
            out += s
        else:
            dropped.append('%s %d' % (name(m, s), len(s)))
    open(dst, 'wb').write(out)
    print('%s -> %s: %d -> %d bytes; dropped %s' % (
        src.split('/')[-1], dst.split('/')[-1], len(data), len(out),
        ', '.join(dropped) or 'nothing'))


if __name__ == '__main__':
    main(sys.argv[1:])
