import type {
  LearningPath,
  LearningPathFrontier,
  LearningPathSubject,
  LearningPathTopic,
} from '@shared/types';
import { ProgressAtlas } from './ProgressAtlas';

function conceptCount(subject: LearningPathSubject): number {
  return subject.domains.reduce((n, d) => n + d.topics.length, 0);
}

export function SubjectOverview({
  path,
  frontier,
  onSelectSubject,
  onSelectTopic,
}: {
  path: LearningPath;
  frontier: LearningPathFrontier | null;
  onSelectSubject: (subject: string) => void;
  onSelectTopic: (topic: LearningPathTopic) => void;
}) {
  return (
    <div className="subject-overview" aria-label="Subject overview">
      <ProgressAtlas
        path={path}
        onSelectSubject={onSelectSubject}
        onSelectTopic={onSelectTopic}
      />

      <p className="section-title">Subjects</p>
      <div className="subject-overview-grid">
        {path.subjects.map((subject) => {
          const isFrontierSubject = frontier?.subject === subject.subject;
          return (
            <button
              key={subject.subject}
              type="button"
              className={`subject-card${isFrontierSubject ? ' has-frontier' : ''}`}
              onClick={() => onSelectSubject(subject.subject)}
            >
              <h2>{subject.subject}</h2>
              <p className="meta">{conceptCount(subject)} concepts</p>
              <div className="subject-card-rag" aria-label="Progress summary">
                <span className="rag-green">
                  <strong>{subject.ragCounts.green}</strong> excellent
                </span>
                <span className="rag-amber">
                  <strong>{subject.ragCounts.amber}</strong> growing
                </span>
                <span className="rag-red">
                  <strong>{subject.ragCounts.red}</strong> to learn
                </span>
              </div>
              {isFrontierSubject && frontier && (
                <p className="subject-card-next">
                  Next: {frontier.topicName ?? 'a new concept'}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
