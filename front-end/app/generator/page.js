'use client';

import { useState } from 'react';
import AppHeader from '../components/generator/AppHeader';
import CreateVideoPanel from '../components/generator/CreateVideoPanel';
import VideoPreviewPanel from '../components/generator/VideoPreviewPanel';
import PricingPanel from '../components/generator/PricingPanel';

export default function GeneratorPage() {
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('A cinematic drone shot flying over a futuristic city at sunset with neon lights...');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic');
  const [selectedLength, setSelectedLength] = useState('10s');
  const [resolution, setResolution] = useState('1080p');
  const [frameRate, setFrameRate] = useState('30 FPS');
  const [aiEnhancement, setAiEnhancement] = useState(true);
  const [generationStatus, setGenerationStatus] = useState('waiting'); // waiting, confirmed, generating, ready

  const pricing = {
    length: selectedLength === '5s' ? 2.5 : selectedLength === '10s' ? 4.5 : 12,
    styleProcessing: 0.5,
    aiEnhancement: aiEnhancement ? 1.0 : 0,
    processingFee: 0.5,
    get subtotal() {
      return this.length + this.styleProcessing + this.aiEnhancement;
    },
    get total() {
      return this.subtotal + this.processingFee;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />
      <div className="flex flex-col lg:flex-row gap-6 p-6 pt-24">
        {/* Left Panel - Create Video */}
        <div className="lg:w-1/3">
          <CreateVideoPanel
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
          />
        </div>

        {/* Middle Panel - Video Preview */}
        <div className="lg:w-1/3">
          <VideoPreviewPanel
            generationStatus={generationStatus}
            setGenerationStatus={setGenerationStatus}
          />
        </div>

        {/* Right Panel - Pricing & Wallet */}
        <div className="lg:w-1/3">
          <PricingPanel
            pricing={pricing}
            selectedLength={selectedLength}
            resolution={resolution}
            aiEnhancement={aiEnhancement}
            onPay={() => setGenerationStatus('confirmed')}
          />
        </div>
      </div>
    </div>
  );
}

