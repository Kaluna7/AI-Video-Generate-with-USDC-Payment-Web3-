'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { getCoinBalance } from '../../lib/api';

// Cookie helper function (same as in api.js)
const setCookie = (name, value, days = 1) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// Import API base URL function
import { getApiBaseUrl } from '../../lib/api';

// Make sure getApiBaseUrl is available
const API_BASE_URL = getApiBaseUrl();

function GoogleAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setCoinBalance } = useAuthStore();
  const [message, setMessage] = useState('Finishing Google sign-in...');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setMessage(`Google sign-in failed: ${error}`);
      return;
    }

    if (!token) {
      setMessage('Missing token from Google sign-in.');
      return;
    }

    // Store token in localStorage
    try {
      localStorage.setItem('access_token', token);
      // Verify it was stored
      const stored = localStorage.getItem('access_token');
      if (stored !== token) {
        console.error('Failed to store token in localStorage');
        setMessage('Failed to save authentication token. Please try again.');
        return;
      }
    } catch (e) {
      console.error('Error storing token in localStorage:', e);
      setMessage('Failed to save authentication token. Please check your browser settings.');
      return;
    }
    
    // Also set cookie with 1 day expiry
    try {
      setCookie('access_token', token, 1);
    } catch (e) {
      console.error('Error setting cookie:', e);
      // Continue anyway, localStorage is more important
    }

    // Fetch user info and redirect
    (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const user = await res.json();
        setUser(user);

        // Fetch latest coin balance from backend
        try {
          const balanceData = await getCoinBalance();
          setCoinBalance(balanceData.coins);
        } catch (e) {
          console.error('Failed to fetch coin balance:', e);
          // Balance will remain 0 or from localStorage
        }

        // Small delay to ensure state is saved before redirect
        setTimeout(() => {
          router.replace('/generator');
        }, 100);
      } catch (e) {
        console.error('Failed to fetch user info:', e);
        setMessage('Signed in, but failed to load profile. Please try again.');
      }
    })();
  }, [router, searchParams, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#06080c]/90 p-6 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
          PrimeStudio
        </h1>
        <p className="mt-3 text-gray-300">{message}</p>
      </div>
    </div>
  );
}

export default function GoogleAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#06080c]/90 p-6 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 via-pink-300 to-orange-500 bg-clip-text text-transparent">
            PrimeStudio
          </h1>
          <p className="mt-3 text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <GoogleAuthCallbackContent />
    </Suspense>
  );
}

