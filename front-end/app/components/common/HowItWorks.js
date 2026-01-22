'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeTrack, setActiveTrack] = useState('video');

  const steps = [
    {
      number: '1',
      title: 'Sign In & Top Up',
      description: 'Sign in with your account and top up coins using USDC. 1 USDC = 100 coins. Start generating videos and images instantly.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      media: '/assets/images/coin.png',
      mediaType: 'image',
    },
    {
      number: '2',
      title: 'Choose Generation Type',
      description: 'Select from Text to Video, Image to Video, Text to Image, or Image to Image. Enter your text prompt or upload an image. Customize settings like duration, quality, aspect ratio, and style.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      media: '/assets/video/city.mp4',
      mediaType: 'video',
    },
    {
      number: '3',
      title: 'Generate & Download',
      description: 'Watch as our AI generates your content in real-time. Download your high-quality video or image instantly when ready. All generations are saved to your library.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500',
      media: '/assets/video/dog_love.mp4',
      mediaType: 'video',
    },
  ];

  useEffect(() => {
    if (typeof window === 'undefined' || !gsap) return;

    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) return;

      // Initial state - cards aligned (sejajar dulu dengan spacing)
      cards.forEach((card, index) => {
        if (!card) return;
        gsap.set(card, {
          zIndex: cards.length - index,
          y: 0,
          scale: 1,
          opacity: 1,
          rotationY: 0,
          position: 'relative',
        });
      });

    // Create stacking effect with scroll trigger
    cards.forEach((card, index) => {
      if (!card) return;

      // Scroll trigger animation - card pertama mengecil saat card kedua masuk
      ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1,
        onEnter: () => {
          // Card masuk - naik ke depan dengan transform, bukan layout
          gsap.to(card, {
            zIndex: cards.length + 10,
            y: 0,
            scale: 1,
            opacity: 1,
            rotationY: 0,
            duration: 0.6,
            ease: 'power3.out',
            clearProps: 'position',
          });

          // Card sebelumnya mengecil dan tertumpuk dengan transform
          if (index > 0 && cardRefs.current[index - 1]) {
            gsap.to(cardRefs.current[index - 1], {
              zIndex: cards.length - (index - 1),
              y: 30,
              scale: 0.92,
              opacity: 0.8,
              rotationY: 5,
              duration: 0.6,
              ease: 'power3.out',
            });
          }
        },
        onLeave: () => {
          // Card keluar - kembali ke belakang jika ada card berikutnya
          if (index < cards.length - 1) {
            gsap.to(card, {
              zIndex: cards.length - index,
              y: 30,
              scale: 0.92,
              opacity: 0.8,
              rotationY: 5,
              duration: 0.6,
              ease: 'power3.out',
            });
          }
        },
        onEnterBack: () => {
          // Scroll kembali - card kembali aktif
          gsap.to(card, {
            zIndex: cards.length + 10,
            y: 0,
            scale: 1,
            opacity: 1,
            rotationY: 0,
            duration: 0.6,
            ease: 'power3.out',
          });

          // Card sebelumnya kembali normal jika scroll balik
          if (index > 0 && cardRefs.current[index - 1]) {
            gsap.to(cardRefs.current[index - 1], {
              zIndex: cards.length - (index - 1),
              y: 0,
              scale: 1,
              opacity: 1,
              rotationY: 0,
              duration: 0.6,
              ease: 'power3.out',
            });
          }
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Background media berdasarkan track
  const backgroundMedia = activeTrack === 'video'
    ? { type: 'video', src: '/assets/video/robot.mp4' }
    : { type: 'image', src: '/assets/images/plane.png' };

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'transparent' }}>
      {/* Fullscreen Background Video/Image - berubah sesuai track */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {backgroundMedia.type === 'video' ? (
          <video
            key={`bg-video-${activeTrack}`}
            src={backgroundMedia.src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
          />
        ) : (
          <img
            key={`bg-image-${activeTrack}`}
            src={backgroundMedia.src}
            alt="Background"
            className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
          />
        )}
        {/* Overlay untuk kontras teks */}
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-700" />
      </div>

      {/* Background Effects - lebih subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header + track selector */}
        <div className="max-w-5xl mx-auto mb-14 fade-in-up text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-modern rounded-full text-sm text-gray-300 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></span>
            Guided creation flow
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="gradient-text">How It Works</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl">
                One timeline-free flow that works across text to video, image to video, and image generation.
                Switch tracks without changing your mental model.
              </p>
            </div>
            <div className="glass-modern rounded-2xl px-3 py-2 flex items-center gap-2 text-xs md:text-sm">
              <span className="text-gray-300 mr-1">View flow for</span>
              <button
                type="button"
                onClick={() => setActiveTrack('video')}
                className={`px-3 py-1 rounded-xl transition-all ${
                  activeTrack === 'video'
                    ? 'bg-white text-gray-900 shadow'
                    : 'bg-white/5 text-gray-200 hover:bg-white/10'
                }`}
              >
                Video
              </button>
              <button
                type="button"
                onClick={() => setActiveTrack('image')}
                className={`px-3 py-1 rounded-xl transition-all ${
                  activeTrack === 'image'
                    ? 'bg-white text-gray-900 shadow'
                    : 'bg-white/5 text-gray-200 hover:bg-white/10'
                }`}
              >
                Image
              </button>
            </div>
          </div>
        </div>
        
        {/* Stacking cards + quick timeline */}
        <div className="relative max-w-7xl mx-auto" style={{ minHeight: '600px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-start">
            {/* Left: compact step timeline */}
            <div className="space-y-4 fade-in-up">
              <div className="glass-modern rounded-3xl p-5 border border-white/10">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-3">
                  {activeTrack === 'video' ? 'Video creation track' : 'Image creation track'}
                </p>
                <ol className="space-y-3 text-sm md:text-base">
                  <li className="flex gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] text-white">
                      1
                    </span>
                    <div>
                      <p className="text-white font-medium">Sign in & load coins</p>
                      <p className="text-gray-400 text-xs md:text-sm">
                        Connect, top up in USDC, and unlock all generators with the same balance.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[10px] text-white">
                      2
                    </span>
                    <div>
                      <p className="text-white font-medium">
                        {activeTrack === 'video' ? 'Choose video generator' : 'Choose image generator'}
                      </p>
                      <p className="text-gray-400 text-xs md:text-sm">
                        Pick text to {activeTrack}, image to {activeTrack}, or remix with presets.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-[10px] text-white">
                      3
                    </span>
                    <div>
                      <p className="text-white font-medium">Generate, review, and save</p>
                      <p className="text-gray-400 text-xs md:text-sm">
                        Preview, tweak prompts, then download your final output in one click.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                <div className="glass-modern rounded-2xl p-4 border border-white/5">
                  <p className="text-gray-400 mb-1">Average video render</p>
                  <p className="text-lg font-semibold text-white">⟶ under 60s</p>
                </div>
                <div className="glass-modern rounded-2xl p-4 border border-white/5">
                  <p className="text-gray-400 mb-1">Average image render</p>
                  <p className="text-lg font-semibold text-white">⟶ under 5s</p>
                </div>
              </div>
            </div>

            {/* Right: stacking cards for detailed steps (3 cards sejajar dulu, lalu stacking saat scroll) */}
            <div className="relative space-y-4" style={{ minHeight: '400px' }}>
              {steps.map((step, index) => (
                <div
                  key={`step-${index}`}
                  ref={(el) => {
                    if (el) cardRefs.current[index] = el;
                  }}
                  className="step-card-stack relative group transition-all duration-500 animate-fade-in-up opacity-0"
                  data-index={index}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Card with professional design */}
                  <div className="relative h-full">
                    {/* Subtle border effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-sm`} />

                    {/* Main card */}
                    <div className="relative glass-modern rounded-2xl p-6 lg:p-7 border border-white/10 hover:border-white/20 card-hover-3d h-full bg-gray-900/60 backdrop-blur-xl transition-all duration-500 hover:bg-gray-900/70">

                      {/* Number badge and icon */}
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-xl font-bold text-white shadow-lg transition-all duration-300 group-hover:scale-105`}>
                          {step.number}
                        </div>

                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${step.gradient} bg-opacity-20 flex items-center justify-center text-white/80 transition-all duration-300 group-hover:bg-opacity-30`}>
                          <div className="text-sm">{step.icon}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 leading-tight group-hover:text-purple-200 transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm lg:text-base group-hover:text-gray-200 transition-colors duration-300">
                        {step.description}
                      </p>

                      {/* Simple accent line */}
                      <div className={`mt-6 h-1 w-16 bg-gradient-to-r ${step.gradient} rounded-full transition-all duration-300 group-hover:w-20`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
