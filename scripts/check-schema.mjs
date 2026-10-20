// Dependency-free validation for the keywords used by this dataset's schemas.
// Unknown keywords fail closed; this is not a general JSON Schema implementation.
const supported = new Set(['$schema', '$id', 'title', 'description', 'type', 'const', 'enum', 'anyOf', 'properties', 'required', 'additionalProperties', 'propertyNames', 'items', 'minItems', 'maxItems', 'minLength', 'pattern', 'format', 'minimum', 'maximum']);
// RFC 3339 date-time (JSON Schema `format: date-time`). Date.parse alone accepts
// loose strings such as "1", "2024" or "March 7 2024".
const RFC3339 = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|[+-](\d{2}):(\d{2}))$/;
function isRfc3339DateTime(value) {
  const m = RFC3339.exec(value);
  if (!m) return false;
  const [year, month, day, hour, minute, second] = m.slice(1, 7).map(Number);
  if (month < 1 || month > 12) return false;
  // Date.UTC maps years 0-99 to 1900-1999, so count leap years directly.
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  if (day < 1 || day > daysInMonth) return false;
  // Every field is range-checked here; Date.parse would also reject a leap second (:60).
  if (hour > 23 || minute > 59 || second > 60) return false;
  if (m[7] !== undefined && (Number(m[7]) > 23 || Number(m[8]) > 59)) return false;
  return true;
}
export function checkSchema(value, schema, path = '$', errors = []) {
  for (const key of Object.keys(schema)) if (!supported.has(key)) throw Error(`Unsupported schema keyword: ${key}`);
  const fail = message => errors.push(`${path}: ${message}`);
  if (schema.anyOf && !schema.anyOf.some(branch => checkSchema(value, branch).length === 0)) { fail('does not match any allowed shape'); return errors; }
  if ('const' in schema && value !== schema.const) fail(`must equal ${schema.const}`);
  if (schema.enum && !schema.enum.includes(value)) fail('not an allowed value');
  if (schema.type) {
    const matches = type => type === 'null' ? value === null : type === 'array' ? Array.isArray(value) : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : type === 'integer' ? Number.isInteger(value) : typeof value === type;
    if (!(Array.isArray(schema.type) ? schema.type : [schema.type]).some(matches)) { fail(`expected ${schema.type}`); return errors; }
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && [...value].length < schema.minLength) fail('string too short');
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail('pattern mismatch');
    if (schema.format === 'date-time' && !isRfc3339DateTime(value)) fail('invalid date-time');
    if (schema.format === 'uri') { try { new URL(value); } catch { fail('invalid absolute URI'); } }
    if (schema.format && !['date-time', 'uri'].includes(schema.format)) throw Error(`Unsupported format: ${schema.format}`);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('number must be finite');
    if (schema.minimum !== undefined && value < schema.minimum) fail('below minimum');
    if (schema.maximum !== undefined && value > schema.maximum) fail('above maximum');
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail('too few items');
    if (schema.maxItems !== undefined && value.length > schema.maxItems) fail('too many items');
    if (schema.items) value.forEach((item, i) => checkSchema(item, schema.items, `${path}[${i}]`, errors));
  } else if (value && typeof value === 'object') {
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) fail(`missing ${key}`);
    for (const [key, child] of Object.entries(value)) {
      if (schema.propertyNames) checkSchema(key, schema.propertyNames, `${path} key`, errors);
      if (schema.properties && Object.hasOwn(schema.properties, key)) checkSchema(child, schema.properties[key], `${path}.${key}`, errors);
      else if (schema.additionalProperties === false) fail(`unexpected property ${key}`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') checkSchema(child, schema.additionalProperties, `${path}.${key}`, errors);
    }
  }
  return errors;
}
