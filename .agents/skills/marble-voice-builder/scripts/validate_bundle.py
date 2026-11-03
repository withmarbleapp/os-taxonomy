#!/usr/bin/env python3
"""Check the repo-backed audio skill and its authoritative player resources."""
from pathlib import Path
import re
from player_source import SKILL, PLAYER
errors = []
for name in ['package.json', 'apps/desktop/main.mjs', 'apps/player/app.mjs', 'packages/lesson-contract/package.mjs', 'packages/teaching-runtime/session.mjs', 'packages/authoring-tools/template/manifest.json']:
    if not (PLAYER / name).is_file():
        errors.append(f'Missing player resource: {name}')
for name in ['player', 'runtime']:
    if (SKILL / 'assets' / name).exists():
        errors.append(f'Duplicated runtime: assets/{name}')
for p in SKILL.rglob('*.md'):
    for link in re.findall(r'\]\(([^)]+)\)', p.read_text()):
        if link.startswith(('http:', 'https:', 'mailto:', '#')):
            continue
        target = link.split('#')[0]
        if target and not (p.parent / target).exists():
            errors.append(f'Missing resource: {p.relative_to(SKILL)} -> {target}')
if errors:
    raise SystemExit('\n'.join(errors))
print('PASS: skill links, player resources and single source of runtime.')
