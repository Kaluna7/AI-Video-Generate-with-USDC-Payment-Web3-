# Railway Deployment Guide

## File Konfigurasi yang Dibutuhkan

1. **Procfile** - Menentukan command untuk menjalankan aplikasi
2. **runtime.txt** - Menentukan versi Python
3. **railway.json** - Konfigurasi Railway (opsional)
4. **requirements.txt** - Dependencies Python

## Environment Variables yang Harus Diset di Railway

Setelah deploy ke Railway, pastikan untuk menambahkan environment variables berikut di Railway dashboard:

### Database (Required)
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
```
Railway menyediakan PostgreSQL service yang bisa dihubungkan. Copy connection string dari Railway PostgreSQL service.

### Security (Required)
```
JWT_SECRET_KEY=your-random-secret-key-here
```

### CORS (Optional - untuk production)
```
CORS_ORIGINS=https://your-frontend-domain.vercel.app
ALLOW_ALL_ORIGINS=false
```

### Backend URL (Required untuk production)
```
BACKEND_URL=https://your-backend.railway.app
```

### API Keys (Sesuai kebutuhan)
- `CIRCLE_API_KEY` - Untuk payment
- `GEMINI_API_KEY` - Untuk AI enhancement
- `SORA2_API_KEY` atau `OPENAI_API_KEY` - Untuk video generation
- `KLING_ACCESS_KEY` dan `KLING_SECRET_KEY` - Untuk Kling AI
- `VEO3_API_KEY` - Untuk Veo3
- `REPLICATE_API_TOKEN` - Untuk Replicate

### Email (Optional)
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Google OAuth (Jika digunakan)
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.railway.app/auth/google/callback
FRONTEND_URL=https://your-frontend.vercel.app
```

## Langkah Deploy

1. **Push code ke GitHub** (jika belum)
   ```bash
   git add .
   git commit -m "Add Railway deployment config"
   git push origin main
   ```

2. **Di Railway Dashboard:**
   - Klik "New Project"
   - Pilih "Deploy from GitHub repo"
   - Pilih repository backend Anda
   - Railway akan otomatis mendeteksi Python dan menjalankan build

3. **Setup Database:**
   - Di Railway project, klik "New" → "Database" → "PostgreSQL"
   - Copy connection string dari PostgreSQL service
   - Set sebagai `DATABASE_URL` environment variable

4. **Set Environment Variables:**
   - Di Railway project, klik "Variables"
   - Tambahkan semua environment variables yang diperlukan

5. **Deploy:**
   - Railway akan otomatis deploy setelah push ke GitHub
   - Atau klik "Deploy" manual di dashboard

## Troubleshooting

### Error: "PORT not found"
- Railway otomatis menyediakan PORT environment variable
- Pastikan Procfile menggunakan `${PORT}` atau `$PORT`

### Error: "Database connection failed"
- Pastikan `DATABASE_URL` sudah di-set dengan benar
- Pastikan PostgreSQL service sudah running di Railway

### Error: "Module not found"
- Pastikan semua dependencies ada di `requirements.txt`
- Railway akan otomatis install dari `requirements.txt`

### Error: "Build failed"
- Cek build logs di Railway dashboard
- Pastikan Python version di `runtime.txt` sesuai (3.13)

## Catatan Penting

- Railway secara otomatis menyediakan `PORT` environment variable
- Jangan hardcode port di code, gunakan `$PORT` dari environment
- Pastikan `ALLOW_ALL_ORIGINS=false` di production untuk security
- Update `FRONTEND_URL` dan `GOOGLE_REDIRECT_URI` dengan URL production

