'use client';

/**
 * Get API base URL for fetch requests
 * Priority:
 * 1. NEXT_PUBLIC_API_URL environment variable (for Vercel/Railway production)
 * 2. localhost:8001 (for local development)
 * 
 * Usage: fetch(`${getApiBaseUrl()}/api/endpoint`)
 */
export const getApiBaseUrl = () => {
  // Use environment variable if set (for production: Vercel + Railway)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:8001';
};

// Export constant for backward compatibility
export const API_BASE_URL = getApiBaseUrl();

// Cookie helper functions
const setCookie = (name, value, days = 1) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name) => {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Helper function for error handling
const handleResponse = async (response) => {  
  if (!response.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear token from localStorage and cookie
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        deleteCookie('access_token');
        
        // Clear user from auth store if available
        try {
          const { useAuthStore } = await import('../store/authStore');
          useAuthStore.getState().logout();
        } catch (e) {
          // Auth store might not be available, ignore
        }
        
        // Redirect to home page (which will show login modal)
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || 'Request failed';
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Register
export const registerUser = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        full_name: data.full_name,
        password: data.password,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

// Login
export const loginUser = async (data) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await handleResponse(response);

    // Store token in localStorage and cookie (1 day expiry)
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
      setCookie('access_token', result.access_token, 1);
    }

    return result;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

// Forgot Password
export const forgotPassword = async (data) => {
  console.log('🚀 forgotPassword called with:', data);
  console.log('📡 API_BASE_URL:', API_BASE_URL);

  try {
    const url = `${API_BASE_URL}/auth/forgot-password`;
    console.log('🔗 Full URL:', url);

    const requestBody = JSON.stringify({
      email: data.email,
    });
    console.log('📦 Request body:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: requestBody,
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    return await handleResponse(response);
  } catch (error) {
    console.error('❌ Network error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please check if the backend server is running on port 8001.`);
    }
    throw error;
  }
};

// Reset Password
export const resetPassword = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: data.token,
        new_password: data.new_password,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

// ==============================
// Coins (Top Up -> Spend)
// ==============================

export const getCoinBalance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/coins/balance`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

export const claimTopUp = async ({ tx_hash }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coins/topup/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ tx_hash }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

// ==============================
// AI prompt enhancement (Gemini)
// ==============================

export const enhancePrompt = async ({ idea, existing_prompt }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/enhance-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        idea,
        existing_prompt: existing_prompt || null,
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

// ==============================
// Video generation (Text to Video)
// ==============================

const getAuthHeaders = () => {
  // Try cookie first, then fallback to localStorage
  const token = typeof window !== 'undefined' 
    ? (getCookie('access_token') || localStorage.getItem('access_token'))
    : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAuthToken = () => {
  // Try cookie first, then fallback to localStorage
  return typeof window !== 'undefined' 
    ? (getCookie('access_token') || localStorage.getItem('access_token'))
    : null;
};

/**
 * Normalize video URL - replace localhost with correct API base URL if needed
 */
export const normalizeVideoUrl = (url) => {
  if (!url) return url;
  
  // If we're in production (NEXT_PUBLIC_API_URL is set) and URL uses localhost, replace it
  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    // Replace localhost:8001 with production API URL
    if (url.includes('localhost:8001') || url.startsWith('http://localhost:8001') || url.startsWith('https://localhost:8001')) {
      return url.replace(/https?:\/\/localhost:8001/g, apiBaseUrl);
    }
    // If URL is relative, prepend API base URL
    if (url.startsWith('/')) {
      return `${apiBaseUrl}${url}`;
    }
  }
  
  return url;
};

/**
 * Add authentication token to video URL for download endpoints.
 * This is needed because video tags cannot send Authorization headers.
 */
export const addTokenToVideoUrl = (url) => {
  if (!url) return url;
  
  // Normalize URL first (replace localhost with correct API URL if needed)
  const normalizedUrl = normalizeVideoUrl(url);
  
  const token = getAuthToken();
  if (!token) return normalizedUrl;
  
  // Check if token is already in the URL
  try {
    const urlObj = new URL(normalizedUrl);
    if (urlObj.searchParams.has('token')) {
      // Token already exists, return as is
      return normalizedUrl;
    }
  } catch {
    // If URL parsing fails, continue with string manipulation
  }
  
  // Check if URL already has query parameters
  const separator = normalizedUrl.includes('?') ? '&' : '?';
  return `${normalizedUrl}${separator}token=${encodeURIComponent(token)}`;
};

export const createTextToVideoJob = async ({
  prompt,
  model,
  aspect_ratio,
  provider,
  duration_seconds,
  resolution,
  quality,
  image_urls,
  callback_url,
  watermark,
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/video/text-to-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        prompt,
        model,
        aspect_ratio,
        provider,
        duration_seconds,
        resolution,
        quality,
        image_urls,
        callback_url,
        watermark,
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

export const getVideoJob = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/video/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

// ==============================
// Image generation (Text to Image / Image to Image)
// ==============================

export const createTextToImageJob = async ({
  prompt,
  model,
  aspect_ratio,
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/image/text-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        prompt,
        model,
        aspect_ratio,
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

export const createImageToImageJob = async ({
  prompt,
  image_url,
  image_url2,
  model,
  mode,
  aspect_ratio,
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/image/image-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        prompt,
        image_url,
        image_url2,
        model,
        mode,
        aspect_ratio,
      }),
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

export const getImageJob = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/image/job/${jobId}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });
    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error(`Server Error. Please reload the page and try again.`);
    }
    throw error;
  }
};

