# 🔧 Fix: Google OAuth Error 400: redirect_uri_mismatch

## ❌ Error yang Terjadi

```
Error 400: redirect_uri_mismatch
```

## 🎯 Penyebab

Redirect URI yang dikirim ke Google tidak sama dengan yang terdaftar di Google Cloud Console.

## ✅ Solusi Lengkap

### STEP 1: Cek Redirect URI di Backend

1. Buka **Railway** → **Backend Service** → **Variables**
2. Cek variable `GOOGLE_REDIRECT_URI`
3. Harus format: `https://your-backend.railway.app/auth/google/callback`
4. **PENTING**: 
   - Harus `https://` (bukan `http://`)
   - Harus tanpa trailing slash (`/auth/google/callback` bukan `/auth/google/callback/`)
   - Harus sama persis dengan yang di Google Console

### STEP 2: Update Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. **APIs & Services** → **Credentials**
4. Klik **OAuth 2.0 Client ID** yang digunakan
5. Di bagian **Authorized redirect URIs**, pastikan ada:
   ```
   https://your-backend.railway.app/auth/google/callback
   ```
6. **Hapus** yang lama (localhost) jika tidak diperlukan
7. Klik **Save**

### STEP 3: Verify Backend URL

Pastikan `BACKEND_URL` di Railway sudah benar:

1. Buka **Railway** → **Backend Service**
2. Copy URL dari bagian **"Domains"** atau **"Settings"**
3. Format: `https://your-backend.railway.app`
4. Set sebagai `BACKEND_URL` di Variables

### STEP 4: Set GOOGLE_REDIRECT_URI

Di Railway → Backend Service → Variables:

```
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback
```

**PENTING**: Ganti `your-backend.railway.app` dengan URL Railway backend Anda yang sebenarnya!

### STEP 5: Redeploy Backend

1. Setelah set semua variables
2. Klik **"Redeploy"** di Backend Service
3. Tunggu sampai **"Running"**

### STEP 6: Test

1. Buka frontend di Vercel
2. Klik "Sign in with Google"
3. Seharusnya tidak ada error `redirect_uri_mismatch`

## 🔍 Debug: Cek Redirect URI yang Dikirim

Untuk melihat redirect URI yang dikirim ke Google:

1. Buka browser Developer Tools (F12)
2. Tab **Network**
3. Klik "Sign in with Google"
4. Cari request ke `accounts.google.com/o/oauth2/v2/auth`
5. Lihat parameter `redirect_uri` di URL
6. Pastikan sama dengan yang di Google Console

## ⚠️ Common Mistakes

### ❌ SALAH
```
GOOGLE_REDIRECT_URI=http://localhost:8001/auth/google/callback
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback/
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback (tanpa set di Google Console)
```

### ✅ BENAR
```
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback
```
Dan **SAMA PERSIS** di Google Console!

## 📝 Checklist

- [ ] `BACKEND_URL` sudah di-set di Railway (format: `https://...`)
- [ ] `GOOGLE_REDIRECT_URI` sudah di-set di Railway (format: `https://.../auth/google/callback`)
- [ ] Redirect URI di Google Console **SAMA PERSIS** dengan yang di Railway
- [ ] Tidak ada trailing slash di akhir
- [ ] Menggunakan `https://` (bukan `http://`)
- [ ] Backend sudah di-redeploy setelah set variables
- [ ] Test login - tidak ada error redirect_uri_mismatch

## 🧪 Quick Test

Setelah setup, test dengan:

```bash
# Cek backend URL
curl https://your-backend.railway.app/

# Cek redirect URI yang digunakan (lihat di Network tab browser)
# Atau cek logs backend saat login
```

