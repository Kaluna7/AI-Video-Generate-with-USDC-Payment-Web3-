'use client';

import { useState, useRef, useEffect } from 'react';
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
  videoProvider,
  setVideoProvider,
  soraAspectRatio,
  setSoraAspectRatio,
  soraDuration,
  setSoraDuration,
  soraWatermark,
  setSoraWatermark,
  soraImageUrls,
  setSoraImageUrls,
  aiEnhancement,
  setAiEnhancement,
  onGenerate,
}) {
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
  const [enhanceError, setEnhanceError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const PROMPT_MAX_LEN = 1200;

  // Sync imagePreview with soraImageUrls if it's a data URL or valid image URL
  useEffect(() => {
    if (soraImageUrls && soraImageUrls.trim() && !uploadedFile) {
      // Check if it's a data URL or valid image URL
      if (soraImageUrls.startsWith('data:image/') || soraImageUrls.startsWith('http://') || soraImageUrls.startsWith('https://')) {
        setImagePreview(soraImageUrls);
      }
    } else if (!soraImageUrls && !uploadedFile) {
      // Clear preview if soraImageUrls is cleared
      setImagePreview(null);
    }
  }, [soraImageUrls, uploadedFile]);

  const handleEnhanceGenerate = async (idea) => {
    setEnhanceError('');
    const result = await enhancePrompt({ idea, existing_prompt: prompt });
    if (result?.prompt) {
      setPrompt(result.prompt);
    } else {
      throw new Error('AI did not return a prompt');
    }
  };
  const aspectRatios = ['16:9', '9:16', 'Auto'];
  const soraAspectRatios = ['landscape', 'portrait'];

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    setUploadedFile(file);
    // Create preview and update soraImageUrls with base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      // Update soraImageUrls with base64 data URL for image-to-video
      if (setSoraImageUrls) {
        setSoraImageUrls(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

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
                maxLength={PROMPT_MAX_LEN}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{prompt.length}/{PROMPT_MAX_LEN}</span>
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
              <div>
                <label className="block text-xs text-gray-400 mb-2">Upload Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div 
                  className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-900 max-h-48">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-auto max-h-48 object-contain mx-auto"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-xs text-gray-400">{uploadedFile?.name}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                            setImagePreview(null);
                            // Clear soraImageUrls when removing file
                            if (setSoraImageUrls) {
                              setSoraImageUrls('');
                            }
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg className="w-10 h-10 mx-auto text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-400 mb-2">Upload an image</p>
                      <button 
                        type="button"
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Choose File
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Supported formats: JPG, PNG, WebP (max 10MB)
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Describe your video</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  rows={4}
                  placeholder="Enter your video description..."
                  maxLength={PROMPT_MAX_LEN}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{prompt.length}/{PROMPT_MAX_LEN}</span>
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

        {/* Provider Settings */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-3">Provider Settings</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Provider</label>
              <select
                value={videoProvider || 'sora2'}
                onChange={(e) => setVideoProvider?.(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="sora2">PS.AI</option>
              </select>
              {activeTab === 'image' && (
                <p className="text-[11px] text-gray-400 mt-2">
                  ✓ Image-to-video generation is supported with selected provider
                </p>
              )}
              {activeTab === 'text' && (
                <p className="text-[11px] text-gray-500 mt-2">
                  Backend must be configured for the chosen provider (or accept per-request provider override).
                </p>
              )}
            </div>

            { (videoProvider || 'sora2') === 'sora2' ? (
              <>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Video Duration</label>
                  <div className="flex gap-2">
                    {[
                      { duration: 4, price: 50 },
                      { duration: 8, price: 90 },
                      { duration: 12, price: 110 }
                    ].map(({ duration, price }) => (
                      <button
                        key={duration}
                        onClick={() => setSoraDuration?.(duration)}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
                          (soraDuration || 4) === duration
                            ? 'gradient-purple-blue text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {duration}s
                        <span className="block text-[10px] opacity-80 mt-0.5">{price} coins</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">
                    Choose video duration: 4, 8, or 12 seconds
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Aspect Ratio</label>
                  <select
                    value={soraAspectRatio || 'landscape'}
                    onChange={(e) => setSoraAspectRatio?.(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {soraAspectRatios.map((ar) => (
                      <option key={ar} value={ar}>{ar}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
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

