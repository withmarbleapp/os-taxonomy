import type {
  AppSettings,
  Assessment,
  Child,
  LearningPath,
  ProgressSummary,
  Worksheet,
} from '@shared/types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getSettings: () => request<AppSettings>('/api/settings'),
  setDemoMode: (demoMode: boolean) =>
    request<{ demoMode: boolean }>('/api/settings/demo-mode', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoMode }),
    }),
  listChildren: () => request<Child[]>('/api/children'),
  getChild: (id: string) => request<Child>(`/api/children/${id}`),
  createChild: (data: {
    name: string;
    dateOfBirth: string;
    interests?: string[];
    avatarColor?: string;
  }) =>
    request<Child>('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateChild: (
    id: string,
    data: {
      name?: string;
      dateOfBirth?: string;
      interests?: string[];
      avatarColor?: string;
    },
  ) =>
    request<Child>(`/api/children/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteChild: (id: string) =>
    request<{ ok: boolean }>(`/api/children/${id}`, { method: 'DELETE' }),
  getProgress: (id: string) => request<ProgressSummary>(`/api/children/${id}/progress`),
  getLearningPath: (id: string) =>
    request<LearningPath>(`/api/children/${id}/learning-path`),
  getMastery: (id: string) =>
    request<
      Array<{
        topicId: string;
        status: string;
        confidence: number;
        notes: string | null;
        topic: {
          id: string;
          name: string | null;
          subject: string;
          domain: string | null;
          description: string;
        } | null;
      }>
    >(`/api/children/${id}/mastery`),
  getDomains: (id: string) =>
    request<
      Array<{
        subject: string;
        domain: string;
        summary: string | null;
        topics: Array<{
          topicId: string;
          name: string | null;
          status: string;
          confidence: number;
        }>;
      }>
    >(`/api/children/${id}/domains`),
  listWorksheets: (id: string) => request<Worksheet[]>(`/api/children/${id}/worksheets`),
  listAssessments: (id: string) =>
    request<Assessment[]>(`/api/children/${id}/assessments`),
  createWorksheet: (data: {
    childId: string;
    theme: string;
    durationMinutes: number;
    subjectFocus?: string | null;
    domainFocus?: string | null;
    preferTopicId?: string | null;
  }) =>
    request<Worksheet>('/api/worksheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  getWorksheet: (id: string) => request<Worksheet>(`/api/worksheets/${id}`),
  markPrinted: (id: string) =>
    request<{ ok: boolean }>(`/api/worksheets/${id}/printed`, { method: 'POST' }),
  assessWorksheet: async (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/worksheets/${id}/assess`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { error?: string }).error || res.statusText);
    }
    return res.json() as Promise<Assessment>;
  },
  getSubjects: () => request<string[]>('/api/taxonomy/subjects'),
};
