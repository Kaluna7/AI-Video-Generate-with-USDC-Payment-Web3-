'use client';

import { useState } from 'react';

export default function ImagePreviewPanel({
  generationStatus,
  imageUrl,
  errorMessage,
  progress,
  recentGenerations = [],
  onSeeAllRecent,
  aspectRatio = '1:1',
}) {
  const steps = [
    { id: 'waiting', label: 'Waiting', icon: '⏱️' },
    { id: 'confirmed', label: 'Confirmed', icon: '✓' },
    { id: 'generating', label: 'Generating', icon: '⚙️' },
    { id: 'ready', label: 'Ready', icon: '✓' },
  ];

  const getProgressValue = () => {
    if (progress !== undefined && progress !== null) {
      return progress;
    }
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

  // Calculate aspect ratio class
  const getAspectRatioClass = () => {
    const ratio = aspectRatio || '1:1';
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return 'aspect-[9/16]';
      case '4:3':
        return 'aspect-[4/3]';
      case '3:4':
        return 'aspect-[3/4]';
      case '3:2':
        return 'aspect-[3/2]';
      case '2:3':
        return 'aspect-[2/3]';
      case '21:9':
        return 'aspect-[21/9]';
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className="space-y-3">
      {/* Image Preview Section */}
      <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-white">Image Preview</h2>
          {generationStatus === 'ready' && imageUrl && (
            <div className="flex gap-1.5">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageUrl;
                  link.download = `generated-image-${Date.now()}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors" 
                title="Download"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Generated Image',
                      text: 'Check out this AI-generated image!',
                      url: imageUrl,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(imageUrl).then(() => {
                      alert('Image URL copied to clipboard!');
                    }).catch(() => {});
                  }
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors" 
                title="Share"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className={`${getAspectRatioClass()} bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-700 flex items-center justify-center relative overflow-hidden max-w-full`}>
          {generationStatus === 'ready' && imageUrl ? (
            <img
              className="absolute inset-0 w-full h-full object-contain"
              src={imageUrl}
              alt="Generated image"
            />
          ) : (
            <div className="text-center z-10">
              <div className="w-6 h-6 gradient-purple-blue rounded-full flex items-center justify-center mx-auto mb-1.5 opacity-40">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[10px] text-gray-500">
                {generationStatus === 'generating' ? 'Generating...' : 'No image yet'}
              </p>
              <p className="text-[9px] text-gray-600 mt-0.5">
                {errorMessage ? errorMessage : 'Configure & generate'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generation Status Section */}
      {generationStatus !== 'ready' && generationStatus !== 'waiting' && (
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">
                {generationStatus === 'confirmed' && 'Payment confirmed. Starting generation...'}
                {generationStatus === 'generating' && 'Generating your image...'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">This may take a few moments</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-400">Step {getCurrentStep()} of 4</span>
              <span className="text-[10px] text-gray-400">{getProgressValue()}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className="gradient-purple-blue h-1 rounded-full transition-all duration-500"
                style={{ width: `${getProgressValue()}%` }}
              ></div>
            </div>
          </div>

          {/* Steps - Compact */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
            {steps.map((step, index) => {
              const isActive = steps.findIndex(s => s.id === generationStatus) >= index;
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 transition-all ${
                      isActive
                        ? 'gradient-purple-blue text-white'
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className={`text-[9px] text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Images Section */}
      <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-white">Recent Images</h3>
          {recentGenerations.length > 3 && (
            <button
              type="button"
              onClick={() => onSeeAllRecent?.()}
              className="text-[10px] text-purple-300 hover:text-purple-200 transition-colors"
            >
              See all →
            </button>
          )}
        </div>
        {recentGenerations.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5">
            {recentGenerations.slice(0, 3).map((gen) => (
              <div
                key={gen.id}
                className="aspect-square bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer group relative overflow-hidden"
                title={gen.prompt}
              >
                {gen.imageUrl ? (
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src={gen.imageUrl}
                    alt={gen.title}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-colors" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/0 opacity-90" />

                <div className="absolute left-0 right-0 bottom-0 p-1.5">
                  <p className="text-[9px] text-gray-200 text-center truncate w-full">{gen.title}</p>
                  <p className="text-[9px] text-gray-400 text-center">{gen.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-gray-500">No images yet.</p>
        )}
      </div>
    </div>
  );
}

