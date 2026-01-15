'use client';

import { useState } from 'react';

export default function MyVideosPage() {
  const [activeTab, setActiveTab] = useState('text');

  // Sample videos data - in real app, this would come from API
  const textToVideoVideos = [
    {
      id: 1,
      title: 'Futuristic Cityscape',
      prompt: 'A cinematic drone shot flying over a futuristic city at sunset with neon lights',
      thumbnail: 'cityscape',
      duration: '10s',
      createdAt: '2 hours ago',
      status: 'ready',
    },
    {
      id: 2,
      title: 'Ocean Waves',
      prompt: 'Dramatic ocean waves crashing against rocky cliffs with golden hour lighting',
      thumbnail: 'ocean',
      duration: '15s',
      createdAt: '1 day ago',
      status: 'ready',
    },
    {
      id: 3,
      title: 'Mountain Landscape',
      prompt: 'Aerial view of snow-capped mountains at golden hour with dramatic clouds',
      thumbnail: 'mountain',
      duration: '12s',
      createdAt: '3 days ago',
      status: 'ready',
    },
  ];

  const imageToVideoVideos = [
    {
      id: 4,
      title: 'Abstract Transformation',
      prompt: 'Abstract patterns flowing and morphing from uploaded image',
      thumbnail: 'abstract',
      duration: '8s',
      createdAt: '5 hours ago',
      status: 'ready',
    },
    {
      id: 5,
      title: 'Portrait Animation',
      prompt: 'Animated portrait with dynamic lighting effects',
      thumbnail: 'portrait',
      duration: '10s',
      createdAt: '2 days ago',
      status: 'ready',
    },
  ];

  const videos = activeTab === 'text' ? textToVideoVideos : imageToVideoVideos;

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

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all cursor-pointer">
                    <svg className="w-8 h-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                  {video.duration}
                </div>
                {video.status === 'ready' && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/80 rounded text-xs text-white font-medium">
                    Ready
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{video.prompt}</p>
                <p className="text-xs text-gray-500 mb-4">{video.createdAt}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
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
          <p className="text-sm text-gray-500">Start generating videos to see them here</p>
        </div>
      )}
    </div>
  );
}

