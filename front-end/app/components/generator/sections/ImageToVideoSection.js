'use client';

import Image from 'next/image';

export default function ImageToVideoSection() {
  const marqueeItems = [
    'Animate portraits with natural motion',
    'Turn product photos into cinematic ads',
    'Add camera moves: push-in, pan, handheld',
    'Perfect for Shorts, Reels, TikTok',
    'Keep faces consistent across scenes',
    'Ship more variations, faster',
  ];

  return (
    <section className="relative py-16">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
            Bring the Pics to Life
          </span>{' '}
          <span className="text-white">with Image to Video</span>
        </h2>
        <p className="text-gray-400 max-w-3xl mx-auto">
          Upload a single image, add a short prompt, and PrimeStudio generates a smooth, pro-looking video—ready to post.
        </p>

        {/* Marquee (different copy than Text-to-Video) */}
        <div className="mt-8">
          <div
            className="ps-marquee"
            style={{
              '--ps-marquee-duration': '22s',
            }}
          >
            <div className="ps-marquee__track">
              {[...marqueeItems, ...marqueeItems].map((t, idx) => (
                <span
                  key={`${t}-${idx}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#06080c]/70 text-sm text-gray-200 mx-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Showcase */}
      <div className="mt-14 relative">
        <div className="max-w-6xl mx-auto relative">
          {/* Side nav buttons (visual only) */}
          <button
            type="button"
            className="hidden md:flex absolute left-[-28px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/10 items-center justify-center text-white/80 hover:bg-white/15 transition-colors"
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className="hidden md:flex absolute right-[-28px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/10 items-center justify-center text-white/80 hover:bg-white/15 transition-colors"
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            {/* Original image */}
            <div className="rounded-3xl border border-white/10 bg-[#06080c]/70 p-4">
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-white/10 via-purple-500/10 to-cyan-500/10">
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs text-white">
                  Original image
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[78%] max-w-[420px] opacity-95">
                    <Image
                      src="/assets/images/coin-3d.svg"
                      alt="Sample"
                      width={420}
                      height={420}
                      className="w-full h-auto drop-shadow-2xl"
                      priority={false}
                    />
                  </div>
                </div>
              </div>

              {/* Prompt card */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-sm font-semibold text-white mb-2">Prompt</p>
                <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                  A cinematic close-up portrait comes alive: subtle breathing, a gentle head turn, soft hair movement,
                  shallow depth of field, and a slow push-in camera move. Warm rim light, natural skin texture, film grain,
                  and a confident mood.
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Video */}
            <div className="rounded-3xl border border-white/10 bg-[#06080c]/70 p-4">
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-black/20">
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs text-white">
                  Video
                </div>
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src="/assets/video/samoyed.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            </div>
          </div>

          {/* Mobile arrow */}
          <div className="lg:hidden flex items-center justify-center my-6">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


