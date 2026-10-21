import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CirclePlay, LoaderCircle, Pencil, Search, Trash2 } from 'lucide-react';
import type { Clip } from '../types';
import VideoHoverPreview from './VideoHoverPreview';

interface ClipLibraryProps {
  clips: Clip[];
  filtered: Clip[];
  loading: boolean;
  deleting: number | null;
  search: string;
  status: string;
  sport: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSportChange: (value: string) => void;
  onEdit: (clip: Clip) => void;
  onPlay: (clip: Clip) => void;
  onDelete: (id: number) => Promise<void>;
}

interface HoveredClip {
  clip: Clip;
  x: number;
  y: number;
}

const PREVIEW_DELAY_MS = 450;

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export default function ClipLibrary({
  clips,
  filtered,
  loading,
  deleting,
  search,
  status,
  sport,
  onSearchChange,
  onStatusChange,
  onSportChange,
  onEdit,
  onPlay,
  onDelete,
}: ClipLibraryProps) {
  const [hoveredClip, setHoveredClip] = useState<HoveredClip | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const [pageSize, setPageSize] = useState<5 | 10>(5);
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, pageCount);
  const pagedClips = useMemo(
    () => filtered.slice((activePage - 1) * pageSize, activePage * pageSize),
    [filtered, activePage, pageSize],
  );

  useEffect(() => setPage(1), [search, status, sport, pageSize]);

  const dismissPreview = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = undefined;
    setHoveredClip(null);
  }, []);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  function schedulePreview(clip: Clip, element: HTMLElement) {
    dismissPreview();

    if (!clip.video_url || !window.matchMedia('(hover: hover)').matches) return;

    const rectangle = element.getBoundingClientRect();
    const previewWidth = 340;
    const previewHeight = 245;

    // Keep the preview visible on both desktop and narrow screens.
    const x = rectangle.right + previewWidth + 18 < window.innerWidth
      ? rectangle.right + 12
      : Math.max(12, rectangle.left - previewWidth - 12);

    const y = Math.max(
      12,
      Math.min(rectangle.top - 45, window.innerHeight - previewHeight - 12),
    );

    hoverTimer.current = window.setTimeout(() => {
      setHoveredClip({ clip, x, y });
    }, PREVIEW_DELAY_MS);
  }

  return (
    <>
      <div className="filters">
        <div className="search-field">
          <Search size={18}/>
          <input
            aria-label="Search clips"
            placeholder="Search from the start of a title (e.g. T, Te, Ten)..."
            value={search}
            onChange={event => onSearchChange(event.target.value)}
          />
        </div>

        <select
          aria-label="Filter by sport"
          value={sport}
          onChange={event => onSportChange(event.target.value)}
        >
          <option value="all">All sports</option>
          {[...new Set(clips.map(clip => clip.sport))].sort().map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={event => onStatusChange(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="reviewing">Reviewing</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>CLIP</th>
              <th>SPORT</th>
              <th>STATUS</th>
              <th>VIEWS</th>
              <th>DURATION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {pagedClips.map((clip, index) => (
              <tr key={clip.id}>
                <td>
                  <div className="clip-name">
                    <button
                      className={`thumbnail thumb-${index % 5}`}
                      aria-label={`Play ${clip.title}`}
                      onMouseEnter={event => schedulePreview(clip, event.currentTarget)}
                      onMouseLeave={dismissPreview}
                      onClick={() => {
                        dismissPreview();
                        onPlay(clip);
                      }}
                    >
                      <CirclePlay size={22}/>
                    </button>

                    <div>
                      <strong>{clip.title}</strong>
                      <small>Clip #{String(clip.id).padStart(4, '0')}</small>
                    </div>
                  </div>
                </td>

                <td><span className="sport-label">{clip.sport}</span></td>

                <td>
                  <span className={`status status-${clip.status}`}>
                    <i/>{clip.status === 'reviewing' ? 'In review' : clip.status}
                  </span>
                </td>

                <td className="numeric">{clip.views.toLocaleString('en-US')}</td>
                <td className="numeric muted">{formatDuration(clip.duration_seconds)}</td>

                <td>
                  <div className="actions">
                    <button aria-label={`Edit ${clip.title}`} onClick={() => onEdit(clip)}>
                      <Pencil size={17}/>
                    </button>
                    <button
                      aria-label={`Delete ${clip.title}`}
                      disabled={deleting === clip.id}
                      onClick={() => void onDelete(clip.id)}
                    >
                      <Trash2 size={17}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <div className="empty"><LoaderCircle className="spin"/> Loading clips...</div>}

        {!loading && filtered.length === 0 && (
          <div className="empty">No clips found. Change the filters or add a clip.</div>
        )}
      </div>

      <div className="pagination-bar">
        <span className="pagination-summary">
          {filtered.length === 0
            ? 'No matching clips'
            : `Showing ${(activePage - 1) * pageSize + 1}–${Math.min(activePage * pageSize, filtered.length)} of ${filtered.length} matches`}
        </span>

        <label className="pagination-size">
          Rows per page
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={event => setPageSize(Number(event.target.value) as 5 | 10)}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </label>

        <div className="pagination-actions">
          <button
            aria-label="Previous page"
            disabled={activePage <= 1}
            onClick={() => setPage(previous => Math.max(1, previous - 1))}
          ><ChevronLeft size={17}/></button>
          <span>Page {activePage} of {pageCount}</span>
          <button
            aria-label="Next page"
            disabled={activePage >= pageCount}
            onClick={() => setPage(previous => Math.min(pageCount, previous + 1))}
          ><ChevronRight size={17}/></button>
        </div>
      </div>

      {hoveredClip && (
        <VideoHoverPreview
          key={hoveredClip.clip.id}
          clip={hoveredClip.clip}
          x={hoveredClip.x}
          y={hoveredClip.y}
          onComplete={dismissPreview}
        />
      )}
    </>
  );
}
