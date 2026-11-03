"""Resolve the authoritative player source in the repository."""
from pathlib import Path
SKILL = Path(__file__).resolve().parents[1]
PLAYER = SKILL.parents[2] / 'player'
if not (PLAYER / 'packages/lesson-contract/package.mjs').is_file():
    raise RuntimeError('Use this skill from an os-taxonomy checkout containing player/.')
