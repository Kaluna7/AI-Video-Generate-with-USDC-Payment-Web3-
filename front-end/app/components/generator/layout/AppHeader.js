'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';

const ARC_TESTNET_FAUCET_URL = 'https://faucet.circle.com';
const ARC_TESTNET = {
  chainIdDec: 5042002,
  chainIdHex: '0x4cef52',
  chainName: 'Arc Testnet',
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
  // Arc uses USDC as native gas.
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
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
  const usdcBalance = useAuthStore((state) => state.usdcBalance);
  const walletAddress = useAuthStore((state) => state.walletAddress);
  const setUsdcBalance = useAuthStore((state) => state.setUsdcBalance);
  const setWalletAddress = useAuthStore((state) => state.setWalletAddress);
  const [isConnecting, setIsConnecting] = useState(false);

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
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId?.toLowerCase() !== ARC_TESTNET.chainIdHex.toLowerCase()) return;
      const balHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      // Balance is returned as hex. Convert & format as "USDC-like" 6 decimals.
      const balBig = BigInt(balHex);
      const formatted = formatUnits(balBig, ARC_TESTNET.nativeCurrency.decimals);
      const asFloat = Number.parseFloat(formatted);
      if (!Number.isNaN(asFloat)) setUsdcBalance(asFloat);
    } catch {
      // no-op
    }
  }, [setUsdcBalance]);

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

    const onChainChanged = () => {
      if (walletAddress) refreshArcBalance(walletAddress);
    };

    window.ethereum.on?.('accountsChanged', onAccountsChanged);
    window.ethereum.on?.('chainChanged', onChainChanged);
    return () => {
      window.ethereum.removeListener?.('accountsChanged', onAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', onChainChanged);
    };
  }, [walletAddress, setWalletAddress, refreshArcBalance]);

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
                    <span className="text-xs text-gray-300 hidden sm:inline">Connect (Arc Testnet)</span>
                    <span className="text-xs text-gray-300 sm:hidden">Connect</span>
                  </>
                )}
              </button>
            )}

            {/* Arc Testnet Faucet */}
            <a
              href={ARC_TESTNET_FAUCET_URL}
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
              <span className="text-xs text-gray-300 hidden sm:inline">Faucet</span>
              <span className="text-xs text-gray-300 sm:hidden">USDC</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

