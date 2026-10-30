// Generated alongside experience.json: keep the serialized descriptor in sync.
export const descriptor = {
  protocolVersion: 1,
  kind: 'equal-parts',
  releaseId: 'equal-parts-v1',
  description: 'A bar split into equal visible parts. No assessment happens until Check.',
  stateSchema: {
    type: 'object',
    properties: {
      sceneId: { type: 'string' },
      parts: { type: 'integer', minimum: 2, maximum: 8 },
      draft: { type: 'string' },
      currentAttempt: { type: 'object' },
    },
    required: ['sceneId', 'parts', 'draft', 'currentAttempt'],
    additionalProperties: false,
  },
  actions: [
    {
      name: 'new_bar',
      description:
        'Show a different bar with 2–8 equal parts. Introduce a fresh try before asking for an answer.',
      inputSchema: {
        type: 'object',
        properties: { parts: { type: 'integer', minimum: 2, maximum: 8 } },
        required: ['parts'],
        additionalProperties: false,
      },
    },
  ],
  events: {
    answer_checked: { type: 'object' },
    draft_changed: { type: 'object' },
    bar_changed: { type: 'object' },
  },
};
