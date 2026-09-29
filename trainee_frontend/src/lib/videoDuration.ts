/**
 * Helper utility to extract video duration from a local File object or direct URL
 * using an in-memory HTML5 Video element.
 */

/**
 * Format total seconds into MM:SS or HH:MM:SS
 */
export function formatDurationSeconds(seconds?: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const total = Math.round(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Reads metadata from a video File using HTML5 video element.
 * Resolves with duration formatted as 'MM:SS' and raw seconds.
 */
export function extractVideoDuration(file: File): Promise<{
  durationFormatted: string;
  durationSeconds: number;
}> {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';

      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const cleanUp = () => {
        URL.revokeObjectURL(objectUrl);
        video.remove();
      };

      video.onloadedmetadata = () => {
        const durationSecs = video.duration;
        const formatted = formatDurationSeconds(durationSecs);
        cleanUp();
        resolve({
          durationFormatted: formatted,
          durationSeconds: durationSecs,
        });
      };

      video.onerror = (err) => {
        cleanUp();
        reject(new Error('Failed to load video metadata: ' + (typeof err === 'string' ? err : 'Unknown error')));
      };
    } catch (e) {
      reject(e);
    }
  });
}
