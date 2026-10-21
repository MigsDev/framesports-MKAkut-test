import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, RefreshCw, Radio } from 'lucide-react';
import { api } from '../api';
import type { SportsFixture } from '../types';

const leagues = [
  { id: '4328', name: 'English Premier League' },
  { id: '4335', name: 'Spanish La Liga' },
  { id: '4387', name: 'NBA' },
  { id: '4391', name: 'NFL' },
  { id: '4418', name: 'Formula 1' },
];

export default function SportsFeeds() {
  const [league, setLeague] = useState('4328');
  const [fixtures, setFixtures] = useState<SportsFixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.sportsFeeds(league);
      setFixtures(result.fixtures);
      setUpdated(new Date().toLocaleTimeString());
    } catch (cause) {
      setFixtures([]);
      setError(cause instanceof Error ? cause.message : 'Could not load fixtures');
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="library-panel fixtures-panel" aria-label="Upcoming sports fixtures">
      <div className="section-heading">
        <div><h2><CalendarDays size={21} /> Upcoming fixtures</h2><p>Schedules provided by TheSportsDB free API. Not live scores.</p></div>
        <div className="fixture-controls">
          <label htmlFor="league-picker">League</label>
          <select id="league-picker" value={league} onChange={event => setLeague(event.target.value)}>
            {leagues.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button type="button" className="btn" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>
      {error && <p role="alert" className="notice error">{error}</p>}
      {loading && <p className="empty">Loading upcoming matches...</p>}
      {!loading && !error && fixtures.length === 0 && <p className="empty">No upcoming fixtures available for this league with the free API.</p>}
      <div className="fixture-list">
        {fixtures.map(match => <article key={match.id} className="fixture-card">
          <div><strong>{match.home_team || match.title || 'TBD'} {match.away_team ? ` vs ${match.away_team}` : ''}</strong><p>{match.league || match.sport || 'Sport'} {match.venue ? `· ${match.venue}` : ''}</p></div>
          <div className="fixture-date"><CalendarDays size={16} /> {match.date || 'Date TBD'} {match.time ? `· ${match.time} UTC` : ''}</div>
        </article>)}
      </div>
      <p className="fixture-credit"><Radio size={14} /> TheSportsDB v1 · cached up to 10 minutes {updated ? `· Last checked ${updated}` : ''}</p>
    </section>
  );
}
