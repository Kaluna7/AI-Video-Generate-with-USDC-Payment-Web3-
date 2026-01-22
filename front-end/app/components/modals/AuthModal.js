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
  const [successMessage, setSuccessMessage] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(null); // null | 'email' | 'code' | 'password'
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordCode, setForgotPasswordCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const getSchema = () => {
    if (forgotPasswordStep === 'email') {
      return loginSchema.pick({ email: true });
    } else if (forgotPasswordStep === 'code') {
      return loginSchema.pick({ email: true }).extend({
        code: loginSchema.shape.email // reusing email validation for code
      });
    } else if (forgotPasswordStep === 'password') {
      return loginSchema.extend({
        newPassword: loginSchema.shape.password,
        confirmNewPassword: loginSchema.shape.password
      }).refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Passwords don't match",
        path: ["confirmNewPassword"],
      });
    } else {
      return activeTab === 'login' ? loginSchema : registerSchema;
    }
  };

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(getSchema()),
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      setError('');
      setSuccessMessage('Account created successfully! Please sign in.');
      setActiveTab('login');
      reset();
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    },
    onError: (err) => {
      setError(err.message);
      setSuccessMessage('');
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (result) => {
      setError('');
      // Fetch user info from /auth/me endpoint
      try {
        const token = result?.access_token || localStorage.getItem('access_token');
        if (token) {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const user = await res.json();
            setUser(user);
          } else if (result?.user) {
            // Fallback to user from login response if /auth/me fails
            setUser(result.user);
          }
        } else if (result?.user) {
          // Fallback to user from login response
          setUser(result.user);
        }
      } catch (e) {
        console.error('Failed to fetch user info:', e);
        // Still proceed with login even if user fetch fails
        if (result?.user) {
          setUser(result.user);
        }
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

  // Forgot password mutations
  const requestResetMutation = useMutation({
    mutationFn: async (email) => {
      console.log('Sending forgot password request for:', email);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const url = `${API_BASE_URL}/auth/forgot-password`;
      console.log('Request URL:', url);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        let errorText;
        try {
          const errorData = await res.json();
          errorText = errorData.detail || errorData.message || 'Failed to send reset code';
        } catch (e) {
          errorText = await res.text();
        }
        console.error('Error response:', errorText);
        throw new Error(errorText);
      }

      const result = await res.json();
      console.log('Success response:', result);
      return result;
    },
    onSuccess: () => {
      setError('');
      setForgotPasswordStep('code');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async ({ email, code }) => {
      console.log('Verifying code for:', email, 'code:', code);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const url = `${API_BASE_URL}/auth/verify-reset-code`;
      console.log('Request URL:', url);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        let errorText;
        try {
          const errorData = await res.json();
          errorText = errorData.detail || errorData.message || 'Invalid verification code';
        } catch (e) {
          errorText = await res.text();
        }
        console.error('Error response:', errorText);
        throw new Error(errorText);
      }

      const result = await res.json();
      console.log('Success response:', result);
      return result;
    },
    onSuccess: () => {
      setError('');
      setForgotPasswordStep('password');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email, code, password }) => {
      console.log('Resetting password for:', email);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const url = `${API_BASE_URL}/auth/reset-password-with-code`;
      console.log('Request URL:', url);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        let errorText;
        try {
          const errorData = await res.json();
          errorText = errorData.detail || errorData.message || 'Failed to reset password';
        } catch (e) {
          errorText = await res.text();
        }
        console.error('Error response:', errorText);
        throw new Error(errorText);
      }

      const result = await res.json();
      console.log('Success response:', result);
      return result;
    },
    onSuccess: (result) => {
      setError('');
      alert('Password reset successful! You will be logged in automatically.');
      // Auto login with new password
      loginMutation.mutate({
        email: forgotPasswordEmail,
        password: document.querySelector('input[name="newPassword"]').value
      });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const onSubmit = (data) => {
    setError('');
    setSuccessMessage('');
    if (forgotPasswordStep === 'email') {
      requestResetMutation.mutate(data.email);
    } else if (forgotPasswordStep === 'code') {
      verifyCodeMutation.mutate({
        email: forgotPasswordEmail,
        code: data.code
      });
    } else if (forgotPasswordStep === 'password') {
      resetPasswordMutation.mutate({
        email: forgotPasswordEmail,
        code: forgotPasswordCode,
        password: data.newPassword
      });
    } else if (activeTab === 'login') {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMessage('');
    reset();
    // Reset password visibility states
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    // Reset forgot password state
    setForgotPasswordStep(null);
    setForgotPasswordEmail('');
    setForgotPasswordCode('');
  };

  const handleForgotPassword = () => {
    console.log('🔄 Switching to forgot password mode');
    setForgotPasswordStep('email');
    setError('');
    setSuccessMessage('');
    reset();
  };

  const handleBackToLogin = () => {
    setForgotPasswordStep(null);
    setError('');
    setSuccessMessage('');
    setForgotPasswordEmail('');
    setForgotPasswordCode('');
    // Reset password visibility states
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
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
            <p className="text-gray-400">
              {forgotPasswordStep === 'email' && 'Reset your password'}
              {forgotPasswordStep === 'code' && 'Enter verification code'}
              {forgotPasswordStep === 'password' && 'Set new password'}
              {forgotPasswordStep === null && 'Welcome to the future of video generation'}
            </p>
          </div>

          {/* Back button for forgot password */}
          {forgotPasswordStep && (
            <button
              onClick={handleBackToLogin}
              className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

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

          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {successMessage}
              </span>
              <button
                onClick={() => setSuccessMessage('')}
                className="text-green-400 hover:text-green-300 transition-colors ml-2"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Forgot Password - Email Step */}
            {forgotPasswordStep === 'email' && (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-300">
                    Enter your email address and we will send you a verification code.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                  <input
                    {...registerForm('email')}
                    type="email"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Enter your registered email"
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Forgot Password - Code Step */}
            {forgotPasswordStep === 'code' && (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-300">
                    We sent a verification code to{' '}
                    <strong>{forgotPasswordEmail}</strong>
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Verification Code</label>
                  <input
                    {...registerForm('code')}
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-center text-2xl font-mono tracking-wider"
                    placeholder="000000"
                    maxLength={6}
                    onChange={(e) => setForgotPasswordCode(e.target.value)}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-400">{errors.code.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Forgot Password - Password Step */}
            {forgotPasswordStep === 'password' && (
              <>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-300">
                    Create your new password
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      {...registerForm('newPassword')}
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      {...registerForm('confirmNewPassword')}
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmNewPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmNewPassword.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Regular Login/Register */}
            {forgotPasswordStep === null && activeTab === 'register' && (
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

            {forgotPasswordStep === null && (
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
            )}

            {forgotPasswordStep === null && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <input
                    {...registerForm('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
            )}

            {forgotPasswordStep === null && activeTab === 'register' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    {...registerForm('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {forgotPasswordStep === null && activeTab === 'login' && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={
                loginMutation.isPending ||
                registerMutation.isPending ||
                requestResetMutation.isPending ||
                verifyCodeMutation.isPending ||
                resetPasswordMutation.isPending
              }
              className="w-full gradient-purple-blue text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending || registerMutation.isPending
                ? 'Processing...'
                : requestResetMutation.isPending
                ? 'Sending...'
                : verifyCodeMutation.isPending
                ? 'Verifying...'
                : resetPasswordMutation.isPending
                ? 'Resetting...'
                : forgotPasswordStep === 'email'
                ? 'Send Reset Code'
                : forgotPasswordStep === 'code'
                ? 'Verify Code'
                : forgotPasswordStep === 'password'
                ? 'Reset Password'
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

