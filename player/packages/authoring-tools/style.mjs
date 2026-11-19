// Notes on where a lesson's 3D code leaves Marble's shared look. These are
// advice printed by `validate`, never failures: a lesson may have a reason.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const stageFile = fileURLToPath(new URL('../lesson-sdk/stage.mjs', import.meta.url));
const hex = /#[0-9a-fA-F]{6}\b/g;

async function palette() {
  const source = await readFile(stageFile, 'utf8');
  const start = source.indexOf('export const PALETTE');
  return new Set(source.slice(start, source.indexOf('};', start)).match(hex).map((c) => c.toLowerCase()));
}

// `files` maps a package path to its text. Returns a list of plain sentences.
export async function styleNotes(files) {
  const notes = [],
    known = await palette();
  const scripts = Object.entries(files).filter(([path]) => /\.(mjs|js)$/.test(path) && !/(^|\/)vendor\//.test(path));
  const uses3D = scripts.some(([, text]) => /\bTHREE\b|three\.module/.test(text));
  if (!uses3D) return notes;
  if (Object.keys(files).some((path) => /three(\.module|\.core)?(\.min)?\.js$/.test(path)))
    notes.push('The package carries its own three.js. Take THREE from /sdk/stage.mjs so the shared stage can draw the scene.');
  for (const [path, text] of scripts) {
    if (/new\s+THREE\.WebGLRenderer/.test(text))
      notes.push(`${path} makes its own renderer. createStage from /sdk/stage.mjs gives the shared shading, outlines and backdrop.`);
    const materials = [...new Set(text.match(/Mesh(Standard|Lambert|Phong|Physical|Toon)Material/g) ?? [])];
    if (materials.length)
      notes.push(`${path} uses ${materials.join(', ')}. Use toon() for surfaces and flat() for light and marks.`);
    if (!/\/sdk\/stage\.mjs/.test(text)) continue;
    const odd = [...new Set((text.match(hex) ?? []).map((c) => c.toLowerCase()))].filter((c) => !known.has(c));
    if (odd.length > 6)
      notes.push(`${path} uses ${odd.length} colours outside PALETTE (${odd.slice(0, 6).join(', ')}, …). A few are expected; many means the scene is drifting from the shared palette.`);
  }
  return notes;
}
