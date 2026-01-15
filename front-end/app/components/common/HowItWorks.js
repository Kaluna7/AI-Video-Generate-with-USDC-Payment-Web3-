'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Connect Wallet',
      description: 'Connect your Web3 wallet and fund it with USDC. Our platform supports all major wallets including MetaMask, WalletConnect, and more.',
    },
    {
      number: '2',
      title: 'Create Prompt',
      description: 'Enter your text prompt or upload an image. Customize settings like duration, quality, and style to match your vision.',
    },
    {
      number: '3',
      title: 'Generate & Download',
      description: 'Pay with USDC and watch as our AI generates your video. Download your high-quality video instantly when ready.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Generate videos in 3 simple steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 border-t-2 border-dashed border-gray-700"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition-all">
                <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 mx-auto">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

