import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { CirclePlay, ExternalLink, Eye, MessageSquare, Star, X } from 'lucide-react';
import type { Clip, ClipFeedback, NewClipComment } from '../types';
import { api } from '../api';
import { resolveVideoSource } from '../utils/videoSource';

interface VideoPlayerModalProps {
  clip: Clip;
  onClose: () => void;
}

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

/** Displays playback tools and stored viewer feedback for one clip. */
export default function VideoPlayerModal({ clip, onClose }: VideoPlayerModalProps) {
  const source = clip.video_url ? resolveVideoSource(clip.video_url) : null;
  const embedded = source?.kind === 'youtube' || source?.kind === 'vimeo';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [feedback, setFeedback] = useState<ClipFeedback | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [kind, setKind] = useState<'comment' | 'issue'>('comment');

  const refreshComments = useCallback(async () => {
    try {
      setFeedback(await api.comments(clip.id));
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load feedback');
    }
  }, [clip.id]);

  useEffect(() => { void refreshComments(); }, [refreshComments]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function updateSpeed(next: number) {
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const comment: NewClipComment = {
      author: name.trim(),
      body: message.trim(),
      kind,
      rating: kind === 'comment' && rating > 0 ? rating : null,
    };
    if (!comment.author || !comment.body) {
      setError('Enter your name and feedback.');
      return;
    }
    setSending(true);
    try {
      await api.addComment(clip.id, comment);
      setMessage('');
      setRating(0);
      await refreshComments();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit feedback');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="player-modal feedback-modal" role="dialog" aria-modal="true" aria-label={`Watch ${clip.title}`}>
        <div className="player-heading">
          <div className="player-heading-title">
            <strong>{clip.title}</strong>
            <span className="player-view-count" aria-live="polite">
              <Eye size={15} /> {clip.views.toLocaleString('en-US')} views
            </span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close player"><X size={20}/></button>
        </div>

        {embedded && <iframe className="player-frame" src={source.url} title={clip.title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
        {source?.kind === 'file' && <video ref={videoRef} className="player-frame" src={source.url} controls autoPlay playsInline>Your browser cannot play this file.</video>}
        {(!source || source.kind === 'unsupported') && <div className="no-video"><CirclePlay size={52}/><p>{source ? 'This link cannot play inside the browser.' : 'No video URL attached.'}</p><small>Use a YouTube, Vimeo, or direct MP4/WebM/Ogg URL.</small></div>}

        <div className="video-tool-row">
          {source?.kind === 'file' && <label>Playback speed <select value={speed} onChange={e => updateSpeed(Number(e.target.value))}>{speedOptions.map(value => <option key={value} value={value}>{value}×</option>)}</select></label>}
          {embedded && <small>Video provider controls playback speed and quality.</small>}
          {source?.url && <a className="source-link" href={source.url} target="_blank" rel="noopener noreferrer">Open video <ExternalLink size={13}/></a>}
        </div>

        <div className="feedback-section">
          <h3><MessageSquare size={18}/> Viewer comments & player feedback</h3>
          <div className="feedback-summary">{feedback?.rating_count ? `★ ${feedback.average_rating} / 5 · ${feedback.rating_count} ratings` : 'No ratings yet'} · {feedback?.comments.length ?? 0} recent entries</div>
          <form onSubmit={submitComment} className="feedback-form">
            <div className="feedback-fields">
              <input aria-label="Your name" maxLength={80} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
              <select aria-label="Feedback type" value={kind} onChange={e => setKind(e.target.value as 'comment' | 'issue')}><option value="comment">Comment / rating</option><option value="issue">Report playback issue</option></select>
            </div>
            {kind === 'comment' && <div className="rating-picker" role="group" aria-label="Rate this clip">{[1,2,3,4,5].map(value => <button key={value} type="button" aria-label={`Rate ${value} stars`} aria-pressed={rating===value} onClick={() => setRating(value)}><Star size={22} fill={value <= rating ? 'currentColor' : 'none'}/></button>)} <small>Optional rating</small></div>}
            <textarea aria-label="Your feedback" maxLength={2000} rows={3} placeholder={kind === 'issue' ? 'Describe the playback issue...' : 'What did you think of this video?'} value={message} onChange={e => setMessage(e.target.value)} required />
            <button type="submit" className="btn primary" disabled={sending}>{sending ? 'Sending…' : 'Post feedback'}</button>
            {error && <p className="feedback-error" role="alert">{error} <button type="button" onClick={() => void refreshComments()}>Retry</button></p>}
          </form>
          <div className="feedback-list">
            {feedback?.comments.map(comment => <article className="feedback-item" key={comment.id}><div><strong>{comment.author}</strong><span>{comment.kind === 'issue' ? 'Playback issue' : comment.rating ? `★ ${comment.rating}/5` : 'Comment'} · {new Date(comment.created_at).toLocaleDateString()}</span></div><p>{comment.body}</p></article>)}
            {feedback && feedback.comments.length === 0 && <p className="feedback-empty">No feedback yet. Be the first to comment.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
