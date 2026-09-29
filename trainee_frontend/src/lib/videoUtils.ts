/**
 * Helper utilities for video parsing and playback resolution across Mux, YouTube, and HTML5 video.
 */

/**
 * Extracts a Mux Playback ID from either an explicit playbackId string,
 * a stream.mux.com URL, an image.mux.com URL, or a raw playback ID string.
 */
export function getMuxPlaybackId(playbackId?: string | null, videoUrl?: string | null): string | null {
  if (playbackId && playbackId.trim()) {
    return playbackId.trim();
  }
  if (!videoUrl) return null;
  const trimmed = videoUrl.trim();

  // e.g. https://stream.mux.com/{id}.m3u8
  const streamMatch = trimmed.match(/stream\.mux\.com\/([a-zA-Z0-9_-]+)/);
  if (streamMatch) return streamMatch[1];

  // e.g. https://image.mux.com/{id}/thumbnail.png
  const imageMatch = trimmed.match(/image\.mux\.com\/([a-zA-Z0-9_-]+)/);
  if (imageMatch) return imageMatch[1];

  // Direct Mux playback ID (alphanumeric string between 15 and 50 characters without slashes or dots)
  if (/^[a-zA-Z0-9_-]{15,50}$/.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }

  return null;
}

/**
 * Extracts a YouTube embed URL from various YouTube link formats
 * (e.g. watch?v=, youtu.be/, embed/, shorts/)
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1`
    : null;
}

/**
 * Extracts YouTube video ID (11 chars) if present
 */
export function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
