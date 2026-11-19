import { checkTeachingResearch as checkLegacy, checkResearchArchiveReferences as checkLegacyArchive } from './check-teaching-research.mjs';
import { checkCanonicalResearchCollection } from './canonical-research-collection.mjs';

export function checkTeachingResearch(research, context) {
  return research?.schemaVersion === 2 ? checkCanonicalResearchCollection(research, context) : checkLegacy(research, context);
}
export function checkResearchArchiveReferences(archive, context) {
  const errors = checkLegacyArchive(archive, context);
  if (errors.length || context.research?.schemaVersion !== 2) return errors;
  if (archive.activeReferenceRepairs.length) errors.push('Stale active archive repairs cannot alter canonical authored references');
  if (archive.historicalReferenceRepairs !== undefined) {
    const history = archive.historicalReferenceRepairs;
    if (!history || typeof history !== 'object' || Array.isArray(history) || Object.keys(history).length !== 3 ||
        !['sourceCommit', 'sourceResearchSha256', 'entries'].every(key => Object.hasOwn(history, key)) ||
        typeof history.sourceCommit !== 'string' || history.sourceCommit.length !== 40 || !/^[a-f0-9]{40}$/.test(history.sourceCommit) ||
        typeof history.sourceResearchSha256 !== 'string' || history.sourceResearchSha256.length !== 64 || !/^[a-f0-9]{64}$/.test(history.sourceResearchSha256) || !Array.isArray(history.entries)) {
      errors.push('Invalid historical reference migration provenance');
    } else {
      const seen = new Set();
      for (const entry of history.entries) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry) || Object.keys(entry).length !== 5 ||
            !['researchTopicId', 'diagnosticId', 'path', 'from', 'to'].every(key => Object.hasOwn(entry, key))) {
          errors.push('Invalid historical diagnostic reference migration'); continue;
        }
        const key = JSON.stringify([entry.researchTopicId, entry.diagnosticId]);
        if (!/^diagnostic_[A-Za-z0-9_-]{8,64}$/.test(entry.diagnosticId ?? '') ||
            !/^\.?assess\.errorPatterns\[(0|[1-9][0-9]*)\]\.reteachPrerequisiteId$/.test(entry.path ?? '') ||
            !['researchTopicId', 'from', 'to'].every(field => typeof entry[field] === 'string' && entry[field].startsWith('mt_')) || seen.has(key)) {
          errors.push('Invalid or duplicate historical diagnostic reference migration');
        }
        seen.add(key);
      }
    }
  }
  return errors;
}
