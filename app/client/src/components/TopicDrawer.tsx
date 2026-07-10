import { Link } from 'react-router-dom';
import type { LearningPathTopic } from '@shared/types';
import { ragLabel } from '@shared/mastery';

export function TopicDrawer({
  topic,
  childId,
  onClose,
}: {
  topic: LearningPathTopic;
  childId: string;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className="topic-drawer-backdrop"
        aria-label="Close topic details"
        onClick={onClose}
      />
      <aside className="topic-drawer" role="dialog" aria-label={topic.name ?? 'Topic'}>
        <p className={`section-title rag-${topic.rag}`}>{ragLabel(topic.rag)}</p>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
          {topic.name ?? 'Concept'}
        </h2>
        <p className="meta" style={{ marginBottom: '1rem' }}>
          {topic.subject} · {topic.domain}
        </p>
        <p style={{ marginBottom: '1rem' }}>{topic.description}</p>
        {topic.evidence.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p className="section-title">Mastery looks like</p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--ink-soft)' }}>
              {topic.evidence.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="row">
          <Link
            className="btn"
            to={`/children/${childId}/generate`}
            state={{
              subjectFocus: topic.subject,
              domainFocus: topic.domain,
              preferTopicId: topic.id,
              preferTopicName: topic.name ?? undefined,
            }}
          >
            Create worksheet
          </Link>
          <button type="button" className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </aside>
    </>
  );
}
