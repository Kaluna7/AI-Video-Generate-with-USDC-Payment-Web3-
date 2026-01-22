// Local (client-side) generated image history.
// Stored per-user in localStorage so images are separated by account.

const keyForUser = (userId) => `primeStudio_images_${userId || 'anonymous'}`;

export const getImageHistory = (userId) => {
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

export const saveImageHistory = (userId, items) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(keyForUser(userId), JSON.stringify(items || []));
  // Notify in-app listeners (My Images page, etc.)
  try {
    window.dispatchEvent(new Event('primeStudio:imageHistoryUpdated'));
  } catch {
    // no-op
  }
};

export const addImageHistoryItem = (userId, item) => {
  const existing = getImageHistory(userId);
  
  const imageItem = {
    ...item,
    createdAt: item.createdAt || new Date().toISOString(),
  };
  
  const next = [imageItem, ...existing].filter(Boolean);

  // Deduplicate by id or url
  const seen = new Set();
  const deduped = [];
  for (const img of next) {
    const k = img.id || img.url;
    if (!k) {
      deduped.push(img);
      continue;
    }
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(img);
  }

  // Cap to avoid bloating localStorage
  saveImageHistory(userId, deduped.slice(0, 100));
  return deduped;
};

export const deleteImageHistoryItem = (userId, imageId) => {
  if (typeof window === 'undefined') return;
  const existing = getImageHistory(userId);
  const filtered = existing.filter((img) => {
    // Match by id or url
    return img.id !== imageId && img.url !== imageId;
  });
  saveImageHistory(userId, filtered);
  return filtered;
};

