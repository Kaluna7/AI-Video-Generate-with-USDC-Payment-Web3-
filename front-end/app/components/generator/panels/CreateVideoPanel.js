'use client';

import { useState } from 'react';
import EnhanceAIModal from '../modals/EnhanceAIModal';
import { enhancePrompt } from '../../../lib/api';

export default function CreateVideoPanel({
  title = 'Create Video',
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
  veoModel,
  setVeoModel,
  veoAspectRatio,
  setVeoAspectRatio,
  aiEnhancement,
  setAiEnhancement,
  onGenerate,
}) {
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
  const [enhanceError, setEnhanceError] = useState('');

  const handleEnhanceGenerate = async (idea) => {
    setEnhanceError('');
    const result = await enhancePrompt({ idea, existing_prompt: prompt });
    if (result?.prompt) {
      setPrompt(result.prompt);
    } else {
      throw new Error('AI did not return a prompt');
    }
  };
  const veoModels = [
    { value: 'veo3-fast', label: 'veo3-fast', price: 0.25 },
    { value: 'veo3', label: 'veo3 (HQ)', price: 1.8 },
  ];
  const aspectRatios = ['16:9', '9:16', 'Auto'];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-4 pr-2">
        {/* Create Video Section */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>

          {/* Prompt Input */}
          {activeTab === 'text' ? (
            <div>
              <label className="block text-xs text-gray-400 mb-2">Describe your video</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                rows={4}
                placeholder="Enter your video description..."
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{prompt.length}/500</span>
                <button
                  onClick={() => setIsEnhanceModalOpen(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Enhance with AI
                </button>
              </div>
              {enhanceError && (
                <p className="mt-2 text-xs text-red-400">{enhanceError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                <svg className="w-10 h-10 mx-auto text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400 mb-2">Upload an image</p>
                <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  Choose File
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Describe your video</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  rows={4}
                  placeholder="Enter your video description..."
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{prompt.length}/500</span>
                  <button
                    onClick={() => setIsEnhanceModalOpen(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Enhance with AI
                  </button>
                </div>
                {enhanceError && (
                  <p className="mt-2 text-xs text-red-400">{enhanceError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Veo 3.1 Settings */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-3">Veo 3.1 Settings</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Model (credits)</label>
              <div className="flex gap-2">
                {veoModels.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setVeoModel?.(m.value)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      (veoModel || 'veo3-fast') === m.value
                        ? 'gradient-purple-blue text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {m.label}
                    <span className="block text-[10px] opacity-80 mt-0.5">{m.price} USDC</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                Note: Veo 3.1 API does not let you choose “seconds” directly—duration is determined by the model.
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Aspect Ratio</label>
              <select
                value={veoAspectRatio || '16:9'}
                onChange={(e) => setVeoAspectRatio?.(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                {aspectRatios.map((ar) => (
                  <option key={ar} value={ar}>{ar}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button - Fixed at bottom */}
      <div className="pt-4 mt-4 border-t border-gray-700/50">
        <button
          onClick={onGenerate}
          className="w-full gradient-purple-blue text-white py-4 rounded-xl font-bold text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Generate Video</span>
          </div>
        </button>
      </div>

      {/* Enhance AI Modal */}
      <EnhanceAIModal
        isOpen={isEnhanceModalOpen}
        onClose={() => setIsEnhanceModalOpen(false)}
        onGenerate={async (idea) => {
          try {
            await handleEnhanceGenerate(idea);
            setIsEnhanceModalOpen(false);
          } catch (e) {
            setEnhanceError(e.message || 'Failed to enhance prompt');
            throw e;
          }
        }}
      />
    </div>
  );
}

