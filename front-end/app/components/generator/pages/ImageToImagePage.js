'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ImagePreviewPanel from '../panels/ImagePreviewPanel';
import { getImageJob } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { addImageHistoryItem, getImageHistory } from '../../../lib/imageHistory';

export default function ImageToImagePage({ onGenerate, onNavigateToMyImages }) {
  const user = useAuthStore((state) => state.user);
  const walletAddress = useAuthStore((state) => state.walletAddress);
  // Local history is stored per "account". Prefer app user id, fall back to connected wallet, else anonymous.
  const historyUserId = user?.id || walletAddress || 'anonymous';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [prompt, setPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedFile2, setUploadedFile2] = useState(null);
  const [imagePreview2, setImagePreview2] = useState(null);
  const fileInputRef = useRef(null);
  const fileInputRef2 = useRef(null);
  const [selectedMode, setSelectedMode] = useState('entire-image');
  const [selectedModel, setSelectedModel] = useState('ai-model');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('waiting');
  const [imageJobId, setImageJobId] = useState(null);
  const [generationError, setGenerationError] = useState('');
  const [recentImages, setRecentImages] = useState([]);

  // Load recent images from localStorage per user
  useEffect(() => {
    const loadRecentImages = () => {
      try {
        const stored = getImageHistory(historyUserId);
        // Filter for image-to-image type
        const i2iImages = stored.filter(img => img.type === 'image-to-image');
        const formatted = i2iImages.slice(0, 6).map((img) => ({
          id: img.id,
          imageUrl: img.url,
          title: img.prompt?.slice(0, 30) || 'Generated Image',
          time: new Date(img.createdAt).toLocaleDateString(),
        }));
        setRecentImages(formatted);
      } catch (error) {
        console.error('Error loading recent images:', error);
        setRecentImages([]);
      }
    };

    loadRecentImages();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadRecentImages();
    };
    
    // Listen for custom event (same-tab updates)
    const handleImageHistoryUpdated = () => {
      loadRecentImages();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('primeStudio:imageHistoryUpdated', handleImageHistoryUpdated);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('primeStudio:imageHistoryUpdated', handleImageHistoryUpdated);
      }
    };
  }, [historyUserId]);

  const modes = [
    {
      id: 'entire-image',
      name: 'Entire Image',
      description: 'Transform the entire input image',
      models: ['ai-standard'],
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16'],
      tokens: 2,
    },
    {
      id: 'subject',
      name: 'Subject',
      description: 'Focus on the subject of the image',
      models: ['ai-enhanced'],
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9'],
      tokens: 3,
    },
    {
      id: 'face',
      name: 'Face',
      description: 'Transform faces in the image',
      models: ['ai-enhanced'],
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9'],
      tokens: 3,
    },
    {
      id: 'restyle',
      name: 'Restyle',
      description: 'Apply new style to the image',
      models: ['ai-advanced'],
      aspectRatios: ['auto'],
      tokens: 5,
    },
    {
      id: 'multi-image',
      name: 'Multi-Image',
      description: 'Combine multiple images',
      models: ['ai-advanced'],
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9'],
      tokens: 5,
    },
    {
      id: 'image-editing',
      name: 'Image Editing',
      description: 'Edit and enhance images',
      models: ['ai-editing'],
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9'],
      tokens: 1,
    },
  ];

  const selectedModeData = modes.find(m => m.id === selectedMode);
  const availableModels = selectedModeData?.models || [];
  const currentModel = availableModels.includes(selectedModel) ? selectedModel : availableModels[0];

  // Handle file upload
  const handleFileUpload = (e, isSecond = false) => {
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

    if (isSecond) {
      setUploadedFile2(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setImagePreview2(dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get the actual image URL to use (uploaded file as base64)
  const getImageUrlForGeneration = () => {
    if (uploadedFile && imagePreview) {
      // Use base64 data URL for uploaded files
      return imagePreview;
    }
    return '';
  };

  // Get second image URL for multi-image mode
  const getSecondImageUrlForGeneration = () => {
    if (uploadedFile2 && imagePreview2) {
      return imagePreview2;
    }
    return '';
  };

  const handleGenerate = async () => {
    const finalImageUrl = getImageUrlForGeneration();
    if (!finalImageUrl) {
      alert('Please upload an image');
      return;
    }
    
    // For multi-image mode, check if second image is provided
    if (selectedMode === 'multi-image') {
      const secondImageUrl = getSecondImageUrlForGeneration();
      if (!secondImageUrl) {
        alert('Please upload a second image for multi-image mode');
        return;
      }
    }
    
    if (!prompt.trim() && selectedMode !== 'restyle') {
      alert('Please enter a prompt');
      return;
    }
    
    setIsGenerating(true);
    setProgress(0);
    setGenerationStatus('confirmed');
    setGeneratedImageUrl(null);
    setGenerationError('');
    
    try {
      const result = await onGenerate?.({
        prompt: selectedMode === 'restyle' ? '' : prompt,
        imageUrl: finalImageUrl,
        imageUrl2: selectedMode === 'multi-image' ? getSecondImageUrlForGeneration() : undefined,
        mode: selectedMode,
        model: currentModel,
        aspectRatio,
        type: 'image-to-image',
      });
      
      if (result?.jobId) {
        setImageJobId(result.jobId);
        setGenerationStatus('generating');
      } else if (result?.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        setProgress(100);
        setGenerationStatus('ready');
        setIsGenerating(false);
      } else {
        throw new Error('No job ID or image URL returned');
      }
    } catch (error) {
      setIsGenerating(false);
      setProgress(0);
      setGenerationStatus('waiting');
      setGenerationError(error.message || 'Generation failed');
      alert(error.message || 'Failed to generate image');
    }
  };

  // Poll image job status
  useEffect(() => {
    if (generationStatus !== 'generating' || !imageJobId) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const job = await getImageJob(imageJobId);
        if (cancelled) return;
        
        if (job.status === 'succeeded' || job.status === 'succeed') {
          if (job.image_url) {
            setGeneratedImageUrl(job.image_url);
            setGenerationStatus('ready');
            setProgress(100);
            setIsGenerating(false);
            clearInterval(interval);
            
            // Save to localStorage per user
            try {
              const imageData = {
                id: Date.now().toString(),
                url: job.image_url,
                prompt: prompt || 'Restyle transformation',
                type: 'image-to-image',
                createdAt: new Date().toISOString(),
                model: currentModel,
                mode: selectedMode,
                aspectRatio: aspectRatio,
              };
              
              // Save to per-user history
              addImageHistoryItem(historyUserId, imageData);
              
              // Update recent images state from current user's history
              const userHistory = getImageHistory(historyUserId);
              const i2iImages = userHistory.filter(img => img.type === 'image-to-image');
              const formatted = i2iImages.slice(0, 6).map((img) => ({
                id: img.id,
                imageUrl: img.url,
                title: img.prompt?.slice(0, 30) || 'Generated Image',
                time: new Date(img.createdAt).toLocaleDateString(),
              }));
              setRecentImages(formatted);
            } catch (error) {
              console.error('Error saving image to localStorage:', error);
            }
          } else {
            setProgress((prev) => Math.min(prev + 2, 95));
          }
        } else if (job.status === 'failed') {
          const errorMsg = job.error || 'Generation failed';
          setGenerationError(errorMsg);
          setGenerationStatus('waiting');
          setIsGenerating(false);
          clearInterval(interval);
          alert(errorMsg);
        } else if (job.status === 'processing') {
          setProgress((prev) => Math.min(prev + 5, 90));
        }
      } catch (error) {
        if (!cancelled) {
          setGenerationError(error.message || 'Failed to check job status');
          setGenerationStatus('waiting');
          setIsGenerating(false);
          clearInterval(interval);
        }
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [generationStatus, imageJobId, prompt, currentModel, selectedMode, aspectRatio]);

  return (
    <div className="space-y-8">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {/* Left Panel - Create Image */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="lg:py-4 lg:max-h-[calc(100vh-5rem)] lg:flex lg:flex-col lg:min-h-0">
            <div className="flex flex-col h-full min-h-0">
              {/* Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-4 pr-2 pb-4">
                {/* Image Input */}
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Input Image</h2>
                  
                  {/* File Upload */}
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-2">Upload from Device</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="flex-1 text-left">{uploadedFile ? uploadedFile.name : 'Choose Image File'}</span>
                      {uploadedFile && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                            setImagePreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="ml-auto text-red-400 hover:text-red-300 cursor-pointer p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Preview */}
                  {imagePreview && (
                    <div className="mt-4">
                      <label className="block text-xs text-gray-400 mb-2">Image Preview</label>
                      <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-auto max-h-96 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Second Image Upload for Multi-Image Mode */}
                  {selectedMode === 'multi-image' && (
                    <div className="mt-4">
                      <label className="block text-xs text-gray-400 mb-2">Second Image (Required)</label>
                      <input
                        ref={fileInputRef2}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        onClick={() => fileInputRef2.current?.click()}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="flex-1 text-left">{uploadedFile2 ? uploadedFile2.name : 'Choose Second Image'}</span>
                        {uploadedFile2 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFile2(null);
                              setImagePreview2(null);
                              if (fileInputRef2.current) {
                                fileInputRef2.current.value = '';
                              }
                            }}
                            className="ml-auto text-red-400 hover:text-red-300 cursor-pointer p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Second Image Preview */}
                      {imagePreview2 && (
                        <div className="mt-4">
                          <label className="block text-xs text-gray-400 mb-2">Second Image Preview</label>
                          <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                            <img
                              src={imagePreview2}
                              alt="Second Preview"
                              className="w-full h-auto max-h-96 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Prompt Input (if needed) */}
                {selectedMode !== 'restyle' && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Transformation</h2>
                    <label className="block text-xs text-gray-400 mb-2">Describe your transformation</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                      rows={4}
                      placeholder="Describe how you want to transform the image..."
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{prompt.length}/1000</span>
                    </div>
                  </div>
                )}

                {/* Mode Selection */}
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-sm font-semibold text-white mb-3">Transformation Mode</h3>
                  <label className="block text-xs text-gray-400 mb-2">Select Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {modes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setSelectedMode(mode.id);
                          const firstModel = mode.models[0];
                          setSelectedModel(firstModel);
                          setAspectRatio(mode.aspectRatios[0]);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedMode === mode.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white text-sm">{mode.name}</h3>
                          {selectedMode === mode.id && (
                            <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{mode.description}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-purple-400">{mode.tokens}</span>
                          <span className="text-xs text-gray-500">token</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Selection (if multiple available) */}
                {availableModels.length > 1 && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <label className="block text-xs text-gray-400 mb-2">Select Model</label>
                    <div className="flex flex-wrap gap-2">
                      {availableModels.map((modelId) => (
                        <button
                          key={modelId}
                          onClick={() => setSelectedModel(modelId)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentModel === modelId
                              ? 'gradient-purple-blue text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {modelId === 'ai-standard' ? 'AI Standard' :
                           modelId === 'ai-enhanced' ? 'AI Enhanced' :
                           modelId === 'ai-advanced' ? 'AI Advanced' :
                           modelId === 'ai-editing' ? 'AI Editing' : modelId}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aspect Ratio */}
                {selectedModeData && selectedModeData.aspectRatios[0] !== 'auto' && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <label className="block text-xs text-gray-400 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                      {selectedModeData.aspectRatios.map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            aspectRatio === ratio
                              ? 'gradient-purple-blue text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              
              {/* Generate Button - Sticky at bottom */}
              <div className="pt-4 border-t border-gray-700/50 mt-auto">
                <button
                  onClick={handleGenerate}
                  disabled={
                    !getImageUrlForGeneration() || 
                    (selectedMode === 'multi-image' && !getSecondImageUrlForGeneration()) ||
                    (!prompt.trim() && selectedMode !== 'restyle') || 
                    isGenerating
                  }
                  className="w-full px-6 py-4 gradient-purple-blue text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Transform Image ({selectedModeData?.tokens || 2} tokens)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Image Preview */}
        <div className="lg:col-span-2">
          <div className="custom-scrollbar-right">
            <ImagePreviewPanel
              generationStatus={generationStatus}
              imageUrl={generatedImageUrl}
              errorMessage={generationError}
              progress={progress}
              recentGenerations={recentImages}
              onSeeAllRecent={onNavigateToMyImages}
              aspectRatio={aspectRatio === 'auto' ? '1:1' : aspectRatio}
            />
          </div>
        </div>
      </div>

      {/* Auto Scrolling Reviews */}
      <div className="mt-16 mb-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
            <span className="gradient-text">Loved by creators who ship fast</span>
          </h3>
          <p className="text-gray-400">
            Join 10,000+ creators transforming images with AI—and sharing their results.
          </p>
        </div>

        <div className="space-y-4">
          <div className="ps-marquee" style={{ '--ps-marquee-duration': '30s' }}>
            <div className="ps-marquee__track">
              <div className="flex items-stretch gap-4">
                {[
                  'Transform entire images effortlessly',
                  'Edit faces with precision',
                  'Apply artistic styles instantly',
                  'Combine multiple images seamlessly',
                  'Enhance image quality automatically',
                  'Restyle with one click',
                ].map((text, idx) => (
                  <div key={`m1-${idx}`} className="px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm whitespace-nowrap">
                    <span className="text-white font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-stretch gap-4" aria-hidden="true">
                {[
                  'Transform entire images effortlessly',
                  'Edit faces with precision',
                  'Apply artistic styles instantly',
                  'Combine multiple images seamlessly',
                  'Enhance image quality automatically',
                  'Restyle with one click',
                ].map((text, idx) => (
                  <div key={`m1dup-${idx}`} className="px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm whitespace-nowrap">
                    <span className="text-white font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ps-marquee" style={{ '--ps-marquee-duration': '35s', '--ps-marquee-direction': 'reverse' }}>
            <div className="ps-marquee__track">
              <div className="flex items-stretch gap-4">
                {[
                  'AI-powered image transformation',
                  'Multiple editing modes available',
                  'High-quality results guaranteed',
                  'Fast processing times',
                  'Professional-grade output',
                  'Easy to use interface',
                ].map((text, idx) => (
                  <div key={`m2-${idx}`} className="px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm whitespace-nowrap">
                    <span className="text-white font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-stretch gap-4" aria-hidden="true">
                {[
                  'AI-powered image transformation',
                  'Multiple editing modes available',
                  'High-quality results guaranteed',
                  'Fast processing times',
                  'Professional-grade output',
                  'Easy to use interface',
                ].map((text, idx) => (
                  <div key={`m2dup-${idx}`} className="px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm whitespace-nowrap">
                    <span className="text-white font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - New Design */}
      <div className="relative mt-16 pt-12">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
              GET STARTED
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Transform your images with AI-powered editing. Our advanced technology makes image transformation effortless.
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Upload Your Image',
                description: 'Provide a publicly accessible image URL. Make sure the image is high quality for best results.',
              },
              {
                step: '2',
                title: 'Choose Mode & Settings',
                description: 'Select transformation mode (entire image, subject, face, restyle, etc.) and configure settings.',
              },
              {
                step: '3',
                title: 'Transform & Download',
                description: 'Describe your transformation and let AI work its magic. Download your enhanced image when ready.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative group bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section - New Design */}
      <div className="mt-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            <span className="gradient-text">Why Choose Us</span>
          </h2>
          <p className="text-gray-400">Powerful features to enhance your creative workflow</p>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Multiple Modes',
                description: 'Transform entire images, focus on subjects, edit faces, or apply new styles',
              },
              {
                title: 'AI Powered',
                description: 'Advanced AI technology understands your intent and delivers stunning transformations',
              },
              {
                title: 'Preserve Quality',
                description: 'Maintain high resolution and quality while applying transformations',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 mb-16">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
              COMMON QUESTIONS
            </span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Know
          </h3>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Find answers to frequently asked questions about Image to Image transformation
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {[
            {
              question: 'How does Image to Image AI work?',
              answer: 'Our AI analyzes your input image and applies transformations based on your prompt or selected mode. You can transform entire images, focus on specific subjects, edit faces, apply new styles, or combine multiple images.',
            },
            {
              question: 'What image formats are supported?',
              answer: 'We support common image formats including JPG, PNG, and WebP. Images should be under 10MB for optimal processing. Higher resolution images generally produce better results.',
            },
            {
              question: 'What are the different transformation modes?',
              answer: 'We offer 6 modes: Entire Image (transform the whole image), Subject (focus on main subject), Face (transform faces), Restyle (apply new artistic style), Multi-Image (combine multiple images), and Image Editing (enhance and edit images).',
            },
            {
              question: 'Do I need to provide a prompt for all modes?',
              answer: 'Most modes require a prompt describing your desired transformation. However, Restyle mode works without a prompt—it automatically applies a new artistic style to your image.',
            },
            {
              question: 'Can I combine multiple images?',
              answer: 'Yes! Use the Multi-Image mode to combine two images. Upload both images and describe how you want them combined. The AI will intelligently merge them based on your instructions.',
            },
            {
              question: 'How long does transformation take?',
              answer: 'Transformation time varies by mode and model, typically ranging from 1-5 minutes. More complex transformations may take longer. You can track progress in real-time.',
            },
            {
              question: 'Will the original image quality be preserved?',
              answer: 'Yes, our AI maintains high resolution and quality while applying transformations. The output image will match or exceed the quality of your input image.',
            },
            {
              question: 'What happens if I don\'t like the result?',
              answer: 'You can regenerate with different settings, adjust your prompt, or try a different mode. Each generation uses tokens from your balance, so experiment freely to find the perfect transformation.',
            },
          ].map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {/* CTA Section - Card Design */}
      <div className="mt-20 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src="/assets/images/plane.png"
                alt="AI Image Transformation"
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/85 via-black/75 to-black/85"></div>
            </div>

            {/* Content Card Overlay */}
            <div className="relative p-8 md:p-12 lg:p-16">
              <div className="max-w-3xl mx-auto text-center">
                {/* Badge */}
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full text-sm font-semibold text-blue-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    START TRANSFORMING
                  </span>
                </div>

                {/* Header */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Ready to Transform?
                  </span>
                  <br />
                  <span className="text-white">Turn Images into Masterpieces</span>
                </h2>
                
                <p className="text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed mb-4">
                  Transform your images with AI-powered editing. No complex software needed—just upload, describe, and watch the magic happen.
                </p>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-10">
                  Join thousands of creators using AI to enhance, transform, and reimagine their images. 
                  Start your transformation journey now.
                </p>

                {/* CTA Button */}
                <div className="mb-12">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="group inline-flex items-center gap-3 px-10 py-5 bg-linear-to-r from-blue-500 via-cyan-500 to-purple-500 text-white rounded-xl font-bold text-lg md:text-xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                    <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="relative z-10">Transform Image Now</span>
                    <svg className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                {/* Features - Circular Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm text-center">6 Modes</p>
                    <p className="text-gray-300 text-xs text-center">Versatile options</p>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm text-center">HD Quality</p>
                    <p className="text-gray-300 text-xs text-center">High resolution</p>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm text-center">Fast Process</p>
                    <p className="text-gray-300 text-xs text-center">Quick results</p>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm text-center">Secure</p>
                    <p className="text-gray-300 text-xs text-center">Safe & private</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-linear-to-r from-[#06080c]/90 to-[#0a0d12]/90 rounded-xl border border-blue-500/20 overflow-hidden hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left group"
      >
        <h4 className="text-lg md:text-xl font-semibold text-white group-hover:text-blue-300 transition-colors pr-6 flex-1">
          {question}
        </h4>
        <svg
          className={`w-6 h-6 md:w-7 md:h-7 text-gray-400 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5">
          <p className="text-base md:text-lg text-gray-300 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

