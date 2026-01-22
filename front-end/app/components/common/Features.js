'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function FeatureCard({ feature, index, cardRef }) {
  return (
    <div
      ref={cardRef}
      className="feature-card-stack card-hover-3d glass-modern rounded-2xl p-6 lg:p-7 border border-white/10 hover:border-white/20 overflow-hidden relative group transition-all duration-300 hover:bg-gray-900/70 animate-fade-in-up opacity-0"
      data-index={index}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="relative z-10">
        {/* Number badge */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 text-white font-bold shadow-lg">
          {index + 1}
        </div>

        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4 text-white/90">
          <div className="text-sm">{feature.icon}</div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm group-hover:text-gray-200 transition-colors duration-300">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export default function Features() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Text to Video',
      description: 'Transform your text prompts into stunning videos with our advanced Sora AI model. Just describe what you want, and we\'ll bring it to life in seconds.',
      media: '/assets/video/plane_jupiter.mp4',
      mediaType: 'video',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Image to Video',
      description: 'Bring static images to life with AI-powered animation. Upload any image and watch it transform into dynamic video content with natural motion and cinematic effects.',
      media: '/assets/video/samoyed.mp4',
      mediaType: 'video',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Text to Image',
      description: 'Create beautiful, high-quality images from text descriptions. Generate stunning visuals for your projects, social media, or creative works with our powerful AI image models.',
      media: '/assets/images/beautiful_scenery.png',
      mediaType: 'image',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Image to Image',
      description: 'Transform and enhance existing images with AI. Apply new styles, modify compositions, or create variations while maintaining the essence of your original image.',
      media: '/assets/images/samoyed.png',
      mediaType: 'image',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'USDC Payments',
      description: 'Pay only for what you use with USDC. No subscriptions, no hidden fees. Transparent pricing on every generation.',
      media: '/assets/images/coin.png',
      mediaType: 'image',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Lightning Fast',
      description: 'Generate high-quality videos in seconds. Our optimized infrastructure ensures minimal wait times for maximum productivity.',
      media: '/assets/video/ferrari.mp4',
      mediaType: 'video',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Trustless & Secure',
      description: 'Built on blockchain technology. Your payments and generations are secured onchain with full transparency.',
      media: '/assets/images/ai.png',
      mediaType: 'image',
    },
  ];

  const primaryFeatures = features.slice(0, 3);
  const secondaryFeatures = features.slice(3);

  useEffect(() => {
    if (typeof window === 'undefined' || !gsap) return;

    const cards = cardRefs.current.filter(Boolean);
    if (cards.length === 0) return;

    // Interactive hover animations
    cards.forEach((card, index) => {
      if (!card) return;

      // Staggered entrance animation
      gsap.fromTo(card,
        {
          y: 50,
          opacity: 0,
          scale: 0.9
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'power2.out'
        }
      );

      // Add hover animations
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -8,
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="features" 
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-gray-900/30 relative overflow-hidden"
    >
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-500/3 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-5xl mx-auto text-center mb-12 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-modern rounded-full text-sm text-gray-300 mb-4">
            <span className="w-2 h-2 bg-sky-400 rounded-full pulse-glow" />
            One platform · Multiple AI generators
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Everything in One Studio</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Text to video, image to video, text to image, and image to image — all in a single, coin-based workspace.
            Switch modes without ever leaving your flow.
          </p>
        </div>
        
        {/* Primary modes – horizontal interactive cards */}
        <div className="relative max-w-7xl mx-auto mb-20">
          {/* Header section */}
          <div className="text-center mb-12 fade-in-up">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Core generation modes
            </h3>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Pick a mode, describe your idea, and let the engine handle the camera, motion, and style.
              Each mode is optimized for a different type of story.
            </p>
          </div>

          {/* Interactive horizontal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {primaryFeatures.map((feature, index) => (
              <div
                key={feature.title}
                ref={(el) => (cardRefs.current[index] = el)}
                className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 animate-fade-in-up opacity-0 cursor-pointer"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Background glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                {/* Icon with enhanced animation */}
                <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6 text-white shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-white/30 rounded-3xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  {/* Floating particles */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/80 rounded-full animate-ping opacity-0 group-hover:opacity-100" style={{ animationDelay: '0.1s' }} />
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping opacity-0 group-hover:opacity-100" style={{ animationDelay: '0.3s' }} />
                </div>

                {/* Number badge */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {index + 1}
                </div>

                {/* Title with gradient text effect */}
                <h4 className="text-2xl font-bold mb-4 leading-tight group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                  {feature.title}
                </h4>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed mb-6 group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Interactive CTA */}
                <div
                  className="flex items-center justify-between cursor-pointer relative z-20"
                  onClick={() => {
                    console.log('Try it now clicked');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                    Try it now →
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-purple-500/50 group-hover:to-blue-500/50 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Secondary platform features – enhanced interactive grid */}
        <div className="max-w-7xl mx-auto fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for real workflows
            </h3>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm uppercase tracking-wider text-gray-400 font-medium">
                Payments · Speed · Security
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {secondaryFeatures.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/70 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 animate-fade-in-up opacity-0 overflow-hidden"
                style={{ animationDelay: `${0.4 + idx * 0.15}s` }}
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Floating particles background */}
                <div className="absolute top-4 right-4 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                  <div className="absolute top-4 right-4 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                </div>

                {/* Enhanced icon */}
                <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6 text-white shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-white/30 rounded-3xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>

                {/* Title with gradient hover effect */}
                <h4 className="text-xl font-bold text-white mb-4 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500 leading-tight">
                  {feature.title}
                </h4>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Interactive bottom accent */}
                <div
                  className="mt-6 flex items-center justify-between cursor-pointer relative z-20"
                  onClick={() => {
                    console.log('Secondary CTA clicked');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="h-1 w-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 group-hover:w-12" />
                  <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
