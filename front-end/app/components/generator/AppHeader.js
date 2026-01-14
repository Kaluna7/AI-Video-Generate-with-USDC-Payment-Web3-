'use client';

import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold gradient-text">AI Video Generator</h1>
            <p className="text-sm text-gray-400 hidden md:block">Create stunning videos with AI.</p>
          </Link>

          {/* User Balance & Profile */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
              <span className="text-lg font-semibold text-white">125.50</span>
              <span className="text-sm text-gray-400">USDC</span>
            </div>
            <div className="w-10 h-10 rounded-full gradient-purple-blue flex items-center justify-center">
              <span className="text-white font-semibold">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

