'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import PromptBarsStack from './PromptBarsStack';

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#06080c]/90 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/40 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left group"
      >
        <h4 className="text-xl md:text-2xl font-semibold text-white group-hover:text-purple-300 transition-colors pr-6">
          {question}
        </h4>
        <svg
          className={`w-6 h-6 md:w-7 md:h-7 text-gray-400 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-8 pb-6">
          <p className="text-base md:text-lg text-gray-300 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function TextToVideoSection() {
  const sectionRef = useRef(null);
  const scrollToTopRef = useRef(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const promptingBars = [
    {
      id: 1,
      headline: 'Accurately Convert Text to Video in Seconds',
      description: 'Enter a text prompt—whether it\'s a detailed description, a full script, or just a few keywords—PrimeStudio AI analyzes your input, understands your tone, and transforms it into the stunning video content you envisioned.',
      prompt: 'CG style, a stunning anime style character with vibrant colors',
      videoSrc: '/assets/video/city.mp4',
      videoTitle: 'Futuristic Cityscape',
      videoDuration: '10s',
      videoFormat: 'MP4',
    },
    {
      id: 2,
      headline: 'Fast, Seamless, and High-quality AI Video Generation',
      description: 'With instant previews and fast rendering, PrimeStudio lets you create more and wait less — the best text to video AI generator produces smooth, high-quality AI videos in no time.',
      prompt: 'A baby bird hides under its mother\'s protective wings during a storm',
      videoSrc: '/assets/video/ferrari.mp4',
      videoTitle: 'Nature Scene',
      videoDuration: '15s',
      videoFormat: 'HD',
    },
    {
      id: 3,
      headline: 'Customize with a Variety of Styles',
      description: 'Choose the AI video style you want to generate, whether it\'s Anime, Realistic, Cinematic, or Abstract. PrimeStudio offers diverse style options to match your creative vision.',
      prompt: 'Anime style character with vibrant purple hair and cherry blossoms',
      videoSrc: '/assets/video/stickman.mp4',
      videoTitle: 'Anime Style',
      videoDuration: '12s',
      videoFormat: 'MP4',
    },
  ];

  const reviews = [
    {
      name: 'Alya S.',
      role: 'Content Creator',
      text: 'Huge time-saver. From prompt to video in minutes—and the result looks premium.',
    },
    {
      name: 'Rizky P.',
      role: 'TikTok Editor',
      text: 'The previews make the workflow effortless. Iterate the prompt, ship the video.',
    },
    {
      name: 'Nadia K.',
      role: 'Brand Designer',
      text: 'Consistent style and clean output. Perfect for fast-turnaround campaigns.',
    },
    {
      name: 'Kevin M.',
      role: 'YouTube Shorts',
      text: 'Makes it easy to generate multiple variations without touching a timeline.',
    },
    {
      name: 'Salsa R.',
      role: 'Freelance Marketer',
      text: 'Simple UI, strong results. My clients love how fast we can test concepts.',
    },
    {
      name: 'Dimas H.',
      role: 'UGC Creator',
      text: 'Tried it once and got hooked. The output is ready to post.',
    },
  ];

  // Showcase images data - Fill this array with your images
  // Each item should have: id, imageUrl (path to image), title, and description
  // Images will be displayed in a beautiful grid with hover effects
  const showcaseImages = [
    {
      id: 1,
      imageUrl: '/assets/images/showcase-video-1.jpg', // Replace with your image path
      title: 'Professional Content', // Add your title here
      description: 'Create stunning professional videos with AI-powered generation', // Add your description here
    },
    {
      id: 2,
      imageUrl: '/assets/images/showcase-video-2.jpg', // Replace with your image path
      title: 'Creative Workspaces', // Add your title here
      description: 'Design inspiring video content for creative environments', // Add your description here
    },
    {
      id: 3,
      imageUrl: '/assets/images/showcase-video-3.jpg', // Replace with your image path
      title: 'Lifestyle Videos', // Add your title here
      description: 'Capture beautiful lifestyle moments and everyday scenes', // Add your description here
    },
    {
      id: 4,
      imageUrl: '/assets/images/showcase-video-4.jpg', // Replace with your image path
      title: 'Business Content', // Add your title here
      description: 'Professional business videos and corporate content', // Add your description here
    },
    {
      id: 5,
      imageUrl: '/assets/images/showcase-video-5.jpg', // Replace with your image path
      title: 'Digital Art Videos', // Add your title here
      description: 'Express your creativity with digital art and visual effects', // Add your description here
    },
  ];

  const Stars = ({ count = 5 }) => (
    <div className="flex items-center gap-1" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-yellow-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.43 8.81c-.783-.57-.38-1.81.588-1.81H6.48a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const ReviewCard = ({ r }) => (
    <div className="w-[320px] sm:w-[360px] shrink-0 rounded-2xl border border-white/10 bg-[#06080c]/90 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{r.name}</p>
          <p className="text-xs text-gray-400">{r.role}</p>
        </div>
        <Stars />
      </div>
      <p className="mt-3 text-sm text-gray-300 leading-relaxed">“{r.text}”</p>
    </div>
  );

  return (
    <div ref={sectionRef} className="w-full relative">
      {/* Header Section */}
      <div className="text-center mb-16 pt-8">
        <h2 className="text-4xl md:text-5xl font-bold">
          <span className="text-purple-400">From Idea to Impact — </span>
          <span className="text-orange-400">AI Video Generation Without Limits</span>
        </h2>
        <div className="mt-6 ps-marquee">
          <div className="ps-marquee__track">
            <div className="flex items-center gap-5">
              <span className="text-sm text-gray-300 whitespace-nowrap">Turn ideas into videos in minutes</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Cinematic motion, studio-ready results</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">High-quality Veo 3.1 generation</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Fast previews, smoother iterations</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Perfect for Shorts, Reels, and TikTok</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Choose aspect ratio: 16:9, 9:16, or Auto</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">From prompt to playable video—no timeline needed</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Create, refine, and generate on demand</span>
            </div>
            {/* duplicate for seamless loop */}
            <div className="flex items-center gap-5" aria-hidden="true">
              <span className="text-sm text-gray-300 whitespace-nowrap">Turn ideas into videos in minutes</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Cinematic motion, studio-ready results</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">High-quality Veo 3.1 generation</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Fast previews, smoother iterations</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Perfect for Shorts, Reels, and TikTok</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Choose aspect ratio: 16:9, 9:16, or Auto</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">From prompt to playable video—no timeline needed</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-300 whitespace-nowrap">Create, refine, and generate on demand</span>
            </div>
          </div>
        </div>
      </div>

      <PromptBarsStack items={promptingBars} />

      {/* How it works */}
      <div className="mt-16 mb-18">
        <div className="text-center">
          <h3 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
            How to use PrimeStudio
          </h3>
          <p className="mt-3 text-gray-400">
            Generate studio-ready videos in a simple, repeatable workflow.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#06080c]/90 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                1
              </div>
              <p className="text-white font-semibold">Enter a text prompt</p>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Describe your scene, style, and motion. Paste a script or a few keywords—PrimeStudio turns it into a clean prompt-ready input.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Tip: Add camera moves, lighting, and mood for better results.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#06080c]/90 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 font-bold">
                2
              </div>
              <p className="text-white font-semibold">Choose Veo settings</p>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Pick your model and aspect ratio (16:9 / 9:16)—optimized for Shorts, Reels, TikTok, or widescreen.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Recommended: 9:16 for social, 16:9 for YouTube.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#06080c]/90 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold">
                3
              </div>
              <p className="text-white font-semibold">Generate & preview</p>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Start generation and watch the status update in real time. Preview the output, then iterate quickly by tweaking your prompt.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Faster iterations = better creative direction.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#06080c]/90 p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold">
                4
              </div>
              <p className="text-white font-semibold">Save, download, share</p>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Your successful generations are saved automatically to <span className="text-white font-semibold">Recent Generations</span> and <span className="text-white font-semibold">My Videos</span> so you can reuse or download anytime.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              Build a library of reusable styles and prompts.
            </div>
          </div>
        </div>
      </div>

      {/* Reviews header */}
      <div className="mt-20 mb-10 text-center">
        <h3 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
          Loved by creators who ship fast
        </h3>
        <p className="mt-3 text-gray-400">
          Join <span className="text-white font-semibold">10,000+</span> creators turning prompts into polished videos—and sharing their results.
        </p>
      </div>

      {/* Reviews marquee */}
      <div className="space-y-4 mb-16">
        <div className="ps-marquee" style={{ '--ps-marquee-duration': '28s' }}>
          <div className="ps-marquee__track">
            <div className="flex items-stretch gap-4">
              {reviews.map((r, idx) => (
                <ReviewCard key={`r1-${idx}`} r={r} />
              ))}
            </div>
            <div className="flex items-stretch gap-4" aria-hidden="true">
              {reviews.map((r, idx) => (
                <ReviewCard key={`r1dup-${idx}`} r={r} />
              ))}
            </div>
          </div>
        </div>

        <div className="ps-marquee" style={{ '--ps-marquee-duration': '34s', '--ps-marquee-direction': 'reverse' }}>
          <div className="ps-marquee__track">
            <div className="flex items-stretch gap-4">
              {reviews.slice().reverse().map((r, idx) => (
                <ReviewCard key={`r2-${idx}`} r={r} />
              ))}
            </div>
            <div className="flex items-stretch gap-4" aria-hidden="true">
              {reviews.slice().reverse().map((r, idx) => (
                <ReviewCard key={`r2dup-${idx}`} r={r} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Grid - Below Auto Scrolling Reviews */}
      <div className="mb-12 mt-10">
        {/* Showcase Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            <span className="bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
              AI Video Generator
            </span>
            <span className="text-white"> — </span>
            <span className="bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
              Ready for Anything
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Transform your ideas into stunning videos in seconds
          </p>
        </div>

        {/* Showcase Grid - 2 rows, 3 cols: 1 big left (col 1, row 1-2), 4 small right (col 2-3, row 1-2) */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-3 md:gap-4 lg:gap-5 items-center">
          {showcaseImages.map((item, index) => {
            // First image: big on left, spans 2 rows in column 1
            // Next 4 images: small on right, 2x2 grid in columns 2-3
            const isBigImage = index === 0;
            const isSmallImage = index > 0 && index <= 4;
            
            // Calculate grid position for small images (2x2 grid in columns 2-3)
            let gridStyles = {};
            
            if (isBigImage) {
              // Big image: column 1, spans rows 1-2
              gridStyles = {
                gridColumn: '1 / 2',
                gridRow: '1 / 3',
              };
            } else if (isSmallImage) {
              const smallIndex = index - 1; // 0-3 for the 4 small images
              // Position in 2x2 grid: (0,0), (1,0), (0,1), (1,1)
              const gridCol = smallIndex % 2; // 0 or 1
              const gridRow = Math.floor(smallIndex / 2); // 0 or 1
              const colStart = 2 + gridCol; // Column 2 or 3
              const rowStart = 1 + gridRow; // Row 1 or 2
              gridStyles = {
                gridColumn: `${colStart} / ${colStart + 1}`,
                gridRow: `${rowStart} / ${rowStart + 1}`,
              };
            }
            
            return (
              <div
                key={item.id}
                className={`group relative rounded-xl md:rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-[1.05] hover:z-10 hover:shadow-2xl hover:shadow-purple-500/30 ${
                  isBigImage 
                    ? 'md:row-span-2 md:col-span-1 md:self-center aspect-[3/4] md:aspect-[2/3] md:max-h-[550px]' 
                    : isSmallImage
                    ? 'aspect-square'
                    : 'aspect-square'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  ...gridStyles,
                }}
              >
                {/* Image Background with Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-blue-500/40 to-cyan-500/40 overflow-hidden">
                  {/* Actual Image - Use Next.js Image for optimization */}
                  {item.imageUrl && !item.imageUrl.includes('showcase-video-') ? (
                    <div className="relative w-full h-full">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </div>
                  ) : (
                    // Placeholder gradient when no image is provided
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/50 via-blue-600/50 to-cyan-600/50 opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                  )}
                  
                  {/* Pattern overlay for visual interest */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" 
                    style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '24px 24px',
                    }}
                  ></div>
                </div>

                {/* Hover Overlay with Title and Description */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-5">
                  <div className="transform translate-y-6 group-hover:translate-y-0 transition-all duration-500">
                    {/* Title */}
                    <h3 className="text-white font-bold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
                      {item.title}
                    </h3>
                    {/* Description */}
                    <p className="text-gray-300 text-xs md:text-sm line-clamp-3 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {item.description}
                    </p>
                    
                    {/* Action Indicator */}
                    <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                      <span className="text-purple-400 text-xs font-medium">Explore</span>
                      <svg className="w-4 h-4 text-purple-400 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Decorative Corner Accents */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tr-full"></div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                {/* Border Glow Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/50 transition-all duration-500"></div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 mb-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h3>
          <p className="text-lg md:text-xl text-gray-400">
            Everything you need to know about Text to Video generation
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {[
            {
              question: 'How does Text to Video AI work?',
              answer: 'Text to Video AI uses advanced machine learning models to understand your text description and generate corresponding video content. Simply enter a detailed prompt describing the scene, style, and motion you want, and our AI will create a high-quality video that matches your vision.',
            },
            {
              question: 'What video formats and aspect ratios are supported?',
              answer: 'We support multiple aspect ratios including 16:9 (widescreen), 9:16 (vertical for Shorts/Reels/TikTok), and Auto. Videos are generated in MP4 format with high quality output suitable for professional use.',
            },
            {
              question: 'How long does it take to generate a video?',
              answer: 'Generation time depends on the model you choose and video length. Fast models (like veo3-fast) typically take 2-5 minutes, while high-quality models may take 10-20 minutes. You can track progress in real-time through the preview panel.',
            },
            {
              question: 'What makes PrimeStudio different from other AI video generators?',
              answer: 'PrimeStudio offers multiple AI models (including Veo 3.1), fast previews, seamless iteration, and studio-ready output quality. Our platform is optimized for creators who need to ship content quickly without compromising on quality.',
            },
            {
              question: 'Can I customize the style and motion of generated videos?',
              answer: 'Yes! You can specify style preferences (Anime, Realistic, Cinematic, Abstract) and motion details in your prompt. Adding camera movements, lighting descriptions, and mood indicators in your text prompt will help the AI generate videos that match your creative vision.',
            },
            {
              question: 'How are coins deducted for video generation?',
              answer: 'Coins are deducted from your in-app balance based on the model you choose. Fast models cost fewer coins (e.g., 25 coins), while high-quality models cost more (e.g., 180 coins). You can top up your balance anytime through the Top Up button in the header.',
            },
            {
              question: 'Can I edit or modify a generated video?',
              answer: 'Currently, you can regenerate videos by tweaking your prompt and generating again. All your successful generations are automatically saved to "Recent Generations" and "My Videos" for easy access and reuse.',
            },
            {
              question: 'Is there a limit to how many videos I can generate?',
              answer: 'There\'s no hard limit on the number of videos you can generate. As long as you have sufficient coins in your balance, you can create unlimited videos. Generate as many variations as you need to find the perfect result!',
            },
          ].map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {/* CTA Section with Video */}
      <div className="mt-20 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/60 via-gray-800/40 to-gray-900/60 rounded-3xl border border-gray-700/50 overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center p-8 md:p-12">
              {/* Left: Video */}
              <div className="relative order-2 lg:order-1">
                <div className="aspect-video bg-[#0a0d12] rounded-2xl border border-white/10 overflow-hidden group relative shadow-2xl">
                  <video
                    className="w-full h-full object-cover"
                    src="/assets/video/samoyed_ball.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Right: Text & CTA */}
              <div className="order-1 lg:order-2 space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    <span className="bg-linear-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
                      Ready to Create?
                    </span>
                    <br />
                    <span className="text-white">Start Generating Your Video Now</span>
                  </h2>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-2">
                    Transform your creative ideas into stunning videos with our powerful AI technology. 
                    No complex software, no lengthy timelines—just your imagination and our AI.
                  </p>
                  <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                    Join thousands of creators who are already using PrimeStudio to bring their visions to life. 
                    Generate professional-quality videos in minutes, not hours.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={scrollToTop}
                    className="group px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl font-bold text-lg md:text-xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate Now</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm md:text-base">Fast Generation</p>
                      <p className="text-gray-400 text-xs md:text-sm">Get videos in minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm md:text-base">High Quality</p>
                      <p className="text-gray-400 text-xs md:text-sm">Studio-ready output</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm md:text-base">Easy to Use</p>
                      <p className="text-gray-400 text-xs md:text-sm">No technical skills needed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm md:text-base">Multiple Styles</p>
                      <p className="text-gray-400 text-xs md:text-sm">Anime, Realistic, Cinematic</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        ref={scrollToTopRef}
        onClick={scrollToTop}
        className="fixed right-8 bottom-8 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors shadow-lg z-50"
        aria-label="Scroll to top"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}

