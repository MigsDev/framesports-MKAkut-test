
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Activity, Check, Plus } from 'lucide-react';

import { api } from './api';
import type { Clip, ClipInput, Dashboard } from './types';

import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import ClipLibrary from './components/ClipLibrary';
import ClipModal from './components/ClipModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import AnalyticsReports from './components/AnalyticsReports';
import SportsFeeds from './components/SportsFeeds';
import type { View } from './components/Sidebar';

function readView(): View {
  const hash = window.location.hash.replace('#', '');
  return hash === 'library' || hash === 'analytics' || hash === 'fixtures' ? hash : 'overview';
}

const headings: Record<View, { eyebrow: string; title: string; subtitle: string }> = {
  overview: { eyebrow: 'YOUR CONTENT AT A GLANCE', title: 'Overview', subtitle: 'Manage your sports content and track performance in one place.' },
  library: { eyebrow: 'VIDEO WORKSPACE', title: 'Clip library', subtitle: 'Search, review, publish and manage all your sports highlights.' },
  analytics: { eyebrow: 'CONTENT PERFORMANCE', title: 'Analytics', subtitle: 'Understand your clip performance and sports distribution.' },
  fixtures: { eyebrow: 'SPORTS DATA', title: 'Sports feeds', subtitle: 'Browse upcoming fixtures from TheSportsDB.' },
};

