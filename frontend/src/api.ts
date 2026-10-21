import type { Clip, ClipInput, Dashboard, ClipFeedback, ClipComment, NewClipComment, SportsFeedResponse, RegisteredView } from './types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json() as { error?: string; errors?: string[] };
      message = body.errors?.join(', ') || body.error || message;
    } catch { /* Non-JSON server failure. */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  sportsFeeds: (league: string) => request<SportsFeedResponse>(`/sports_feeds?league=${encodeURIComponent(league)}`),
  comments: (clipId: number) => request<ClipFeedback>(`/clips/${clipId}/comments`),
  addComment: (clipId: number, comment: NewClipComment) => request<ClipComment>(`/clips/${clipId}/comments`, { method: 'POST', body: JSON.stringify({ comment }) }),
  dashboard: () => request<Dashboard>('/dashboard'),
  registerView: (clipId: number) => request<RegisteredView>(`/clips/${clipId}/view`, { method: 'POST' }),
  clips: (query = '') => request<Clip[]>(`/clips${query}`),
  create: (clip: ClipInput) => request<Clip>('/clips', { method: 'POST', body: JSON.stringify({ clip }) }),
  update: (id: number, clip: ClipInput) => request<Clip>(`/clips/${id}`, { method: 'PATCH', body: JSON.stringify({ clip }) }),
  remove: (id: number) => request<void>(`/clips/${id}`, { method: 'DELETE' }),
};
