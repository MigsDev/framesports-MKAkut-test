import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Clip, ClipInput, ClipStatus } from '../types';

const SPORTS = ['Football', 'Basketball', 'Tennis', 'Hockey', 'Athletics', 'Other'];

const EMPTY_CLIP: ClipInput = {
  title: '',
  sport: 'Football',
  status: 'draft',
  views: 0,
  duration_seconds: 60,
  video_url: '',
};

interface ClipModalProps {
  selected: Clip | null;
  onClose: () => void;
  onSave: (input: ClipInput) => Promise<void>;
}

function toEditableClip(clip: Clip | null): ClipInput {
  if (!clip) return { ...EMPTY_CLIP };

  return {
    title: clip.title,
    sport: clip.sport,
    status: clip.status,
    views: clip.views,
    duration_seconds: clip.duration_seconds,
    video_url: clip.video_url ?? '',
  };
}

export default function ClipModal({ selected, onClose, onSave }: ClipModalProps) {
  const [form, setForm] = useState<ClipInput>(() => toEditableClip(selected));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField<K extends keyof ClipInput>(field: K, value: ClipInput[K]) {
    setForm(previous => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await onSave(form);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save clip.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="modal" onSubmit={handleSubmit}>
        <header className="modal-heading">
          <div>
            <p className="eyebrow">CLIP MANAGEMENT</p>
            <h2>{selected ? 'Edit clip' : 'Add a new clip'}</h2>
          </div>

          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={20}/>
          </button>
        </header>

        <label>
          Clip title
          <input
            required
            maxLength={120}
            value={form.title}
            placeholder="e.g. Last-minute match winner"
            onChange={event => setField('title', event.target.value)}
          />
        </label>

        <div className="field-grid">
          <label>
            Sport
            <select value={form.sport} onChange={event => setField('sport', event.target.value)}>
              {[...new Set([form.sport, ...SPORTS])].map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={event => setField('status', event.target.value as ClipStatus)}
            >
              <option value="draft">Draft</option>
              <option value="reviewing">Reviewing</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>

        <div className="field-grid">
          <label>
            Duration (seconds)
            <input
              required
              type="number"
              min={1}
              value={form.duration_seconds}
              onChange={event => setField('duration_seconds', Number(event.target.value))}
            />
          </label>

          <label>
            Views
            <input
              required
              type="number"
              min={0}
              value={form.views}
              onChange={event => setField('views', Number(event.target.value))}
            />
          </label>
        </div>

        <label>
          Video URL <span className="muted">(YouTube / direct MP4 or WebM)</span>
          <input
            type="url"
            value={form.video_url ?? ''}
            placeholder="https://www.youtube.com/shorts/..."
            onChange={event => setField('video_url', event.target.value)}
          />
        </label>

        {error && <div role="alert" className="notice error">{error}</div>}

        <footer className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button disabled={saving} type="submit" className="btn primary">
            {saving ? 'Saving...' : selected ? 'Save changes' : 'Create clip'}
          </button>
        </footer>
      </form>
    </div>
  );
}
