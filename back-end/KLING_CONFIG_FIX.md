# Fix Kling AI Configuration Error

## Problem
Error: `Failed to resolve 'api.your-kling-provider.com'` atau `getaddrinfo failed`

## Cause
`KLING_BASE_URL` di file `.env` masih menggunakan placeholder URL `api.your-kling-provider.com` yang bukan URL yang sebenarnya.

## Solution

### Step 1: Update `.env` file

Buka file `.env` di folder `back-end` dan update `KLING_BASE_URL` dengan URL yang benar dari provider Kling AI Anda.

**Contoh provider yang umum:**
- `https://api.useapi.net`
- `https://api.cometapi.com`
- `https://api.kie.ai`
- Atau URL dari provider Kling AI Anda

**Update di `.env`:**
```env
# GANTI ini:
KLING_BASE_URL=https://api.your-kling-provider.com

# MENJADI URL yang benar, contoh:
KLING_BASE_URL=https://api.useapi.net
```

### Step 2: Pastikan API Key juga sudah di-set

```env
# Option 1: Access Key + Secret Key (Recommended)
KLING_ACCESS_KEY=your_access_key_here
KLING_SECRET_KEY=your_secret_key_here

# Atau Option 2: JWT Token
# KLING_JWT_TOKEN=your_jwt_token_here

# Atau Option 3: API Key langsung
# KLING_API_KEY=your_api_key_here
```

### Step 3: Restart Backend Server

Setelah update `.env`, **restart backend server**:

```bash
# Stop server (Ctrl+C)
# Start lagi
cd back-end
uvicorn main:app --reload --port 8001
```

## Verifikasi

Setelah update, coba generate video lagi. Error seharusnya sudah hilang.

## Common Providers

Jika Anda tidak tahu base URL provider Anda, cek dokumentasi dari provider atau coba:

1. **useapi.net**: `https://api.useapi.net`
2. **cometapi.com**: `https://api.cometapi.com`
3. **KIE API**: `https://api.kie.ai`
4. **PiAPI**: `https://api.piapi.ai`

## Still Having Issues?

1. Pastikan URL benar (bisa diakses di browser)
2. Pastikan tidak ada typo di URL
3. Pastikan tidak ada spasi atau karakter tambahan
4. Cek dokumentasi provider Anda untuk base URL yang benar

