'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '../../../store/authStore';
import TopUpModal from '../modals/TopUpModal';

const ARC_TESTNET_FAUCETS = [
  { label: 'Circle Faucet', url: 'https://faucet.circle.com' },
  { label: 'Easy Faucet (Arc)', url: 'https://www.easyfaucetarc.xyz/' },
  { label: 'Oku Faucet', url: 'https://www.oku.xyz/faucet' },
];
const ARC_TESTNET = {
  chainIdDec: 5042002,
  chainIdHex: '0x4cef52',
  chainName: 'Arc Testnet',
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
  // Arc uses USDC as native gas.
  // Arc testnet returns native balance in 18-decimal base units (wei-like).
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
};

const formatUnits = (value, decimals) => {
  try {
    const v = BigInt(value);
    const d = BigInt(10) ** BigInt(decimals);
    const whole = v / d;
    const frac = v % d;
    const fracStr = frac.toString().padStart(decimals, '0').slice(0, 2); // show 2 decimals
    return `${whole.toString()}.${fracStr}`;
  } catch {
    return '0.00';
  }
};

export default function AppHeader() {
  const coinBalance = useAuthStore((state) => state.coinBalance);
  const walletAddress = useAuthStore((state) => state.walletAddress);
  const setWalletAddress = useAuthStore((state) => state.setWalletAddress);
  const openTopUpModal = useAuthStore((state) => state.openTopUpModal);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const ensureArcTestnet = useCallback(async () => {
    if (!window?.ethereum) throw new Error('MetaMask not found');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainIdHex }],
      });
    } catch (e) {
      // 4902 = unknown chain, so add then switch
      if (e?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ARC_TESTNET.chainIdHex,
              chainName: ARC_TESTNET.chainName,
              rpcUrls: ARC_TESTNET.rpcUrls,
              blockExplorerUrls: ARC_TESTNET.blockExplorerUrls,
              nativeCurrency: ARC_TESTNET.nativeCurrency,
            },
          ],
        });
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ARC_TESTNET.chainIdHex }],
        });
      } else {
        throw e;
      }
    }
  }, []);

  const refreshArcBalance = useCallback(async (address) => {
    if (!window?.ethereum || !address) return;
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(currentChainId || '');
      if (currentChainId?.toLowerCase() !== ARC_TESTNET.chainIdHex.toLowerCase()) return;
      const balHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      // Balance is returned as hex. Convert & format as "USDC-like" 6 decimals.
      const balBig = BigInt(balHex);
      const formatted = formatUnits(balBig, ARC_TESTNET.nativeCurrency.decimals);
      // We no longer show USDC balance in UI; this refresh is kept only to validate network connectivity.
      void formatted;
    } catch {
      // no-op
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        alert('MetaMask not found. Please install MetaMask to connect your wallet.');
        return;
      }

      // 1) Connect wallet
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        alert('No wallet account selected.');
        return;
      }
      const address = accounts[0];

      // 2) Switch/Add Arc Testnet
      await ensureArcTestnet();

      // 3) Store address + refresh balance
      setWalletAddress(address);
      await refreshArcBalance(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet / switch network. Please check MetaMask and try again.');
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

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const onAccountsChanged = (accounts) => {
      const next = accounts?.[0] || null;
      setWalletAddress(next);
      if (next) refreshArcBalance(next);
    };

    const onChainChanged = (nextChainId) => {
      setChainId(nextChainId || '');
      if (walletAddress) refreshArcBalance(walletAddress);
    };

    window.ethereum.on?.('accountsChanged', onAccountsChanged);
    window.ethereum.on?.('chainChanged', onChainChanged);
    // Initial chain id
    window.ethereum.request?.({ method: 'eth_chainId' }).then((id) => setChainId(id || '')).catch(() => {});

    // Auto-refresh balance while connected (helps after faucet top-up)
    const interval = setInterval(() => {
      if (walletAddress) refreshArcBalance(walletAddress);
    }, 5000);

    const onFocus = () => {
      if (walletAddress) refreshArcBalance(walletAddress);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.ethereum.removeListener?.('accountsChanged', onAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', onChainChanged);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [walletAddress, setWalletAddress, refreshArcBalance]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('header')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left Side: Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity shrink-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">PrimeStudio</h1>
          </Link>

          {/* Right Side: Coin Balance + Desktop Wallet & Faucet / Mobile Hamburger */}
          <div className="flex items-center gap-2 md:gap-2 lg:gap-3 shrink-0">
            {/* Coin Balance - Always Visible */}
            <button
              type="button"
              onClick={openTopUpModal}
              className="relative flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-gray-800/50 pl-1.5 sm:pl-2 pr-2 sm:pr-2.5 md:pr-3 py-1 sm:py-1.5 md:py-1.5 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors overflow-visible"
              title="Top up coins"
            >
              {/* Oversized 3D coin that intentionally overflows the pill */}
              <span className="relative">
                <Image
                  src="/assets/images/coin-3d.svg"
                  alt="Coin"
                  width={30}
                  height={30}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-[30px] md:h-[30px] -translate-y-1 drop-shadow-lg"
                />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white">{Number(coinBalance || 0)}</span>
              <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">Coins</span>
              <span className="text-[10px] sm:text-xs text-purple-300 hidden md:inline">Top Up</span>
            </button>
            {/* Desktop: Wallet & Faucet */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* Wallet Connection */}
              {walletAddress ? (
                <div
                  className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700 group relative"
                  title={walletAddress}
                >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-white font-mono">{formatAddress(walletAddress)}</span>
                {chainId && chainId.toLowerCase() !== ARC_TESTNET.chainIdHex.toLowerCase() && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300">
                    Wrong network
                  </span>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(walletAddress);
                    } catch {
                      // Fallback for older browsers
                      try {
                        const el = document.createElement('textarea');
                        el.value = walletAddress;
                        document.body.appendChild(el);
                        el.select();
                        document.execCommand('copy');
                        document.body.removeChild(el);
                      } catch {
                        // no-op
                      }
                    }
                  }}
                  className="ml-1 text-gray-400 hover:text-white transition-colors"
                  title="Copy wallet address"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h10a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 17H5a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v1" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => refreshArcBalance(walletAddress)}
                  className="ml-1 text-gray-400 hover:text-white transition-colors"
                  title="Refresh Arc testnet balance"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8a8 8 0 00-14.828-2M4 16a8 8 0 0014.828 2" />
                  </svg>
                </button>
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
                      <span className="text-xs text-gray-300">Connect (Arc Testnet)</span>
                    </>
                  )}
                </button>
              )}

              {/* Arc Testnet Faucet (with fallbacks) */}
              <div className="relative group">
                <a
                  href={ARC_TESTNET_FAUCETS[0].url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
                  title="Get USDC on Arc testnet (faucet)"
                >
                  <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16.5a4 4 0 004 4h2a4 4 0 004-4c0-1.657-.895-3-2-4-1.105-1-2-2.343-2-4a4 4 0 00-8 0c0 1.657-.895 3-2 4-1.105 1-2 2.343-2 4z"
                    />
                  </svg>
                  <span className="text-xs text-gray-300">Faucet</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>

                <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-black/90 backdrop-blur-md shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-2 text-[11px] text-gray-400 border-b border-white/10">
                    Arc Testnet USDC faucets
                  </div>
                  <div className="py-1">
                    {ARC_TESTNET_FAUCETS.map((f) => (
                      <a
                        key={f.url}
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block px-3 py-2 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                      >
                        {f.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-800 pt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {/* Wallet Connection */}
            {walletAddress ? (
              <div className="bg-gray-800/50 px-4 py-3 rounded-lg border border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-white font-mono">{formatAddress(walletAddress)}</span>
                  </div>
                  {chainId && chainId.toLowerCase() !== ARC_TESTNET.chainIdHex.toLowerCase() && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300">
                      Wrong network
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(walletAddress);
                      } catch {
                        try {
                          const el = document.createElement('textarea');
                          el.value = walletAddress;
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                        } catch {
                          // no-op
                        }
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors"
                    title="Copy wallet address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h10a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 17H5a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v1" />
                    </svg>
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      refreshArcBalance(walletAddress);
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors"
                    title="Refresh Arc testnet balance"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8a8 8 0 00-14.828-2M4 16a8 8 0 0014.828 2" />
                    </svg>
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      handleDisconnectWallet();
                      setIsMenuOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    title="Disconnect Wallet"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleConnectWallet();
                  setIsMenuOpen(false);
                }}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 bg-gray-800/50 px-4 py-3 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-gray-300">Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-gray-300">Connect Wallet (Arc Testnet)</span>
                  </>
                )}
              </button>
            )}

            {/* Arc Testnet Faucet */}
            <div className="space-y-1">
              <div className="px-4 py-2 text-xs text-gray-400">Arc Testnet Faucets</div>
              {ARC_TESTNET_FAUCETS.map((f) => (
                <a
                  key={f.url}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 hover:border-purple-500 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16.5a4 4 0 004 4h2a4 4 0 004-4c0-1.657-.895-3-2-4-1.105-1-2-2.343-2-4a4 4 0 00-8 0c0 1.657-.895 3-2 4-1.105 1-2 2.343-2 4z"
                    />
                  </svg>
                  <span className="text-sm text-gray-200">{f.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <TopUpModal />
    </header>
  );
}

