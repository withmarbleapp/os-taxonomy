import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Child, LearningPath, ProgressSummary } from '@shared/types';
import { api } from '../lib/api';
import { LearningPathCinema } from '../components/LearningPathCinema';

export function ProgressPage() {
  const { id } = useParams<{ id: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getChild(id), api.getLearningPath(id), api.getProgress(id)])
      .then(([c, lp, p]) => {
        setChild(c);
        setPath(lp);
        setProgress(p);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!child || !path || !progress) return <p className="muted">Loading…</p>;

  return (
    <div className="fade-in stack" style={{ width: '100%' }}>
      <LearningPathCinema
        path={path}
        childName={child.name}
        childId={child.id}
        trackedRagCounts={progress.ragCounts}
      />
    </div>
  );
}
