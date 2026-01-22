'use client';

import { useAuthStore } from '../../store/authStore';

export default function CTA() {
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="gradient-border rounded-3xl overflow-hidden fade-in-up">
          <div className="relative px-6 py-10 md:px-12 md:py-14 lg:px-16 lg:py-16 bg-gradient-to-r from-purple-900/70 via-black/60 to-blue-900/60">
            {/* Soft media placeholder background – ganti dengan video / gambar Anda jika mau */}
            <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/30 blur-3xl rounded-full" />
              <div className="absolute -left-16 -top-16 w-80 h-80 bg-purple-500/25 blur-3xl rounded-full" />
            </div>

            <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
              <div className="flex-1 text-center lg:text-left">
                <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-gray-100 mb-4">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-glow" />
                  Ship your next launch with AI-native visuals
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Turn prompts into campaigns in a single afternoon.
                </h2>
                <p className="text-sm md:text-base text-white/85 max-w-xl mx-auto lg:mx-0 mb-8">
                  From storyboard clips to hero images, everything runs through the same studio.
                  Connect, top up coins, pick a generator, and start shipping today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="btn-3d px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Launch Studio
                  </button>
                  <button className="btn-3d px-8 py-4 glass-modern text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Explore public gallery
                  </button>
                </div>
              </div>

              {/* Right: small stat teaser */}
              <div className="w-full max-w-xs glass-modern rounded-2xl border border-white/15 px-4 py-5 text-left">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-3">
                  Snapshot from the last 24h
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Video runs</span>
                    <span className="text-white font-semibold">48,392</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Image runs</span>
                    <span className="text-white font-semibold">112,874</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Average render time</span>
                    <span className="text-emerald-400 font-semibold">⟶ 37s</span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-gray-500 leading-snug">
                  Just like on LumeFlow-style studios, these are live-style metrics — yours will update
                  automatically as you generate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
