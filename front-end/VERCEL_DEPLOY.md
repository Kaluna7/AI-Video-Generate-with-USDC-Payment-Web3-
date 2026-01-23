# Vercel Deployment Guide

## Environment Variables Setup

### Required Environment Variable

Set `NEXT_PUBLIC_API_URL` di Vercel untuk menghubungkan frontend ke backend Railway.

### Setup di Vercel Dashboard

1. Buka Vercel Dashboard → Project → Settings → Environment Variables
2. Tambahkan variable berikut:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Penting**: Ganti `your-backend.railway.app` dengan URL Railway backend Anda.

### Cara Mendapatkan Railway Backend URL

1. Buka Railway Dashboard → Project → Backend Service
2. Klik pada service backend
3. Copy URL dari bagian "Domains" atau "Settings" → "Public Domain"
4. Format biasanya: `https://your-project-name.up.railway.app`

### Environment Variables untuk Development

Untuk development local, buat file `.env.local` di folder `front-end/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

**Catatan**: File `.env.local` sudah di-ignore oleh Git, jadi aman untuk menyimpan konfigurasi local.

### Cara Kerja

1. **Development (Local)**:
   - Jika `NEXT_PUBLIC_API_URL` tidak di-set, akan fallback ke `http://localhost:8001`
   - Atau set di `.env.local` untuk override

2. **Production (Vercel)**:
   - Set `NEXT_PUBLIC_API_URL` di Vercel Environment Variables
   - Semua API calls akan menggunakan URL ini

### Testing

Setelah deploy, test dengan:

```bash
# Test API connection
curl https://your-frontend.vercel.app
```

Atau buka browser dan cek Network tab untuk melihat API calls menggunakan URL yang benar.

### Troubleshooting

#### Issue: API calls masih ke localhost
**Solution**: 
- Pastikan `NEXT_PUBLIC_API_URL` sudah di-set di Vercel
- Redeploy setelah menambahkan environment variable
- Cek di Vercel → Settings → Environment Variables

#### Issue: CORS error
**Solution**: 
- Pastikan backend Railway sudah set CORS untuk allow domain Vercel
- Set `CORS_ORIGINS` di Railway dengan domain Vercel Anda
- Atau set `ALLOW_ALL_ORIGINS=true` di Railway (untuk development)

#### Issue: 404 Not Found
**Solution**:
- Pastikan URL Railway backend benar
- Test backend URL langsung: `curl https://your-backend.railway.app/`
- Harus return: `{"message":"Web3 Auth API is running"}`

### Example Configuration

**Vercel Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://my-backend.up.railway.app
```

**Railway Environment Variables:**
```
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://my-frontend.vercel.app
ALLOW_ALL_ORIGINS=false
FRONTEND_URL=https://my-frontend.vercel.app
```

