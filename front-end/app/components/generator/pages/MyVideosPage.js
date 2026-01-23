'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { formatRelativeTime, getVideoHistory, deleteVideoHistoryItem, cleanupExpiredVideos, isVideoExpired, getDaysUntilExpiry } from '../../../lib/videoHistory';
import { addTokenToVideoUrl, getAuthToken } from '../../../lib/api';
import dynamic from 'next/dynamic';

export default function MyVideosPage() {
  const [activeTab, setActiveTab] = useState('text');
  const user = useAuthStore((state) => state.user);
  const walletAddress = useAuthStore((state) => state.walletAddress);
  const [historyTick, setHistoryTick] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedModalDescription, setExpandedModalDescription] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // SSR: Hydration-safe rendering
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Local history is stored per "account". Prefer app user id, fall back to connected wallet, else anonymous.
  const historyUserId = user?.id || walletAddress || 'anonymous';

  // SSR: Scroll to top on mount and cleanup expired videos
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Cleanup expired videos on page load
    cleanupExpiredVideos(historyUserId);
  }, [historyUserId]);

  useEffect(() => {
    const handler = () => setHistoryTick((t) => t + 1);
    if (typeof window !== 'undefined') {
      window.addEventListener('primeStudio:videoHistoryUpdated', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('primeStudio:videoHistoryUpdated', handler);
      }
    };
  }, []);

  // SSR: Memoized filtered videos for performance
  const filtered = useMemo(() => {
    // touch historyTick so UI refreshes when history changes
    void historyTick;
    const type = activeTab === 'text' ? 'text' : 'image';
    const history = getVideoHistory(historyUserId);

    // Filter out expired videos
    const now = Date.now();
    const activeHistory = history.filter(v => {
      if (!v.expiresAt) return true; // Keep videos without expiry (backward compatibility)
      return v.expiresAt > now;
    });

    const mapped = activeHistory
      .map((v) => {
        const daysUntilExpiry = getDaysUntilExpiry(v);
        const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 2 && daysUntilExpiry > 0;
        return {
          ...v,
          createdAtLabel: formatRelativeTime(v.createdAt),
          status: 'ready',
          daysUntilExpiry,
          isExpiringSoon,
        };
      })
      .filter((v) => (v.type || 'text') === type);

    // Debug: log video count
    if (typeof window !== 'undefined' && history.length > 0) {
      console.log('Video history:', history.length, 'Active:', activeHistory.length, 'Filtered:', mapped.length, 'Type:', type);
    }

    return mapped;
  }, [historyTick, activeTab, historyUserId]);

  const textVideos = filtered.filter(v => (v.type || 'text') === 'text');
  const imageVideos = filtered.filter(v => (v.type || 'text') === 'image');

  const handleDownload = async (videoUrl, title) => {
    if (!videoUrl) return;
    
    try {
      // Get token for authentication
      const token = getAuthToken();
      if (!token) {
        alert('Please login to download videos');
        return;
      }

      // Add token to URL if not already present
      const urlWithToken = addTokenToVideoUrl(videoUrl);
      
      // Fetch video with authentication
      const response = await fetch(urlWithToken, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download video');
      }

      // Get blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'video'}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download video. Please try again.');
    }
  };

  const handleShare = async (videoUrl, title) => {
    if (!videoUrl) return;
    
    try {
      // Copy video URL to clipboard
      const urlWithToken = addTokenToVideoUrl(videoUrl);
      await navigator.clipboard.writeText(urlWithToken);
      alert('Video URL copied to clipboard!');
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to copy URL. Please try again.');
    }
  };

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
    setVideoError(null);
    setVideoLoading(true);
    setExpandedModalDescription(false);

    // SSR: Preload video when modal opens for better UX
    if (typeof window !== 'undefined' && video.videoUrl) {
      // Create a temporary video element to preload
      const preloadVideo = document.createElement('video');
      preloadVideo.src = addTokenToVideoUrl(video.videoUrl);
      preloadVideo.preload = 'metadata';
      preloadVideo.load();
    }
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
    setVideoError(null);
    setVideoLoading(false);
  };

  const toggleDescription = (videoId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  };

  const getTruncatedDescription = (description, maxLength = 100) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  const handleDeleteVideo = (video) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      deleteVideoHistoryItem(historyUserId, video.id);
      setHistoryTick((t) => t + 1);
      
      // Close modal if the deleted video is currently open
      if (selectedVideo && selectedVideo.id === video.id) {
        handleCloseVideoModal();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          <span className="gradient-text">My Videos</span>
        </h1>
        <p className="text-gray-400">
          Manage and view all your generated videos
        </p>
      </div>

      {/* Warning Banner */}
      {filtered.length > 0 && (
        <div className="bg-linear-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-300 mb-1">Important: Video Storage Notice</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Videos generated from Sora AI are automatically saved to our server for <span className="font-semibold text-white">2 days</span>. 
                After this period, videos will be automatically deleted to manage storage. 
                <span className="block mt-2 text-yellow-200 font-medium">
                  💡 Tip: Download important videos to keep them permanently!
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Videos</span>
            <div className="w-10 h-10 gradient-purple-blue rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{filtered.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Text to Video</span>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{textVideos.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Image to Video</span>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{imageVideos.length}</p>
        </div>
      </div>

      {/* Tips Section */}
      {filtered.length === 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 gradient-purple-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Start Creating Amazing Videos</h3>
              <p className="text-sm text-gray-400 mb-3">
                Generate your first AI video using Text to Video or Image to Video. Each generation costs coins based on the model you choose.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Use detailed prompts for cinematic results</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Try different models for various styles</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Experiment with duration and quality settings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-800/50 rounded-xl p-1 border border-gray-700 w-fit">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'text'
              ? 'gradient-purple-blue text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Text to Video
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'image'
              ? 'gradient-purple-blue text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Image to Video
        </button>
      </div>

      {/* SSR: Videos Grid with loading optimization */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="group bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all flex flex-col"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-linear-to-br from-purple-500/30 via-blue-500/30 to-cyan-500/30 relative overflow-hidden cursor-pointer group/thumbnail" onClick={() => handlePlayVideo(video)}>
                {/* SSR: Video thumbnail preview with optimized loading */}
                {video.videoUrl ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={addTokenToVideoUrl(video.videoUrl)}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    loading="lazy"
                    onError={(e) => {
                      // Silently handle thumbnail errors - don't log to avoid console spam
                      // Thumbnail errors are not critical, the video might be expired or inaccessible
                      e.target.style.display = 'none';
                    }}
                    // SSR: Add intersection observer for performance
                    style={{ contentVisibility: 'auto' }}
                  />
                ) : (
                  /* Placeholder gradient background - fallback when no video URL */
                  <div className="absolute inset-0 bg-linear-to-br from-purple-500/40 via-blue-500/40 to-cyan-500/40"></div>
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/thumbnail:bg-black/30 transition-colors z-10">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center group-hover/thumbnail:bg-white/30 group-hover/thumbnail:scale-110 group-hover/thumbnail:border-white/60 transition-all shadow-lg">
                    <svg className="w-10 h-10 text-white ml-1 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  </div>
                </div>
                
                {video.status === 'ready' && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 rounded text-xs text-white font-medium z-20 shadow-lg">
                    Ready
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors flex-1">
                    {video.title}
                  </h3>
                  {video.isExpiringSoon && (
                    <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-300 font-medium shrink-0">
                      {video.daysUntilExpiry === 1 ? 'Expires tomorrow' : `Expires in ${video.daysUntilExpiry}d`}
                    </div>
                  )}
                </div>
                <div className="mb-3 flex-1">
                  <p className={`text-sm text-gray-400 ${expandedDescriptions[video.id] ? '' : 'line-clamp-2'}`}>
                    {expandedDescriptions[video.id] ? video.prompt : getTruncatedDescription(video.prompt, 100)}
                  </p>
                  {video.prompt && video.prompt.length > 100 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(video.id);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 mt-1 transition-colors"
                    >
                      {expandedDescriptions[video.id] ? 'See less' : 'See more'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-4">{video.createdAtLabel}</p>

                {/* Actions - Always at bottom */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-700 mt-auto">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(video.videoUrl, video.title);
                    }}
                    disabled={!video.videoUrl}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(video.videoUrl, video.title);
                    }}
                    disabled={!video.videoUrl}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVideo(video);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    title="Delete video"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-2">No videos yet</p>
          <p className="text-sm text-gray-500">Generate videos to see them here</p>
        </div>
      )}

      {/* SSR: Video Modal - Only render on client */}
      {isHydrated && isVideoModalOpen && selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleCloseVideoModal}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-2xl bg-gray-900/95 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseVideoModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
              aria-label="Close video"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video Container */}
            <div className="aspect-video bg-black relative">
              {selectedVideo.videoUrl ? (
                <>
                  {videoLoading && !videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-gray-400">Loading video...</p>
                      </div>
                    </div>
                  )}
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center p-6">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-white font-semibold mb-2">Failed to load video</p>
                        <p className="text-sm text-gray-400 mb-4">{videoError}</p>
                        <button
                          onClick={() => {
                            setVideoError(null);
                            setVideoLoading(true);
                            // Force video reload by updating key
                            const video = document.querySelector('video');
                            if (video) {
                              video.load();
                            }
                          }}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                  <video
                    key={`${selectedVideo.videoUrl}-${Date.now()}`} // Force re-render on video change with timestamp
                    className="w-full h-full object-contain"
                    src={addTokenToVideoUrl(selectedVideo.videoUrl)}
                    controls
                    autoPlay
                    playsInline
                    onLoadStart={() => {
                      console.log('Video load start - URL:', addTokenToVideoUrl(selectedVideo.videoUrl));
                      console.log('Auth token available:', !!getAuthToken());
                      setVideoLoading(true);
                      setVideoError(null);
                    }}
                    onCanPlay={() => {
                      setVideoLoading(false);
                      setVideoError(null);
                    }}
                    onError={(e) => {
                      setVideoLoading(false);
                      const video = e.target;

                      // Debug: Log the actual error object
                      console.error('Video error event:', e);
                      console.error('Video element error:', video?.error);
                      console.error('Video src:', video?.src);

                      let errorMsg = 'Failed to load video';
                      let errorCode = null;

                      try {
                        if (video && video.error) {
                          errorCode = video.error.code;
                          console.error('Video error code:', errorCode);

                          switch (errorCode) {
                            case video.error.MEDIA_ERR_ABORTED:
                              errorMsg = 'Video loading was aborted';
                              break;
                            case video.error.MEDIA_ERR_NETWORK:
                              errorMsg = 'Network error while loading video. Please check your connection.';
                              break;
                            case video.error.MEDIA_ERR_DECODE:
                              errorMsg = 'Video decoding error. The video file may be corrupted.';
                              break;
                            case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                              errorMsg = 'Video format not supported by your browser.';
                              break;
                            default:
                              errorMsg = `Video error (code: ${errorCode})`;
                          }
                        } else {
                          // If video.error is not available, check network status
                          if (video && video.networkState === video.NETWORK_NO_SOURCE) {
                            errorMsg = 'No video source available. The video URL may be invalid.';
                          } else if (video && video.networkState === video.NETWORK_EMPTY) {
                            errorMsg = 'Video source is empty.';
                          } else if (video && video.networkState === video.NETWORK_LOADING) {
                            errorMsg = 'Video is still loading. Please wait.';
                          } else {
                            errorMsg = 'Failed to load video. Please try again or check if the video is still available.';
                          }
                        }

                        // Check if token is missing
                        const token = getAuthToken();
                        if (!token) {
                          errorMsg = 'Authentication token missing. Please login again.';
                        }

                        // Check if URL is valid
                        if (!video?.src || video.src === '') {
                          errorMsg = 'Video URL is empty or invalid.';
                        }

                      } catch (err) {
                        console.error('Error handling video error:', err);
                        errorMsg = 'An unexpected error occurred while loading the video.';
                      }

                      console.error('Final error message:', errorMsg);
                      setVideoError(errorMsg);
                    }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400">No video URL available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-1.5">{selectedVideo.title}</h3>
              <div className="mb-1.5">
                <p className={`text-sm text-gray-400 ${expandedModalDescription ? '' : 'line-clamp-2'}`}>
                  {expandedModalDescription ? selectedVideo.prompt : getTruncatedDescription(selectedVideo.prompt, 150)}
                </p>
                {selectedVideo.prompt && selectedVideo.prompt.length > 150 && (
                  <button
                    onClick={() => setExpandedModalDescription(!expandedModalDescription)}
                    className="text-xs text-purple-400 hover:text-purple-300 mt-1 transition-colors"
                  >
                    {expandedModalDescription ? 'See less' : 'See more'}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">{selectedVideo.createdAtLabel}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

