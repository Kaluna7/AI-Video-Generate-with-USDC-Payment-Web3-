'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TextToVideoSection() {
  const scrollingTextRef = useRef(null);
  const sectionRef = useRef(null);
  const barsContainerRef = useRef(null);
  const barsRef = useRef([]);
  const footerRef = useRef(null);

  // Auto scrolling text
  useEffect(() => {
    if (!scrollingTextRef.current) return;

    const text = scrollingTextRef.current;
    const textWidth = text.scrollWidth;

    // Duplicate text for seamless loop
    const clonedText = text.cloneNode(true);
    text.parentElement.appendChild(clonedText);

    // Animate scrolling
    gsap.to([text, clonedText], {
      x: -textWidth,
      duration: 20,
      ease: 'none',
      repeat: -1,
    });

    return () => {
      if (clonedText.parentElement) {
        clonedText.parentElement.removeChild(clonedText);
      }
    };
  }, []);

  // Scroll-triggered stacking animation with pin
  useEffect(() => {
    if (!barsContainerRef.current || barsRef.current.length === 0) return;

    const bars = barsRef.current.filter(Boolean);
    if (bars.length === 0) return;

    // Wait for bars to render to get accurate heights
    const initAnimation = () => {
      const viewportHeight = window.innerHeight;
      // Center position using transform translateY
      const centerY = 0; // Using top: 50% and transform: translateY(-50%), so centerY is 0

      // Get bar height for calculations
      const barHeight = bars[0]?.offsetHeight || 600;
      const spacing = 800; // Spacing between cards
      const containerTop = 200; // Padding top of container

      // Initial state - all bars aligned vertically (sejajar ke bawah)
      bars.forEach((bar, index) => {
        // Each card starts at its own vertical position
        // First card at top, others below with spacing
        const initialY = containerTop + (index * spacing);
        
        gsap.set(bar, {
          y: initialY, // Cards stacked vertically
          x: 0,
          opacity: 1, // All bars fully visible
          scale: 1, // All bars same size
          zIndex: bars.length - index, // Z-index: first bar on top, others below
        });
      });

      // Calculate total scroll distance needed
      // Each bar transition needs scroll distance to stack them
      const scrollPerBar = viewportHeight * 0.6; // Scroll distance per bar transition
      const scrollDistance = (bars.length - 1) * scrollPerBar; // Total scroll distance

      // Create a timeline for stacking animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: barsContainerRef.current,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Animate each bar transition - stacking effect as user scrolls
      bars.forEach((bar, index) => {
        if (index === 0) return; // Skip first bar (it's already at top)

        // Each bar transition happens at its own section
        const sectionStart = (index - 1) * 0.6; // Start of this section

        // Calculate center position (where active card should be)
        // Center should be around viewport center, accounting for header
        const centerY = containerTop + 100; // Center position for active card

        // Move all previous bars up (stacking effect - menumpuk ke atas)
        bars.slice(0, index).forEach((prevBar, prevIndex) => {
          const stackPosition = index - prevIndex; // Position in stack (1 = first stacked, 2 = second, etc.)
          const stackOffset = stackPosition * 80; // Each bar stacks 80px above previous
          
          // Calculate target Y position (move up from center)
          const targetY = centerY - stackOffset; // Move up from center
          
          tl.to(
            prevBar,
            {
              y: targetY, // Move up (menumpuk ke atas)
              opacity: Math.max(0.3, 1 - stackPosition * 0.2), // Fade based on stack position
              scale: Math.max(0.75, 1 - stackPosition * 0.08), // Scale down based on stack
              zIndex: bars.length - stackPosition, // Z-index for proper stacking order
              duration: 0.5,
              ease: 'power2.out',
            },
            sectionStart
          );
        });

        // Current bar moves to center (becomes the active card)
        tl.to(
          bar,
          {
            y: centerY, // Move to center (becomes the active card)
            opacity: 1, // Full opacity
            scale: 1, // Full scale
            zIndex: bars.length, // Highest z-index (active card)
            duration: 0.5,
            ease: 'power2.out',
          },
          sectionStart
        );
      });
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initAnimation, 100);

    // Footer animation - after pin ends
    if (footerRef.current) {
      gsap.fromTo(
        footerRef.current,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const scrollToTopRef = useRef(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const promptingBars = [
    {
      id: 1,
      headline: 'Accurately Convert Text to Video in Seconds',
      description: 'Enter a text prompt—whether it\'s a detailed description, a full script, or just a few keywords—PrimeStudio AI analyzes your input, understands your tone, and transforms it into the stunning video content you envisioned.',
      prompt: 'CG style, a stunning anime style character with vibrant colors',
      videoTitle: 'Futuristic Cityscape',
      videoDuration: '10s',
      videoFormat: 'MP4',
    },
    {
      id: 2,
      headline: 'Fast, Seamless, and High-quality AI Video Generation',
      description: 'With instant previews and fast rendering, PrimeStudio lets you create more and wait less — the best text to video AI generator produces smooth, high-quality AI videos in no time.',
      prompt: 'A baby bird hides under its mother\'s protective wings during a storm',
      videoTitle: 'Nature Scene',
      videoDuration: '15s',
      videoFormat: 'HD',
    },
    {
      id: 3,
      headline: 'Customize with a Variety of Styles',
      description: 'Choose the AI video style you want to generate, whether it\'s Anime, Realistic, Cinematic, or Abstract. PrimeStudio offers diverse style options to match your creative vision.',
      prompt: 'Anime style character with vibrant purple hair and cherry blossoms',
      videoTitle: 'Anime Style',
      videoDuration: '12s',
      videoFormat: 'MP4',
    },
  ];

  return (
    <div ref={sectionRef} className="w-full relative">
      {/* Header Section */}
      <div className="text-center mb-16 pt-8">
        <h2 className="text-4xl md:text-5xl font-bold">
          <span className="text-purple-400">From Idea to Impact — </span>
          <span className="text-orange-400">AI Video Generation Without Limits</span>
        </h2>
      </div>

      {/* Prompting Bars with Videos - Container for pinning */}
      <div ref={barsContainerRef} className="relative" style={{ minHeight: '100vh' }}>
        <div className="relative w-full" style={{ minHeight: `${promptingBars.length * 800}px`, paddingTop: '200px' }}>
          {promptingBars.map((bar, index) => (
            <div
              key={bar.id}
              ref={(el) => (barsRef.current[index] = el)}
              className="absolute w-full max-w-7xl bg-gray-800/50 rounded-3xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all shadow-2xl"
              style={{ 
                left: '50%', 
                transform: 'translateX(-50%)'
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Left: Video Preview */}
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-xl border border-gray-700 overflow-hidden group relative">
                    {/* Video Thumbnail */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 gradient-purple-blue rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all cursor-pointer shadow-lg">
                        <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>

                    {/* Top Right - Format Label */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {bar.videoFormat === 'HD' && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 rounded-lg backdrop-blur-sm">
                          <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-xs font-semibold text-gray-800">HD</span>
                        </div>
                      )}
                      {bar.videoFormat === 'MP4' && (
                        <div className="px-2.5 py-1 bg-white/90 rounded-lg backdrop-blur-sm">
                          <span className="text-xs font-semibold text-gray-800">.MP4</span>
                        </div>
                      )}
                    </div>

                    {/* Top Left - Text Input Icon */}
                    <div className="absolute top-4 left-4 w-8 h-8 bg-white/90 rounded-lg backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-800">T</span>
                    </div>

                    {/* Bottom Bar - Prompt Text */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
                      <div className="w-5 h-5 gradient-purple-blue rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <p className="text-sm text-white flex-1 truncate">{bar.prompt}</p>
                      <button className="w-8 h-8 bg-gray-700/80 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Text Content */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {bar.headline}
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    {bar.description}
                  </p>
                  <button className="w-fit px-8 py-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-lg font-semibold text-base hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20">
                    Turn Text to Video Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        ref={scrollToTopRef}
        onClick={scrollToTop}
        className="fixed right-8 bottom-8 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors shadow-lg z-50"
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Footer */}
      <footer
        ref={footerRef}
        className="border-t border-gray-800 pt-8 pb-4"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-purple-blue flex items-center justify-center text-white font-bold text-lg">
              V3
            </div>
            <div>
              <p className="text-sm font-semibold text-white">PrimeStudio</p>
              <p className="text-xs text-gray-400">AI Video Generation Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-purple-400 transition-colors">About</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2024 PrimeStudio. All rights reserved. Powered by Web3 technology.</p>
        </div>
      </footer>
    </div>
  );
}

