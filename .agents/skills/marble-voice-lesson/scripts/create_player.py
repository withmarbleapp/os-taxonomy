#!/usr/bin/env python3
"""Export a clean portable player starter from the authoritative repo source."""
import argparse
from pathlib import Path
import shutil
from player_source import PLAYER

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    dest = args.destination.expanduser().resolve()
    if dest.exists():
        parser.error('Destination exists; inspect and update it instead.')
    dest.mkdir(parents=True)
    ignore = shutil.ignore_patterns('node_modules', '__pycache__', '*.pyc', '.env*', '.data', 'artifacts', 'dist', '*.jsonl', '*.wav')
    for name in ['apps', 'packages', 'lessons', 'docs', 'scripts', 'test']:
        shutil.copytree(PLAYER / name, dest / name, ignore=ignore)
    for name in ['package.json', 'package-lock.json', 'README.md']:
        shutil.copy2(PLAYER / name, dest / name)
    print(f'Exported {dest}')
    print('Run npm ci, then npm start (desktop) or npm run dev (browser).')
    print('Configure a tutor connection and local voice in Settings. See README.md.')

if __name__ == '__main__':
    main()
