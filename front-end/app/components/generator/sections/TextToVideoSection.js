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

  const reviews = [
    {
      name: 'Alya S.',
      role: 'Content Creator',
      text: 'Huge time-saver. From prompt to video in minutes—and the result looks premium.',
    },
    {
      name: 'Rizky P.',
      role: 'TikTok Editor',
      text: 'The previews make the workflow effortless. Iterate the prompt, ship the video.',
    },
    {
      name: 'Nadia K.',
      role: 'Brand Designer',
      text: 'Consistent style and clean output. Perfect for fast-turnaround campaigns.',
    },
    {
      name: 'Kevin M.',
      role: 'YouTube Shorts',
      text: 'Makes it easy to generate multiple variations without touching a timeline.',
    },
    {
      name: 'Salsa R.',
      role: 'Freelance Marketer',
      text: 'Simple UI, strong results. My clients love how fast we can test concepts.',
    },
    {
      name: 'Dimas H.',
      role: 'UGC Creator',
      text: 'Tried it once and got hooked. The output is ready to post.',
    },
  ];

  const Stars = ({ count = 5 }) => (
    <div className="flex items-center gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-yellow-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.43 8.81c-.783-.57-.38-1.81.588-1.81H6.48a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const ReviewCard = ({ r }) => (
    <div className="w-[320px] sm:w-[360px] shrink-0 rounded-2xl border border-white/10 bg-[#06080c]/90 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{r.name}</p>
          <p className="text-xs text-gray-400">{r.role}</p>
        </div>
        <Stars />
      </div>
      <p className="mt-3 text-sm text-gray-300 leading-relaxed">“{r.text}”</p>
    </div>
  );

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

      {/* How it works */}
      <div className="mt-16 mb-18">
        <div className="text-center">
          <h3 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
            How to use PrimeStudio
          </h3>
          <p className="mt-3 text-gray-400">
            Generate studio-ready videos in a simple, repeatable workflow.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#06080c]/90 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                1
              </div>
              <p className="text-white font-semibold">Enter a text prompt</p>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Describe your scene, style, and motion. Paste a script or a few keywords—PrimeStudio turns it into a clean prompt-ready input.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Tip: Add camera moves, lighting, and mood for better results.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#06080c]/90 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 font-bold">
                2
              </div>
              <p className="text-white font-semibold">Choose Veo settings</p>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Pick your model and aspect ratio (16:9 / 9:16)—optimized for Shorts, Reels, TikTok, or widescreen.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Recommended: 9:16 for social, 16:9 for YouTube.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#06080c]/90 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold">
                3
              </div>
              <p className="text-white font-semibold">Generate & preview</p>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Start generation and watch the status update in real time. Preview the output, then iterate quickly by tweaking your prompt.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Faster iterations = better creative direction.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#06080c]/90 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold">
                4
              </div>
              <p className="text-white font-semibold">Save, download, share</p>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Your successful generations are saved automatically to <span className="text-white font-semibold">Recent Generations</span> and <span className="text-white font-semibold">My Videos</span> so you can reuse or download anytime.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Build a library of reusable styles and prompts.
            </div>
          </div>
        </div>
      </div>

      {/* Reviews header */}
      <div className="mt-20 mb-10 text-center">
        <h3 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
          Loved by creators who ship fast
        </h3>
        <p className="mt-3 text-gray-400">
          Join <span className="text-white font-semibold">10,000+</span> creators turning prompts into polished videos—and sharing their results.
        </p>
      </div>

      {/* Reviews marquee */}
      <div className="space-y-4 mb-16">
        <div className="ps-marquee" style={{ '--ps-marquee-duration': '28s' }}>
          <div className="ps-marquee__track">
            <div className="flex items-stretch gap-4">
              {reviews.map((r, idx) => (
                <ReviewCard key={`r1-${idx}`} r={r} />
              ))}
            </div>
            <div className="flex items-stretch gap-4" aria-hidden="true">
              {reviews.map((r, idx) => (
                <ReviewCard key={`r1dup-${idx}`} r={r} />
              ))}
            </div>
          </div>
        </div>

        <div className="ps-marquee" style={{ '--ps-marquee-duration': '34s', '--ps-marquee-direction': 'reverse' }}>
          <div className="ps-marquee__track">
            <div className="flex items-stretch gap-4">
              {reviews.slice().reverse().map((r, idx) => (
                <ReviewCard key={`r2-${idx}`} r={r} />
              ))}
            </div>
            <div className="flex items-stretch gap-4" aria-hidden="true">
              {reviews.slice().reverse().map((r, idx) => (
                <ReviewCard key={`r2dup-${idx}`} r={r} />
              ))}
            </div>
          </div>
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

