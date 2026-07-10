import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Child, LearningPath, ProgressSummary, Worksheet } from '@shared/types';
import { api } from '../lib/api';
import { ConceptConstellation } from '../components/ConceptConstellation';

export function ChildPage() {
  const { id } = useParams<{ id: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getChild(id),
      api.getProgress(id),
      api.getLearningPath(id),
      api.listWorksheets(id),
    ])
      .then(([c, p, lp, w]) => {
        setChild(c);
        setProgress(p);
        setPath(lp);
        setWorksheets(w);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!child || !progress || !path) return <p className="muted">Loading…</p>;

  return (
    <div className="fade-in stack">
      <section className="hero" style={{ marginBottom: '1.5rem' }}>
        <p className="section-title">{child.name}</p>
        <h1 className="story">{progress.story}</h1>
        <p className="meta">
          Age {child.age}
          {progress.suggestedTheme ? ` · Try a “${progress.suggestedTheme}” theme` : ''}
        </p>
      </section>

      <div className="row">
        <Link className="btn" to={`/children/${child.id}/generate`}>
          Create worksheet
        </Link>
        <Link className="btn secondary" to={`/children/${child.id}/progress`}>
          Explore learning path
        </Link>
      </div>

      <ConceptConstellation
        topics={path.constellation}
        ragCounts={progress.ragCounts}
        frontier={progress.frontier}
      />

      <section className="panel stack">
        <div>
          <p className="section-title">Recent worksheets</p>
          {worksheets.length === 0 && (
            <p className="muted">No worksheets yet — create the first one.</p>
          )}
          <div className="list">
            {worksheets.map((ws) => (
              <div key={ws.id} className="list-item">
                <div>
                  <strong>{ws.title}</strong>
                  <p className="meta">
                    {ws.theme} · {ws.durationMinutes} min · {ws.status}
                  </p>
                </div>
                <div className="row">
                  <a
                    className="btn secondary"
                    href={`/api/worksheets/${ws.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                  {(ws.status === 'ready' ||
                    ws.status === 'printed' ||
                    ws.status === 'submitted') && (
                    <Link className="btn" to={`/children/${child.id}/upload/${ws.id}`}>
                      Upload scan
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
