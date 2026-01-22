'use client';

import { useAuthStore } from '../../store/authStore';
import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeMode, setActiveMode] = useState('text-to-video');

  const modes = [
    {
      id: 'text-to-video',
      label: 'Text to Video',
      badge: 'Script to Scene',
      description:
        'Type a simple prompt, choose duration, and watch it turn into a cinematic clip in seconds.',
      videoUrl: '/assets/video/city.mp4',
      thumbnailUrl: '/assets/images/beautiful_scenery.png',
      stats: ['Up to 4K', 'Movie-style camera moves', 'Perfect for trailers & ads'],
    },
    {
      id: 'image-to-video',
      label: 'Image to Video',
      badge: 'Static to Motion',
      description:
        'Upload a single frame and let AI add motion, depth, and atmosphere around your subject.',
      videoUrl: '/assets/video/samoyed.mp4',
      thumbnailUrl: '/assets/images/samoyed.png',
      stats: ['Portrait & product shots', 'Smooth parallax depth', 'Social-ready formats'],
    },
    {
      id: 'ai-effects',
      label: 'AI Effects',
      badge: 'Remix Anything',
      description:
        'Remix your clips with AI effects, motion styles, and camera presets in one click.',
      videoUrl: '/assets/video/ferrari.mp4',
      thumbnailUrl: '/assets/images/ai.png',
      stats: ['Preset styles', 'One-click remixes', 'Batch friendly'],
    },
  ];

  const active = modes.find((m) => m.id === activeMode) ?? modes[0];

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.1;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.1;
      setMousePos({ x, y });
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
      return () => hero.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <section 
      ref={heroRef}
      id="home" 
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      {/* Fullscreen Background Video */}
      <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <video
          src="/assets/video/plane_jupiter.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl float-animation"
          style={{ 
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl float-animation"
          style={{ 
            transform: `translate(${-mousePos.x * 25}px, ${-mousePos.y * 25}px)`,
            transition: 'transform 0.3s ease-out',
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl float-animation"
          style={{ 
            transform: `translate(-50%, -50%) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
            transition: 'transform 0.3s ease-out',
            animationDelay: '4s'
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* LEFT: Copy & CTAs */}
          <div className="max-w-xl mx-auto text-center lg:text-left">
          {/* Badge */}
          <div className="fade-in-up mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 glass-modern rounded-full text-sm text-gray-300">
              <span className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></span>
              Live AI Studio · Onchain Ready
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text fade-in-up text-reveal inline-block">
              One Studio,
            </span>
            <br />
            <span
              className="text-white fade-in-up text-reveal inline-block"
              style={{ animationDelay: '0.2s' }}
            >
              Infinite AI Visuals
            </span>
          </h1>
          
          {/* Description */}
          <p 
            className="text-xl text-gray-300 mb-10 max-w-2xl lg:max-w-none mx-auto lg:mx-0 fade-in-up text-reveal"
            style={{ animationDelay: '0.4s' }}
          >
            Transform text, images, and clips into studio-grade videos and images.
            Built for creators and brands who want cinematic output without touching a timeline.
          </p>
          
          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <button
              onClick={() => openAuthModal('login')}
              className="btn-3d w-full sm:w-auto px-8 py-4 gradient-purple-blue text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Start for Free
            </button>
          </div>
          
          {/* Key Features */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm">
            {[
              { icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z', text: 'Lightning Fast' },
              { icon: 'M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z', text: 'Trustless & Secure' },
              { icon: 'M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z', text: 'Pay per Use' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 glass-modern px-4 py-2 rounded-lg card-hover-3d fade-in-up scale-in"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <svg 
                  className="w-4 h-4" 
                  style={{ color: '#a855f7' }} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d={feature.icon} clipRule="evenodd" />
                </svg>
                <span className="text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>
          </div>

          {/* RIGHT: Interactive Preview Panel (inspired by LumeFlow) */}
          <div className="max-w-xl mx-auto w-full fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="glass-modern rounded-3xl p-4 sm:p-6 lg:p-7 border border-white/10 card-hover-3d relative overflow-hidden">
              {/* Top badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-glow" />
                  Live preview · No timeline needed
                </div>
                <span className="text-[10px] uppercase tracking-[0.16em] text-gray-400">
                  PrimeStudio Engine
                </span>
              </div>

              {/* Mode tabs */}
              <div className="flex gap-2 mb-5 overflow-x-auto hide-scrollbar">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveMode(mode.id)}
                    className={`whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all border ${
                      activeMode === mode.id
                        ? 'bg-white text-gray-900 border-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Main preview */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 mb-4 aspect-video">
                {/* Placeholder video – silakan ganti link-nya di object modes */}
                <video
                  key={active.id}
                  src={active.videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 backdrop-blur text-[10px] text-gray-100 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                      {active.badge}
                    </div>
                    <p className="text-xs sm:text-sm text-white/90 line-clamp-2">
                      {active.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-900 text-xs font-semibold shadow-lg">
                      ▶
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] text-gray-100">
                      4K
                    </button>
                  </div>
                </div>
              </div>

              {/* Mini details */}
              <div className="flex flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-xs">
                {active.stats.map((item, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400/80" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
