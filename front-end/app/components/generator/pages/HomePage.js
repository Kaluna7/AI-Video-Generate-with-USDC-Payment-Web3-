'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Video Modal Component - Menggunakan style yang sama dengan ImagePreviewPanel
function VideoModal({ isOpen, onClose, videoSrc, title, description }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl shadow-2xl overflow-hidden">
        {/* Header - Mirip dengan ImagePreviewPanel */}
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

        {/* Video Player - Style mirip ImagePreviewPanel */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden max-w-full">
            <video
              className="w-full aspect-video rounded-lg"
              src={videoSrc}
              controls
              autoPlay
              playsInline
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Footer - Mirip dengan ImagePreviewPanel */}
        <div className="p-6 bg-gray-800/50 border-t border-gray-700">
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ onNavigateToText, onNavigateToImage, onNavigateToTextImage, onNavigateToImageImage, onNavigateToInspiration }) {
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

  const exampleVideos = [
    {
      id: 1,
      title: 'Futuristic Cityscape',
      description: 'A cinematic drone shot flying over a futuristic city at sunset',
      videoSrc: '/assets/video/city.mp4',
      duration: '10s',
      style: 'Cinematic',
    },
    {
      id: 2,
      title: 'Samoyed Adventure',
      description: 'A playful samoyed dog exploring and having fun',
      videoSrc: '/assets/video/samoyed.mp4',
      duration: '8s',
      style: 'Realistic',
    },
    {
      id: 3,
      title: 'Stickman Animation',
      description: 'Fun stickman character with creative movements',
      videoSrc: '/assets/video/stickman.mp4',
      duration: '12s',
      style: 'Animation',
    },
    {
      id: 4,
      title: 'Ferrari Race',
      description: 'High-speed Ferrari racing through scenic routes',
      videoSrc: '/assets/video/ferrari.mp4',
      duration: '10s',
      style: 'Cinematic',
    },
    {
      id: 5,
      title: 'Space Journey',
      description: 'Epic journey through space with planets and stars',
      videoSrc: '/assets/video/plane_jupiter.mp4',
      duration: '15s',
      style: 'Sci-Fi',
    },
    {
      id: 6,
      title: 'Robot Dance',
      description: 'Cool robot performing amazing dance moves',
      videoSrc: '/assets/video/robot.mp4',
      duration: '8s',
      style: '3D Animation',
    },
    {
      id: 7,
      title: 'Samoyed Playtime',
      description: 'Adorable samoyed playing with a ball in the park',
      videoSrc: '/assets/video/samoyed_ball.mp4',
      duration: '10s',
      style: 'Realistic',
    },
    {
      id: 8,
      title: 'Dog Love Story',
      description: 'Heartwarming story of two dogs sharing love and friendship',
      videoSrc: '/assets/video/dog_love.mp4',
      duration: '12s',
      style: 'Emotional',
    },
    {
      id: 9,
      title: 'Butterfly Wings',
      description: 'Beautiful butterfly with intricate wing patterns',
      videoSrc: '/assets/video/buter.mp4',
      duration: '6s',
      style: 'Nature',
    },
    {
      id: 10,
      title: 'Rabbit Adventure',
      description: 'Cute rabbit exploring and hopping around',
      videoSrc: '/assets/video/rabit.mp4',
      duration: '8s',
      style: 'Cute Animation',
    },
  ];

  return (
    <div className="space-y-8 mt-[-30px] md:mt-[-10px]">
      {/* Hero Section with Background Video */}
      <div className="relative text-center py-10 min-h-screen flex items-center justify-center overflow-hidden w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-100"
            src="/assets/video/ninja.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
          {/* Light overlay untuk readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Create Stunning Videos</span>
          <br />
          <span className="text-white">with AI Power</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Transform your ideas into breathtaking videos. Choose your creation method and let AI bring your vision to life.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 mb-12">
          {/* Video Generation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 text-center">Video Generation</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onNavigateToText}
                className="group w-full sm:w-auto px-8 py-4 gradient-purple-blue text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Text to Video</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={onNavigateToImage}
                className="group w-full sm:w-auto px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-xl font-semibold text-lg hover:border-purple-500 hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Image to Video</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Image Generation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 text-center">Image Generation</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onNavigateToTextImage}
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/20 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Text to Image</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={onNavigateToImageImage}
                className="group w-full sm:w-auto px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-xl font-semibold text-lg hover:border-pink-500 hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Image to Image</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Example Videos Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Example Videos</h2>
          <button
            onClick={onNavigateToInspiration}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exampleVideos.map((video) => (
            <div
              key={video.id}
              className="group bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all hover:scale-[1.02] cursor-pointer"
            >
              {/* Video Preview */}
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 cursor-pointer">
                <video
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                  src={video.videoSrc}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => {
                    // Desktop only: autoplay on hover
                    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                      e.target.play().catch(() => {
                        // Ignore autoplay errors
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Desktop only: pause on leave
                    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                      e.target.pause();
                    }
                  }}
                  onTouchStart={(e) => {
                    // Mobile: handle touch start
                    e.preventDefault();
                    console.log('Video touched for:', video.title);
                    openVideoModal(video);
                  }}
                  onClick={(e) => {
                    // Desktop: handle click
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Video clicked for:', video.title);
                    openVideoModal(video);
                  }}
                />
                {/* Play overlay - Desktop only */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Play button clicked for:', video.title);
                      openVideoModal(video);
                    }}
                    className="w-12 h-12 gradient-purple-blue rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-10 relative"
                  >
                    <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white backdrop-blur-sm">
                  {video.duration}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {video.title}
                  </h3>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                    {video.style}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="group bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="w-12 h-12 gradient-purple-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg className="w-6 h-6 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">Fast Generation</h3>
          <p className="text-sm text-gray-400 leading-relaxed">Generate high-quality videos in minutes, not hours.</p>
        </div>

        <div className="group bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="w-12 h-12 gradient-purple-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg className="w-6 h-6 text-white group-hover:animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDuration: '3s' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">AI Powered</h3>
          <p className="text-sm text-gray-400 leading-relaxed">Advanced AI technology for stunning visual results.</p>
        </div>

        <div className="group bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="w-12 h-12 gradient-purple-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <svg className="w-6 h-6 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">Pay Per Use</h3>
          <p className="text-sm text-gray-400 leading-relaxed">No subscriptions. Pay only for what you generate.</p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative mt-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Generate videos in 3 simple steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            {
              step: '1',
              title: 'Connect Wallet',
              description: 'Connect your wallet to pay with USDC and start generating videos in seconds.',
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              gradient: 'from-purple-500/20 to-pink-500/20',
              iconGradient: 'from-purple-500 to-pink-500',
            },
            {
              step: '2',
              title: 'Create Prompt',
              description: 'Enter your text prompt or upload an image. Customize settings like duration, quality, and style to match your vision.',
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ),
              gradient: 'from-blue-500/20 to-cyan-500/20',
              iconGradient: 'from-blue-500 to-cyan-500',
            },
            {
              step: '3',
              title: 'Generate & Download',
              description: 'Pay with USDC and watch as our AI generates your video. Download your high-quality video instantly when ready.',
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              ),
              gradient: 'from-purple-500/20 to-blue-500/20',
              iconGradient: 'from-purple-500 to-blue-500',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative group"
            >
              <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 group-hover:bg-gray-900/80">
                {/* Step Number Badge */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-12 h-12 gradient-purple-blue rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/50 z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  {item.step}
                </div>
                
                {/* Content */}
                <div className="pt-6">
                  {/* Icon */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${item.iconGradient} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl group-hover:shadow-purple-500/30`}>
                    {item.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-base text-gray-400 leading-relaxed text-center">
                    {item.description}
                  </p>
                </div>
                
                {/* Decorative gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
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