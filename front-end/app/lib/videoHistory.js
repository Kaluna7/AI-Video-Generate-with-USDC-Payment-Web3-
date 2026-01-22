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
  
  // Add expiry date (2 days from creation) if not already set
  const now = Date.now();
  const twoDaysInMs = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
  const videoItem = {
    ...item,
    createdAt: item.createdAt || now,
    expiresAt: item.expiresAt || (item.createdAt || now) + twoDaysInMs,
  };
  
  const next = [videoItem, ...existing].filter(Boolean);

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

  // Remove expired videos before saving
  const nowForFilter = Date.now();
  const activeVideos = deduped.filter(v => {
    if (!v.expiresAt) return true; // Keep videos without expiry (backward compatibility)
    return v.expiresAt > nowForFilter;
  });

  // Cap to avoid bloating localStorage
  saveVideoHistory(userId, activeVideos.slice(0, 50));
  return activeVideos;
};

export const deleteVideoHistoryItem = (userId, videoId) => {
  if (typeof window === 'undefined') return;
  const existing = getVideoHistory(userId);
  const filtered = existing.filter((v) => {
    // Match by id, jobId, or videoUrl
    return v.id !== videoId && v.jobId !== videoId && (v.videoUrl || '').indexOf(videoId) === -1;
  });
  saveVideoHistory(userId, filtered);
  return filtered;
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

/**
 * Clean up expired videos from history
 * Videos expire after 2 days
 */
export const cleanupExpiredVideos = (userId) => {
  if (typeof window === 'undefined') return;
  const existing = getVideoHistory(userId);
  const now = Date.now();
  const activeVideos = existing.filter(v => {
    if (!v.expiresAt) return true; // Keep videos without expiry (backward compatibility)
    return v.expiresAt > now;
  });
  
  if (activeVideos.length !== existing.length) {
    saveVideoHistory(userId, activeVideos);
  }
  return activeVideos;
};

/**
 * Check if a video is expired
 */
export const isVideoExpired = (video) => {
  if (!video || !video.expiresAt) return false;
  return Date.now() > video.expiresAt;
};

/**
 * Get remaining days until video expires
 */
export const getDaysUntilExpiry = (video) => {
  if (!video || !video.expiresAt) return null;
  const now = Date.now();
  const diffMs = video.expiresAt - now;
  if (diffMs <= 0) return 0;
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  return days;
};


