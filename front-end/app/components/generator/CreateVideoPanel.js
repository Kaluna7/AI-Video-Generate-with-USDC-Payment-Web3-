'use client';

export default function CreateVideoPanel({
  activeTab,
  setActiveTab,
  prompt,
  setPrompt,
  selectedStyle,
  setSelectedStyle,
  selectedLength,
  setSelectedLength,
  resolution,
  setResolution,
  frameRate,
  setFrameRate,
  aiEnhancement,
  setAiEnhancement,
}) {
  const styles = ['Cinematic', 'Anime', 'Realistic', 'Abstract', '3D Render', 'Sketch'];
  const lengths = [
    { value: '5s', price: 2.5 },
    { value: '10s', price: 4.5 },
    { value: '30s', price: 12 },
  ];
  const resolutions = ['1080p (HD)', '720p (SD)', '4K (UHD)'];
  
  // Format resolution for display (remove parentheses part)
  const formatResolution = (res) => {
    return res.split(' ')[0];
  };
  const frameRates = ['30 FPS', '60 FPS', '24 FPS'];

  return (
    <div className="space-y-6">
      {/* Create Video Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Create Video</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'text'
                ? 'gradient-purple-blue text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'image'
                ? 'gradient-purple-blue text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Image
          </button>
        </div>

        {/* Prompt Input */}
        {activeTab === 'text' ? (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Describe your video</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              rows={4}
              placeholder="Enter your video description..."
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{prompt.length}/500 characters</span>
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Enhance with AI
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 mb-2">Upload an image</p>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Choose File
            </button>
          </div>
        )}
      </div>

      {/* Video Style Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Video Style</h3>
        <div className="grid grid-cols-3 gap-2">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                selectedStyle === style
                  ? 'gradient-purple-blue text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Video Length Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Video Length</h3>
        <div className="flex gap-2">
          {lengths.map((length) => (
            <button
              key={length.value}
              onClick={() => setSelectedLength(length.value)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                selectedLength === length.value
                  ? 'gradient-purple-blue text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {length.value} ({length.price} USDC)
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <label className="block text-sm font-semibold text-white mb-2">Resolution</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
        >
          {resolutions.map((res) => (
            <option key={res} value={res}>{res}</option>
          ))}
        </select>
      </div>

      {/* Frame Rate Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <label className="block text-sm font-semibold text-white mb-2">Frame Rate</label>
        <select
          value={frameRate}
          onChange={(e) => setFrameRate(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
        >
          {frameRates.map((fps) => (
            <option key={fps} value={fps}>{fps}</option>
          ))}
        </select>
      </div>

      {/* Advanced Settings Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <button className="flex items-center justify-between w-full text-left">
          <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

