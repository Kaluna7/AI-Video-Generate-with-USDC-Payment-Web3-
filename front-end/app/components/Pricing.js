'use client';

import Link from 'next/link';

export default function Pricing() {
  const plans = [
    {
      name: 'Text to Video',
      price: '$2',
      popular: false,
      features: [
        'Up to 5 seconds',
        '1080p quality',
        'Commercial use',
        'Instant generation',
      ],
    },
    {
      name: 'Image to Video',
      price: '$3',
      popular: true,
      features: [
        'Up to 5 seconds',
        '1080p quality',
        'Commercial use',
        'Advanced AI model',
      ],
    },
    {
      name: 'Extended',
      price: '$5',
      popular: false,
      features: [
        'Up to 10 seconds',
        '4K quality',
        'Commercial use',
        'Priority processing',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Simple Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Pay only for what you generate. No hidden fees.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-gray-800/50 rounded-xl p-8 border-2 transition-all ${
                plan.popular
                  ? 'border-purple-500 scale-105'
                  : 'border-gray-700 hover:border-purple-500'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="gradient-purple-blue text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 ml-2">per generation</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3" style={{ color: '#a855f7' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link href="/generator">
                <button className={`w-full py-3 rounded-lg font-semibold transition-opacity ${
                  plan.popular
                    ? 'gradient-purple-blue text-white hover:opacity-90'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}>
                  Get Started
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

