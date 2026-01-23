'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

// FAQ Item Component - Different Style
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-linear-to-r from-[#06080c]/90 to-[#0a0d12]/90 rounded-2xl border-l-4 border-emerald-500/30 overflow-hidden hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left group"
      >
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-emerald-500/20 border-emerald-500/40' : ''}`}>
            <svg className={`w-4 h-4 text-emerald-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h4 className="text-xl md:text-2xl font-semibold text-white group-hover:text-emerald-300 transition-colors flex-1">
            {question}
          </h4>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-8 pb-6 pl-20">
          <div className="border-l-2 border-emerald-500/30 pl-4">
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImageToVideoSection({ soraImageUrls, setSoraImageUrls }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  // Initialize imagePreview from soraImageUrls if available
  const [imagePreview, setImagePreview] = useState(() => {
    if (soraImageUrls && soraImageUrls.trim()) {
      if (soraImageUrls.startsWith('data:image/') || soraImageUrls.startsWith('http://') || soraImageUrls.startsWith('https://')) {
        return soraImageUrls;
      }
    }
    return null;
  });
  const fileInputRef = useRef(null);

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle file upload
  const handleFileUpload = (e) => {
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

    setUploadedFile(file);
    // Create preview and update soraImageUrls with base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      // Update soraImageUrls with base64 data URL for image-to-video
      if (setSoraImageUrls) {
        setSoraImageUrls(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sync imagePreview with soraImageUrls when it changes externally (only if no uploaded file)
  useEffect(() => {
    if (uploadedFile) {
      // If we have an uploaded file, don't sync with soraImageUrls
      return;
    }
    
    const newPreview = soraImageUrls && soraImageUrls.trim() && 
      (soraImageUrls.startsWith('data:image/') || soraImageUrls.startsWith('http://') || soraImageUrls.startsWith('https://'))
      ? soraImageUrls 
      : null;
    
    // Only update if different to avoid unnecessary re-renders
    setImagePreview(prev => prev !== newPreview ? newPreview : prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soraImageUrls]); // Only depend on soraImageUrls


  const marqueeItems = [
    'Animate portraits with natural motion',
    'Turn product photos into cinematic ads',
    'Add camera moves: push-in, pan, handheld',
    'Perfect for Shorts, Reels, TikTok',
    'Keep faces consistent across scenes',
    'Ship more variations, faster',
  ];

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-32 right-[-120px] w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
              Image to Video
            </span>{' '}
            <span className="text-white">that feels alive</span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            A clean, controlled workflow: one image in, cinematic motion out—no clutter, no gimmicks.
          </p>

          {/* Marquee (different copy than Text-to-Video) */}
          <div className="mt-8">
            <div
              className="ps-marquee"
              style={{
                '--ps-marquee-duration': '18s',
                '--ps-marquee-direction': 'reverse',
              }}
            >
              <div className="ps-marquee__track">
                {[...marqueeItems, ...marqueeItems].map((t, idx) => (
                  <span
                    key={`${t}-${idx}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-[#06080c]/70 text-sm text-gray-200 mx-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Elegant layout (different from reference screenshot) */}
        <div className="mt-14 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
          {/* Left: workflow + prompt */}
          <div className="rounded-3xl border border-white/10 bg-[#06080c]/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-white font-semibold">A simple workflow</p>
              <span className="text-xs text-gray-400">3 steps</span>
            </div>

            <div className="mt-5 space-y-3">
              {/* Step 1: Upload an image - Interactive */}
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-200 font-semibold">
                    01
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold">Upload an image</p>
                    <p className="mt-1 text-sm text-gray-300 leading-relaxed">Start from a portrait, product, or scene. Clean inputs yield the best motion.</p>
                    
                    {/* File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {/* Upload Button or Preview */}
                    <div className="mt-3">
                      {imagePreview ? (
                        <div className="space-y-3">
                          <div className="relative rounded-xl overflow-hidden border-2 border-purple-500/40 bg-black/50 group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imagePreview}
                              alt="Uploaded preview"
                              className="w-full h-auto max-h-48 object-contain mx-auto"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedFile(null);
                                  setImagePreview(null);
                                  if (setSoraImageUrls) {
                                    setSoraImageUrls('');
                                  }
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-xs rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2 px-1">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <p className="text-xs text-gray-300 truncate font-medium">{uploadedFile?.name || 'Image uploaded'}</p>
                            </div>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs text-purple-400 hover:text-purple-300 transition-colors shrink-0"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 bg-purple-500/5 hover:bg-purple-500/10 transition-all flex flex-col items-center justify-center gap-2 text-sm text-purple-300 hover:text-purple-200 group"
                        >
                          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Choose Image</span>
                          <span className="text-xs text-gray-400">JPG, PNG, WebP (max 10MB)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 & 3 */}
              {[
                { n: '02', t: 'Describe the motion', d: 'Tell us camera move, mood, and action—keep it short and specific.' },
                { n: '03', t: 'Generate variations', d: 'Iterate quickly until it looks right. Save the best and ship.' },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-200 font-semibold">
                      {s.n}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold">{s.t}</p>
                      <p className="mt-1 text-sm text-gray-300 leading-relaxed">{s.d}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="text-sm font-semibold text-white mb-2">Example motion prompt</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                 Samoyed dog running in the river while play with his owner
              </p>
            </div>
          </div>  

          {/* Right: big hero preview card (glass, not side-by-side) */}
          <div className="rounded-3xl border border-white/10 bg-[#06080c]/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-white font-semibold">Preview</p>
            </div>

            <div className="mt-5 relative rounded-3xl overflow-hidden border border-white/10 bg-black/30">
              {/* Diagonal split overlay */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
                <div className="absolute -inset-24 rotate-12 bg-white/5 blur-2xl" />
              </div>

              <div className="relative flex flex-col items-center gap-5 p-5 md:p-6">
                <div className="w-full max-w-[260px]">
                  <div className="text-xs text-gray-300 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-300" />
                    Source image
                  </div>
                  <div className="rounded-2xl overflow-hidden border-2 border-white/20 bg-black/40 p-4 flex items-center justify-center min-h-[200px]">
                    {imagePreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imagePreview}
                        alt="Uploaded source"
                        className="w-full h-auto max-h-[280px] object-contain drop-shadow-2xl rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                        <Image
                          src="/assets/images/coin-3d.svg"
                          alt="Source"
                          width={120}
                          height={120}
                          className="w-24 h-24 md:w-28 md:h-28 drop-shadow-2xl opacity-50"
                        />
                        <p className="text-xs text-gray-500">Upload an image to preview</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="w-full max-w-[520px]">
                  <div className="text-xs text-gray-300 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-300" />
                    Generated video
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                    <div className="relative aspect-video">
                      <video
                        className="absolute inset-0 w-full h-full object-cover"
                        src="/assets/video/samoyed.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small footer */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                From Coin generate to video in seconds.
              </p>
            </div>
          </div>
        </div>


        {/* FAQ Section - Different Style */}
        <div className="mt-20 mb-16">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                QUESTIONS & ANSWERS
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Got Questions? We&apos;ve Got Answers
            </h3>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Learn how to get the most out of Image to Video generation
            </p>
          </div>

          <div className="max-w-7xl mx-auto space-y-6">
            {[
              {
                question: 'How does Image to Video AI work?',
                answer: 'Image to Video AI analyzes your uploaded image and generates motion based on your motion prompt. Simply upload an image, describe the desired motion (camera moves, actions, mood), and our AI will create a video that brings your static image to life with natural, cinematic movement.',
              },
              {
                question: 'What types of images work best?',
                answer: 'Portraits, product photos, landscapes, and character illustrations work excellently. Clean, high-quality images with clear subjects produce the best results. Avoid overly complex or cluttered images for optimal motion generation.',
              },
              {
                question: 'Can I control the type of motion?',
                answer: 'Yes! You can specify camera movements (push-in, pan, handheld), character actions, and mood in your motion prompt. Be specific about what you want—for example, "gentle push-in with soft lighting" or "dynamic action with fast camera movement".',
              },
              {
                question: 'How long does it take to generate a video from an image?',
                answer: 'Generation time typically ranges from 3-8 minutes depending on the model and motion complexity. Fast models generate quicker, while high-quality models take longer but produce more refined results. You can track progress in real-time.',
              },
              {
                question: 'Can I keep faces consistent across multiple videos?',
                answer: 'Yes! Our AI maintains facial consistency when generating videos from the same source image. This makes it perfect for creating multiple variations of the same character or person with different motions.',
              },
              {
                question: 'What video formats are supported?',
                answer: 'Videos are generated in MP4 format with high quality suitable for professional use. You can choose different aspect ratios (16:9, 9:16) optimized for various platforms like YouTube, Shorts, Reels, or TikTok.',
              },
              {
                question: 'How many variations can I generate from one image?',
                answer: 'You can generate unlimited variations from a single image! Each generation uses coins from your balance, so as long as you have sufficient coins, you can create as many different motion variations as you need to find the perfect result.',
              },
              {
                question: 'Is there a limit to image file size?',
                answer: 'We recommend images under 10MB for optimal processing. Higher resolution images generally produce better results, but very large files may take longer to process. Common formats like JPG, PNG, and WebP are all supported.',
              },
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* CTA Section - Vertical Stack Layout */}
        <div className="mt-20 mb-16">
          <div className="max-w-5xl mx-auto">
            <div className="bg-linear-to-b from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-3xl border border-emerald-500/20 overflow-hidden backdrop-blur-sm relative">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
              
              <div className="relative p-8 md:p-12 space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                  <div className="inline-block">
                    <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                      START CREATING
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    <span className="bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      Bring Your Images to Life
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                    Transform static photos into captivating animated videos with just a few clicks. 
                    Perfect for creators, marketers, and storytellers.
                  </p>
                </div>

                {/* Video Section - Centered */}
                <div className="relative">
                  <div className="aspect-video bg-[#0a0d12] rounded-2xl border-2 border-emerald-500/20 overflow-hidden group relative shadow-2xl shadow-emerald-500/10">
                    <video
                      className="w-full h-full object-cover"
                      src="/assets/video/dog_love.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-emerald-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/30 rounded-2xl transition-all duration-300"></div>
                  </div>
                </div>

                {/* CTA Button - Centered */}
                <div className="flex justify-center">
                  <button
                    onClick={scrollToTop}
                    className="group px-10 py-5 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl font-bold text-lg md:text-xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-3 hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Start Animating Now</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>

                {/* Features List - Horizontal Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm">Quick Start</p>
                    <p className="text-gray-400 text-xs">Easy to use</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-teal-500/5 border border-teal-500/10 hover:border-teal-500/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm">HD Quality</p>
                    <p className="text-gray-400 text-xs">High resolution</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm">Fast Render</p>
                    <p className="text-gray-400 text-xs">Quick results</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-sm">Secure</p>
                    <p className="text-gray-400 text-xs">Safe & private</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


