import { useMemo } from 'react';
import type { LearningPathFrontier, LearningPathTopic, RagCounts } from '@shared/types';
import { RagLegend } from './RagLegend';

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function layoutNodes(
  topics: LearningPathTopic[],
  width: number,
  height: number,
): Array<LearningPathTopic & { x: number; y: number; r: number }> {
  const cx = width / 2;
  const cy = height / 2;
  return topics.map((topic, i) => {
    const angle = (i / Math.max(topics.length, 1)) * Math.PI * 2 + (hash(topic.id) % 17) * 0.02;
    const ring = 0.28 + ((hash(topic.id) % 50) / 100) * 0.55;
    const x = cx + Math.cos(angle) * (width * 0.42 * ring);
    const y = cy + Math.sin(angle) * (height * 0.4 * ring);
    const r = 4 + (topic.centrality ?? 0.2) * 10;
    return { ...topic, x, y, r };
  });
}

export function ConceptConstellation({
  topics,
  ragCounts,
  frontier,
}: {
  topics: LearningPathTopic[];
  ragCounts: RagCounts;
  frontier: LearningPathFrontier | null;
}) {
  const width = 720;
  const height = 280;
  const nodes = useMemo(
    () => layoutNodes(topics.slice(0, 40), width, height),
    [topics],
  );

  return (
    <section className="constellation-panel" aria-label="Concept constellation">
      <p className="section-title">Concepts</p>
      <RagLegend counts={ragCounts} />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Coloured dots showing concept progress"
        style={{ marginTop: '1rem' }}
      >
        <defs>
          <radialGradient id="constellationWash" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(217,230,234,0.55)" />
            <stop offset="100%" stopColor="rgba(217,230,234,0)" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#constellationWash)" />
        {nodes.map((node) => {
          const isFrontier = frontier?.topicId === node.id;
          return (
            <g key={node.id} className={`topic-node rag-${node.rag}${isFrontier ? ' frontier' : ''}`}>
              {isFrontier && (
                <circle className="ring" cx={node.x} cy={node.y} r={node.r + 6} />
              )}
              <circle className="core" cx={node.x} cy={node.y} r={node.r}>
                <title>
                  {node.name ?? 'Concept'} — {node.rag}
                </title>
              </circle>
            </g>
          );
        })}
      </svg>
      {frontier && (
        <p className="constellation-caption">
          Next focus: {frontier.topicName ?? 'a new concept'}
          <span className="meta"> · {frontier.subject} · {frontier.domain}</span>
        </p>
      )}
    </section>
  );
}
