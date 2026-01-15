'use client';

import { useRef } from 'react';
import PromptBarsStack from './PromptBarsStack';

export default function TextToVideoSection() {
  const sectionRef = useRef(null);
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
      videoSrc: '/assets/video/city.mp4',
      videoTitle: 'Futuristic Cityscape',
      videoDuration: '10s',
      videoFormat: 'MP4',
    },
    {
      id: 2,
      headline: 'Fast, Seamless, and High-quality AI Video Generation',
      description: 'With instant previews and fast rendering, PrimeStudio lets you create more and wait less — the best text to video AI generator produces smooth, high-quality AI videos in no time.',
      prompt: 'A baby bird hides under its mother\'s protective wings during a storm',
      videoSrc: '/assets/video/ferrari.mp4',
      videoTitle: 'Nature Scene',
      videoDuration: '15s',
      videoFormat: 'HD',
    },
    {
      id: 3,
      headline: 'Customize with a Variety of Styles',
      description: 'Choose the AI video style you want to generate, whether it\'s Anime, Realistic, Cinematic, or Abstract. PrimeStudio offers diverse style options to match your creative vision.',
      prompt: 'Anime style character with vibrant purple hair and cherry blossoms',
      videoSrc: '/assets/video/stickman.mp4',
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
        <div className="mt-6 ps-marquee">
          <div className="ps-marquee__track">
            <div className="flex items-center gap-5">
              <span className="text-sm text-gray-300 whitespace-nowrap">Turn ideas into videos in minutes</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Cinematic motion, studio-ready results</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">High-quality Veo 3.1 generation</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Fast previews, smoother iterations</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Perfect for Shorts, Reels, and TikTok</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Choose aspect ratio: 16:9, 9:16, or Auto</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">From prompt to playable video—no timeline needed</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Create, refine, and generate on demand</span>
            </div>
            {/* duplicate for seamless loop */}
            <div className="flex items-center gap-5" aria-hidden="true">
              <span className="text-sm text-gray-300 whitespace-nowrap">Turn ideas into videos in minutes</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Cinematic motion, studio-ready results</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">High-quality Veo 3.1 generation</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Fast previews, smoother iterations</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Perfect for Shorts, Reels, and TikTok</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Choose aspect ratio: 16:9, 9:16, or Auto</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">From prompt to playable video—no timeline needed</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Create, refine, and generate on demand</span>
            </div>
          </div>
        </div>
      </div>

      <PromptBarsStack items={promptingBars} />

      {/* Reviews header */}
      <div className="mt-20 mb-10 text-center">
        <h3 className="text-3xl md:text-4xl font-bold text-white">
          Loved by creators who ship fast
        </h3>
        <p className="mt-3 text-gray-400">
          Join <span className="text-white font-semibold">10,000+</span> creators turning prompts into polished videos—and sharing their results.
        </p>
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
      <footer className="border-t border-gray-800 pt-8 pb-4">
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

