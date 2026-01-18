'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Pricing() {
  const sectionRef = useRef(null);
  const [visibleSteps, setVisibleSteps] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleSteps((prev) => [...prev, index]);
          }
        });
      },
      { threshold: 0.2 }
    );

    const steps = sectionRef.current?.querySelectorAll('.step-item');
    steps?.forEach((step) => observer.observe(step));

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: '1',
      title: 'Top Up Coins',
      description: 'Top up your account with USDC to get coins. 1 USDC = 100 coins.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: '2',
      title: 'Choose Generation Type',
      description: 'Select Text to Video or Image to Video. Each generation costs coins based on quality.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      number: '3',
      title: 'Generate Video',
      description: 'Enter your prompt or upload image. Coins will be deducted when generation starts.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      number: '4',
      title: 'Download Video',
      description: 'Once generation is complete, download your high-quality video instantly.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
  ];

  const pricingInfo = [
    {
      type: 'Text to Video',
      coins: '25',
      features: ['Fast generation', '1080p quality', 'Up to 5 seconds'],
    },
    {
      type: 'Image to Video',
      coins: '25',
      features: ['Fast AI model', '1080p quality', 'Up to 5 seconds'],
    },
    {
      type: 'Premium Quality',
      coins: '180',
      features: ['High-quality AI', '4K quality', 'Up to 10 seconds', 'Priority processing'],
    },
  ];

  return (
    <section 
      ref={sectionRef}
      id="pricing" 
      className="py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="container mx-auto">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">How to Generate Videos</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Generate stunning AI videos using coins. Simple, fast, and transparent.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const isVisible = visibleSteps.includes(index);
            return (
              <div
                key={index}
                data-index={index}
                className={`step-item ${
                  isVisible ? 'fade-in-up scale-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="glass-modern rounded-2xl p-6 border border-gray-700/50 card-hover-3d h-full text-center">
                  <div className="w-14 h-14 rounded-xl gradient-purple-blue flex items-center justify-center mx-auto mb-4 text-white">
                    {step.icon}
                  </div>
                  <div className="w-8 h-8 rounded-full gradient-purple-blue flex items-center justify-center mx-auto mb-4 text-white text-sm font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coin Pricing Info */}
        <div className="max-w-4xl mx-auto fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="glass-modern rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Coin Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50"
                >
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-white mb-2">{info.type}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold gradient-text">{info.coins}</span>
                      <span className="text-gray-400">coins</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {info.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link href="/generator">
            <button className="btn-3d px-8 py-4 gradient-purple-blue text-white rounded-xl font-semibold text-lg">
              Start Generating Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
