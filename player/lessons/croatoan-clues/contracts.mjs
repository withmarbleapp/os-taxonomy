// JSON Schema subset used by this prototype. Unsupported keywords fail closed.
export function validate(schema, value, path = '$') {
  const supported = new Set([
    'type',
    'const',
    'enum',
    'properties',
    'required',
    'additionalProperties',
    'items',
    'minItems',
    'maxItems',
    'minLength',
    'maxLength',
    'minimum',
    'maximum',
    'description',
  ]);
  for (const key of Object.keys(schema))
    if (!supported.has(key)) throw new Error(`Unsupported schema keyword: ${key}`);
  const fail = (message) => {
    throw new Error(`${path}: ${message}`);
  };
  if ('const' in schema && value !== schema.const) fail('unexpected constant');
  if (schema.enum && !schema.enum.includes(value)) fail('not an allowed value');
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  if (schema.type && !(schema.type === 'integer' ? Number.isInteger(value) : schema.type === type))
    fail(`expected ${schema.type}`);
  if (type === 'number' && !Number.isFinite(value)) fail('expected finite number');
  if (type === 'object') {
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) fail(`missing ${key}`);
    for (const [key, item] of Object.entries(value)) {
      if (schema.properties?.[key]) validate(schema.properties[key], item, `${path}.${key}`);
      else if (schema.additionalProperties === false) fail(`unknown field ${key}`);
    }
  }
  if (type === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail('too few items');
    if (schema.maxItems !== undefined && value.length > schema.maxItems) fail('too many items');
    value.forEach((v, i) => schema.items && validate(schema.items, v, `${path}[${i}]`));
  }
  if (type === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) fail('too short');
    if (schema.maxLength !== undefined && value.length > schema.maxLength) fail('too long');
  }
  if (schema.minimum !== undefined && value < schema.minimum) fail('too small');
  if (schema.maximum !== undefined && value > schema.maximum) fail('too large');
  return value;
}

export const object = (properties) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const id = { type: 'string', minLength: 1, maxLength: 160 };
const revision = { type: 'integer', minimum: 0 };
export const commandSchema = object({
  protocolVersion: { const: 1 },
  sessionId: id,
  releaseId: id,
  commandId: id,
  expectedRevision: revision,
  name: id,
  args: { type: 'object' },
});
export const snapshotSchema = object({
  protocolVersion: { const: 1 },
  sessionId: id,
  releaseId: id,
  revision,
  state: { type: 'object' },
  availableActions: { type: 'array', items: id, maxItems: 32 },
});
export const eventSchema = object({
  id,
  revision,
  source: { enum: ['learner', 'agent', 'system'] },
  name: id,
  data: { type: 'object' },
});
export const toolCallSchema = object({ id, name: id, args: { type: 'object' } });
export const inferenceReplySchema = object({
  text: { type: 'string', maxLength: 20000 },
  toolCalls: { type: 'array', items: toolCallSchema, maxItems: 8 },
});

export function assertSnapshot(descriptor, snapshot) {
  validate(snapshotSchema, snapshot);
  validate(descriptor.stateSchema, snapshot.state);
  if (snapshot.releaseId !== descriptor.releaseId) throw new Error('Release mismatch');
  if (
    snapshot.availableActions.some(
      (name) => !descriptor.actions.some((action) => action.name === name),
    )
  )
    throw new Error('Undeclared available action');
  return snapshot;
}

export function assertUpdate(descriptor, update) {
  if (!update || !Array.isArray(update.events) || update.events.length > 32)
    throw new Error('Invalid update events');
  assertSnapshot(descriptor, update.snapshot);
  for (const event of update.events) {
    validate(eventSchema, event);
    const schema = descriptor.events[event.name];
    if (!schema || event.revision > update.snapshot.revision) throw new Error('Invalid event');
    validate(schema, event.data);
  }
  return update;
}
