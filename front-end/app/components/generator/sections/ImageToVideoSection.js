'use client';

import { useState } from 'react';
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

export default function ImageToVideoSection() {
  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Showcase images data - Fill this array with your images
  // Each item should have: id, imageUrl (path to image), title, and description
  // Images will be displayed in a beautiful grid with hover effects
  const showcaseImages = [
    {
      id: 1,
      imageUrl: '/assets/images/showcase-image-video-1.jpg', // Replace with your image path
      title: 'Portrait Animation', // Add your title here
      description: 'Bring static portraits to life with natural motion and expressions', // Add your description here
    },
    {
      id: 2,
      imageUrl: '/assets/images/showcase-image-video-2.jpg', // Replace with your image path
      title: 'Product Showcase', // Add your title here
      description: 'Transform product photos into engaging video advertisements', // Add your description here
    },
    {
      id: 3,
      imageUrl: '/assets/images/showcase-image-video-3.jpg', // Replace with your image path
      title: 'Scene Animation', // Add your title here
      description: 'Add cinematic motion to any scene or landscape image', // Add your description here
    },
    {
      id: 4,
      imageUrl: '/assets/images/showcase-image-video-4.jpg', // Replace with your image path
      title: 'Character Movement', // Add your title here
      description: 'Animate characters with realistic movement and gestures', // Add your description here
    },
    {
      id: 5,
      imageUrl: '/assets/images/showcase-image-video-5.jpg', // Replace with your image path
      title: 'Dynamic Transitions', // Add your title here
      description: 'Create smooth transitions and camera movements from still images', // Add your description here
    },
  ];

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
              {[
                { n: '01', t: 'Upload an image', d: 'Start from a portrait, product, or scene. Clean inputs yield the best motion.' },
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
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 p-4 flex items-center justify-center">
                    <Image
                      src="/assets/images/coin-3d.svg"
                      alt="Source"
                      width={280}
                      height={280}
                      className="w-28 h-28 md:w-32 md:h-32 drop-shadow-2xl"
                    />
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

        {/* Showcase Grid - Horizontal Card Layout */}
        <div className="mt-20 mb-16">
          {/* Showcase Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              <span className="bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                From Still to Motion
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Watch your images come alive with AI-powered animation and motion
            </p>
          </div>

          {/* Showcase Grid - Horizontal Scrollable Cards */}
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
              {showcaseImages.map((item, index) => {
                return (
                  <div
                    key={item.id}
                    className="group relative min-w-[280px] md:min-w-[320px] lg:min-w-[360px] aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.03] hover:z-10 hover:shadow-2xl hover:shadow-emerald-500/30 snap-start"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Image Background with Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/30 via-teal-500/30 to-cyan-500/30 overflow-hidden">
                      {item.imageUrl && !item.imageUrl.includes('showcase-image-video-') ? (
                        <div className="relative w-full h-full">
                          <Image 
                            src={item.imageUrl} 
                            alt={item.title} 
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700" 
                            sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px"
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-600/40 via-teal-600/40 to-cyan-600/40 opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                      )}
                      
                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 bg-linear-to-br from-emerald-400/0 via-teal-400/0 to-cyan-400/0 group-hover:from-emerald-400/10 group-hover:via-teal-400/10 group-hover:to-cyan-400/10 transition-all duration-500"></div>
                    </div>

                    {/* Hover Overlay with Title and Description - Side Panel Style */}
                    <div className="absolute inset-0 bg-linear-to-r from-black/0 via-black/0 to-black/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center items-end p-5 md:p-6">
                      <div className="w-full max-w-[80%] transform translate-x-8 group-hover:translate-x-0 transition-all duration-500">
                        <div className="mb-3">
                          <div className="w-12 h-1 bg-linear-to-r from-emerald-400 to-cyan-400 rounded-full mb-3"></div>
                          <h3 className="text-white font-bold text-lg md:text-xl mb-2 group-hover:text-emerald-300 transition-colors duration-300">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                          <span className="text-emerald-400 text-sm font-medium">Learn More</span>
                          <svg className="w-5 h-5 text-emerald-400 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Top Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="text-xs font-medium text-emerald-300">Animated</span>
                    </div>

                    {/* Bottom Gradient Accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-500/50 transition-all duration-500"></div>
                  </div>
                );
              })}
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
                      src="/assets/video/samoyed_ball.mp4"
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


