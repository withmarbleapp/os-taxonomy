import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Assessment, Worksheet } from '@shared/types';
import { api } from '../lib/api';

export function UploadPage() {
  const { id, worksheetId } = useParams<{ id: string; worksheetId: string }>();
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!worksheetId) return;
    api
      .getWorksheet(worksheetId)
      .then(setWorksheet)
      .catch((e: Error) => setError(e.message));
  }, [worksheetId]);

  async function handleFile(file: File) {
    if (!worksheetId) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.assessWorksheet(worksheetId, file);
      setAssessment(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setBusy(false);
    }
  }

  if (!worksheet) return <p className="muted">Loading…</p>;

  if (assessment) {
    return (
      <div className="fade-in stack">
        <p className="section-title">Marked</p>
        <h1>How it went</h1>
        <p className="story" style={{ maxWidth: '36ch' }}>
          {assessment.summary}
        </p>
        <section className="panel">
          <p className="section-title">By topic</p>
          <div className="list">
            {assessment.results.map((r) => (
              <div key={r.topicId} className="list-item">
                <div>
                  <strong>{r.recommendation}</strong>
                  <p className="meta">{r.evidence.join(' · ')}</p>
                </div>
                <span className="status">{Math.round(r.score * 100)}%</span>
              </div>
            ))}
          </div>
        </section>
        <div className="row">
          <Link className="btn" to={`/children/${id}/progress`}>
            View progress
          </Link>
          <Link className="btn secondary" to={`/children/${id}`}>
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in stack">
      <section className="hero" style={{ marginBottom: '1rem' }}>
        <p className="section-title">Upload scan</p>
        <h1>{worksheet.title}</h1>
        <p>Photograph or scan the completed sheet. We’ll mark it and update progress.</p>
      </section>

      <div
        className={`dropzone ${drag ? 'active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const file = e.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
          {busy ? 'Marking…' : 'Drop a photo here, or tap to choose'}
        </p>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          JPG, PNG, or WebP
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      {error && <p className="error">{error}</p>}

      <Link className="btn ghost" to={`/children/${id}`}>
        Cancel
      </Link>
    </div>
  );
}
