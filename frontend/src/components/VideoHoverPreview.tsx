import { useEffect, useRef } from 'react';
import { CirclePlay } from 'lucide-react';
import type { Clip } from '../types';
import { resolveVideoSource } from '../utils/videoSource';

export const PREVIEW_SECONDS = 6;

interface VideoHoverPreviewProps {
  clip: Clip;
  x: number;
  y: number;
  onComplete: () => void;
}

/** A non-interactive, muted, six-second preview shown near a clip thumbnail. */
export default function VideoHoverPreview({
  clip,
  x,
  y,
  onComplete,
}: VideoHoverPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = clip.video_url ? resolveVideoSource(clip.video_url) : null;

  useEffect(() => {
    const timeout = window.setTimeout(onComplete, PREVIEW_SECONDS * 1000 + 1500);
    return () => window.clearTimeout(timeout);
  }, [clip.id, onComplete]);

  const style = { left: x, top: y };

  const youtubeUrl = source?.kind === 'youtube'
    ? `${source.url}?autoplay=1&mute=1&controls=0&playsinline=1&end=${PREVIEW_SECONDS}`
    : '';

  const vimeoUrl = source?.kind === 'vimeo'
    ? `${source.url}?autoplay=1&muted=1&background=1`
    : '';

  return (
    <div className="hover-preview" style={style} role="status" aria-label={`Previewing ${clip.title}`}>
      <div className="hover-preview-media">
        {source?.kind === 'youtube' && (
          <iframe
            title={`${clip.title} short preview`}
            src={youtubeUrl}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}

        {source?.kind === 'vimeo' && (
          <iframe
            title={`${clip.title} short preview`}
            src={vimeoUrl}
            allow="autoplay; fullscreen; picture-in-picture"
          />
        )}

        {source?.kind === 'file' && (
          <video
            ref={videoRef}
            src={source.url}
            autoPlay
            muted
            playsInline
            preload="metadata"
            onTimeUpdate={() => {
              if (videoRef.current && videoRef.current.currentTime >= PREVIEW_SECONDS) {
                videoRef.current.pause();
                onComplete();
              }
            }}
          />
        )}

        {(!source || source.kind === 'unsupported') && (
          <div className="hover-preview-placeholder">
            <CirclePlay size={28}/>
            <span>No playable preview available</span>
          </div>
        )}
      </div>

      <div className="hover-preview-caption">
        <strong>{clip.title}</strong>
        <span>Muted · Up to {PREVIEW_SECONDS}s</span>
      </div>
    </div>
  );
}
