'use client';

import { useEffect, useRef, useState } from 'react';

export default function HowItWorks() {
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
      { threshold: 0.3 }
    );

    const cards = sectionRef.current?.querySelectorAll('.step-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: '1',
      title: 'Sign In',
      description: 'Sign in with your account to start generating videos and images instantly.',
    },
    {
      number: '2',
      title: 'Create Prompt',
      description: 'Enter your text prompt or upload an image. Customize settings like duration, quality, and style to match your vision.',
    },
    {
      number: '3',
      title: 'Generate & Download',
      description: 'Watch as our AI generates your content. Download your high-quality video or image instantly when ready.',
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Generate videos in 3 simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          
          {steps.map((step, index) => {
            const isVisible = visibleSteps.includes(index);
            return (
              <div
                key={index}
                data-index={index}
                className={`step-card relative ${
                  isVisible ? 'fade-in-up scale-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="glass-modern rounded-2xl p-8 border border-white/5 card-hover-3d text-center">
                  <div className="w-20 h-20 gradient-purple-blue rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6 mx-auto pulse-glow">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>

                  {step.title === 'Connect Wallet' && (
                    <div className="mt-6 grid grid-cols-1 gap-3">
                      <div className="glass-modern rounded-xl p-4 border border-white/5">
                        <p className="font-semibold gradient-text mb-2">Arc</p>
                        <p className="text-sm text-gray-300 leading-relaxed mb-3">
                          Arc is an EVM-compatible Layer-1 blockchain using USDC as native gas, built for stablecoin finance,
                          tokenization, and global payments across scalable & transparent networks.
                        </p>
                        <a
                          href="https://docs.arc.network/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          👉 Read more about Arc
                        </a>
                        <div className="mt-2 space-y-1">
                          <a
                            href="https://faucet.circle.com"
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            💧 Testnet faucet — Circle
                          </a>
                          <a
                            href="https://www.easyfaucetarc.xyz/"
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            💧 Testnet faucet — Easy Faucet
                          </a>
                          <a
                            href="https://www.oku.xyz/faucet"
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            💧 Testnet faucet — Oku
                          </a>
                        </div>
                      </div>

                      <div className="glass-modern rounded-xl p-4 border border-white/5">
                        <p className="font-semibold gradient-text mb-2">Circle</p>
                        <p className="text-sm text-gray-300 leading-relaxed mb-3">
                          Circle is a global fintech company behind USDC, providing regulated, transparent, and programmable digital money
                          infrastructure for businesses and developers.
                        </p>
                        <a
                          href="https://www.circle.com/en/usdc"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          👉 Read more about Circle
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
