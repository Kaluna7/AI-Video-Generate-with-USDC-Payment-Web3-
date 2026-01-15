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
    <section className="relative py-16 overflow-hidden">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-32 right-[-120px] w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
              Image to Video
            </span>{' '}
            <span className="text-white">that feels alive</span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            A clean, controlled workflow: one image in, cinematic motion out—no clutter, no gimmicks.
          </p>

          {/* Marquee (different copy than Text-to-Video) */}
          <div className="mt-8">
            <div
              className="ps-marquee"
              style={{
                '--ps-marquee-duration': '18s',
                '--ps-marquee-direction': 'reverse',
              }}
            >
              <div className="ps-marquee__track">
                {[...marqueeItems, ...marqueeItems].map((t, idx) => (
                  <span
                    key={`${t}-${idx}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#06080c]/70 text-sm text-gray-200 mx-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Elegant layout (different from reference screenshot) */}
        <div className="mt-14 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
          {/* Left: workflow + prompt */}
          <div className="rounded-3xl border border-white/10 bg-[#06080c]/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-white font-semibold">A simple workflow</p>
              <span className="text-xs text-gray-400">3 steps</span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { n: '01', t: 'Upload an image', d: 'Start from a portrait, product, or scene. Clean inputs yield the best motion.' },
                { n: '02', t: 'Describe the motion', d: 'Tell us camera move, mood, and action—keep it short and specific.' },
                { n: '03', t: 'Generate variations', d: 'Iterate quickly until it looks right. Save the best and ship.' },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-200 font-semibold">
                      {s.n}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold">{s.t}</p>
                      <p className="mt-1 text-sm text-gray-300 leading-relaxed">{s.d}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm font-semibold text-white mb-2">Example motion prompt</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Subtle breathing and micro-expressions, soft hair movement, shallow depth of field, gentle push‑in camera,
                warm rim light, film grain, confident mood.
              </p>
            </div>
          </div>

          {/* Right: big hero preview card (glass, not side-by-side) */}
          <div className="rounded-3xl border border-white/10 bg-[#06080c]/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-white font-semibold">Preview</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">Auto-loop</span>
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">HD</span>
              </div>
            </div>

            <div className="mt-5 relative rounded-3xl overflow-hidden border border-white/10 bg-black/30">
              {/* Diagonal split overlay */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
                <div className="absolute -inset-24 rotate-12 bg-white/5 blur-2xl" />
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0">
                <div className="p-6 md:p-8 flex items-center justify-center">
                  <div className="w-full max-w-[280px]">
                    <div className="text-xs text-gray-300 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-300" />
                      Source image
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 p-5 flex items-center justify-center">
                      <Image
                        src="/assets/images/coin-3d.svg"
                        alt="Source"
                        width={280}
                        height={280}
                        className="w-40 h-40 md:w-48 md:h-48 drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex items-center justify-center">
                  <div className="w-full max-w-[320px]">
                    <div className="text-xs text-gray-300 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-300" />
                      Generated video
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                      <div className="relative aspect-[4/5]">
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
                </div>
              </div>

              {/* Mobile arrow */}
              <div className="md:hidden px-6 pb-6 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Small footer */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                Tip: For faster motion, include “fast-paced”, “quick cuts”, or “high-energy camera”.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-200">
                  Portrait
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-200">
                  Product
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-200">
                  Scene
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


