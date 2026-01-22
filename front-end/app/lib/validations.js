'use client';

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address (e.g., example@gmail.com)'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be at most 72 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address (e.g., example@gmail.com)'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be at most 72 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address (e.g., example@gmail.com)'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
});

