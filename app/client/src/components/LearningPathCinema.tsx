import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LearningPath, LearningPathTopic, RagCounts } from '@shared/types';
import { RagLegend, RagTally } from './RagLegend';
import { SubjectOverview } from './SubjectOverview';
import { SubjectWorkspace } from './SubjectWorkspace';
import { TopicDrawer } from './TopicDrawer';

export function LearningPathCinema({
  path,
  childName,
  childId,
  trackedRagCounts,
}: {
  path: LearningPath;
  childName: string;
  childId: string;
  trackedRagCounts: RagCounts;
}) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [openDomain, setOpenDomain] = useState<string | null>(null);
  const [selected, setSelected] = useState<LearningPathTopic | null>(null);

  const pathTopicCount = useMemo(
    () =>
      path.subjects.reduce(
        (n, s) => n + s.domains.reduce((m, d) => m + d.topics.length, 0),
        0,
      ),
    [path.subjects],
  );

  const active = useMemo(
    () => path.subjects.find((s) => s.subject === activeSubject) ?? null,
    [path.subjects, activeSubject],
  );

  const onOpenDomainChange = useCallback((domain: string | null) => {
    setOpenDomain(domain);
  }, []);

  const generateState =
    activeSubject != null
      ? {
          subjectFocus: activeSubject,
          ...(openDomain ? { domainFocus: openDomain } : {}),
        }
      : undefined;

  return (
    <div className="path-cinema">
      <section className="hero" style={{ marginBottom: 0 }}>
        <p className="section-title">{childName}&apos;s learning path</p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', maxWidth: '14ch' }}>
          The curriculum, curated
        </h1>
        <p className="meta" style={{ maxWidth: '36rem', marginTop: '0.75rem' }}>
          See how ideas connect, then pick a subject. We&apos;ll open where they are
          now.
        </p>
      </section>

      <div>
        <p className="section-title">Assessed so far</p>
        <RagTally counts={trackedRagCounts} />
      </div>
      <RagLegend />
      <p className="meta">
        Full path for this age: {pathTopicCount} concepts · {path.ragCounts.green}{' '}
        excellent · {path.ragCounts.amber} growing · {path.ragCounts.red} still to
        learn
      </p>

      {path.frontier && (
        <p className="constellation-caption">
          You are here: {path.frontier.topicName ?? 'next concept'}
          <span className="meta">
            {' '}
            · {path.frontier.subject} · {path.frontier.domain}
          </span>
        </p>
      )}

      <div className="path-subject-tabs" role="tablist" aria-label="Subjects">
        <button
          type="button"
          className={`chip ${activeSubject === null ? 'active' : ''}`}
          onClick={() => {
            setActiveSubject(null);
            setOpenDomain(null);
          }}
        >
          Overview
        </button>
        {path.subjects.map((s) => (
          <button
            key={s.subject}
            type="button"
            className={`chip ${activeSubject === s.subject ? 'active' : ''}`}
            onClick={() => {
              setActiveSubject(s.subject);
              setOpenDomain(null);
            }}
          >
            {s.subject}
          </button>
        ))}
      </div>

      {activeSubject === null || !active ? (
        <SubjectOverview
          path={path}
          frontier={path.frontier}
          onSelectSubject={setActiveSubject}
          onSelectTopic={setSelected}
        />
      ) : (
        <SubjectWorkspace
          key={active.subject}
          subject={active}
          frontierTopicId={
            path.frontier?.subject === active.subject
              ? path.frontier.topicId
              : null
          }
          onSelectTopic={setSelected}
          onBack={() => {
            setActiveSubject(null);
            setOpenDomain(null);
          }}
          onOpenDomainChange={onOpenDomainChange}
        />
      )}

      <div className="row" style={{ marginTop: '1.5rem' }}>
        <Link className="btn" to={`/children/${childId}/generate`} state={generateState}>
          Create next worksheet
        </Link>
        <Link className="btn ghost" to={`/children/${childId}`}>
          Back to {childName}
        </Link>
      </div>

      {selected && (
        <TopicDrawer
          topic={selected}
          childId={childId}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
