'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';

export default function AppHeader() {
  const usdcBalance = useAuthStore((state) => state.usdcBalance);
  const walletAddress = useAuthStore((state) => state.walletAddress);
  const setUsdcBalance = useAuthStore((state) => state.setUsdcBalance);
  const setWalletAddress = useAuthStore((state) => state.setWalletAddress);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection (replace with actual Web3 wallet integration)
    // For now, we'll simulate a MetaMask-like connection
    try {
      // Check if MetaMask is installed (for future integration)
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          
          // Fetch USDC balance from wallet (for future Web3 integration)
          // For now, keep existing balance
        }
      } else {
        // Simulate wallet connection for demo
        const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
        setWalletAddress(mockAddress);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please make sure MetaMask is installed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    // Keep balance even after disconnect
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold gradient-text">PrimeStudio</h1>
          </Link>

          {/* Right Side - USDC Balance & Wallet */}
          <div className="flex items-center gap-3">
            {/* USDC Balance Display */}
            <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-white">{usdcBalance.toFixed(2)}</span>
                <span className="text-xs text-gray-400">USDC</span>
              </div>
            </div>

            {/* Wallet Connection */}
            {walletAddress ? (
              <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700 group relative">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-white font-mono hidden sm:inline">{formatAddress(walletAddress)}</span>
                <span className="text-xs text-white font-mono sm:hidden">{formatAddress(walletAddress)}</span>
                <button
                  onClick={handleDisconnectWallet}
                  className="ml-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Disconnect Wallet"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 bg-gray-800/50 px-4 py-1.5 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs text-gray-300">Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-xs text-gray-300 hidden sm:inline">Connect Wallet</span>
                    <span className="text-xs text-gray-300 sm:hidden">Connect</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

