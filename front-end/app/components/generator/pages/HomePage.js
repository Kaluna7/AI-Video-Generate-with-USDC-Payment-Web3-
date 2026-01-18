'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage({ onNavigateToText, onNavigateToImage, onNavigateToTextImage, onNavigateToImageImage }) {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const exampleVideos = [
    {
      id: 1,
      title: 'Futuristic Cityscape',
      description: 'A cinematic drone shot flying over a futuristic city at sunset',
      thumbnail: 'cityscape',
      duration: '10s',
      style: 'Cinematic',
    },
    {
      id: 2,
      title: 'Ocean Waves',
      description: 'Dramatic ocean waves crashing against rocky cliffs',
      thumbnail: 'ocean',
      duration: '15s',
      style: 'Realistic',
    },
    {
      id: 3,
      title: 'Abstract Art',
      description: 'Colorful abstract patterns flowing and morphing',
      thumbnail: 'abstract',
      duration: '8s',
      style: 'Abstract',
    },
    {
      id: 4,
      title: 'Mountain Landscape',
      description: 'Aerial view of snow-capped mountains at golden hour',
      thumbnail: 'mountain',
      duration: '12s',
      style: 'Cinematic',
    },
    {
      id: 5,
      title: 'Neon Cyberpunk',
      description: 'Cyberpunk street with neon lights and flying vehicles',
      thumbnail: 'cyberpunk',
      duration: '10s',
      style: '3D Render',
    },
    {
      id: 6,
      title: 'Forest Path',
      description: 'Peaceful walk through a mystical forest with sunlight rays',
      thumbnail: 'forest',
      duration: '15s',
      style: 'Realistic',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Create Stunning Videos</span>
          <br />
          <span className="text-white">with AI Power</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Transform your ideas into breathtaking videos. Choose your creation method and let AI bring your vision to life.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 mb-12">
          {/* Video Generation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 text-center">Video Generation</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onNavigateToText}
                className="group w-full sm:w-auto px-8 py-4 gradient-purple-blue text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Text to Video</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={onNavigateToImage}
                className="group w-full sm:w-auto px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-xl font-semibold text-lg hover:border-purple-500 hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Image to Video</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Image Generation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 text-center">Image Generation</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onNavigateToTextImage}
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/20 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Text to Image</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={onNavigateToImageImage}
                className="group w-full sm:w-auto px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-xl font-semibold text-lg hover:border-pink-500 hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Image to Image</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Example Videos Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Example Videos</h2>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exampleVideos.map((video) => (
            <div
              key={video.id}
              className="group bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all hover:scale-[1.02] cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <svg className="w-8 h-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                  {video.duration}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {video.title}
                  </h3>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                    {video.style}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="w-12 h-12 gradient-purple-blue rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Fast Generation</h3>
          <p className="text-sm text-gray-400">Generate high-quality videos in minutes, not hours.</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="w-12 h-12 gradient-purple-blue rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">AI Powered</h3>
          <p className="text-sm text-gray-400">Advanced AI technology for stunning visual results.</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="w-12 h-12 gradient-purple-blue rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Pay Per Use</h3>
          <p className="text-sm text-gray-400">No subscriptions. Pay only for what you generate.</p>
        </div>
      </div>

      {/* How It Works Section - Enhanced */}
      <div className="relative mt-16 pt-12">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent"></div>
        <div className="relative bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-900/40 rounded-3xl p-8 md:p-12 border border-gray-700/50 backdrop-blur-sm">
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
              Generate videos in 3 simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30"></div>
            {[
              {
                step: '1',
                title: 'Connect Wallet',
                description: 'Connect your wallet to pay with USDC and start generating videos in seconds.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                gradient: 'from-purple-500/20 to-pink-500/20',
                extraContent: (
                  <div className="mt-4 space-y-3 text-left">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white text-sm">Arc</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-3">
                        Arc is an EVM-compatible Layer-1 blockchain using USDC as native gas, built for stablecoin finance, tokenization, and global payments across scalable & transparent networks.
                      </p>
                      <div className="space-y-1.5">
                        <div><a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">👉 Read more about Arc</a></div>
                        <div><a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">💧 Testnet faucet — Circle</a></div>
                        <div><a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">💧 Testnet faucet — Easy Faucet</a></div>
                        <div><a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">💧 Testnet faucet — Oku</a></div>
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white text-sm">Circle</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-3">
                        Circle is a global fintech company behind USDC, providing regulated, transparent, and programmable digital money infrastructure for businesses and developers.
                      </p>
                      <div><a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">👉 Read more about Circle</a></div>
                    </div>
                  </div>
                ),
              },
              {
                step: '2',
                title: 'Create Prompt',
                description: 'Enter your text prompt or upload an image. Customize settings like duration, quality, and style to match your vision.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
                gradient: 'from-blue-500/20 to-cyan-500/20',
              },
              {
                step: '3',
                title: 'Generate & Download',
                description: 'Pay with USDC and watch as our AI generates your video. Download your high-quality video instantly when ready.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
                gradient: 'from-purple-500/20 to-blue-500/20',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative group"
              >
                <div className={`relative bg-gradient-to-br ${item.gradient} rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20`}>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 gradient-purple-blue rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl shadow-purple-500/50 z-10 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="pt-8">
                    <div className="w-16 h-16 gradient-purple-blue rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                    {item.extraContent && item.extraContent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

