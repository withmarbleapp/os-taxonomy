import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Child } from '@shared/types';
import { api } from '../lib/api';

export function HomePage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listChildren()
      .then(setChildren)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="fade-in">
      <section className="hero">
        <p className="section-title">This weekend</p>
        <h1>Whose learning adventure?</h1>
        <p>
          Choose a child to create a themed printable worksheet, or upload a scan of
          work already finished at the kitchen table.
        </p>
      </section>

      {error && <p className="error">{error}</p>}

      <div className="child-grid">
        {children.map((child) => (
          <button
            key={child.id}
            type="button"
            className="child-tile"
            onClick={() => {
              localStorage.setItem('selectedChildId', child.id);
              navigate(`/children/${child.id}`);
            }}
          >
            <div className="avatar" style={{ background: child.avatarColor }}>
              {child.name.slice(0, 1)}
            </div>
            <div>
              <h2>{child.name}</h2>
              <p className="meta">
                Age {child.age}
                {child.yearGroup ? ` · ${child.yearGroup}` : ''}
              </p>
              {child.interests.length > 0 && (
                <p className="meta" style={{ marginTop: '0.5rem' }}>
                  Loves {child.interests.slice(0, 2).join(' & ')}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {children.length === 0 && !error && (
        <p className="muted" style={{ marginTop: '2rem' }}>
          No children yet. Add one in Settings.
        </p>
      )}
    </div>
  );
}
