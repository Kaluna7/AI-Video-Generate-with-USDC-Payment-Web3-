'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { loginSchema, registerSchema } from '../../lib/validations';
import { registerUser, loginUser } from '../../lib/api';

export default function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, activeTab, setActiveTab, setUser } = useAuthStore();
  const [error, setError] = useState('');

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(activeTab === 'login' ? loginSchema : registerSchema),
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setError('');
      alert('Account created! Please sign in.');
      setActiveTab('login');
      reset();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      setError('');
      // Simpan user di store jika ada
      if (result?.user) {
        setUser(result.user);
      }
      closeAuthModal();
      reset();
      // Redirect ke generator page tanpa full reload,
      // supaya state Zustand (user) tetap tersimpan.
      router.push('/generator');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const onSubmit = (data) => {
    setError('');
    if (activeTab === 'login') {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    reset();
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={closeAuthModal}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Logo/Title */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold gradient-text mb-2">PrimeStudio</h2>
            <p className="text-gray-400">Welcome to the future of video generation</p>
          </div>

          {/* Google sign-in */}
          <button
            type="button"
            onClick={() => {
              const backend = 'http://localhost:8001';
              const redirectTo = `${window.location.origin}/auth/google`;
              window.location.href = `${backend}/auth/google/login?redirect_to=${encodeURIComponent(redirectTo)}`;
            }}
            className="w-full mb-4 bg-gray-800 border border-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.66 32.657 29.21 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.962 3.038l5.657-5.657C34.047 6.053 29.261 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917Z"/>
              <path fill="#FF3D00" d="M6.306 14.691 12.88 19.51C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.962 3.038l5.657-5.657C34.047 6.053 29.261 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"/>
              <path fill="#4CAF50" d="M24 44c5.161 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.171 35.091 26.715 36 24 36c-5.189 0-9.626-3.32-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.07 12.07 0 0 1-4.084 5.565l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {activeTab === 'register' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  {...registerForm('full_name')}
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="Enter your full name"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                {...registerForm('email')}
                type="email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                {...registerForm('password')}
                type="password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                <input
                  {...registerForm('confirmPassword')}
                  type="password"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {activeTab === 'login' && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full gradient-purple-blue text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending || registerMutation.isPending
                ? 'Processing...'
                : activeTab === 'login'
                ? 'Continue'
                : 'Create account'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-400">
            {activeTab === 'login' ? (
              <>
                New to PrimeStudio?{' '}
                <button
                  onClick={() => handleTabChange('register')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => handleTabChange('login')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

