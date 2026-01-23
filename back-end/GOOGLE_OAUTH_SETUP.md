# Google OAuth Setup untuk Production (Railway + Vercel)

## ⚠️ PENTING: Environment Variables yang Harus Di-Set

### Di Railway (Backend)

Set environment variables berikut di **Backend Service**:

```
BACKEND_URL=https://your-backend.railway.app
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback
FRONTEND_URL=https://your-frontend.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Di Vercel (Frontend)

Set environment variable berikut:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## 🔧 Setup Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. **APIs & Services** → **Credentials**
4. Klik **OAuth 2.0 Client ID** yang sudah ada (atau buat baru)
5. Di **Authorized redirect URIs**, tambahkan:
   ```
   https://your-backend.railway.app/auth/google/callback
   ```
6. Klik **Save**

## ✅ Verifikasi Setup

### 1. Test Backend URL

```bash
curl https://your-backend.railway.app/
# Harus return: {"message":"Web3 Auth API is running"}
```

### 2. Test Google OAuth Login

1. Buka frontend di Vercel
2. Klik "Sign in with Google"
3. URL harus menjadi:
   ```
   https://your-backend.railway.app/auth/google/login?redirect_to=...
   ```
   **BUKAN** `http://localhost:8001/...`

### 3. Cek Environment Variables

**Backend (Railway):**
```bash
curl https://your-backend.railway.app/debug/env
# Harus return database: true, dan lainnya
```

## 🐛 Troubleshooting

### Masalah: Masih redirect ke localhost:8001

**Penyebab:**
- `NEXT_PUBLIC_API_URL` belum di-set di Vercel
- Atau belum di-redeploy setelah set

**Solusi:**
1. Set `NEXT_PUBLIC_API_URL` di Vercel → Settings → Environment Variables
2. **Redeploy** frontend di Vercel
3. Hard refresh browser (Ctrl+Shift+R)

### Masalah: Google OAuth error "redirect_uri_mismatch"

**Penyebab:**
- `GOOGLE_REDIRECT_URI` di Railway tidak sesuai dengan yang di Google Console

**Solusi:**
1. Cek `GOOGLE_REDIRECT_URI` di Railway Variables
2. Pastikan sama persis dengan yang di Google Console
3. Format: `https://your-backend.railway.app/auth/google/callback`

### Masalah: Backend masih pakai localhost

**Penyebab:**
- `BACKEND_URL` belum di-set di Railway
- Atau belum di-redeploy

**Solusi:**
1. Set `BACKEND_URL` di Railway → Backend Service → Variables
2. **Redeploy** backend
3. Cek logs untuk verify

## 📝 Checklist

- [ ] `BACKEND_URL` sudah di-set di Railway (Backend Service)
- [ ] `GOOGLE_REDIRECT_URI` sudah di-set di Railway (Backend Service)
- [ ] `FRONTEND_URL` sudah di-set di Railway (Backend Service)
- [ ] `GOOGLE_CLIENT_ID` sudah di-set di Railway (Backend Service)
- [ ] `GOOGLE_CLIENT_SECRET` sudah di-set di Railway (Backend Service)
- [ ] `NEXT_PUBLIC_API_URL` sudah di-set di Vercel
- [ ] Google Console redirect URI sudah di-update
- [ ] Backend sudah di-redeploy setelah set variables
- [ ] Frontend sudah di-redeploy setelah set variables
- [ ] Test login Google - URL harus menggunakan Railway backend

