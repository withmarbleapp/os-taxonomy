import { useEffect, useMemo, useState } from 'react';
import type {
  LearningPathDomain,
  LearningPathSubject,
  LearningPathTopic,
  RagCounts,
} from '@shared/types';
import { ragLabel } from '@shared/mastery';

const FOCUS_WINDOW = 8;
const FOCUS_THRESHOLD = 10;
const MAP_WIDTH = 720;
const MAP_HEIGHT = 220;

function domainRagSummary(domain: LearningPathDomain): RagCounts {
  const counts: RagCounts = { red: 0, amber: 0, green: 0 };
  for (const t of domain.topics) counts[t.rag] += 1;
  return counts;
}

function defaultOpenDomain(
  domains: LearningPathDomain[],
  frontierTopicId: string | null,
): string | null {
  if (frontierTopicId) {
    const withFrontier = domains.find((d) =>
      d.topics.some((t) => t.id === frontierTopicId),
    );
    if (withFrontier) return withFrontier.domain;
  }
  const withWork = domains.find((d) =>
    d.topics.some((t) => t.rag === 'amber' || t.rag === 'red'),
  );
  return withWork?.domain ?? domains[0]?.domain ?? null;
}

function focusAnchorIndex(
  topics: LearningPathTopic[],
  frontierTopicId: string | null,
): number {
  if (frontierTopicId) {
    const i = topics.findIndex((t) => t.id === frontierTopicId);
    if (i >= 0) return i;
  }
  const nonGreen = topics.findIndex((t) => t.rag !== 'green');
  return nonGreen >= 0 ? nonGreen : 0;
}

