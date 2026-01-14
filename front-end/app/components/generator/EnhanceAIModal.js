'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function EnhanceAIModal({ isOpen, onClose, onGenerate }) {
  const [idea, setIdea] = useState('');

  const handleGenerate = () => {
    if (idea.trim()) {
      onGenerate(idea.trim());
      setIdea('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl z-[10000]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-[10001]"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Icon & Title */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Enhance with AI</h2>
            <p className="text-sm text-gray-400">Enter a short idea to improve your video prompt</p>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Your Idea</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              rows={4}
              placeholder="e.g., Add dramatic lighting, cinematic camera movement, slow motion effect..."
              maxLength={200}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{idea.length}/200 characters</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!idea.trim()}
              className="flex-1 py-3 px-4 gradient-purple-blue text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at body level to avoid z-index issues
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

