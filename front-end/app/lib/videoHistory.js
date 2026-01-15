// Local (client-side) generated video history.
// Stored per-user in localStorage so "Recent Generations" and "My Videos" stay in sync.

const keyForUser = (userId) => `primeStudio_videos_${userId || 'anonymous'}`;

export const getVideoHistory = (userId) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(keyForUser(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveVideoHistory = (userId, items) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(keyForUser(userId), JSON.stringify(items || []));
  // Notify in-app listeners (My Videos page, etc.)
  try {
    window.dispatchEvent(new Event('primeStudio:videoHistoryUpdated'));
  } catch {
    // no-op
  }
};

export const addVideoHistoryItem = (userId, item) => {
  const existing = getVideoHistory(userId);
  const next = [item, ...existing].filter(Boolean);

  // Deduplicate by jobId or videoUrl when available
  const seen = new Set();
  const deduped = [];
  for (const v of next) {
    const k = v.jobId || v.videoUrl || v.id;
    if (!k) {
      deduped.push(v);
      continue;
    }
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(v);
  }

  // Cap to avoid bloating localStorage
  saveVideoHistory(userId, deduped.slice(0, 50));
  return deduped;
};

export const formatRelativeTime = (ts) => {
  if (!ts) return '';
  const diffMs = Date.now() - ts;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};


