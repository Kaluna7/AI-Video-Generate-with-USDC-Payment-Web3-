'use client';

import { useEffect, useRef, useState } from 'react';

export default function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: '100+', label: 'Countries', sub: 'Creators worldwide using the studio' },
    { value: '98%', label: 'Satisfaction', sub: 'Average session rating across projects' },
    { value: '3.2M+', label: 'Subscribers', sub: 'Audiences reached with AI-first content' },
    { value: '6.7M+', label: 'Users', sub: 'Teams, agencies, and solo builders' },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="glass-modern rounded-3xl border border-white/10 px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-200 mb-3">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-glow" />
                Trusted by creators worldwide
              </p>
              <h3 className="text-2xl md:text-3xl font-semibold text-white">
                Proof that AI-native studios can ship at human speed
              </h3>
            </div>
            <p className="text-xs md:text-sm text-gray-400 max-w-sm">
              Metrics update continuously as new videos and images are generated across the platform.
              Use them as a benchmark for your own growth.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`glass-modern rounded-2xl p-5 md:p-6 text-left md:text-center card-hover-3d ${
                  isVisible ? 'fade-in-up scale-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-300 mb-1">
                  {stat.label}
                </div>
                {stat.sub && (
                  <p className="text-[11px] md:text-xs text-gray-500 leading-snug">
                    {stat.sub}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
