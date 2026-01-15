'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '../components/generator/layout/AppHeader';
import SidebarNav from '../components/generator/layout/SidebarNav';
import HomePage from '../components/generator/pages/HomePage';
import InspirationPage from '../components/generator/pages/InspirationPage';
import MyVideosPage from '../components/generator/pages/MyVideosPage';
import CreateVideoPanel from '../components/generator/panels/CreateVideoPanel';
import VideoPreviewPanel from '../components/generator/panels/VideoPreviewPanel';
import TextToVideoSection from '../components/generator/sections/TextToVideoSection';
import GenerateConfirmModal from '../components/generator/modals/GenerateConfirmModal';
import { useAuthStore } from '../store/authStore';
import { createTextToVideoJob, getVideoJob } from '../lib/api';

export default function GeneratorPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'text-to-video', 'image-to-video'
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('A cinematic drone shot flying over a futuristic city at sunset with neon lights...');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic');
  const [selectedLength, setSelectedLength] = useState('10s');
  const [resolution, setResolution] = useState('1080p');
  const [frameRate, setFrameRate] = useState('30 FPS');
  const [aiEnhancement, setAiEnhancement] = useState(true);
  const [generationStatus, setGenerationStatus] = useState('waiting'); // waiting, confirmed, generating, ready
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [videoJobId, setVideoJobId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [generationError, setGenerationError] = useState('');

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const { freeGenerationUsed, setFreeGenerationUsed, usdcBalance, setUsdcBalance } = useAuthStore();

  // Calculate generation cost
  const calculateCost = () => {
    const lengthPrice = selectedLength === '5s' ? 2.5 : selectedLength === '10s' ? 4.5 : 12;
    const stylePrice = 0.5;
    const aiPrice = aiEnhancement ? 1.0 : 0;
    const fee = 0.5;
    return lengthPrice + stylePrice + aiPrice + fee;
  };

  const handleGenerateClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmGeneration = () => {
    const cost = calculateCost();
    const isFree = !freeGenerationUsed;

    if (isFree) {
      // Use free generation
      setFreeGenerationUsed(true);
      setGenerationStatus('generating');
    } else {
      // Check balance
      if (usdcBalance >= cost) {
        setUsdcBalance(usdcBalance - cost);
        setGenerationStatus('generating');
      } else {
        alert('Insufficient balance. Please add funds to your wallet.');
        setIsConfirmModalOpen(false);
        return;
      }
    }

    setIsConfirmModalOpen(false);

    // Start backend generation job (Text tab -> text-to-video)
    setGenerationError('');
    setVideoUrl(null);
    setVideoJobId(null);

    (async () => {
      try {
        const job = await createTextToVideoJob({
          prompt,
          duration_seconds: selectedLength === '5s' ? 5 : selectedLength === '10s' ? 10 : 30,
          resolution,
          fps: parseInt((frameRate || '30').toString(), 10) || 30,
          style: selectedStyle,
        });
        setVideoJobId(job.job_id);
        if (job.status === 'succeeded' && job.video_url) {
          setVideoUrl(job.video_url);
          setGenerationStatus('ready');
        } else if (job.status === 'failed') {
          setGenerationError(job.error || 'Generation failed');
          setGenerationStatus('waiting');
        } else {
          setGenerationStatus('generating');
        }
      } catch (e) {
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
        } else if (job.status === 'failed') {
          setGenerationError(job.error || 'Generation failed');
          setGenerationStatus('waiting');
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
  }, [generationStatus, videoJobId]);

  const cost = calculateCost();
  const isFree = !freeGenerationUsed;

  const handleNavigateToText = () => {
    setCurrentView('text-to-video');
    setActiveTab('text');
  };

  const handleNavigateToImage = () => {
    setCurrentView('image-to-video');
    setActiveTab('image');
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
      />

      <div className="lg:pl-20 pt-20 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
          {currentView === 'home' ? (
            <HomePage
              onNavigateToText={handleNavigateToText}
              onNavigateToImage={handleNavigateToImage}
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

      {/* Generate Confirm Modal */}
      <GenerateConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmGeneration}
        cost={cost}
        isFree={isFree}
      />
    </div>
  );
}

