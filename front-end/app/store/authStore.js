'use client';

import { create } from 'zustand';

// Initialize from localStorage if available
const getInitialBalance = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('usdc_balance');
    return stored ? parseFloat(stored) : 125.50;
  }
  return 125.50;
};

const getInitialWallet = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('wallet_address') || null;
  }
  return null;
};

const getFreeGenerationUsed = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('free_generation_used') === 'true';
  }
  return false;
};

const getInitialCoinBalance = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('coin_balance');
    return stored ? parseInt(stored, 10) : 0;
  }
  return 0;
};

export const useAuthStore = create((set) => ({
  isAuthModalOpen: false,
  activeTab: 'login', // 'login' or 'register'
  user: null, // { id, email, full_name }
  usdcBalance: getInitialBalance(), // USDC balance
  walletAddress: getInitialWallet(), // Connected wallet address
  freeGenerationUsed: getFreeGenerationUsed(), // Track if free generation has been used
  coinBalance: getInitialCoinBalance(), // In-app coins (top up first)
  isTopUpModalOpen: false,
  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, activeTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setUser: (user) => set({ user }),
  setUsdcBalance: (balance) => {
    set({ usdcBalance: balance });
    // Also update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('usdc_balance', balance.toString());
    }
  },
  setWalletAddress: (address) => {
    set({ walletAddress: address });
    if (typeof window !== 'undefined') {
      if (address) {
        localStorage.setItem('wallet_address', address);
      } else {
        localStorage.removeItem('wallet_address');
      }
    }
  },
  setFreeGenerationUsed: (used) => {
    set({ freeGenerationUsed: used });
    if (typeof window !== 'undefined') {
      localStorage.setItem('free_generation_used', used.toString());
    }
  },
  setCoinBalance: (coins) => {
    const n = Number.isFinite(coins) ? Math.max(0, Math.floor(coins)) : 0;
    set({ coinBalance: n });
    if (typeof window !== 'undefined') {
      localStorage.setItem('coin_balance', n.toString());
    }
  },
  openTopUpModal: () => set({ isTopUpModalOpen: true }),
  closeTopUpModal: () => set({ isTopUpModalOpen: false }),
  logout: () => set({ user: null }),
}));

