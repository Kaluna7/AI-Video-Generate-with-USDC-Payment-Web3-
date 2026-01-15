'use client';

export default function InspirationPage({ onGenerateWithPrompt }) {
  const inspirationVideos = [
    {
      id: 1,
      title: 'Futuristic Cityscape',
      description: 'A cinematic drone shot flying over a futuristic city at sunset with neon lights illuminating the skyline',
      promptTitle: 'Futuristic Cityscape',
      promptText: 'A cinematic drone shot flying over a futuristic city at sunset with neon lights illuminating the skyline',
      thumbnail: 'cityscape',
      duration: '10s',
      style: 'Cinematic',
      category: 'Urban',
      views: '12.5k',
      likes: '892',
    },
    {
      id: 2,
      title: 'Ocean Waves',
      description: 'Dramatic ocean waves crashing against rocky cliffs with golden hour lighting',
      promptTitle: 'Ocean Waves',
      promptText: 'Dramatic ocean waves crashing against rocky cliffs with golden hour lighting',
      thumbnail: 'ocean',
      duration: '15s',
      style: 'Realistic',
      category: 'Nature',
      views: '8.3k',
      likes: '654',
    },
    {
      id: 3,
      title: 'Abstract Art',
      description: 'Colorful abstract patterns flowing and morphing in a mesmerizing dance',
      promptTitle: 'Abstract Art',
      promptText: 'Colorful abstract patterns flowing and morphing in a mesmerizing dance',
      thumbnail: 'abstract',
      duration: '8s',
      style: 'Abstract',
      category: 'Art',
      views: '15.2k',
      likes: '1.2k',
    },
    {
      id: 4,
      title: 'Mountain Landscape',
      description: 'Aerial view of snow-capped mountains at golden hour with dramatic clouds',
      promptTitle: 'Mountain Landscape',
      promptText: 'Aerial view of snow-capped mountains at golden hour with dramatic clouds',
      thumbnail: 'mountain',
      duration: '12s',
      style: 'Cinematic',
      category: 'Nature',
      views: '9.7k',
      likes: '743',
    },
    {
      id: 5,
      title: 'Neon Cyberpunk',
      description: 'Cyberpunk street with neon lights and flying vehicles in a futuristic city',
      promptTitle: 'Neon Cyberpunk',
      promptText: 'Cyberpunk street with neon lights and flying vehicles in a futuristic city',
      thumbnail: 'cyberpunk',
      duration: '10s',
      style: '3D Render',
      category: 'Sci-Fi',
      views: '18.9k',
      likes: '1.5k',
    },
    {
      id: 6,
      title: 'Forest Path',
      description: 'Peaceful walk through a mystical forest with sunlight rays filtering through trees',
      promptTitle: 'Forest Path',
      promptText: 'Peaceful walk through a mystical forest with sunlight rays filtering through trees',
      thumbnail: 'forest',
      duration: '15s',
      style: 'Realistic',
      category: 'Nature',
      views: '11.4k',
      likes: '856',
    },
    {
      id: 7,
      title: 'Space Nebula',
      description: 'Cosmic nebula with swirling colors and distant stars in deep space',
      promptTitle: 'Space Nebula',
      promptText: 'Cosmic nebula with swirling colors and distant stars in deep space',
      thumbnail: 'space',
      duration: '20s',
      style: 'Abstract',
      category: 'Space',
      views: '22.1k',
      likes: '2.1k',
    },
    {
      id: 8,
      title: 'Desert Dunes',
      description: 'Endless sand dunes shifting in the wind under a starry night sky',
      promptTitle: 'Desert Dunes',
      promptText: 'Endless sand dunes shifting in the wind under a starry night sky',
      thumbnail: 'desert',
      duration: '12s',
      style: 'Cinematic',
      category: 'Nature',
      views: '7.8k',
      likes: '589',
    },
    {
      id: 9,
      title: 'Underwater World',
      description: 'Vibrant coral reef with tropical fish swimming in crystal clear water',
      promptTitle: 'Underwater World',
      promptText: 'Vibrant coral reef with tropical fish swimming in crystal clear water',
      thumbnail: 'underwater',
      duration: '18s',
      style: 'Realistic',
      category: 'Nature',
      views: '14.6k',
      likes: '1.1k',
    },
  ];

  const categories = ['All', 'Urban', 'Nature', 'Art', 'Sci-Fi', 'Space'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          <span className="gradient-text">Inspiration</span>
        </h1>
        <p className="text-gray-400">
          Explore stunning AI-generated videos to spark your creativity
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gray-800/50 border border-gray-700 text-gray-300 hover:text-white hover:border-purple-500 hover:bg-gray-800"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {inspirationVideos.map((video) => (
          <div
            key={video.id}
            className="group bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                  <svg className="w-8 h-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                {video.duration}
              </div>
              <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500/80 rounded text-xs text-white font-medium">
                {video.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors flex-1">
                  {video.title}
                </h3>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium ml-2">
                  {video.style}
                </span>
              </div>

              {/* Prompt Text */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Prompt</p>
                <p className="text-sm text-gray-400 line-clamp-3">{video.promptText}</p>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{video.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{video.likes}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onGenerateWithPrompt?.(video.promptTitle, video.promptText)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold gradient-purple-blue text-white hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

