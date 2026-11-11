import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const json = p => JSON.parse(readFileSync(new URL(p, root)));
const report = json('reports/ontario-arts-staff-literacy-2026-11-11.json');
const scores = json('reports/assets/ontario-arts-staff/scores.json');
const svg = readFileSync(new URL('reports/assets/ontario-arts-staff/scores.svg', root), 'utf8');
function checkScores(scoreData, image) {
  const notes = [];
  const letterSteps = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  for (const [i, score] of scoreData.scores.entries()) {
    const [numerator, denominator] = score.time.split('/').map(Number);
    for (const bar of score.bars) {
      const duration = bar.reduce((sum, event) => sum + (event.quarters ?? event.quartersTotal ?? event.eighths / 2), 0);
      assert.equal(duration, numerator * 4 / denominator, `${score.id}: bar duration disagrees with metre`);
      for (const event of bar) for (const pitch of event.tripletPitches ?? (event.pitch ? [event.pitch] : [])) {
        const match = /^([A-G])#?(\d)$/.exec(pitch);
        assert.ok(match, `unsupported pitch ${pitch}`);
        const step = Number(match[2]) * 7 + letterSteps[match[1]];
        notes.push(155 + i * 160 - (step - 30) * 6);
      }
    }
  }
  const renderedY = [...image.matchAll(/<ellipse cx="[^"]+" cy="([^"]+)"/g)].map(m => Number(m[1]));
  assert.deepEqual(renderedY, notes, 'rendered staff pitches disagree with the event answer keys');
  const a = scoreData.scores.find(s => s.id === 'A');
  assert.equal(a.key, 'G major');
  assert.equal(a.bars[1][2].pitch, 'F4');
  assert.equal(a.bars[1][2].writtenAccidental, 'natural');
  assert.ok(a.bars[0].some(e => e.rest && e.quarters === 1));
  assert.match(image, /font-style="italic">mf<\/text>/, 'B declared dynamic must be displayed');
  return true;
}
test('original score notation and exact event keys remain consistent', () => checkScores(scores, svg));
test('a changed pitch or missing duration cannot silently drift from the score', () => {
  const wrongPitch = structuredClone(scores); wrongPitch.scores[0].bars[0][0].pitch = 'D4';
  assert.throws(() => checkScores(wrongPitch, svg), /rendered staff pitches/);
  const wrongDuration = structuredClone(scores); wrongDuration.scores[0].bars[0][0].quarters = 2;
  assert.throws(() => checkScores(wrongDuration, svg), /bar duration/);
});
test('new fixed staff claim retains its source bands and bounded contribution', () => {
  const topics = json('data/topics.json').topics;
  const topic = topics.find(t => t.id === report.topicId);
  assert.equal(topic.type, 'REPRESENTATIONAL');
  assert.match(topic.description, /standard staff notation/);
  const research = json('data/teaching-research.json').records.find(r => r.topicId === topic.id);
  assert.equal(research.assess.method, 'interpret_translate');
  assert.equal(research.confidence, 'low');
  assert.ok(research.learn.reviewNotes.some(n => n.includes('reports/assets/ontario-arts-staff/scores.svg')));
  const alignments = json('data/curriculum-alignments.json').alignments;
  assert.equal(report.componentSourceKeys.length, 6);
  for (const row of report.contexts) {
    assert.equal(row.ageRangeStart, row.grade + 5); assert.equal(row.ageRangeEnd, row.grade + 6);
    const actual = alignments.find(a => a.topicId === topic.id && a.scope === 'jurisdiction' && a.country === 'CA' && a.region === 'Ontario' && a.ageRangeStart === row.ageRangeStart && a.ageRangeEnd === row.ageRangeEnd);
    assert.ok(actual); for (const key of row.sourceKeys) assert.ok(actual.standards.includes(key));
  }
  assert.deepEqual(report.contexts.flatMap(r => r.sourceKeys), report.componentSourceKeys);
  assert.ok(!alignments.some(a => a.topicId === topic.id && a.standards.some(k => /ON-ARTS-2009-G[12]-/.test(k))), 'early devised-symbol tasks cannot become unqualified whole staff links');
});
