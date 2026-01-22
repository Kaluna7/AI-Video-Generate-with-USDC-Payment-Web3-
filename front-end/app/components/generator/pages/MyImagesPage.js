'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { getImageHistory, deleteImageHistoryItem } from '../../../lib/imageHistory';

export default function MyImagesPage() {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'text-to-image', 'image-to-image'
  const [historyTick, setHistoryTick] = useState(0);
  const user = useAuthStore((state) => state.user);
  const walletAddress = useAuthStore((state) => state.walletAddress);

  // Local history is stored per "account". Prefer app user id, fall back to connected wallet, else anonymous.
  const historyUserId = user?.id || walletAddress || 'anonymous';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Load images from localStorage
    const loadImages = () => {
      try {
        const loaded = getImageHistory(historyUserId);
        setImages(loaded);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadImages();
    };
    
    // Listen for custom event (same-tab updates)
    const handleImageHistoryUpdated = () => {
      setHistoryTick((t) => t + 1);
      loadImages();
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
  }, [historyUserId, historyTick]);

  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.type === filter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (id) => {
    if (!confirm(`Are you sure you want to delete this image? This action cannot be undone.`)) {
      return;
    }
    
    try {
      deleteImageHistoryItem(historyUserId, id);
      setHistoryTick((t) => t + 1);
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleDownload = async (image) => {
    try {
      let blob;
      let filename = `image-${image.id}.jpg`;

      // Check if it's a base64 data URL
      if (image.url.startsWith('data:image/')) {
        // Extract base64 data and convert to blob
        const response = await fetch(image.url);
        blob = await response.blob();
        
        // Determine file extension from MIME type
        const mimeType = image.url.split(';')[0].split(':')[1];
        const ext = mimeType.split('/')[1] || 'png';
        filename = `image-${image.id}.${ext}`;
      } else {
        // For HTTP/HTTPS URLs, fetch the image
        const response = await fetch(image.url);
        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }
        blob = await response.blob();
        
        // Try to get filename from URL or Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        } else {
          // Extract extension from URL
          const urlPath = new URL(image.url).pathname;
          const urlExt = urlPath.split('.').pop();
          if (urlExt && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExt.toLowerCase())) {
            filename = `image-${image.id}.${urlExt}`;
          }
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          <span className="gradient-text">My Images</span>
        </h1>
        <p className="text-gray-400">
          View and manage all your generated images
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Images</span>
            <div className="w-10 h-10 gradient-purple-blue rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{images.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Text to Image</span>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{images.filter(img => img.type === 'text-to-image').length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Image to Image</span>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{images.filter(img => img.type === 'image-to-image').length}</p>
        </div>
      </div>

      {/* Tips Section */}
      {images.length === 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 gradient-purple-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Start Creating Amazing Images</h3>
              <p className="text-sm text-gray-400 mb-3">
                Generate your first AI image using Text to Image or transform existing images with Image to Image. Each generation costs 5 coins.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Use detailed prompts for better results</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Try different models for various styles</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Experiment with different aspect ratios</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'text-purple-300 border-b-2 border-purple-300'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          All Images
        </button>
        <button
          onClick={() => setFilter('text-to-image')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'text-to-image'
              ? 'text-purple-300 border-b-2 border-purple-300'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Text to Image
        </button>
        <button
          onClick={() => setFilter('image-to-image')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'image-to-image'
              ? 'text-purple-300 border-b-2 border-purple-300'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Image to Image
        </button>
      </div>

      {/* Images Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all"
            >
              <img
                src={image.url}
                alt={image.prompt || 'Generated image'}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-white mb-1 line-clamp-2">{image.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{formatDate(image.createdAt)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(image)}
                        className="p-1.5 bg-gray-700/80 hover:bg-gray-600 rounded transition-colors"
                        title="Download"
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-[10px] font-medium rounded ${
                  image.type === 'text-to-image'
                    ? 'bg-purple-500/80 text-white'
                    : 'bg-blue-500/80 text-white'
                }`}>
                  {image.type === 'text-to-image' ? 'T2I' : 'I2I'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No images generated yet</p>
          <p className="text-sm text-gray-500 mt-2">Start generating images to see them here</p>
        </div>
      )}
    </div>
  );
}

