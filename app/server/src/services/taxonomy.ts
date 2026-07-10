import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Topic, Dependency, Cluster } from '../../../shared/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../../');
const DATA_DIR = path.join(REPO_ROOT, 'data');

export interface TaxonomyData {
  topics: Topic[];
  dependencies: Dependency[];
  clusters: Cluster[];
  topicsById: Map<string, Topic>;
}

let cached: TaxonomyData | null = null;

export function loadTaxonomy(dataDir = DATA_DIR): TaxonomyData {
  if (cached && dataDir === DATA_DIR) return cached;

  const topicsFile = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'topics.json'), 'utf8'),
  ) as { topics: Topic[] };
  const depsFile = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'dependencies.json'), 'utf8'),
  ) as { dependencies: Dependency[] };
  const clustersFile = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'clusters.json'), 'utf8'),
  ) as { clusters: Cluster[] };

  const topics = topicsFile.topics;
  const data: TaxonomyData = {
    topics,
    dependencies: depsFile.dependencies,
    clusters: clustersFile.clusters,
    topicsById: new Map(topics.map((t) => [t.id, t])),
  };

  if (dataDir === DATA_DIR) cached = data;
  return data;
}

export function clearTaxonomyCache(): void {
  cached = null;
}

export function getTopicsForAge(age: number, taxonomy = loadTaxonomy()): Topic[] {
  return taxonomy.topics.filter((t) => {
    const start = t.ageRangeStart ?? age;
    const end = t.ageRangeEnd ?? age;
    return age >= start - 1 && age <= end + 1;
  });
}

export function getClusterSummary(
  subject: string,
  domain: string,
  age: number,
  taxonomy = loadTaxonomy(),
): string | null {
  const candidates = taxonomy.clusters.filter(
    (c) => c.subject === subject && c.domain === domain,
  );
  if (candidates.length === 0) return null;
  candidates.sort(
    (a, b) => Math.abs(a.ageRangeStart - age) - Math.abs(b.ageRangeStart - age),
  );
  return candidates[0]?.summary ?? null;
}