function ChapterLinkMap({
  domain,
  frontierTopicId,
  onSelectTopic,
}: {
  domain: LearningPathDomain;
  frontierTopicId: string | null;
  onSelectTopic: (topic: LearningPathTopic) => void;
}) {
  const layout = useMemo(() => {
    const n = domain.topics.length;
    const positions = new Map<string, { x: number; y: number; r: number }>();
    domain.topics.forEach((t, i) => {
      const tNorm = n <= 1 ? 0.5 : i / (n - 1);
      const x = 40 + tNorm * (MAP_WIDTH - 80);
      const y = MAP_HEIGHT / 2 + Math.sin(tNorm * Math.PI) * -36 + ((i % 2) * 18 - 9);
      const r = 5 + (t.centrality ?? 0.15) * 7;
      positions.set(t.id, { x, y, r });
    });
    return positions;
  }, [domain.topics]);

  const spine = domain.topics
    .map((t) => layout.get(t.id)!)
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  return (
    <svg
      className="chapter-link-map"
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      role="img"
      aria-label={`${domain.domain} concept links`}
    >
      {spine && <polyline className="chapter-map-spine" points={spine} />}
      {domain.edges.map((edge) => {
        const from = layout.get(edge.from);
        const to = layout.get(edge.to);
        if (!from || !to) return null;
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            className="chapter-map-edge"
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
          />
        );
      })}
      {domain.topics.map((topic) => {
        const pos = layout.get(topic.id)!;
        const isFrontier = frontierTopicId === topic.id;
        return (
          <g
            key={topic.id}
            className={`chapter-map-node rag-${topic.rag}${isFrontier ? ' frontier' : ''}`}
            onClick={() => onSelectTopic(topic)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTopic(topic);
              }
            }}
          >
            {isFrontier && (
              <circle className="chapter-map-ring" cx={pos.x} cy={pos.y} r={pos.r + 7} />
            )}
            <circle className="chapter-map-dot" cx={pos.x} cy={pos.y} r={pos.r}>
              <title>
                {topic.name ?? 'Concept'} — {ragLabel(topic.rag)}
              </title>
            </circle>
            <text
              className="chapter-map-label"
              x={pos.x}
              y={pos.y + pos.r + 14}
              textAnchor="middle"
            >
              {(topic.name ?? 'Concept').length > 18
                ? `${(topic.name ?? 'Concept').slice(0, 16)}…`
                : topic.name ?? 'Concept'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function JourneyList({
  topics,
  frontierTopicId,
  onSelectTopic,
}: {
  topics: LearningPathTopic[];
  frontierTopicId: string | null;
  onSelectTopic: (topic: LearningPathTopic) => void;
}) {
  return (
    <ol className="journey">
      {topics.map((topic) => {
        const isFrontier = frontierTopicId === topic.id;
        return (
          <li key={topic.id}>
            <button
              type="button"
              className={`journey-step rag-${topic.rag}${isFrontier ? ' frontier' : ''}`}
              onClick={() => onSelectTopic(topic)}
            >
              <span className="journey-dot" aria-hidden />
              <span className="journey-body">
                {isFrontier && <span className="journey-here">You are here</span>}
                <span className="journey-name">{topic.name ?? 'Concept'}</span>
                <span className="journey-status">{ragLabel(topic.rag)}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function DomainJourney({
  domain,
  frontierTopicId,
  onSelectTopic,
}: {
  domain: LearningPathDomain;
  frontierTopicId: string | null;
  onSelectTopic: (topic: LearningPathTopic) => void;
}) {
  const anchor = focusAnchorIndex(domain.topics, frontierTopicId);
  const needsWindow = domain.topics.length > FOCUS_THRESHOLD;
  const half = Math.floor(FOCUS_WINDOW / 2);

  const [start, setStart] = useState(() =>
    needsWindow ? Math.max(0, anchor - half) : 0,
  );
  const [end, setEnd] = useState(() => {
    if (!needsWindow) return domain.topics.length;
    const initialStart = Math.max(0, anchor - half);
    return Math.min(
      domain.topics.length,
      Math.max(anchor + half + 1, initialStart + FOCUS_WINDOW),
    );
  });

  const visible = domain.topics.slice(start, end);
  const earlierCount = start;
  const aheadCount = domain.topics.length - end;

  return (
    <div className="domain-journey">
      {domain.summary && <p className="summary">{domain.summary}</p>}
      {earlierCount > 0 && (
        <button
          type="button"
          className="journey-expand"
          onClick={() => setStart((s) => Math.max(0, s - FOCUS_WINDOW))}
        >
          Show earlier concepts ({earlierCount})
        </button>
      )}
      <JourneyList
        topics={visible}
        frontierTopicId={frontierTopicId}
        onSelectTopic={onSelectTopic}
      />
      {aheadCount > 0 && (
        <button
          type="button"
          className="journey-expand"
          onClick={() =>
            setEnd((e) => Math.min(domain.topics.length, e + FOCUS_WINDOW))
          }
        >
          Show more ahead ({aheadCount})
        </button>
      )}
    </div>
  );
}

export function SubjectWorkspace({
  subject,
  frontierTopicId,
  onSelectTopic,
  onBack,
  onOpenDomainChange,
}: {
  subject: LearningPathSubject;
  frontierTopicId: string | null;
  onSelectTopic: (topic: LearningPathTopic) => void;
  onBack: () => void;
  onOpenDomainChange?: (domain: string | null) => void;
}) {
  const conceptCount = subject.domains.reduce((n, d) => n + d.topics.length, 0);
  const initialOpen = useMemo(
    () => defaultOpenDomain(subject.domains, frontierTopicId),
    [subject.domains, frontierTopicId],
  );
  const [openDomain, setOpenDomain] = useState<string | null>(initialOpen);

  useEffect(() => {
    onOpenDomainChange?.(openDomain);
  }, [openDomain, onOpenDomainChange]);

  const activeDomain =
    subject.domains.find((d) => d.domain === openDomain) ?? subject.domains[0] ?? null;

  return (
    <article
      className="subject-workspace"
      aria-label={`${subject.subject} learning path`}
    >
      <aside className="subject-rail">
        <button type="button" className="btn ghost rail-back" onClick={onBack}>
          ← Overview
        </button>
        <header className="path-lane-header">
          <h2>{subject.subject}</h2>
          <p className="meta">{conceptCount} concepts · read top to bottom</p>
        </header>

        <div className="chapter-rail" role="list">
          {subject.domains.map((domain) => {
            const counts = domainRagSummary(domain);
            const isOpen = openDomain === domain.domain;
            const total = counts.red + counts.amber + counts.green || 1;
            return (
              <button
                key={domain.domain}
                type="button"
                role="listitem"
                className={`chapter-rail-item${isOpen ? ' active' : ''}`}
                aria-current={isOpen ? 'true' : undefined}
                onClick={() => setOpenDomain(domain.domain)}
              >
                <span className="chapter-rail-title">{domain.domain}</span>
                <span className="chapter-rail-bar" aria-hidden>
                  <span
                    className="rag-green"
                    style={{ width: `${(counts.green / total) * 100}%` }}
                  />
                  <span
                    className="rag-amber"
                    style={{ width: `${(counts.amber / total) * 100}%` }}
                  />
                  <span
                    className="rag-red"
                    style={{ width: `${(counts.red / total) * 100}%` }}
                  />
                </span>
                <span className="meta chapter-rag">
                  {counts.green} · {counts.amber} · {counts.red}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="subject-stage">
        {activeDomain && (
          <>
            <div className="subject-stage-header">
              <h3>{activeDomain.domain}</h3>
              <p className="meta">How these ideas connect</p>
            </div>
            <ChapterLinkMap
              key={activeDomain.domain}
              domain={activeDomain}
              frontierTopicId={frontierTopicId}
              onSelectTopic={onSelectTopic}
            />
            <DomainJourney
              key={`journey-${activeDomain.domain}`}
              domain={activeDomain}
              frontierTopicId={frontierTopicId}
              onSelectTopic={onSelectTopic}
            />
          </>
        )}
      </div>
    </article>
  );
}
