'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '../components/generator/layout/AppHeader';
import SidebarNav from '../components/generator/layout/SidebarNav';
import HomePage from '../components/generator/pages/HomePage';
import InspirationPage from '../components/generator/pages/InspirationPage';
import MyVideosPage from '../components/generator/pages/MyVideosPage';
import MyImagesPage from '../components/generator/pages/MyImagesPage';
import TextToImagePage from '../components/generator/pages/TextToImagePage';
import ImageToImagePage from '../components/generator/pages/ImageToImagePage';
import CreateVideoPanel from '../components/generator/panels/CreateVideoPanel';
import VideoPreviewPanel from '../components/generator/panels/VideoPreviewPanel';
import TextToVideoSection from '../components/generator/sections/TextToVideoSection';
import ImageToVideoSection from '../components/generator/sections/ImageToVideoSection';
import GenerateConfirmModal from '../components/generator/modals/GenerateConfirmModal';
import { useAuthStore } from '../store/authStore';
import { createTextToVideoJob, getCoinBalance, getVideoJob, createTextToImageJob, getImageJob, addTokenToVideoUrl, getApiBaseUrl } from '../lib/api';
import { addVideoHistoryItem, formatRelativeTime, getVideoHistory, cleanupExpiredVideos } from '../lib/videoHistory';

function GeneratorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, coinBalance, setUser, setCoinBalance, openTopUpModal } = useAuthStore();
  const walletAddress = useAuthStore((state) => state.walletAddress);
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'text-to-video', 'image-to-video'
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic');
  // Provider selection (UI-driven; backend can still default via VIDEO_PROVIDER)
  const [videoProvider, setVideoProvider] = useState('sora2'); // sora2 | ai

  // Sora2API params (api.sora2api.ai)
  const [soraAspectRatio, setSoraAspectRatio] = useState('landscape'); // landscape | portrait
  const [soraDuration, setSoraDuration] = useState(4); // 4, 8, or 12 seconds
  const [soraWatermark, setSoraWatermark] = useState('');
  const [soraImageUrls, setSoraImageUrls] = useState(''); // newline-separated URLs


  // Legacy UI state (kept so existing components don't break if referenced elsewhere)
  const [selectedLength, setSelectedLength] = useState('10s');
  const [resolution, setResolution] = useState('1080p');
  const [frameRate, setFrameRate] = useState('30 FPS');
  const [aiEnhancement, setAiEnhancement] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('waiting'); // waiting, confirmed, generating, ready
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [videoJobId, setVideoJobId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [generationError, setGenerationError] = useState('');
  const [historyTick, setHistoryTick] = useState(0);

  // Keep latest values for polling callbacks without adding extra effect deps (eslint rule)
  const promptRef = useRef(prompt);
  const activeTabRef = useRef(activeTab);
  const currentViewRef = useRef(currentView);
  useEffect(() => {
    promptRef.current = prompt;
    activeTabRef.current = activeTab;
    currentViewRef.current = currentView;
  }, [prompt, activeTab, currentView]);

  // Read URL params and set current view
  useEffect(() => {
    const view = searchParams.get('view') || 'home';
    setCurrentView(view);
  }, [searchParams]);

  // Mark as mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user info if not available but token exists
  useEffect(() => {
    if (!mounted) return; // Wait for client-side mount
    
    const fetchUser = async () => {
      if (!user) {
        const token = typeof window !== 'undefined' 
          ? (document.cookie.match(/access_token=([^;]+)/)?.[1] || localStorage.getItem('access_token'))
          : null;
        
        if (token) {
          try {
            const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const userData = await res.json();
              setUser(userData);
              // Fetch latest coin balance from backend
              try {
                const balanceData = await getCoinBalance();
                setCoinBalance(balanceData.coins);
              } catch (e) {
                console.error('Failed to fetch coin balance:', e);
              }
            } else {
              // Token invalid, redirect to home
              router.push('/');
            }
          } catch (e) {
            console.error('Failed to fetch user:', e);
            router.push('/');
          }
        } else {
          // No token, redirect to home
          router.push('/');
        }
      }
    };
    
    fetchUser();
  }, [mounted, user, router, setUser]);

  // Scroll to top and reset video generation state when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset video generation state when switching between different video/image views
    // This prevents state from Text to Video appearing in Image to Video and vice versa
    if (currentView === 'text-to-video' || currentView === 'image-to-video' || 
        currentView === 'text-to-image' || currentView === 'image-to-image') {
      setGenerationStatus('waiting');
      setVideoUrl(null);
      setVideoJobId(null);
      setGenerationError('');
      setPrompt(''); // Also reset prompt to avoid confusion
    }
  }, [currentView]);

  // Local history is stored per "account". Prefer app user id, fall back to connected wallet, else anonymous.
  const historyUserId = user?.id || walletAddress || 'anonymous';

  // Cleanup expired videos on mount
  useEffect(() => {
    cleanupExpiredVideos(historyUserId);
  }, [historyUserId]);

  const recentGenerations =
    getVideoHistory(historyUserId)
      .map((v) => ({ ...v, time: formatRelativeTime(v.createdAt) }));

  // Keep UI coin balance in sync with backend (authoritative)
  useEffect(() => {
    (async () => {
      try {
        const bal = await getCoinBalance();
        if (bal && typeof bal.coins === 'number') setCoinBalance(bal.coins);
      } catch {
        // ignore (backend might be down during dev)
      }
    })();
  }, [setCoinBalance]);

  // Calculate generation cost
  const calculateCost = () => {
    // Coins pricing based on duration: 4s=50, 8s=90, 12s=110
    const duration = soraDuration || 4;
    if (duration === 4) return 50;
    if (duration === 8) return 90;
    if (duration === 12) return 110;
    return 50; // fallback
  };

  const handleGenerateClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmGeneration = () => {
    const cost = calculateCost();
    (async () => {
      try {
        setIsConfirmModalOpen(false);
        // Re-check balance from backend right before spending (localStorage can be stale)
        let latestCoins = Number(coinBalance || 0);
        try {
          const bal = await getCoinBalance();
          if (bal && typeof bal.coins === 'number') {
            latestCoins = Number(bal.coins || 0);
            setCoinBalance(bal.coins);
          }
        } catch {
          // ignore
        }

        if (latestCoins < cost) {
          setGenerationStatus('waiting');
          setGenerationError(`Insufficient coins: you have ${Math.floor(latestCoins)} but need ${Math.floor(cost)}.`);
          openTopUpModal?.();
          return;
        }

        // Start backend generation job (Text tab -> text-to-video)
        setGenerationError('');
        setVideoUrl(null);
        setVideoJobId(null);

        setGenerationStatus('generating');

        let job;
        
        // Helper function to process image URLs
        const processImageUrls = (imageUrlsString) => {
          if (!imageUrlsString || !imageUrlsString.trim()) return null;
          
          // Check if it's a base64 data URL (starts with data:image/)
          if (imageUrlsString.trim().startsWith('data:image/')) {
            // Return as single-element array for base64 data URL
            return [imageUrlsString.trim()];
          }
          
          // Otherwise, treat as newline-separated URLs
          const urls = imageUrlsString
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
          
          return urls.length > 0 ? urls : null;
        };
        
        if (videoProvider === 'sora2') {
          // Sora2 supports image-to-video via image_urls parameter
          const imageUrls = activeTab === 'image' ? processImageUrls(soraImageUrls) : null;
          
          // Validate that image is provided for image-to-video
          if (activeTab === 'image' && !imageUrls) {
            setGenerationError('Please upload an image for image-to-video generation.');
            setGenerationStatus('waiting');
            return;
          }
          
          job = await createTextToVideoJob({
            prompt,
            provider: 'sora2',
            aspect_ratio: soraAspectRatio,
            duration_seconds: soraDuration,
            watermark: soraWatermark || null,
            image_urls: imageUrls,
          });
        } else {
          // Fallback provider
          if (activeTab === 'image' && soraImageUrls) {
            setGenerationError('Please select a valid provider for generation.');
            setGenerationStatus('waiting');
            return;
          }
          
          job = await createTextToVideoJob({
            prompt,
            provider: 'sora2',
            aspect_ratio: soraAspectRatio || 'landscape',
          });
        }
        setVideoJobId(job.job_id);
        // Refresh coin balance from backend (authoritative)
        try {
          const bal = await getCoinBalance();
          if (bal && typeof bal.coins === 'number') setCoinBalance(bal.coins);
        } catch {
          // ignore
        }
        if (job.status === 'succeeded' && job.video_url) {
          // Store original video URL (without token) for history
          const originalVideoUrl = job.video_url;
          // Add token to video URL for authentication when displaying
          const videoUrlWithToken = addTokenToVideoUrl(originalVideoUrl);
          setVideoUrl(videoUrlWithToken);
          setGenerationStatus('ready');

          const title =
            prompt.split(/[.\n]/)[0]?.trim().slice(0, 32) ||
            (currentView === 'image-to-video' ? 'Image to Video' : 'Text to Video');
          
          // Save video to history with original URL (token will be added when displaying)
          try {
            // Get current historyUserId (may have changed if user logged in/out)
            const currentHistoryUserId = user?.id || walletAddress || 'anonymous';
            console.log('Saving video to history (immediate):', { 
              jobId: job.job_id, 
              title, 
              type: activeTab === 'image' ? 'image' : 'text',
              historyUserId: currentHistoryUserId,
              user: user ? { id: user.id, email: user.email } : null
            });
            
            addVideoHistoryItem(currentHistoryUserId, {
              id: `${job.job_id}`,
              jobId: job.job_id,
              type: activeTab === 'image' ? 'image' : 'text',
              title,
              prompt,
              videoUrl: originalVideoUrl, // Store original URL, token added when displaying
              coinsSpent: job.coins_spent || cost,
              createdAt: Date.now(),
            });
            setHistoryTick((t) => t + 1);
            console.log('Video saved successfully to history (immediate)');
          } catch (error) {
            console.error('Error saving video to history:', error);
          }
        } else if (job.status === 'failed') {
          setGenerationError(job.error || 'Generation failed');
          setGenerationStatus('waiting');
        } else {
          setGenerationStatus('generating');
        }
      } catch (e) {
        // If backend says insufficient coins, open top up
        if ((e?.message || '').toLowerCase().includes('insufficient coins')) {
          openTopUpModal?.();
        }
        setGenerationError(e.message || 'Failed to start generation');
        setGenerationStatus('waiting');
      }
    })();
  };

  // Poll job status while generating
  useEffect(() => {
    if (generationStatus !== 'generating' || !videoJobId) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const job = await getVideoJob(videoJobId);
        if (cancelled) return;
        if (job.status === 'succeeded' && job.video_url) {
          // Store original video URL (without token) for history
          const originalVideoUrl = job.video_url;
          // Add token to video URL for authentication when displaying
          const videoUrlWithToken = addTokenToVideoUrl(originalVideoUrl);
          setVideoUrl(videoUrlWithToken);
          setGenerationStatus('ready');
          clearInterval(interval);

          const latestPrompt = promptRef.current;
          const latestTab = activeTabRef.current;
          const latestView = currentViewRef.current;
          const title =
            latestPrompt.split(/[.\n]/)[0]?.trim().slice(0, 32) ||
            (latestView === 'image-to-video' ? 'Image to Video' : 'Text to Video');
          
          // Save video to history with original URL (token will be added when displaying)
          try {
            // Get current historyUserId (may have changed if user logged in/out)
            const currentHistoryUserId = user?.id || walletAddress || 'anonymous';
            console.log('Saving video to history:', { 
              jobId: videoJobId, 
              title, 
              type: latestTab === 'image' ? 'image' : 'text',
              historyUserId: currentHistoryUserId,
              user: user ? { id: user.id, email: user.email } : null
            });
            
            addVideoHistoryItem(currentHistoryUserId, {
              id: `${videoJobId}`,
              jobId: videoJobId,
              type: latestTab === 'image' ? 'image' : 'text',
              title,
              prompt: latestPrompt,
              videoUrl: originalVideoUrl, // Store original URL, token added when displaying
              createdAt: Date.now(),
            });
            setHistoryTick((t) => t + 1);
            console.log('Video saved successfully to history');
          } catch (error) {
            console.error('Error saving video to history:', error);
          }
        } else if (job.status === 'failed') {
          const raw = job.error || 'Generation failed';
          const lower = String(raw).toLowerCase();
          const msg =
            lower.includes('maintenance') || lower.includes('code=455')
              ? 'Sora2API sedang maintenance. Silakan coba lagi nanti.'
              : lower.includes('internal error')
                ? 'Sora2API sedang bermasalah (internal error). Silakan coba generate lagi beberapa menit kemudian.'
                : raw;
          setGenerationError(msg);
          setGenerationStatus('waiting');
          // Refresh balance (may have been refunded on backend)
          try {
            const bal = await getCoinBalance();
            if (bal && typeof bal.coins === 'number') setCoinBalance(bal.coins);
          } catch {
            // ignore
          }
          clearInterval(interval);
        }
      } catch (e) {
        // Keep polling; transient errors happen during dev
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [generationStatus, videoJobId, historyUserId]);

  const cost = calculateCost();

  const handleNavigateToText = () => {
    router.push('/generator?view=text-to-video');
  };

  const handleNavigateToImage = () => {
    router.push('/generator?view=image-to-video');
  };

  const handleNavigateToTextImage = () => {
    router.push('/generator?view=text-to-image');
  };

  const handleNavigateToImageImage = () => {
    router.push('/generator?view=image-to-image');
  };

  const handleNavigateToHome = () => {
    router.push('/generator');
  };

  const handleNavigateToInspiration = () => {
    router.push('/generator?view=inspiration');
  };

  const handleNavigateToMyVideos = () => {
    router.push('/generator?view=my-videos');
  };

  const handleNavigateToMyImages = () => {
    router.push('/generator?view=my-images');
  };

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // After mounted, check user and redirect if needed
  if (!user) {
    // Will redirect via useEffect, but show loading to prevent hydration error
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />
      <SidebarNav 
        currentView={currentView}
        onNavigateToHome={handleNavigateToHome}
        onNavigateToInspiration={handleNavigateToInspiration}
        onNavigateToMyVideos={handleNavigateToMyVideos}
        onNavigateToText={handleNavigateToText}
        onNavigateToImage={handleNavigateToImage}
        onNavigateToTextImage={handleNavigateToTextImage}
        onNavigateToImageImage={handleNavigateToImageImage}
        onNavigateToMyImages={handleNavigateToMyImages}
      />

      <div className="lg:pl-20 pt-20 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
          {currentView === 'home' ? (
            <HomePage
              onNavigateToText={handleNavigateToText}
              onNavigateToImage={handleNavigateToImage}
              onNavigateToTextImage={handleNavigateToTextImage}
              onNavigateToImageImage={handleNavigateToImageImage}
              onNavigateToInspiration={handleNavigateToInspiration}
            />
          ) : currentView === 'inspiration' ? (
            <InspirationPage 
              onGenerateWithPrompt={(promptTitle, promptText) => {
                // Navigate to text-to-image page and set the prompt
                setPrompt(promptText);
                setCurrentView('text-to-image');
              }}
            />
          ) : currentView === 'my-videos' ? (
            <MyVideosPage />
          ) : currentView === 'my-images' ? (
            <MyImagesPage />
          ) : currentView === 'text-to-image' ? (
            <TextToImagePage
              initialPrompt={prompt}
              onGenerate={async (params) => {
                try {
                  const job = await createTextToImageJob({
                    prompt: params.prompt,
                    model: params.model,
                    aspect_ratio: params.aspectRatio,
                  });
                  // Refresh balance after generation
                  try {
                    const bal = await getCoinBalance();
                    if (bal && typeof bal.coins === 'number') setCoinBalance(bal.coins);
                  } catch {
                    // ignore
                  }
                  return { jobId: job.job_id, imageUrl: job.image_url };
                } catch (error) {
                  throw error;
                }
              }}
              onNavigateToMyImages={handleNavigateToMyImages}
            />
          ) : currentView === 'image-to-image' ? (
            <ImageToImagePage
              onGenerate={async (params) => {
                try {
                  const { createImageToImageJob, getCoinBalance } = await import('../lib/api');
                  const job = await createImageToImageJob({
                    prompt: params.prompt || '',
                    image_url: params.imageUrl,
                    image_url2: params.imageUrl2,
                    model: params.model,
                    mode: params.mode,
                    aspect_ratio: params.aspectRatio,
                  });
                  // Refresh balance after generation
                  try {
                    const bal = await getCoinBalance();
                    if (bal && typeof bal.coins === 'number') setCoinBalance(bal.coins);
                  } catch {
                    // ignore
                  }
                  return { jobId: job.job_id, imageUrl: job.image_url };
                } catch (error) {
                  throw error;
                }
              }}
              onNavigateToMyImages={handleNavigateToMyImages}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
              {/* Left Panel - Create Video */}
              <div className="lg:sticky lg:top-20 lg:self-start">
                <div className="lg:py-4 lg:max-h-[calc(100vh-5rem)] lg:flex lg:flex-col lg:min-h-0">
                  <CreateVideoPanel
                    title={currentView === 'text-to-video' ? 'Text to Video' : 'Image to Video'}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    selectedStyle={selectedStyle}
                    setSelectedStyle={setSelectedStyle}
                    selectedLength={selectedLength}
                    setSelectedLength={setSelectedLength}
                    resolution={resolution}
                    setResolution={setResolution}
                    frameRate={frameRate}
                    setFrameRate={setFrameRate}
                    videoProvider={videoProvider}
                    setVideoProvider={setVideoProvider}
                    soraAspectRatio={soraAspectRatio}
                    setSoraAspectRatio={setSoraAspectRatio}
                    soraDuration={soraDuration}
                    setSoraDuration={setSoraDuration}
                    soraWatermark={soraWatermark}
                    setSoraWatermark={setSoraWatermark}
                    soraImageUrls={soraImageUrls}
                    setSoraImageUrls={setSoraImageUrls}
                    aiEnhancement={aiEnhancement}
                    setAiEnhancement={setAiEnhancement}
                    onGenerate={handleGenerateClick}
                  />
                </div>
              </div>

              {/* Middle Panel - Video Preview */}
              <div className="lg:col-span-2">
                <div className="custom-scrollbar-right">
                  <VideoPreviewPanel
                    generationStatus={generationStatus}
                    videoUrl={videoUrl}
                    errorMessage={generationError}
                    recentGenerations={recentGenerations}
                    onSeeAllRecent={handleNavigateToMyVideos}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text to Video Section - Full width component below grid (only for text-to-video) */}
      {currentView === 'text-to-video' && (
        <div className="lg:pl-20 pb-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
            <TextToVideoSection />
          </div>
        </div>
      )}

      {/* Image to Video Section - Full width component below grid (only for image-to-video) */}
      {currentView === 'image-to-video' && (
        <div className="lg:pl-20 pb-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
            <ImageToVideoSection 
              soraImageUrls={soraImageUrls}
              setSoraImageUrls={setSoraImageUrls}
            />
          </div>
        </div>
      )}

      {/* Generate Confirm Modal */}
      <GenerateConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmGeneration}
        cost={cost}
        isFree={false}
      />
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <GeneratorPageContent />
    </Suspense>
  );
}

