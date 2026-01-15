'use client';

export default function PromptBarCard({ item }) {
  const videoSrc = item?.videoSrc || '/assets/video/city.mp4';
  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#06080c]/95 rounded-3xl border border-white/10 overflow-hidden hover:border-purple-500/40 transition-all shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left: Video Preview */}
        <div className="relative">
          <div className="aspect-video bg-[#0a0d12] rounded-xl border border-white/10 overflow-hidden group relative">
            {/* Autoplay looping preview video */}
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          </div>
        </div>

        {/* Right: Text Content */}
        <div className="flex flex-col justify-center">
          <h3 className="inline-block text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent mb-3 leading-tight">
            {item.headline}
          </h3>
          <p
            className="text-sm md:text-base text-gray-300 leading-relaxed mb-4"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </p>
          <button
            onClick={scrollToTop}
            className="w-fit px-7 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-lg font-semibold text-sm md:text-base hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
          >
            Turn Text to Video Now
          </button>
        </div>
      </div>
    </div>
  );
}


