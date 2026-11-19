import { validate } from '../lesson-contract/contracts.mjs';

// What the tutor is told about its output. Provider adapters that ask for
// `arguments` as an object swap the first sentence for the second.
export const DECISION_FORMAT =
  'Return one decision as JSON: {tool:string,arguments:string}, with arguments a JSON object encoded as a string.';
export const DECISION_FORMAT_OBJECT = 'Return one decision as JSON: {tool:string,arguments:object}.';

const text = { type: 'string', minLength: 1, maxLength: 650 };
const strict = (properties) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
export const MAX_RECORDS = 3;

// Records ride along with whatever the tutor does next, so interpreting the
// learner never costs an inference of its own. Returns the schema of each
// optional array on a decision, keyed by field name.
export function recordSchemaFor(pkg) {
  const focuses = pkg.teaching.dialogue.focuses.map((f) => f.id);
  const skills = (pkg.teaching.selfEvaluation?.skills ?? []).map((s) => s.id);
  return {
    understanding: {
      type: 'array',
      maxItems: MAX_RECORDS,
      items: strict({
        focus: { enum: focuses },
        interpretation: { enum: ['understood', 'needs_help', 'acknowledged', 'question'] },
        evidence: text,
      }),
    },
    ...(skills.length
      ? {
          confidence: {
            type: 'array',
            maxItems: MAX_RECORDS,
            items: strict({ skill: { enum: skills }, words: text }),
          },
        }
      : {}),
  };
}

// Keeps the valid records from a decision and drops the rest: a malformed
// record must never cost the child the tutor's reply. Returns only the fields
// that have at least one valid entry.
export function pickRecords(decision, records) {
  const out = {};
  for (const [field, schema] of Object.entries(records ?? {})) {
    const items = Array.isArray(decision?.[field]) ? decision[field] : [];
    const valid = [];
    for (const item of items.slice(0, schema.maxItems ?? MAX_RECORDS)) {
      try {
        valid.push(validate(schema.items, item));
      } catch {
        // dropped
      }
    }
    if (valid.length) out[field] = valid;
  }
  return out;
}

export function recordGuidance(pkg) {
  const records = recordSchemaFor(pkg);
  const skills = pkg.teaching.selfEvaluation?.skills ?? [];
  return (
    'RECORDS: A decision may also carry "understanding": [{focus, interpretation, evidence}] when the learner’s actual words or committed work show something about a focus. interpretation is understood, needs_help, acknowledged or question. Never grade navigation or a draft. Focus IDs: ' +
    records.understanding.items.properties.focus.enum.join(', ') +
    '.' +
    (records.confidence
      ? ' It may carry "confidence": [{skill, words}] for the child’s own self assessment in their words; do not infer confidence from a score. Skill IDs: ' +
        skills.map((s) => `${s.id}: ${s.description}`).join(' | ') +
        '.'
      : '') +
    ' Put records in the same decision as your reply or action, after arguments, and use empty arrays when there is nothing to record. There is no separate recording step.'
  );
}

// A tutor sometimes fills in a field that belongs to another tool (the wrap-up
// notes on an ordinary reply). Those fields are removed, so the reply is kept;
// what is left is still validated against the tool's own schema. Returns the
// names removed.
export function trimArguments(tool, args) {
  const known = tool?.inputSchema?.properties;
  if (!known || !args || typeof args !== 'object' || Array.isArray(args)) return [];
  const extra = Object.keys(args).filter((k) => !(k in known));
  for (const k of extra) delete args[k];
  return extra;
}
