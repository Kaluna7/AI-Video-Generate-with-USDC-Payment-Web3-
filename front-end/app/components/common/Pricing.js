'use client';

import Link from 'next/link';

export default function Pricing() {
  const pricingInfo = [
    { type: 'Text to Video', tokens: '25', description: 'Generate videos from text prompts' },
    { type: 'Image to Video', tokens: '25', description: 'Animate static images with AI' },
    { type: 'Text to Image', tokens: '5', description: 'Create images from text descriptions' },
    { type: 'Image to Image', tokens: '5', description: 'Transform and enhance images' }
  ];

  return (
    <section
      id="pricing"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Pay Per Generation</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Simple pricing based on what you generate. No subscriptions, no hidden fees.
          </p>
          <p className="text-sm text-gray-400">
            1 USDC = 100 tokens • Pay only for successful generations
          </p>
        </div>

        {/* Pricing Table */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-modern rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Generation Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pricingInfo.map((item, index) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors duration-300 bg-white/5 hover:bg-white/10"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">{item.type}</h4>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-text">{item.tokens}</div>
                    <div className="text-xs text-gray-400">tokens</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-center">
                <Link href="/generator">
                  <button className="btn-3d px-8 py-3 gradient-purple-blue text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300">
                    Start Generating
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}