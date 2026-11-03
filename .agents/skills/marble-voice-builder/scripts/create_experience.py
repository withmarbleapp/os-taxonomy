#!/usr/bin/env python3
"""Create a portable lesson package; use the shared Marble player to run it."""
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
        parser.error('Destination exists. Inspect and adapt it instead of overwriting work.')
    shutil.copytree(PLAYER / 'packages/authoring-tools/template', dest)
    print(f'Created lesson package: {dest}')
    print('Author its teaching guidance and model; validate and pack with the shared Marble CLI.')
    print('Import the .lesson file in Marble. This folder does not duplicate the runtime.')
if __name__ == '__main__':
    main()
