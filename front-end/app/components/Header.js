'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold gradient-text">V3 VideoGen AI</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a>
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Connect Wallet
            </button>
            <Link href="/generator">
              <button className="px-6 py-2.5 gradient-purple-blue text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                Launch App
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

