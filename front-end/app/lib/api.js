'use client';

// Gunakan localhost agar konsisten dengan URL di browser
const API_BASE_URL = 'http://localhost:8001';

// Helper function for error handling
const handleResponse = async (response) => {  
  if (!response.ok) {
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
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000');
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

    // Store token in localStorage
    if (result.access_token) {
      localStorage.setItem('access_token', result.access_token);
    }

    return result;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000');
    }
    throw error;
  }
};

// Forgot Password
export const forgotPassword = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000');
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
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000');
    }
    throw error;
  }
};

// ==============================
// Coins (Top Up -> Spend)
// ==============================

export const getCoinBalance = async () => {
  const response = await fetch(`${API_BASE_URL}/coins/balance`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
  return await handleResponse(response);
};

export const claimTopUp = async ({ tx_hash }) => {
  const response = await fetch(`${API_BASE_URL}/coins/topup/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ tx_hash }),
  });
  return await handleResponse(response);
};

// ==============================
// AI prompt enhancement (Gemini)
// ==============================

export const enhancePrompt = async ({ idea, existing_prompt }) => {
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
};

// ==============================
// Video generation (Text to Video)
// ==============================

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createTextToVideoJob = async ({ prompt, model, aspect_ratio }) => {
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
    }),
  });
  return await handleResponse(response);
};

export const getVideoJob = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/video/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
  return await handleResponse(response);
};

