'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = 'http://localhost:8001';

export default function GoogleAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
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

    localStorage.setItem('access_token', token);
    
    // Also set cookie with 1 day expiry
    const expires = new Date();
    expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
    document.cookie = `access_token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const user = await res.json();
        setUser(user);
        router.replace('/generator');
      } catch (e) {
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


