'use client';

export default function Footer() {

  const footerLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' }
  ];

  return (
    <footer className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8" style={{ minHeight: '500px' }}>
      {/* Fullscreen Video Background */}
      <div className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        <video
          src="/assets/video/plane_jupiter.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Main Content */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Ready to Create</span>
            <br />
            <span className="text-white">Something Amazing?</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Join thousands of creators who trust PrimeStudio for their AI content generation needs.
            Start creating stunning videos and images today.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center items-center mb-12">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn-3d px-8 py-4 gradient-purple-blue text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
            >
              Start Creating Now
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">10K+</div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">1M+</div>
            <div className="text-gray-400 text-sm">Videos Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">500K+</div>
            <div className="text-gray-400 text-sm">Images Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">99.9%</div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Brand */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold gradient-text mb-4">PrimeStudio</h3>
              <p className="text-gray-400 text-sm mb-4">
                All-in-one AI content generation platform. Create stunning videos and images from text or images.
                Powered by Sora AI. Pay per generation with coins.
              </p>
              <div className="text-gray-400 text-sm">
                <p className="mb-1">📍 Denpasar, Bali, Indonesia</p>
              </div>
            </div>

            {/* Navigation Links - Following Header Structure */}
            <div className="text-center">
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm hover:bg-white/5 px-3 py-1 rounded-lg block"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 PrimeStudio. All rights reserved. Made with ❤️ in Bali
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
