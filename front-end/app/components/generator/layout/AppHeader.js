'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import TopUpModal from '../modals/TopUpModal';
import SidebarNav from './SidebarNav';
import { useRouter } from 'next/navigation';

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

function AppHeaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const coinBalance = useAuthStore((state) => state.coinBalance);
  const walletAddress = useAuthStore((state) => state.walletAddress);
  const setWalletAddress = useAuthStore((state) => state.setWalletAddress);
  const openTopUpModal = useAuthStore((state) => state.openTopUpModal);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  
  // Get current view from URL params
  const currentView = searchParams.get('view') || 'home';

  // Navigation handlers for mobile sidebar
  const handleNavigateToHome = () => {
    try {
      router.push('/generator');
      setIsMenuOpen(false);
    } catch (error) {
      // Fallback: use window.location for mobile
      window.location.href = '/generator';
    }
  };

  const handleNavigateToInspiration = () => {
    try {
      router.push('/generator?view=inspiration');
      setIsMenuOpen(false);
    } catch (error) {
      window.location.href = '/generator?view=inspiration';
    }
  };

  const handleNavigateToMyVideos = () => {
    try {
      router.push('/generator?view=my-videos');
      setIsMenuOpen(false);
    } catch (error) {
      window.location.href = '/generator?view=my-videos';
    }
  };

  const handleNavigateToMyImages = () => {
    try {
      router.push('/generator?view=my-images');
      setIsMenuOpen(false);
    } catch (error) {
      window.location.href = '/generator?view=my-images';
    }
  };

  const handleNavigateToText = () => {
    try {
      router.push('/generator?view=text-to-video');
      setIsMenuOpen(false);
    } catch (error) {
      window.location.href = '/generator?view=text-to-video';
    }
  };

  const handleNavigateToImage = () => {
    try {
      router.push('/generator?view=image-to-video');
      setIsMenuOpen(false);
    } catch (error) {
      window.location.href = '/generator?view=image-to-video';
    }
  };

  const handleNavigateToTextImage = () => {
    try {
      router.push('/generator?view=text-to-image');
      setIsMenuOpen(false);
    } catch (error) {
      window.location.href = '/generator?view=text-to-image';
    }
  };

  const handleNavigateToImageImage = () => {
    try {
      router.push('/generator?view=image-to-image');
      setIsMenuOpen(false);
    } catch (error) {
      window.location.href = '/generator?view=image-to-image';
    }
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      document.cookie = 'access_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    }
    router.push('/');
    setIsMenuOpen(false);
  };

  const initials =
    (user?.full_name && user.full_name.trim()[0]?.toUpperCase()) ||
    (user?.email && user.email.trim()[0]?.toUpperCase()) ||
    'U';

  // Navigation items (same as SidebarNav)
  const navItems = [
    { label: 'Home', icon: HomeIcon, view: 'home', onClick: handleNavigateToHome },
    { label: 'Inspiration', icon: SparklesIcon, view: 'inspiration', onClick: handleNavigateToInspiration },
    { label: 'My Videos', icon: VideoIcon, view: 'my-videos', onClick: handleNavigateToMyVideos },
    { label: 'My Images', icon: ImageIcon, view: 'my-images', onClick: handleNavigateToMyImages },
  ];

  const aiItems = [
    { label: 'Text to Video', icon: TextIcon, view: 'text-to-video', onClick: handleNavigateToText },
    { label: 'Image to Video', icon: ImageIcon, view: 'image-to-video', onClick: handleNavigateToImage },
  ];

  const imageItems = [
    { label: 'Text to Image', icon: ImageIcon, view: 'text-to-image', onClick: handleNavigateToTextImage },
    { label: 'Image to Image', icon: TransformIcon, view: 'image-to-image', onClick: handleNavigateToImageImage },
  ];

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
    <>
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
            <div className="hidden lg:flex items-center gap-2 lg:gap-3">
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
                <div className="relative">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(walletAddress);
                        setShowCopySuccess(true);
                        setTimeout(() => setShowCopySuccess(false), 2000);
                      } catch {
                        // Fallback for older browsers
                        try {
                          const el = document.createElement('textarea');
                          el.value = walletAddress;
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                          setShowCopySuccess(true);
                          setTimeout(() => setShowCopySuccess(false), 2000);
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
                  {/* Copy Success Toast */}
                  {showCopySuccess && (
                    <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-green-500/90 text-white text-xs rounded-lg shadow-lg z-50 animate-in fade-in duration-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </div>
                    </div>
                  )}
                </div>
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

              {/* Arc Testnet Faucet - Direct Link */}
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
              </a>
            </div>

            {/* Mobile: Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
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
      </div>

      {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 pb-3 border-t border-gray-800 pt-3 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="space-y-3 px-4">
              {/* Navigation Items */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.onClick();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      currentView === item.view
                        ? 'text-white bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0 text-purple-300" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Video Generation Section */}
              <div className="space-y-1 pt-2 border-t border-gray-800">
                <p className="px-3 text-[11px] uppercase tracking-wide text-gray-500 mb-2">
                  Video Generation
                </p>
                {aiItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.onClick();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      currentView === item.view
                        ? 'text-white bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0 text-blue-300" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Image Generation Section */}
              <div className="space-y-1 pt-2 border-t border-gray-800">
                <p className="px-3 text-[11px] uppercase tracking-wide text-gray-500 mb-2">
                  Image Generation
                </p>
                {imageItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.onClick();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      currentView === item.view
                        ? 'text-white bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0 text-pink-300" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* User Profile Section */}
              <div className="pt-2 border-t border-gray-800">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/50 mb-2">
                  <div className="w-10 h-10 rounded-full gradient-purple-blue flex items-center justify-center text-white font-semibold">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.full_name || 'Guest User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email || 'Not logged in'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogoutIcon className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Wallet Section */}
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
                    <div className="flex-1 relative">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(walletAddress);
                            setShowCopySuccess(true);
                            setTimeout(() => setShowCopySuccess(false), 2000);
                          } catch {
                            try {
                              const el = document.createElement('textarea');
                              el.value = walletAddress;
                              document.body.appendChild(el);
                              el.select();
                              document.execCommand('copy');
                              document.body.removeChild(el);
                              setShowCopySuccess(true);
                              setTimeout(() => setShowCopySuccess(false), 2000);
                            } catch {
                              // no-op
                            }
                          }
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded transition-colors"
                        title="Copy wallet address"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h10a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 17H5a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v1" />
                        </svg>
                        Copy
                      </button>
                      {/* Copy Success Toast for Mobile */}
                      {showCopySuccess && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-green-500/90 text-white text-xs rounded-lg shadow-lg z-50 animate-in fade-in duration-200 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copied!</span>
                          </div>
                        </div>
                      )}
                    </div>
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

              {/* Arc Testnet Faucet - Direct Link */}
              <a
                href={ARC_TESTNET_FAUCETS[0].url}
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
                <span className="text-sm text-gray-200">Faucet</span>
              </a>
            </div>
          </div>
        )}
      </header>
      <TopUpModal />
    </>
  );
}

export default function AppHeader() {
  return (
    <Suspense fallback={
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity shrink-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">PrimeStudio</h1>
            </Link>
          </div>
        </div>
      </header>
    }>
      <AppHeaderContent />
    </Suspense>
  );
}

// Icon Components (same as SidebarNav)
function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
    </svg>
  );
}

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4L11 8l-4.5 1L5 13l-1.5-4L-1 8l4.5-1L5 3zM19 10l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM12 4l.8 2.2 2.2.8-2.2.8L12 10l-.8-2.2-2.2-.8 2.2-.8L12 4z" />
    </svg>
  );
}

function VideoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 7h10a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" />
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M20 8l-4 3v2l4 3V8z" />
    </svg>
  );
}

function TextIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h10M4 14h16M4 18h10" />
    </svg>
  );
}

function ImageIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.8" />
      <circle cx="8.5" cy="9.5" r="1.5" strokeWidth="1.8" />
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5-5-6 6" />
    </svg>
  );
}

function TransformIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M10 17l-5-5m0 0l5-5m-5 5h12m-4 5v1a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h5a2 2 0 012 2v1" />
    </svg>
  );
}
