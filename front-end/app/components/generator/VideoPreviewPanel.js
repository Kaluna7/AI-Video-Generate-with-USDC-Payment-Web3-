'use client';

export default function VideoPreviewPanel({ generationStatus, setGenerationStatus }) {
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

  const recentGenerations = [
    { title: 'Futuristic city at night', time: '2 hours ago' },
    { title: 'Ocean waves crashing', time: '5 hours ago' },
    { title: 'Mountain landscape', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Video Preview Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Video Preview</h2>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="aspect-video bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center">
          {generationStatus === 'ready' ? (
            <div className="text-center">
              <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <p className="text-gray-400">Video ready to play</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <p className="text-gray-400">No video generated yet. Configure settings and start generation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Generation Status Section */}
      {generationStatus !== 'ready' && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">
                {generationStatus === 'waiting' && 'Waiting for Payment. Complete payment to start video generation.'}
                {generationStatus === 'confirmed' && 'Payment confirmed. Starting video generation...'}
                {generationStatus === 'generating' && 'Generating your video. This may take a few minutes...'}
              </p>
            </div>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-semibold">
              {generationStatus === 'waiting' ? 'Pending' : generationStatus === 'confirmed' ? 'Processing' : 'Generating'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step {getCurrentStep()} of 4</span>
              <span className="text-sm text-gray-400">{getProgress()}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="gradient-purple-blue h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = steps.findIndex(s => s.id === generationStatus) >= index;
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 transition-all ${
                      isActive
                        ? 'gradient-purple-blue text-white'
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className={`text-xs text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Generations Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Generations</h3>
        <div className="grid grid-cols-3 gap-3">
          {recentGenerations.map((gen, index) => (
            <div key={index} className="aspect-square bg-gray-900 rounded-lg border border-gray-700 flex flex-col items-center justify-center p-2 hover:border-purple-500 transition-colors cursor-pointer">
              <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg mb-2"></div>
              <p className="text-xs text-gray-400 text-center">{gen.title}</p>
              <p className="text-xs text-gray-500">{gen.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

