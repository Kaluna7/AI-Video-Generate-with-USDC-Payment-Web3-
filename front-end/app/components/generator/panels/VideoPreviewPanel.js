'use client';

export default function VideoPreviewPanel({ generationStatus, videoUrl, errorMessage, recentGenerations = [] }) {
  const steps = [
    { id: 'waiting', label: 'Waiting', icon: '⏱️' },
    { id: 'confirmed', label: 'Confirmed', icon: '✓' },
    { id: 'generating', label: 'Generating', icon: '⚙️' },
    { id: 'ready', label: 'Ready', icon: '✓' },
  ];

  const getProgress = () => {
    switch (generationStatus) {
      case 'waiting': return 0;
      case 'confirmed': return 25;
      case 'generating': return 60;
      case 'ready': return 100;
      default: return 0;
    }
  };

  const getCurrentStep = () => {
    const index = steps.findIndex(s => s.id === generationStatus);
    return index + 1;
  };

  return (
    <div className="space-y-4">
      {/* Video Preview Section */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Video Preview</h2>
          {generationStatus === 'ready' && (
            <div className="flex gap-2">
              <button className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Download">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Share">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden">
          {generationStatus === 'ready' && videoUrl ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={videoUrl}
              controls
              playsInline
            />
          ) : (
            <div className="text-center z-10">
              <div className="w-12 h-12 gradient-purple-blue rounded-full flex items-center justify-center mx-auto mb-3 opacity-40">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">
                {generationStatus === 'generating' ? 'Generating...' : 'No video yet'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {errorMessage ? errorMessage : 'Configure & generate'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generation Status Section */}
      {generationStatus !== 'ready' && generationStatus !== 'waiting' && (
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {generationStatus === 'confirmed' && 'Payment confirmed. Starting generation...'}
                {generationStatus === 'generating' && 'Generating your video...'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">This may take a few minutes</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Step {getCurrentStep()} of 4</span>
              <span className="text-xs text-gray-400">{getProgress()}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="gradient-purple-blue h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Steps - Compact */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            {steps.map((step, index) => {
              const isActive = steps.findIndex(s => s.id === generationStatus) >= index;
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1.5 transition-all ${
                      isActive
                        ? 'gradient-purple-blue text-white'
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className={`text-[10px] text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Generations Section */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Generations</h3>
        {recentGenerations.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {recentGenerations.slice(0, 3).map((gen) => (
              <div
                key={gen.id}
                className="aspect-square bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer group relative overflow-hidden"
                title={gen.prompt}
              >
                {gen.videoUrl ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={gen.videoUrl}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-colors" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/0 opacity-90" />
                <div className="absolute left-0 right-0 bottom-0 p-2">
                  <p className="text-[10px] text-gray-200 text-center truncate w-full">{gen.title}</p>
                  <p className="text-[10px] text-gray-400 text-center">{gen.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No generations yet.</p>
        )}
      </div>
    </div>
  );
}

