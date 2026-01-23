# 🔧 Fix: Google OAuth redirect_uri_mismatch - Step by Step

## ❌ Error yang Terjadi

```
Error 400: redirect_uri_mismatch
```

## 🎯 Penyebab

Redirect URI yang dikirim ke Google **TIDAK SAMA PERSIS** dengan yang terdaftar di Google Cloud Console.

---

## ✅ Solusi Lengkap (Ikuti Urut!)

### STEP 1: Cek Redirect URI yang Digunakan Backend

**Cara 1: Via Debug Endpoint (PALING MUDAH)**

1. Buka browser atau terminal
2. Ganti `your-backend.railway.app` dengan URL Railway backend Anda
3. Akses:
   ```
   https://your-backend.railway.app/debug/google-oauth
   ```
4. Lihat value `google_redirect_uri` - **INI YANG HARUS DITAMBAHKAN DI GOOGLE CONSOLE**

**Cara 2: Via Browser Network Tab**

1. Buka frontend di Vercel
2. Buka Developer Tools (F12)
3. Tab **Network**
4. Klik "Sign in with Google"
5. Cari request ke `accounts.google.com/o/oauth2/v2/auth`
6. Lihat parameter `redirect_uri` di URL
7. **Copy value ini** - ini yang harus ada di Google Console

### STEP 2: Set Environment Variables di Railway

1. Buka **Railway Dashboard** → **Backend Service** → **Variables**
2. Set variable berikut:

**Name:** `BACKEND_URL`  
**Value:** `https://your-backend.railway.app`  
*(Ganti dengan URL Railway backend Anda yang sebenarnya)*

**Name:** `GOOGLE_REDIRECT_URI`  
**Value:** `https://your-backend.railway.app/auth/google/callback`  
*(Ganti dengan URL Railway backend Anda yang sebenarnya)*

**PENTING:**
- ✅ Harus `https://` (bukan `http://`)
- ✅ Tidak ada trailing slash di akhir (`/auth/google/callback` bukan `/auth/google/callback/`)
- ✅ Format: `https://your-backend.railway.app/auth/google/callback`

### STEP 3: Update Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih **project** Anda
3. **APIs & Services** → **Credentials**
4. Klik **OAuth 2.0 Client ID** yang digunakan
5. Scroll ke bagian **"Authorized redirect URIs"**
6. Klik **"+ ADD URI"** (jika belum ada)
7. Paste redirect URI dari STEP 1:
   ```
   https://your-backend.railway.app/auth/google/callback
   ```
8. **PENTING**: 
   - Harus **SAMA PERSIS** dengan yang di Railway Variables
   - Tidak ada trailing slash
   - Harus `https://`
9. Klik **"Save"**

### STEP 4: Redeploy Backend (WAJIB!)

1. Setelah set semua variables di Railway
2. Klik **"Redeploy"** di Backend Service
3. Tunggu sampai status **"Running"**

### STEP 5: Test

1. Buka frontend di Vercel
2. Klik "Sign in with Google"
3. Seharusnya **TIDAK ADA** error `redirect_uri_mismatch`

---

## 🔍 Debug: Cek Redirect URI yang Dikirim

### Via Debug Endpoint (Recommended)

```bash
curl https://your-backend.railway.app/debug/google-oauth
```

**Response:**
```json
{
  "backend_url": "https://your-backend.railway.app",
  "google_redirect_uri": "https://your-backend.railway.app/auth/google/callback",
  "google_client_id_set": true,
  "google_client_secret_set": true,
  "frontend_url": "https://your-frontend.vercel.app",
  "message": "Copy the 'google_redirect_uri' value and add it to Google Cloud Console..."
}
```

**Copy value `google_redirect_uri`** dan tambahkan ke Google Cloud Console!

### Via Browser Network Tab

1. Buka frontend di Vercel
2. Buka Developer Tools (F12)
3. Tab **Network**
4. Klik "Sign in with Google"
5. Cari request ke `accounts.google.com/o/oauth2/v2/auth`
6. Lihat URL, cari parameter `redirect_uri=...`
7. **Copy value setelah `redirect_uri=`** (decoded)
8. Pastikan sama dengan yang di Google Console

---

## ⚠️ Common Mistakes

### ❌ SALAH

```
GOOGLE_REDIRECT_URI=http://localhost:8001/auth/google/callback
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback/
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback (tanpa set di Google Console)
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback (beda dengan Google Console)
```

### ✅ BENAR

```
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback
```

Dan **SAMA PERSIS** di Google Cloud Console!

---

## 📋 Checklist

- [ ] Cek redirect URI via `/debug/google-oauth` endpoint
- [ ] `BACKEND_URL` sudah di-set di Railway (format: `https://...`)
- [ ] `GOOGLE_REDIRECT_URI` sudah di-set di Railway (format: `https://.../auth/google/callback`)
- [ ] Redirect URI di Google Console **SAMA PERSIS** dengan yang di Railway
- [ ] Tidak ada trailing slash di akhir
- [ ] Menggunakan `https://` (bukan `http://`)
- [ ] Backend sudah di-redeploy setelah set variables
- [ ] Test login - tidak ada error redirect_uri_mismatch

---

## 🧪 Quick Test

Setelah setup, test dengan:

```bash
# 1. Cek redirect URI yang digunakan
curl https://your-backend.railway.app/debug/google-oauth

# 2. Test Google OAuth login
# Buka frontend → Klik "Sign in with Google"
# Harus tidak ada error redirect_uri_mismatch
```

---

## 🚀 Quick Fix (Copy-Paste)

1. **Buka Railway** → Backend Service → Variables
2. **Set:**
   - `BACKEND_URL` = `https://your-backend.railway.app`
   - `GOOGLE_REDIRECT_URI` = `https://your-backend.railway.app/auth/google/callback`
3. **Redeploy** Backend Service
4. **Buka Google Cloud Console** → OAuth 2.0 Client ID
5. **Tambah** redirect URI: `https://your-backend.railway.app/auth/google/callback`
6. **Save**
7. **Test** login Google

---

## 💡 Tips

- **Gunakan debug endpoint** `/debug/google-oauth` untuk melihat redirect URI yang digunakan
- **Copy-paste** redirect URI dari debug endpoint ke Google Console (untuk memastikan sama persis)
- **Jangan ada spasi** di awal/akhir redirect URI
- **Case-sensitive**: `https://` bukan `HTTPS://`

