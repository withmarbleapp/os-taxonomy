import { useEffect, useMemo, useState } from 'react';
import type { AppSettings, Child } from '@shared/types';
import { deriveChildAgeFields } from '@shared/ukSchoolYear';
import { api } from '../lib/api';

type EditDraft = {
  name: string;
  dateOfBirth: string;
  interests: string;
};

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2021-03-15');
  const [interests, setInterests] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const preview = useMemo(() => {
    try {
      return deriveChildAgeFields(dateOfBirth);
    } catch {
      return null;
    }
  }, [dateOfBirth]);

  const editPreview = useMemo(() => {
    if (!draft?.dateOfBirth) return null;
    try {
      return deriveChildAgeFields(draft.dateOfBirth);
    } catch {
      return null;
    }
  }, [draft?.dateOfBirth]);

  async function refresh() {
    const [s, c] = await Promise.all([api.getSettings(), api.listChildren()]);
    setSettings(s);
    setChildren(c);
  }

  useEffect(() => {
    refresh().catch((e: Error) => setError(e.message));
  }, []);

  async function toggleDemo(demoMode: boolean) {
    setError(null);
    try {
      await api.setDemoMode(demoMode);
      await refresh();
      setMessage(demoMode ? 'Demo mode on — no LLM calls.' : 'Demo mode off — live agents.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  }

  async function addChild(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.createChild({
        name: name.trim(),
        dateOfBirth,
        interests: interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setName('');
      setInterests('');
      setDateOfBirth('2021-03-15');
      await refresh();
      setMessage('Child added.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add child');
    }
  }

  function startEdit(child: Child) {
    setEditingId(child.id);
    setDraft({
      name: child.name,
      dateOfBirth: child.dateOfBirth,
      interests: child.interests.join(', '),
    });
    setError(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !draft) return;
    setError(null);
    try {
      await api.updateChild(editingId, {
        name: draft.name.trim(),
        dateOfBirth: draft.dateOfBirth,
        interests: draft.interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setEditingId(null);
      setDraft(null);
      await refresh();
      setMessage('Child updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update child');
    }
  }

  async function removeChild(child: Child) {
    if (
      !confirm(
        `Remove ${child.name}? Their worksheets, scans, and progress will be deleted.`,
      )
    ) {
      return;
    }
    setError(null);
    try {
      await api.deleteChild(child.id);
      if (editingId === child.id) {
        setEditingId(null);
        setDraft(null);
      }
      await refresh();
      setMessage(`${child.name} removed.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove child');
    }
  }

  return (
    <div className="fade-in stack">
      <section className="hero" style={{ marginBottom: '1rem' }}>
        <p className="section-title">Settings</p>
        <h1>Household setup</h1>
        <p>
          Add children with their date of birth — we&apos;ll keep their UK school year
          and curriculum band up to date as they grow.
        </p>
      </section>

      {settings && (
        <section className="panel stack">
          <p className="section-title">Agents</p>
          <p className="meta">
            Demo mode: <strong>{settings.demoMode ? 'On' : 'Off'}</strong>
            {' · '}
            Claude key: {settings.anthropicConfigured ? 'set' : 'missing'}
            {' · '}
            OpenAI key: {settings.openaiConfigured ? 'set' : 'missing'}
          </p>
          <div className="row">
            <button
              type="button"
              className={`btn ${settings.demoMode ? '' : 'secondary'}`}
              onClick={() => void toggleDemo(true)}
            >
              Use demo data
            </button>
            <button
              type="button"
              className={`btn ${!settings.demoMode ? '' : 'secondary'}`}
              onClick={() => void toggleDemo(false)}
            >
              Use live LLMs
            </button>
          </div>
        </section>
      )}

      <section className="panel stack">
        <p className="section-title">Children</p>
        <div className="list">
          {children.map((child) => (
            <div key={child.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
              {editingId === child.id && draft ? (
                <form className="stack" onSubmit={saveEdit}>
                  <label className="field">
                    Name
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      required
                    />
                  </label>
                  <label className="field">
                    Date of birth
                    <input
                      type="date"
                      value={draft.dateOfBirth}
                      onChange={(e) =>
                        setDraft({ ...draft, dateOfBirth: e.target.value })
                      }
                      required
                    />
                  </label>
                  {editPreview && (
                    <p className="meta">
                      Age {editPreview.age} · {editPreview.yearGroup}
                    </p>
                  )}
                  <label className="field">
                    Interests (comma-separated)
                    <input
                      value={draft.interests}
                      onChange={(e) =>
                        setDraft({ ...draft, interests: e.target.value })
                      }
                      placeholder="sea life, unicorns"
                    />
                  </label>
                  <div className="row">
                    <button className="btn" type="submit">
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <strong>{child.name}</strong>
                    <p className="meta">
                      Age {child.age}
                      {child.yearGroup ? ` · ${child.yearGroup}` : ''}
                      {child.interests.length ? ` · ${child.interests.join(', ')}` : ''}
                    </p>
                  </div>
                  <div className="row">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => startEdit(child)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => void removeChild(child)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form className="stack" onSubmit={addChild}>
          <p className="section-title">Add child</p>
          <label className="field">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="field">
            Date of birth
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </label>
          {preview && (
            <p className="meta">
              Age {preview.age} · {preview.yearGroup}
            </p>
          )}
          <label className="field">
            Interests (comma-separated)
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="sea life, unicorns"
            />
          </label>
          <button className="btn" type="submit">
            Add child
          </button>
        </form>
      </section>

      {message && <p className="muted">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
