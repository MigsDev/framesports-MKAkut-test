/** Resolves user-supplied video links into safe, supported player URLs. */
export type VideoSource = {
  kind: 'youtube' | 'vimeo' | 'file' | 'unsupported';
  url: string;
};

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'youtu.be',
  'www.youtu.be',
]);

export function resolveVideoSource(rawUrl: string): VideoSource {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return { kind: 'unsupported', url: '' };
  }

  if (!['https:', 'http:'].includes(url.protocol)) {
    return { kind: 'unsupported', url: '' };
  }

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);

  if (YOUTUBE_HOSTS.has(host)) {
    const videoId = host.includes('youtu.be')
      ? parts[0]
      : parts[0] === 'watch'
        ? url.searchParams.get('v')
        : ['shorts', 'embed', 'live'].includes(parts[0])
          ? parts[1]
          : null;

    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return {
        kind: 'youtube',
        url: `https://www.youtube-nocookie.com/embed/${videoId}`,
      };
    }
  }

  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const videoId = parts.find(part => /^\d+$/.test(part));

    if (videoId) {
      return {
        kind: 'vimeo',
        url: `https://player.vimeo.com/video/${videoId}`,
      };
    }
  }

  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
    return { kind: 'file', url: url.href };
  }

  return { kind: 'unsupported', url: url.href };
}
