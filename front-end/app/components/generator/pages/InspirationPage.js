'use client';

import { useEffect, useState } from 'react';

// Video Modal Component
function VideoModal({ isOpen, onClose, videoSrc, title, description }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Player */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden max-w-full">
            <video
              className="w-full aspect-video rounded-lg"
              src={videoSrc}
              controls
              autoPlay
              playsInline
              preload="metadata"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 bg-gray-800/50 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InspirationPage({ onGenerateWithPrompt }) {
  const [contentType, setContentType] = useState('videos'); // 'videos' or 'images'
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal state
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Video modal handlers
  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsVideoModalOpen(false);
  };

  // Auto-play videos on mobile when they come into view
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    if (!isMobile) return; // Only for mobile

    const observerOptions = {
      threshold: 0.5, // 50% of video must be visible
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          // Video is in view, try to play
          video.play().catch(() => {
            // Autoplay failed, user will need to tap to play
          });
        } else {
          // Video is out of view, pause
          video.pause();
        }
      });
    }, observerOptions);

    // Observe all videos on the page
    const videos = document.querySelectorAll('video');
    videos.forEach(video => observer.observe(video));

    return () => {
      videos.forEach(video => observer.unobserve(video));
    };
  }, []);

  const inspirationVideos = [
    {
      id: 1,
      title: 'Futuristic Cityscape',
      description: 'A cinematic drone shot flying over a futuristic city at sunset with neon lights illuminating the skyline',
      promptTitle: 'Futuristic Cityscape',
      promptText: 'A cinematic drone shot flying over a futuristic city at sunset with neon lights illuminating the skyline',
      videoSrc: '/assets/video/city.mp4',
      duration: '10s',
      style: 'Cinematic',
      category: 'Urban',
      views: '12.5k',
      likes: '892',
    },
    {
      id: 2,
      title: 'Samoyed Adventure',
      description: 'A playful samoyed dog exploring and having fun in various scenes',
      promptTitle: 'Samoyed Adventure',
      promptText: 'A playful samoyed dog exploring and having fun in various scenes',
      videoSrc: '/assets/video/samoyed.mp4',
      duration: '8s',
      style: 'Realistic',
      category: 'Nature',
      views: '15.3k',
      likes: '1.2k',
    },
    {
      id: 3,
      title: 'Stickman Animation',
      description: 'Fun stickman character with creative movements and animations',
      promptTitle: 'Stickman Animation',
      promptText: 'Fun stickman character with creative movements and animations',
      videoSrc: '/assets/video/stickman.mp4',
      duration: '12s',
      style: 'Animation',
      category: 'Art',
      views: '18.2k',
      likes: '1.5k',
    },
    {
      id: 4,
      title: 'Ferrari Race',
      description: 'High-speed Ferrari racing through scenic routes and landscapes',
      promptTitle: 'Ferrari Race',
      promptText: 'High-speed Ferrari racing through scenic routes and landscapes',
      videoSrc: '/assets/video/ferrari.mp4',
      duration: '10s',
      style: 'Cinematic',
      category: 'Urban',
      views: '21.7k',
      likes: '1.8k',
    },
    {
      id: 5,
      title: 'Space Journey',
      description: 'Epic journey through space with planets and nebula clouds',
      promptTitle: 'Space Journey',
      promptText: 'Epic journey through space with planets and nebula clouds',
      videoSrc: '/assets/video/plane_jupiter.mp4',
      duration: '15s',
      style: 'Sci-Fi',
      category: 'Space',
      views: '25.1k',
      likes: '2.2k',
    },
    {
      id: 6,
      title: 'Robot Dance',
      description: 'Cool robot performing amazing dance moves and choreography',
      promptTitle: 'Robot Dance',
      promptText: 'Cool robot performing amazing dance moves and choreography',
      videoSrc: '/assets/video/robot.mp4',
      duration: '8s',
      style: '3D Animation',
      category: 'Sci-Fi',
      views: '19.4k',
      likes: '1.6k',
    },
    {
      id: 7,
      title: 'Samoyed Playtime',
      description: 'Adorable samoyed playing with a ball in the park with joyful movements',
      promptTitle: 'Samoyed Playtime',
      promptText: 'Adorable samoyed playing with a ball in the park with joyful movements',
      videoSrc: '/assets/video/samoyed_ball.mp4',
      duration: '10s',
      style: 'Realistic',
      category: 'Nature',
      views: '16.8k',
      likes: '1.4k',
    },
    {
      id: 8,
      title: 'Dog Love Story',
      description: 'Heartwarming story of two dogs sharing love and friendship moments',
      promptTitle: 'Dog Love Story',
      promptText: 'Heartwarming story of two dogs sharing love and friendship moments',
      videoSrc: '/assets/video/dog_love.mp4',
      duration: '12s',
      style: 'Emotional',
      category: 'Nature',
      views: '22.3k',
      likes: '2.0k',
    },
    {
      id: 9,
      title: 'Butterfly Wings',
      description: 'Beautiful butterfly with intricate wing patterns fluttering gracefully',
      promptTitle: 'Butterfly Wings',
      promptText: 'Beautiful butterfly with intricate wing patterns fluttering gracefully',
      videoSrc: '/assets/video/buter.mp4',
      duration: '6s',
      style: 'Nature',
      category: 'Nature',
      views: '14.2k',
      likes: '1.1k',
    },
  ];

  const inspirationImages = [
    {
      id: 1,
      title: 'Neon City Streets',
      description: 'Cyberpunk cityscape with neon lights reflecting on wet streets at night',
      promptTitle: 'Neon City Streets',
      promptText: 'Cyberpunk cityscape with neon lights reflecting on wet streets at night, cinematic lighting, 4k',
      thumbnail: 'neon-city',
      style: 'Cinematic',
      category: 'Urban',
      views: '15.2k',
      likes: '1.1k',
    },
    {
      id: 2,
      title: 'Mountain Sunrise',
      description: 'Majestic mountain peaks at sunrise with golden light and dramatic clouds',
      promptTitle: 'Mountain Sunrise',
      promptText: 'Majestic mountain peaks at sunrise with golden light and dramatic clouds, landscape photography',
      thumbnail: 'mountain-sunrise',
      style: 'Photorealistic',
      category: 'Nature',
      views: '12.8k',
      likes: '956',
    },
    {
      id: 3,
      title: 'Abstract Digital Art',
      description: 'Vibrant abstract composition with flowing colors and geometric patterns',
      promptTitle: 'Abstract Digital Art',
      promptText: 'Vibrant abstract composition with flowing colors and geometric patterns, digital art',
      thumbnail: 'abstract-art',
      style: 'Abstract',
      category: 'Art',
      views: '18.5k',
      likes: '1.4k',
    },
    {
      id: 4,
      title: 'Futuristic Robot',
      description: 'Advanced humanoid robot in a high-tech laboratory with holographic displays',
      promptTitle: 'Futuristic Robot',
      promptText: 'Advanced humanoid robot in a high-tech laboratory with holographic displays, sci-fi concept art',
      thumbnail: 'robot',
      style: '3D Render',
      category: 'Sci-Fi',
      views: '21.3k',
      likes: '1.8k',
    },
    {
      id: 5,
      title: 'Cosmic Galaxy',
      description: 'Spiral galaxy with swirling stars and nebula clouds in deep space',
      promptTitle: 'Cosmic Galaxy',
      promptText: 'Spiral galaxy with swirling stars and nebula clouds in deep space, space art',
      thumbnail: 'galaxy',
      style: 'Digital Art',
      category: 'Space',
      views: '19.7k',
      likes: '1.6k',
    },
    {
      id: 6,
      title: 'Urban Skyline',
      description: 'Modern city skyline at dusk with glass buildings reflecting sunset colors',
      promptTitle: 'Urban Skyline',
      promptText: 'Modern city skyline at dusk with glass buildings reflecting sunset colors, architectural photography',
      thumbnail: 'skyline',
      style: 'Photorealistic',
      category: 'Urban',
      views: '14.1k',
      likes: '1.0k',
    },
    {
      id: 7,
      title: 'Forest Waterfall',
      description: 'Serene waterfall in a lush green forest with morning mist and sunlight',
      promptTitle: 'Forest Waterfall',
      promptText: 'Serene waterfall in a lush green forest with morning mist and sunlight, nature photography',
      thumbnail: 'waterfall',
      style: 'Photorealistic',
      category: 'Nature',
      views: '16.9k',
      likes: '1.3k',
    },
    {
      id: 8,
      title: 'Surreal Landscape',
      description: 'Dreamlike landscape with floating islands and surreal color palette',
      promptTitle: 'Surreal Landscape',
      promptText: 'Dreamlike landscape with floating islands and surreal color palette, fantasy art',
      thumbnail: 'surreal',
      style: 'Digital Art',
      category: 'Art',
      views: '13.4k',
      likes: '987',
    },
    {
      id: 9,
      title: 'Space Station',
      description: 'Futuristic space station orbiting Earth with astronauts and space shuttles',
      promptTitle: 'Space Station',
      promptText: 'Futuristic space station orbiting Earth with astronauts and space shuttles, sci-fi illustration',
      thumbnail: 'space-station',
      style: '3D Render',
      category: 'Space',
      views: '17.6k',
      likes: '1.2k',
    },
    {
      id: 10,
      title: 'Alien Planet',
      description: 'Exotic alien planet with strange vegetation and multiple moons in the sky',
      promptTitle: 'Alien Planet',
      promptText: 'Exotic alien planet with strange vegetation and multiple moons in the sky, sci-fi concept art',
      thumbnail: 'alien-planet',
      style: 'Concept Art',
      category: 'Sci-Fi',
      views: '20.4k',
      likes: '1.7k',
    },
    {
      id: 11,
      title: 'Tropical Beach',
      description: 'Paradise beach with crystal clear turquoise water and palm trees',
      promptTitle: 'Tropical Beach',
      promptText: 'Paradise beach with crystal clear turquoise water and palm trees, tropical photography',
      thumbnail: 'beach',
      style: 'Photorealistic',
      category: 'Nature',
      views: '15.8k',
      likes: '1.1k',
    },
    {
      id: 12,
      title: 'Cyberpunk Alley',
      description: 'Narrow alley in a cyberpunk city with neon signs and rain-soaked streets',
      promptTitle: 'Cyberpunk Alley',
      promptText: 'Narrow alley in a cyberpunk city with neon signs and rain-soaked streets, cinematic mood',
      thumbnail: 'alley',
      style: 'Cinematic',
      category: 'Urban',
      views: '22.1k',
      likes: '1.9k',
    },
  ];

  const categories = ['All', 'Urban', 'Nature', 'Art', 'Sci-Fi', 'Space'];
  
  // Map image items to asset folder images - ensure NO duplicates
  // Only items 1-9 are displayed, each gets a unique image
  const getImageSrc = (item) => {
    // Create unique mapping for items 1-9 (only these are displayed)
    const imageMapping = {
      1: '/assets/images/ai.png',
      2: '/assets/images/beautiful_scenery.png',
      3: '/assets/images/buter.png',
      4: '/assets/images/butter_fly.png',
      5: '/assets/images/coin.png',
      6: '/assets/images/creative.jpg',
      7: '/assets/images/plane.png',
      8: '/assets/images/profesional_content.png',
      9: '/assets/images/samoyed.png',
    };
    
    return imageMapping[item.id] || '/assets/images/coin.png';
  };
  
  // Filter content based on selected category
  const filteredVideos = selectedCategory === 'All' 
    ? inspirationVideos 
    : inspirationVideos.filter(video => video.category === selectedCategory);
  
  const filteredImages = selectedCategory === 'All' 
    ? inspirationImages.slice(0, 9) // Only show first 9 images to avoid duplicates
    : inspirationImages.filter(image => image.category === selectedCategory).slice(0, 9);
  
  const currentContent = contentType === 'videos' ? filteredVideos : filteredImages;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          <span className="gradient-text">Inspiration</span>
        </h1>
        <p className="text-gray-400">
          Explore stunning AI-generated {contentType === 'videos' ? 'videos' : 'images'} to spark your creativity
        </p>
      </div>

      {/* Content Type Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => {
              setContentType('videos');
              setSelectedCategory('All');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              contentType === 'videos'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => {
              setContentType('images');
              setSelectedCategory('All');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              contentType === 'images'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Images
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500 text-white'
                : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:text-white hover:border-purple-500 hover:bg-gray-800'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentContent.map((item) => (
          <div
            key={item.id}
            className="group bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {/* Thumbnail */}
            <div className={`${contentType === 'videos' ? 'aspect-video' : 'aspect-square'} bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 cursor-pointer`}>
              {contentType === 'videos' ? (
                <>
                  {/* Video Background */}
                  <video
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    src={item.videoSrc}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onMouseEnter={(e) => {
                      // Desktop: autoplay on hover
                      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                        e.target.play().catch(() => {
                          // Ignore autoplay errors
                        });
                      }
                    }}
                    onMouseLeave={(e) => {
                      // Desktop: pause on leave
                      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                        e.target.pause();
                      }
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Open modal or handle click
                    }}
                  />
                  {/* Play overlay - Desktop only */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                    <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openVideoModal(item);
                    }}
                      className="w-12 h-12 gradient-purple-blue rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-10 relative"
                    >
                      <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white backdrop-blur-sm">
                    {item.duration}
                  </div>
                </>
              ) : (
                <img
                  src={getImageSrc(item)}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default image if specific image fails
                    e.target.src = '/assets/images/coin.png';
                  }}
                />
              )}
              <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500/80 rounded text-xs text-white font-medium">
                {item.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {contentType === 'videos' ? (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors flex-1">
                      {item.title}
                    </h3>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium ml-2">
                      {item.style}
                    </span>
                  </div>

                  {/* Prompt Text */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Prompt</p>
                    <p className="text-sm text-gray-400 line-clamp-3">{item.promptText}</p>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{item.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{item.likes}</span>
                    </div>
                  </div>
                </>
              ) : null}

              {/* Action Button */}
              <button
                onClick={() => onGenerateWithPrompt?.(item.promptTitle, item.promptText)}
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

      {/* How It Works Section - Enhanced */}
      <div className="relative mt-16 pt-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent"></div>
        <div className="relative bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-900/40 rounded-3xl p-8 md:p-12 border border-gray-700/50 backdrop-blur-sm">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
                GET STARTED
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Get inspired and create your own amazing content. Our curated collection makes it easy to find and use the perfect prompts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30"></div>
            {[
              {
                step: '1',
                title: 'Browse Inspiration',
                description: 'Explore our curated collection of AI-generated videos across different categories and styles',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                gradient: 'from-purple-500/20 to-pink-500/20',
              },
              {
                step: '2',
                title: 'Select & Customize',
                description: 'Click on any video that inspires you and customize the prompt to match your vision',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                gradient: 'from-blue-500/20 to-cyan-500/20',
              },
              {
                step: '3',
                title: 'Generate Your Own',
                description: 'Use the "Generate Now" button to create your own version with the same prompt or modify it',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                gradient: 'from-purple-500/20 to-blue-500/20',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative group"
              >
                <div className={`relative bg-gradient-to-br ${item.gradient} rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20`}>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 gradient-purple-blue rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl shadow-purple-500/50 z-10 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="pt-8">
                    <div className="w-16 h-16 gradient-purple-blue rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced */}
      <div className="mt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            <span className="gradient-text">Why Choose Us</span>
          </h2>
          <p className="text-gray-400">Powerful features to enhance your creative workflow</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Curated Collection',
              description: 'Handpicked AI-generated videos showcasing the best of what our platform can create',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              ),
            },
            {
              title: 'Multiple Categories',
              description: 'Explore videos across Urban, Nature, Art, Sci-Fi, Space, and more categories',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              ),
            },
            {
              title: 'One-Click Generation',
              description: 'Instantly use any prompt from our collection to generate your own version',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 gradient-purple-blue rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
        videoSrc={selectedVideo?.videoSrc}
        title={selectedVideo?.title}
        description={selectedVideo?.description}
      />
    </div>
  );
}

