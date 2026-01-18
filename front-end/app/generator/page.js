'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { createTextToVideoJob, getCoinBalance, getVideoJob, createTextToImageJob, getImageJob } from '../lib/api';
import { addVideoHistoryItem, formatRelativeTime, getVideoHistory } from '../lib/videoHistory';

export default function GeneratorPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const walletAddress = useAuthStore((state) => state.walletAddress);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'text-to-video', 'image-to-video'
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic');
  // Provider selection (UI-driven; backend can still default via VIDEO_PROVIDER)
  const [videoProvider, setVideoProvider] = useState('veo3'); // veo3 | sora2 | kling

  // Veo 3.1 params
  const [veoModel, setVeoModel] = useState('veo3-fast'); // veo3-fast | veo3
  const [veoAspectRatio, setVeoAspectRatio] = useState('16:9'); // 16:9 | 9:16 | Auto

  // Sora2API params (api.sora2api.ai)
  const [soraAspectRatio, setSoraAspectRatio] = useState('landscape'); // landscape | portrait
  const [soraQuality, setSoraQuality] = useState('standard'); // standard | hd
  const [soraWatermark, setSoraWatermark] = useState('');
  const [soraImageUrls, setSoraImageUrls] = useState(''); // newline-separated URLs

  // Kling AI params
  const [klingModel, setKlingModel] = useState('v2-1-master'); // v1-0, v1-6, v2-0, v2-1-master, v2-5-turbo, v2-6

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

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Local history is stored per "account". Prefer app user id, fall back to connected wallet, else anonymous.
  const historyUserId = user?.id || walletAddress || 'anonymous';

  const recentGenerations =
    getVideoHistory(historyUserId)
      .map((v) => ({ ...v, time: formatRelativeTime(v.createdAt) }));

  const { coinBalance, setCoinBalance, openTopUpModal } = useAuthStore();

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
    // Coins pricing buckets: fast/standard=25, HQ/pro=180
    if (videoProvider === 'sora2') {
      return (soraQuality || '').toLowerCase() === 'hd' ? 180 : 25;
    }
    if (videoProvider === 'kling') {
      // Kling AI: v2-0, v2-1-master, v2-5-turbo, v2-6 = 180 coins, v1-0, v1-6 = 25 coins
      const model = (klingModel || '').toLowerCase();
      return (model.includes('v2') || model.includes('2.1') || model.includes('2.0') || model.includes('2.5') || model.includes('2.6')) ? 180 : 25;
    }
    return veoModel === 'veo3' ? 180 : 25;
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
        if (videoProvider === 'sora2') {
          job = await createTextToVideoJob({
            prompt,
            provider: 'sora2',
            aspect_ratio: soraAspectRatio,
            quality: soraQuality,
            watermark: soraWatermark || null,
            image_urls: soraImageUrls
              ? soraImageUrls
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : null,
          });
        } else if (videoProvider === 'kling') {
          // Kling AI supports text-to-video and image-to-video
          const imageUrls = activeTab === 'image' && soraImageUrls
            ? soraImageUrls
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            : null;
          job = await createTextToVideoJob({
            prompt,
            provider: 'kling',
            model: klingModel,
            duration_seconds: parseInt(selectedLength) || 5,
            image_urls: imageUrls,
          });
        } else {
          job = await createTextToVideoJob({
            prompt,
            provider: 'veo3',
            model: veoModel,
            aspect_ratio: veoAspectRatio,
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
          setVideoUrl(job.video_url);
          setGenerationStatus('ready');

          const title =
            prompt.split(/[.\n]/)[0]?.trim().slice(0, 32) ||
            (currentView === 'image-to-video' ? 'Image to Video' : 'Text to Video');
          addVideoHistoryItem(historyUserId, {
            id: `${job.job_id}`,
            jobId: job.job_id,
            type: activeTab === 'image' ? 'image' : 'text',
            title,
            prompt,
            videoUrl: job.video_url,
            coinsSpent: job.coins_spent || cost,
            createdAt: Date.now(),
          });
          setHistoryTick((t) => t + 1);
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
          setVideoUrl(job.video_url);
          setGenerationStatus('ready');
          clearInterval(interval);

          const latestPrompt = promptRef.current;
          const latestTab = activeTabRef.current;
          const latestView = currentViewRef.current;
          const title =
            latestPrompt.split(/[.\n]/)[0]?.trim().slice(0, 32) ||
            (latestView === 'image-to-video' ? 'Image to Video' : 'Text to Video');
          addVideoHistoryItem(historyUserId, {
            id: `${videoJobId}`,
            jobId: videoJobId,
            type: latestTab === 'image' ? 'image' : 'text',
            title,
            prompt: latestPrompt,
            videoUrl: job.video_url,
            createdAt: Date.now(),
          });
          setHistoryTick((t) => t + 1);
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
    setCurrentView('text-to-video');
    setActiveTab('text');
  };

  const handleNavigateToImage = () => {
    setCurrentView('image-to-video');
    setActiveTab('image');
  };

  const handleNavigateToTextImage = () => {
    setCurrentView('text-to-image');
  };

  const handleNavigateToImageImage = () => {
    setCurrentView('image-to-image');
  };

  const handleNavigateToHome = () => {
    setCurrentView('home');
  };

  const handleNavigateToInspiration = () => {
    setCurrentView('inspiration');
  };

  const handleNavigateToMyVideos = () => {
    setCurrentView('my-videos');
  };

  const handleNavigateToMyImages = () => {
    setCurrentView('my-images');
  };

  if (!user) {
    return null; // Will redirect
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
            />
          ) : currentView === 'inspiration' ? (
            <InspirationPage 
              onGenerateWithPrompt={(promptTitle, promptText) => {
                setPrompt(promptText);
                setCurrentView('text-to-video');
                setActiveTab('text');
              }}
            />
          ) : currentView === 'my-videos' ? (
            <MyVideosPage />
          ) : currentView === 'my-images' ? (
            <MyImagesPage />
          ) : currentView === 'text-to-image' ? (
            <TextToImagePage
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
                    veoModel={veoModel}
                    setVeoModel={setVeoModel}
                    veoAspectRatio={veoAspectRatio}
                    setVeoAspectRatio={setVeoAspectRatio}
                    soraAspectRatio={soraAspectRatio}
                    setSoraAspectRatio={setSoraAspectRatio}
                    soraQuality={soraQuality}
                    setSoraQuality={setSoraQuality}
                    soraWatermark={soraWatermark}
                    setSoraWatermark={setSoraWatermark}
                    soraImageUrls={soraImageUrls}
                    setSoraImageUrls={setSoraImageUrls}
                    klingModel={klingModel}
                    setKlingModel={setKlingModel}
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
            <ImageToVideoSection />
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

