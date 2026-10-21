export interface SportsFixture {
  id: string | null;
  title: string | null;
  home_team: string | null;
  away_team: string | null;
  date: string | null;
  time: string | null;
  sport: string | null;
  league: string | null;
  venue: string | null;
}

export interface SportsFeedResponse {
  league_id: string;
  league: string;
  fixtures: SportsFixture[];
  source: string;
}

export type ClipStatus = 'draft' | 'reviewing' | 'published';

export interface Clip {
  id: number;
  title: string;
  sport: string;
  status: ClipStatus;
  views: number;
  duration_seconds: number;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ClipInput = Pick<Clip, 'title' | 'sport' | 'status' | 'views' | 'duration_seconds' | 'video_url'>;

export interface Dashboard {
  total_clips: number;
  published_clips: number;
  total_views: number;
  by_sport: Record<string, number>;
  recent_clips: Clip[];
}

export interface ClipComment {
  id: number;
  clip_id: number;
  author: string;
  body: string;
  rating: number | null;
  kind: 'comment' | 'issue';
  created_at: string;
}

export interface ClipFeedback {
  comments: ClipComment[];
  average_rating: number | null;
  rating_count: number;
}

export interface NewClipComment {
  author: string;
  body: string;
  rating: number | null;
  kind: 'comment' | 'issue';
}
