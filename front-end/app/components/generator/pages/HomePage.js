'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage({ onNavigateToText, onNavigateToImage }) {
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
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
    </div>
  );
}

