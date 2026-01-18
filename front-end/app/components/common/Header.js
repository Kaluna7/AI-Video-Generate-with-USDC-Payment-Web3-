'use client';

import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';

export default function Header() {
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'glass-modern shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text fade-in-up">
              PrimeStudio
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {['Home', 'Features', 'Pricing'].map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 relative group fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="relative z-10">{item}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Action Button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => openAuthModal('login')}
              className="btn-3d px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5 gradient-purple-blue text-white rounded-lg text-xs sm:text-sm md:text-base font-medium fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <span className="hidden sm:inline">Launch App</span>
              <span className="sm:hidden">Launch</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 space-y-1 fade-in-up">
            {['Home', 'Features', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
