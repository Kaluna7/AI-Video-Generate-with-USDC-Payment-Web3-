'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ImagePreviewPanel from '../panels/ImagePreviewPanel';
import { getImageJob } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { addImageHistoryItem, getImageHistory } from '../../../lib/imageHistory';

export default function TextToImagePage({ onGenerate, onNavigateToMyImages, initialPrompt = '' }) {
  const user = useAuthStore((state) => state.user);
  const walletAddress = useAuthStore((state) => state.walletAddress);
  // Local history is stored per "account". Prefer app user id, fall back to connected wallet, else anonymous.
  const historyUserId = user?.id || walletAddress || 'anonymous';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const [prompt, setPrompt] = useState(initialPrompt);

  // Update prompt when initialPrompt changes (e.g., when navigating from Inspiration page)
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);
  const [selectedModel, setSelectedModel] = useState('ai-image');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('waiting');
  const [imageJobId, setImageJobId] = useState(null);
  const [generationError, setGenerationError] = useState('');
  const [recentImages, setRecentImages] = useState([]);

  // Load recent images from localStorage per user
  useEffect(() => {
    const loadRecentImages = () => {
      try {
        const stored = getImageHistory(historyUserId);
        // Format for ImagePreviewPanel
        const formatted = stored.slice(0, 6).map((img) => ({
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

  const models = [
    {
      id: 'ai-image',
      name: 'AI Image Generator',
      description: 'Premium text to image with editing capabilities',
      tokens: 1,
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9'],
    },
    {
      id: 'ai-standard',
      name: 'AI Standard',
      description: 'Basic text to image generation',
      tokens: 2,
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16'],
    },
    {
      id: 'ai-enhanced',
      name: 'AI Enhanced',
      description: 'Enhanced text to image with better quality',
      tokens: 3,
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9'],
    },
    {
      id: 'ai-advanced',
      name: 'AI Advanced',
      description: 'Advanced text to image generation',
      tokens: 5,
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9'],
    },
    {
      id: 'ai-premium',
      name: 'AI Premium',
      description: 'High quality text to image generation',
      tokens: 6,
      aspectRatios: ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9'],
    },
  ];

  const selectedModelData = models.find(m => m.id === selectedModel);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    
    setIsGenerating(true);
    setProgress(0);
    setGenerationStatus('confirmed');
    setImageUrl(null);
    setGenerationError('');
    
    try {
      const result = await onGenerate?.({
        prompt,
        model: selectedModel,
        aspectRatio,
        type: 'text-to-image',
      });
      
      if (result?.jobId) {
        setImageJobId(result.jobId);
        setGenerationStatus('generating');
        // Progress will be updated by polling
      } else if (result?.imageUrl) {
        setImageUrl(result.imageUrl);
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
            setImageUrl(job.image_url);
            setGenerationStatus('ready');
            setProgress(100);
            setIsGenerating(false);
            clearInterval(interval);
            
            // Save to localStorage per user
            try {
              const imageData = {
                id: Date.now().toString(),
                url: job.image_url,
                prompt: prompt,
                type: 'text-to-image',
                createdAt: new Date().toISOString(),
                model: selectedModel,
                aspectRatio: aspectRatio,
              };
              
              // Save to per-user history
              addImageHistoryItem(historyUserId, imageData);
              
              // Update recent images state from current user's history
              const userHistory = getImageHistory(historyUserId);
              const formatted = userHistory.slice(0, 6).map((img) => ({
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
            // Status succeeded but no image URL - might still be processing
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
          // Update progress (simulate based on time)
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
    }, 2000); // Poll every 2 seconds

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [generationStatus, imageJobId]);

  // Showcase images data - Fill this array with your images
  // Each item should have: id, imageUrl (path to image), title, and description
  // Images will be displayed in a beautiful grid with hover effects
  const showcaseImages = [];

  return (
    <div className="space-y-8">
      {/* Showcase Section - Only show if images are provided */}
      {showcaseImages.length > 0 && (
        <div className="relative">
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              <span className="gradient-text">AI Image Generator</span>
              <span className="text-white"> — </span>
              <span className="gradient-text">Ready for Anything</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Transform your ideas into stunning visuals in seconds
            </p>
          </div>

          {/* Showcase Grid - Varied Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
          {showcaseImages.map((item, index) => {
            // Varied aspect ratios for visual interest
            const aspectRatios = [
              'aspect-[3/4]', // Standard portrait
              'aspect-[4/5]', // Slightly wider
              'aspect-[3/4]', // Standard portrait
              'aspect-[4/5]', // Slightly wider
              'aspect-[3/4]', // Standard portrait
            ];
            
            return (
              <div
                key={item.id}
                className={`group relative ${aspectRatios[index]} rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.05] hover:z-10 hover:shadow-2xl hover:shadow-purple-500/30`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Image Background with Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-blue-500/40 to-cyan-500/40 overflow-hidden">
                  {/* Actual Image - Use Next.js Image for optimization */}
                  {item.imageUrl && !item.imageUrl.includes('showcase-') ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </div>
                  ) : (
                    // Placeholder gradient when no image is provided
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 via-blue-600/50 to-cyan-600/50 opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                  )}
                  
                  {/* Pattern overlay for visual interest */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" 
                    style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '24px 24px',
                    }}
                  ></div>
                </div>

                {/* Hover Overlay with Title and Description */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-5">
                  <div className="transform translate-y-6 group-hover:translate-y-0 transition-all duration-500">
                    {/* Title */}
                    <h3 className="text-white font-bold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
                      {item.title}
                    </h3>
                    {/* Description */}
                    <p className="text-gray-300 text-xs md:text-sm line-clamp-3 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {item.description}
                    </p>
                    
                    {/* Action Indicator */}
                    <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                      <span className="text-purple-400 text-xs font-medium">Explore</span>
                      <svg className="w-4 h-4 text-purple-400 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Decorative Corner Accents */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-full"></div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                {/* Border Glow Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/50 transition-all duration-500"></div>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {/* Left Panel - Create Image */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="lg:py-4 lg:max-h-[calc(100vh-5rem)] lg:flex lg:flex-col lg:min-h-0">
            <div className="flex flex-col h-full min-h-0">
              {/* Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-4 pr-2 pb-4">
                {/* Prompt Input */}
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Create Image</h2>
                  <label className="block text-xs text-gray-400 mb-2">Describe your image</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    rows={4}
                    placeholder="Enter your image description..."
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{prompt.length}/1000</span>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                  <h3 className="text-sm font-semibold text-white mb-3">Model Settings</h3>
                  <label className="block text-xs text-gray-400 mb-2">Select Model</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    // Update aspect ratio to first available if current is not available
                    if (!model.aspectRatios.includes(aspectRatio)) {
                      setAspectRatio(model.aspectRatios[0]);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedModel === model.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm">{model.name}</h3>
                    {selectedModel === model.id && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{model.description}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-purple-400">{model.tokens}</span>
                    <span className="text-xs text-gray-500">token</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

                {/* Aspect Ratio */}
                {selectedModelData && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <label className="block text-xs text-gray-400 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {selectedModelData.aspectRatios.map((ratio) => (
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
                  disabled={!prompt.trim() || isGenerating}
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
                      <span>Generate Image ({selectedModelData?.tokens || 2} tokens)</span>
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
              imageUrl={imageUrl}
              errorMessage={generationError}
              progress={progress}
              recentGenerations={recentImages}
              onSeeAllRecent={onNavigateToMyImages}
              aspectRatio={aspectRatio}
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
            Join 10,000+ creators turning prompts into polished images—and sharing their results.
          </p>
        </div>

        <div className="space-y-4">
          <div className="ps-marquee" style={{ '--ps-marquee-duration': '28s' }}>
            <div className="ps-marquee__track">
              <div className="flex items-stretch gap-4">
                {[
                  'Generate stunning images from text',
                  'Multiple AI models available',
                  'High-quality results in seconds',
                  'Various aspect ratios supported',
                  'Professional-grade output',
                  'Easy to use interface',
                ].map((text, idx) => (
                  <div key={`t1-${idx}`} className="px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm whitespace-nowrap">
                    <span className="text-white font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-stretch gap-4" aria-hidden="true">
                {[
                  'Generate stunning images from text',
                  'Multiple AI models available',
                  'High-quality results in seconds',
                  'Various aspect ratios supported',
                  'Professional-grade output',
                  'Easy to use interface',
                ].map((text, idx) => (
                  <div key={`t1dup-${idx}`} className="px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm whitespace-nowrap">
                    <span className="text-white font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ps-marquee" style={{ '--ps-marquee-duration': '32s', '--ps-marquee-direction': 'reverse' }}>
            <div className="ps-marquee__track">
              <div className="flex items-stretch gap-4">
                {[
                  'AI-powered text to image',
                  'Fast generation times',
                  'Multiple style options',
                  'HD quality images',
                  'Creative freedom',
                  'Instant results',
                ].map((text, idx) => (
                  <div key={`t2-${idx}`} className="px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm whitespace-nowrap">
                    <span className="text-white font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-stretch gap-4" aria-hidden="true">
                {[
                  'AI-powered text to image',
                  'Fast generation times',
                  'Multiple style options',
                  'HD quality images',
                  'Creative freedom',
                  'Instant results',
                ].map((text, idx) => (
                  <div key={`t2dup-${idx}`} className="px-6 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm whitespace-nowrap">
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
            <span className="text-sm font-semibold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
              GET STARTED
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Create stunning images in just a few simple steps. Our AI-powered platform makes image generation effortless.
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Write Your Prompt',
                description: 'Describe the image you want to create in detail. Be specific about style, colors, and composition for best results.',
              },
              {
                step: '2',
                title: 'Choose Model & Settings',
                description: 'Select the AI model that best fits your needs and choose the aspect ratio for your image.',
              },
              {
                step: '3',
                title: 'Generate & Download',
                description: 'Click generate and wait for your AI image. Download it instantly when ready (costs 5 coins).',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative group bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-purple-blue flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{item.title}</h3>
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
                title: 'Multiple Models',
                description: 'Choose from various AI models optimized for different styles and quality levels',
              },
              {
                title: 'Fast Generation',
                description: 'Get your images in seconds with our optimized AI processing pipeline',
              },
              {
                title: 'High Quality',
                description: 'Generate stunning, high-resolution images with professional-grade AI technology',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
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
            <span className="text-sm font-semibold text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
              COMMON QUESTIONS
            </span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Know
          </h3>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Find answers to frequently asked questions about Text to Image generation
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {[
            {
              question: 'How does Text to Image AI work?',
              answer: 'Our AI analyzes your text description and generates a unique image that matches your prompt. Simply describe what you want to see, select a model and aspect ratio, and our AI will create a high-quality image for you.',
            },
            {
              question: 'What makes a good prompt?',
              answer: 'A good prompt is specific and descriptive. Include details about style (realistic, cartoon, abstract), colors, composition, mood, and subject matter. The more details you provide, the better the AI can understand and create your vision.',
            },
            {
              question: 'How long does it take to generate an image?',
              answer: 'Generation time varies by model, typically ranging from 30 seconds to 3 minutes. Premium models may take longer but produce higher quality results. You can track progress in real-time.',
            },
            {
              question: 'Can I edit or modify generated images?',
              answer: 'Yes! Our AI Image Generator supports editing capabilities. You can regenerate with modified prompts or use the generated image as a base for further creative work.',
            },
            {
              question: 'What aspect ratios are available?',
              answer: 'We support multiple aspect ratios including 1:1 (square), 16:9 (landscape), 9:16 (portrait), 4:3, 3:4, 21:9, and more. Choose the ratio that best fits your project needs.',
            },
            {
              question: 'How many tokens does each generation cost?',
              answer: 'Token costs vary by model. Basic models start at 1-2 tokens, while premium high-quality models cost 5-6 tokens. Check the model selection to see exact costs before generating.',
            },
            {
              question: 'Can I use generated images commercially?',
              answer: 'Yes, you own the rights to images you generate. You can use them for personal projects, commercial work, social media, marketing materials, and more without restrictions.',
            },
            {
              question: 'What image formats are supported?',
              answer: 'Generated images are provided in high-quality formats suitable for web and print use. You can download and use them in any standard image editing software or directly in your projects.',
            },
          ].map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {/* CTA Section - Full Width Image with Overlay */}
      <div className="mt-20 mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border-2 border-orange-500/20">
            {/* Full Width Image */}
            <div className="relative w-full aspect-[16/9] min-h-[500px]">
              <Image
                src="/assets/images/ai.png"
                alt="AI Image Generation"
                fill
                className="object-cover"
                sizes="100vw"
              />
              {/* Dark Overlay for Text Readability */}
              <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/80"></div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full px-6 md:px-12 lg:px-16 py-12 md:py-16 lg:py-20">
                  <div className="max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="mb-6">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full text-sm font-semibold text-orange-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        START CREATING
                      </span>
                    </div>

                    {/* Header */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                      <span className="bg-linear-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                        Ready to Create?
                      </span>
                      <br />
                      <span className="text-white">Turn Words into Visuals</span>
                    </h2>
                    
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed mb-4 max-w-3xl">
                      Transform your ideas into stunning images with our powerful AI. 
                      No design skills needed—just describe what you envision.
                    </p>
                    <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl">
                      Join thousands of creators using AI to bring their imagination to life. 
                      Start generating your first image now.
                    </p>

                    {/* CTA Button */}
                    <div className="mb-10">
                      <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group inline-flex items-center gap-3 px-8 py-5 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 text-white rounded-xl font-bold text-lg md:text-xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] relative overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                        <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="relative z-10">Generate Image Now</span>
                        <svg className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Features - Horizontal Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <p className="text-white font-semibold text-sm text-center">Lightning Fast</p>
                        <p className="text-gray-300 text-xs text-center">Quick results</p>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <p className="text-white font-semibold text-sm text-center">HD Quality</p>
                        <p className="text-gray-300 text-xs text-center">High resolution</p>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <p className="text-white font-semibold text-sm text-center">Multiple Models</p>
                        <p className="text-gray-300 text-xs text-center">Various styles</p>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-white font-semibold text-sm text-center">24/7 Available</p>
                        <p className="text-gray-300 text-xs text-center">Always ready</p>
                      </div>
                    </div>
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
    <div className="bg-linear-to-r from-[#06080c]/90 to-[#0a0d12]/90 rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left group"
      >
        <h4 className="text-lg md:text-xl font-semibold text-white group-hover:text-purple-300 transition-colors pr-6 flex-1">
          {question}
        </h4>
        <svg
          className={`w-6 h-6 md:w-7 md:h-7 text-gray-400 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
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

