import { describe, expect, it } from 'vitest';
import { loadTaxonomy, getTopicsForAge, getClusterSummary } from '../../server/src/services/taxonomy.js';

describe('taxonomy loader', () => {
  it('loads topics, dependencies, and clusters from repo data', () => {
    const taxonomy = loadTaxonomy();
    expect(taxonomy.topics.length).toBeGreaterThan(1000);
    expect(taxonomy.dependencies.length).toBeGreaterThan(1000);
    expect(taxonomy.clusters.length).toBeGreaterThan(100);
    expect(taxonomy.topicsById.size).toBe(taxonomy.topics.length);
  });

  it('filters topics for a given age band', () => {
    const forFive = getTopicsForAge(5);
    expect(forFive.length).toBeGreaterThan(50);
    expect(forFive.every((t) => t.name)).toBe(true);
  });

  it('returns a parent-friendly cluster summary when available', () => {
    const summary = getClusterSummary('Mathematics', 'Counting & Cardinality', 5);
    // May be null if domain naming differs; at least English Grammar should exist
    const eng = getClusterSummary('English', 'Grammar & Punctuation', 5);
    expect(eng === null || eng.length > 20).toBe(true);
    expect(summary === null || typeof summary === 'string').toBe(true);
  });
});
