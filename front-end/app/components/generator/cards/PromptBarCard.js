'use client';

export default function PromptBarCard({ item }) {
  const videoSrc = item?.videoSrc || '/assets/video/city.mp4';

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

            {/* Top Right - Format Label */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {item.videoFormat === 'HD' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 rounded-lg backdrop-blur-sm">
                  <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-gray-800">HD</span>
                </div>
              )}
              {item.videoFormat === 'MP4' && (
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
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
              <div className="w-5 h-5 gradient-purple-blue rounded flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-sm text-white flex-1 truncate">{item.prompt}</p>
              <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Text Content */}
        <div className="flex flex-col justify-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
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
          <button className="w-fit px-7 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-lg font-semibold text-sm md:text-base hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20">
            Turn Text to Video Now
          </button>
        </div>
      </div>
    </div>
  );
}


