'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { loginSchema, registerSchema } from '../lib/validations';
import { registerUser, loginUser } from '../lib/api';

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
      alert('Registration successful! Please login.');
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'login'
                  ? 'gradient-purple-blue text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'register'
                  ? 'gradient-purple-blue text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Register
            </button>
          </div>

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
                ? 'Login'
                : 'Register'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-400">
            {activeTab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => handleTabChange('register')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => handleTabChange('login')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

