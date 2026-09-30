"""Rebuild every combined spec document from its numbered part files.

The part files (NAME.part1.md, NAME.part2.md, ...) are canonical. This script
joins them in numeric order into NAME.md with a single header comment and a
horizontal rule between parts, normalising line endings to LF.

Usage:  python spec/_tools/reassemble.py [--check]
  --check  only report which combined files are out of date (exit 1 if any)
"""
import glob
import os
import re
import sys

SPEC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_PREFIXES = ('directions' + os.sep, '_')


def part_key(path):
    return int(re.search(r'\.part(\d+)\.md$', path).group(1))


def build(base):
    parts = sorted(glob.glob(base + '.part*.md'), key=part_key)
    chunks = []
    for p in parts:
        with open(p, encoding='utf-8') as f:
            text = f.read().replace('\r\n', '\n').strip('\n')
        # drop a leading/trailing rule inside a part so we never emit two in a row
        text = re.sub(r'\A---\n+', '', text)
        text = re.sub(r'\n+---\Z', '', text)
        chunks.append(text)
    names = ', '.join(os.path.basename(p) for p in parts)
    header = f'<!-- Assembled from {names}. The part files are canonical: edit them, then run spec/_tools/reassemble.py. -->'
    return header + '\n\n' + '\n\n---\n\n'.join(chunks) + '\n'


def main():
    check = '--check' in sys.argv
    os.chdir(SPEC)
    bases = sorted({re.sub(r'\.part\d+\.md$', '', p) for p in glob.glob('**/*.part*.md', recursive=True)})
    stale = []
    for b in bases:
        if b.startswith(SKIP_PREFIXES):
            continue
        new = build(b)
        target = b + '.md'
        old = open(target, encoding='utf-8').read().replace('\r\n', '\n') if os.path.exists(target) else ''
        if old != new:
            stale.append(target)
            if not check:
                with open(target, 'w', encoding='utf-8', newline='\n') as f:
                    f.write(new)
        print(('STALE ' if old != new else 'ok    ') + target + ('' if check or old == new else '  -> rebuilt'))
    if check and stale:
        sys.exit(1)


if __name__ == '__main__':
    main()
