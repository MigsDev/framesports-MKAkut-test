import { useMemo, useState } from 'react';
import { ArrowDown, BarChart3, CirclePlay, PieChart } from 'lucide-react';
import type { Clip } from '../types';

const COLORS = ['#2b76ed', '#8357e8', '#17a883', '#ef9b43', '#e65e83', '#4e9fc2'];

interface AnalyticsReportsProps {
  clips: Clip[];
  bySport: Record<string, number>;
  onPlay: (clip: Clip) => void;
}

function SportPieChart({ bySport }: { bySport: Record<string, number> }) {
  const slices = Object.entries(bySport).sort((a, b) => b[1] - a[1]);
  const total = slices.reduce((sum, [, count]) => sum + count, 0);
  let position = 0;

  const stops = slices.map(([, count], index) => {
    const from = position;
    position += total ? count / total * 100 : 0;
    return `${COLORS[index % COLORS.length]} ${from}% ${position}%`;
  });

  return (
    <section className="library-panel report-panel">
      <div className="report-heading"><PieChart size={19}/><div><h2>Sports distribution</h2><p>Share of stored clips by sport</p></div></div>
      {total === 0 ? <div className="empty">No clip data available.</div> : (
        <div className="pie-layout">
          <div className="pie-donut" role="img" aria-label="Pie chart of clip counts per sport" style={{ background: `conic-gradient(${stops.join(', ')})` }}>
            <div><strong>{total}</strong><span>Total clips</span></div>
          </div>
          <div className="pie-legend">
            {slices.map(([sport, count], index) => (
              <div key={sport} className="pie-legend-row">
                <i style={{ background: COLORS[index % COLORS.length] }}/>
                <span>{sport}</span>
                <strong>{(count / total * 100).toFixed(1)}%</strong>
                <small>{count}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PublicationFlow({ clips }: { clips: Clip[] }) {
  const stages = [
    { label: 'Draft', status: 'draft', detail: 'Content created' },
    { label: 'Reviewing', status: 'reviewing', detail: 'Quality check' },
    { label: 'Published', status: 'published', detail: 'Visible to viewers' },
  ];

  return (
    <section className="library-panel report-panel">
      <div className="report-heading"><BarChart3 size={19}/><div><h2>Publication workflow</h2><p>Current clip counts by stage</p></div></div>
      <div className="flow-stages">
        {stages.map((stage, index) => (
          <div className="flow-stage-group" key={stage.status}>
            <div className={`flow-stage flow-${stage.status}`}>
              <span>{stage.label}</span>
              <strong>{clips.filter(clip => clip.status === stage.status).length}</strong>
              <small>{stage.detail}</small>
            </div>
            {index < stages.length - 1 && <ArrowDown size={18} className="flow-arrow" aria-hidden="true"/>}
          </div>
        ))}
      </div>
      <p className="report-footnote">Workflow diagram represents the stages, not a history of individual transitions.</p>
    </section>
  );
}

function VideoViewsReport({ clips, onPlay }: { clips: Clip[]; onPlay: (clip: Clip) => void }) {
  const [sport, setSport] = useState('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const sports = [...new Set(clips.map(clip => clip.sport))].sort();

  const visibleClips = useMemo(
    () => clips.filter(clip => sport === 'all' || clip.sport === sport)
      .sort((a, b) => b.views - a.views),
    [clips, sport],
  );

  const selected = visibleClips.find(clip => clip.id === selectedId) ?? visibleClips[0];
  const maximum = Math.max(1, ...visibleClips.map(clip => clip.views));
  const totalViews = visibleClips.reduce((sum, clip) => sum + clip.views, 0);

  return (
    <section className="library-panel views-report">
      <div className="views-report-header">
        <div className="report-heading"><BarChart3 size={20}/><div><h2>Views by video</h2><p>Compare video engagement and inspect any clip</p></div></div>
        <label className="report-filter">
          Sport
          <select aria-label="Filter views report by sport" value={sport} onChange={event => { setSport(event.target.value); setSelectedId(null); }}>
            <option value="all">All sports</option>
            {sports.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
      </div>

      <div className="report-summary">
        <span><strong>{totalViews.toLocaleString('en-US')}</strong> Total views</span>
        <span><strong>{visibleClips.length}</strong> Videos</span>
        <span><strong>{visibleClips.length ? Math.round(totalViews / visibleClips.length).toLocaleString('en-US') : '0'}</strong> Average views</span>
      </div>

      {visibleClips.length === 0 ? <div className="empty">No videos for this sport.</div> : (
        <div className="views-chart-layout">
          <div className="views-chart" role="group" aria-label="Views by video bar chart">
            {visibleClips.map(clip => (
              <button
                key={clip.id}
                className={`video-bar-row ${selected?.id === clip.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(clip.id)}
                aria-pressed={selected?.id === clip.id}
              >
                <div className="video-bar-meta"><span>{clip.title}</span><strong>{clip.views.toLocaleString('en-US')}</strong></div>
                <div className="video-bar-track"><div style={{ width: `${clip.views === 0 ? 0 : Math.max(1, clip.views / maximum * 100)}%` }}/></div>
                <small>{clip.sport} · {clip.status}</small>
              </button>
            ))}
          </div>

          {selected && (
            <aside className="selected-video-panel">
              <span className="eyebrow">SELECTED VIDEO</span>
              <h3>{selected.title}</h3>
              <p>{selected.sport} · {selected.status}</p>
              <strong>{selected.views.toLocaleString('en-US')}</strong>
              <small>Recorded views</small>
              <button className="btn primary" onClick={() => onPlay(selected)}><CirclePlay size={17}/> Preview clip</button>
            </aside>
          )}
        </div>
      )}
    </section>
  );
}

export default function AnalyticsReports({ clips, bySport, onPlay }: AnalyticsReportsProps) {
  return (
    <div className="analytics-reports">
      <div className="analytics-report-grid">
        <SportPieChart bySport={bySport}/>
        <PublicationFlow clips={clips}/>
      </div>
      <VideoViewsReport clips={clips} onPlay={onPlay}/>
    </div>
  );
}
