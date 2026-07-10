import { useMemo, useState } from 'react';
import type {
  LearningPath,
  LearningPathFrontier,
  LearningPathSubject,
  LearningPathTopic,
} from '@shared/types';
import { ragLabel } from '@shared/mastery';

const MAX_TOPICS_PER_SUBJECT = 20;
const WIDTH = 1100;
const HEIGHT = 520;
const CLUSTER_RADIUS = 78;
const LABEL_GAP = 22;

type LaidOutTopic = LearningPathTopic & { x: number; y: number; r: number };

type ClusterLayout = {
  subject: LearningPathSubject;
  cx: number;
  cy: number;
  labelX: number;
  labelY: number;
  topics: LaidOutTopic[];
  edges: Array<{ x1: number; y1: number; x2: number; y2: number }>;
};

function pickTopics(subject: LearningPathSubject): LearningPathTopic[] {
  const all = subject.domains.flatMap((d) => d.topics);
  return [...all]
    .sort((a, b) => (b.centrality ?? 0) - (a.centrality ?? 0))
    .slice(0, MAX_TOPICS_PER_SUBJECT);
}

function clusterCenters(count: number): Array<{ cx: number; cy: number; labelY: number }> {
  const cols = Math.min(4, count);
  const rows = Math.ceil(count / cols);
  const padX = 36;
  const padTop = 36;
  const padBottom = 36;
  const cellW = (WIDTH - padX * 2) / cols;
  const cellH = (HEIGHT - padTop - padBottom) / rows;
  const centers: Array<{ cx: number; cy: number; labelY: number }> = [];

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellLeft = padX + col * cellW;
    const cellTop = padTop + row * cellH;
    const cx = cellLeft + cellW / 2;
    // Label sits in the top of the cell; dots sit clearly below
    const labelY = cellTop + 18;
    const cy = labelY + LABEL_GAP + CLUSTER_RADIUS;
    centers.push({ cx, cy, labelY });
  }
  return centers;
}

function layoutClusters(subjects: LearningPathSubject[]): ClusterLayout[] {
  const centers = clusterCenters(subjects.length);
  return subjects.map((subject, i) => {
    const { cx, cy, labelY } = centers[i]!;
    const topics = pickTopics(subject);
    const laid: LaidOutTopic[] = topics.map((topic, ti) => {
      const n = Math.max(topics.length, 1);
      // Start angles from the sides/bottom so dots stay under the label band
      const angle = (ti / n) * Math.PI * 2 + Math.PI / 2;
      const ring = 22 + (ti % 3) * 12 + (topic.centrality ?? 0.2) * 14;
      const maxRing = CLUSTER_RADIUS - 14;
      const clampedRing = Math.min(ring, maxRing);
      return {
        ...topic,
        x: cx + Math.cos(angle) * clampedRing,
        y: cy + Math.sin(angle) * clampedRing * 0.85,
        r: 3.5 + (topic.centrality ?? 0.15) * 5,
      };
    });
    const byId = new Map(laid.map((t) => [t.id, t]));
    const idSet = new Set(laid.map((t) => t.id));
    const edges: ClusterLayout['edges'] = [];
    for (const domain of subject.domains) {
      for (const edge of domain.edges) {
        if (!idSet.has(edge.from) || !idSet.has(edge.to)) continue;
        const a = byId.get(edge.from)!;
        const b = byId.get(edge.to)!;
        edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
    return {
      subject,
      cx,
      cy,
      labelX: cx,
      labelY,
      topics: laid,
      edges,
    };
  });
}

export function ProgressAtlas({
  path,
  onSelectSubject,
  onSelectTopic,
}: {
  path: LearningPath;
  onSelectSubject: (subject: string) => void;
  onSelectTopic: (topic: LearningPathTopic) => void;
}) {
  const clusters = useMemo(() => layoutClusters(path.subjects), [path.subjects]);
  const [hover, setHover] = useState<LearningPathTopic | null>(null);
  const frontier: LearningPathFrontier | null = path.frontier;

  return (
    <section className="progress-atlas" aria-label="Progress atlas">
      <div className="progress-atlas-header">
        <p className="section-title">Progress atlas</p>
        <p className="meta">
          Concepts linked by what must come first. Colours show how they are doing —
          tap a subject island to explore.
        </p>
      </div>
      <div className="progress-atlas-frame">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Linked curriculum progress map"
          className="progress-atlas-svg"
        >
          <defs>
            <radialGradient id="atlasWash" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="rgba(217,230,234,0.55)" />
              <stop offset="100%" stopColor="rgba(217,230,234,0)" />
            </radialGradient>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#atlasWash)" />

          {clusters.map((cluster) => (
            <g key={cluster.subject.subject} className="atlas-cluster">
              <circle
                className="atlas-cluster-halo"
                cx={cluster.cx}
                cy={cluster.cy}
                r={CLUSTER_RADIUS}
                onClick={() => onSelectSubject(cluster.subject.subject)}
              />
              <text
                className="atlas-cluster-label"
                x={cluster.labelX}
                y={cluster.labelY}
                textAnchor="middle"
                dominantBaseline="alphabetic"
                onClick={() => onSelectSubject(cluster.subject.subject)}
              >
                {cluster.subject.subject}
              </text>
              {cluster.edges.map((e, i) => (
                <line
                  key={`${cluster.subject.subject}-e-${i}`}
                  className="atlas-edge"
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                />
              ))}
              {cluster.topics.map((topic) => {
                const isFrontier = frontier?.topicId === topic.id;
                return (
                  <g
                    key={topic.id}
                    className={`atlas-node rag-${topic.rag}${isFrontier ? ' frontier' : ''}`}
                    onMouseEnter={() => setHover(topic)}
                    onMouseLeave={() => setHover(null)}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelectTopic(topic);
                    }}
                  >
                    {isFrontier && (
                      <circle className="atlas-frontier-ring" cx={topic.x} cy={topic.y} r={topic.r + 6} />
                    )}
                    <circle className="atlas-dot" cx={topic.x} cy={topic.y} r={topic.r}>
                      <title>
                        {topic.name ?? 'Concept'} — {ragLabel(topic.rag)}
                      </title>
                    </circle>
                  </g>
                );
              })}
            </g>
          ))}

          {frontier && (
            <text
              className="atlas-frontier-caption"
              x={WIDTH / 2}
              y={HEIGHT - 18}
              textAnchor="middle"
            >
              You are here: {frontier.topicName ?? 'next concept'} · {frontier.subject}
            </text>
          )}
        </svg>

        {hover && (
          <div className="atlas-tooltip" role="status">
            <strong>{hover.name ?? 'Concept'}</strong>
            <span className={`rag-${hover.rag}`}>{ragLabel(hover.rag)}</span>
            <span className="meta">
              {hover.subject} · {hover.domain}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