function App() {
  const [view, setView] = useState<View>(readView);

  useEffect(() => {
    const onHashChange = () => setView(readView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function navigate(next: View) {
    window.location.hash = next;
    setView(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  const [clips, setClips] = useState<Clip[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewError, setViewError] = useState('');

  // Search and filtering
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sport, setSport] = useState('all');

  // Modal state
  const [editing, setEditing] = useState<Clip | 'new' | null>(null);
  const [playing, setPlaying] = useState<Clip | null>(null);

  // Delete state
  const [deleting, setDeleting] = useState<number | null>(null);

  // ==========================================
  // API - LOAD CLIPS AND DASHBOARD
  // ==========================================

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [items, stats] = await Promise.all([
        api.clips(),
        api.dashboard(),
      ]);

      setClips(items);
      setDashboard(stats);
      setError('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // INITIAL DATA LOADING
  // ==========================================

  useEffect(() => {
    void load();
  }, [load]);

  // ==========================================
  // SEARCH AND FILTERING
  // ==========================================

  const filtered = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return clips.filter((clip) => {
      // Progressive, case-insensitive prefix search: T -> Te -> Tenn...
      const matchesSearch = clip.title.toLowerCase().startsWith(searchTerm);

      const matchesStatus =
        status === 'all' || clip.status === status;

      const matchesSport =
        sport === 'all' || clip.sport === sport;

      return matchesSearch && matchesStatus && matchesSport;
    });
  }, [clips, search, status, sport]);

  // ==========================================
  // CREATE OR UPDATE CLIP
  // ==========================================

  async function save(input: ClipInput) {
    if (editing && editing !== 'new') {
      await api.update(editing.id, input);
    } else {
      await api.create(input);
    }

    setEditing(null);
    await load();
  }

  // ==========================================
  // DELETE CLIP
  // ==========================================

  async function remove(id: number) {
    const confirmed = window.confirm(
      'Delete this clip permanently?'
    );

    if (!confirmed) return;

    setDeleting(id);

    try {
      await api.remove(id);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete clip.'
      );
    } finally {
      setDeleting(null);
    }
  }

  // ==========================================
  // RECORD A VIDEO VIEW
  // ==========================================

  function playClip(clip: Clip) {
    // Open the modal immediately; let Rails confirm the view asynchronously.
    setPlaying(clip);
    setViewError('');

    void api.registerView(clip.id).then(({ views }) => {
      // Use the authoritative PostgreSQL count for this clip.
      setClips(current => current.map(item =>
        item.id === clip.id ? { ...item, views: Math.max(item.views, views) } : item
      ));

      // Keep the currently open video and the recent-clips display in sync.
      setPlaying(current => current?.id === clip.id
        ? { ...current, views: Math.max(current.views, views) }
        : current);

      setDashboard(current => current ? {
        ...current,
        total_views: current.total_views + 1,
        recent_clips: current.recent_clips.map(item =>
          item.id === clip.id ? { ...item, views: Math.max(item.views, views) } : item
        ),
      } : current);
    }).catch(reason => {
      const message = reason instanceof Error ? reason.message : 'Unknown error';
      setViewError(`The player opened, but the view was not recorded: ${message}`);
    });
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="app-shell">

      <Sidebar active={view} onNavigate={navigate} />

      <main className="main-content">

        {/* TOP NAVIGATION */}
        <div className="topbar">
          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>{headings[view].title}</strong>
          </div>

          <div className="online">
            <span />
            System ready
          </div>
        </div>

        <div className="page-content">

          {/* PAGE HEADER */}
          <div className="heading-row">
            <div>
              <p className="eyebrow">
                {headings[view].eyebrow}
              </p>

              <h1>{headings[view].title}</h1>

              <p className="subtitle">
                {headings[view].subtitle}
              </p>
            </div>

            <button
              type="button"
              className="btn primary add-button"
              onClick={() => setEditing('new')}
            >
              <Plus size={18} />
              New clip
            </button>
          </div>

          {/* API ERROR */}
          {error && (
            <div className="notice error" role="alert">
              Could not connect to the Rails API: {error}

              <button
                type="button"
                onClick={() => void load()}
              >
                Retry
              </button>
            </div>
          )}

          {viewError && (
            <div className="notice error" role="alert">
              {viewError}
              <button type="button" onClick={() => setViewError('')}>Dismiss</button>
            </div>
          )}

          {/* DASHBOARD STATISTICS */}
          {view !== 'library' && view !== 'fixtures' && <section id="analytics">
            <StatsCards dashboard={dashboard} />
          </section>}

          {view === 'analytics' && <section className="analytics-grid">
            <div className="library-panel analytics-card"><div className="section-heading"><div><h2>Clips by sport</h2><p>Number of highlights in each sport</p></div></div>
              {Object.entries(dashboard?.by_sport ?? {}).sort((a,b) => b[1]-a[1]).map(([name, count]) => <div className="sport-bar-row" key={name}><div><strong>{name}</strong><span>{count} clips</span></div><div className="sport-bar"><div style={{ width: `${dashboard?.total_clips ? count / dashboard.total_clips * 100 : 0}%` }}/></div></div>)}
              {!dashboard && <p className="empty">Loading sport distribution...</p>}
            </div>
            <div className="library-panel analytics-card"><div className="section-heading"><div><h2>Recently added</h2><p>The five latest highlights</p></div></div>
              {dashboard?.recent_clips.map(clip => <button key={clip.id} className="recent-clip" onClick={() => playClip(clip)}><span>{clip.title}<small>{clip.sport} · {clip.status}</small></span><span>{clip.views.toLocaleString()} views</span></button>)}
            </div>
          </section>}

          {view === 'analytics' && (
            <AnalyticsReports
              clips={clips}
              bySport={dashboard?.by_sport ?? {}}
              onPlay={playClip}
            />
          )}

          {view === 'fixtures' && <SportsFeeds />}

          {/* CLIP MANAGEMENT */}
          {view !== 'analytics' && view !== 'fixtures' && <section className="library-panel" id="library">

            <div className="section-heading">
              <div>
                <h2>
                  Clip library <span>{clips.length}</span>
                </h2>

                <p>
                  Organize, review, and publish your
                  video content.
                </p>
              </div>

              <div className="activity-label">
                <Activity size={16} />
                Live workspace
              </div>
            </div>

            <ClipLibrary
              clips={clips}
              filtered={filtered}
              loading={loading}
              deleting={deleting}
              search={search}
              status={status}
              sport={sport}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onSportChange={setSport}
              onEdit={setEditing}
              onPlay={playClip}
              onDelete={remove}
            />

            <div className="table-footer">
              <span>
                {filtered.length} matching clips out of {clips.length}
              </span>

              <span>
                <Check size={15} />
                Connected to Rails API
              </span>
            </div>

          </section>}

          <p className="page-footer">
            © {new Date().getFullYear()} MKAkut. All rights reserved.
          </p>

        </div>
      </main>

      {/* CREATE / EDIT MODAL */}
      {editing && (
        <ClipModal
          selected={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}

      {/* VIDEO PLAYER */}
      {playing && (
        <VideoPlayerModal
          clip={playing}
          onClose={() => setPlaying(null)}
        />
      )}

    </div>
  );
}

export default App;
