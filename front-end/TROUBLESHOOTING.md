# Troubleshooting "Failed to Fetch" Error

## Problem
Error "Failed to fetch" atau "Cannot connect to backend server" muncul saat menggunakan aplikasi.

## Common Causes

### 1. Backend Server Tidak Berjalan
**Solution:** Pastikan backend server sudah berjalan.

**Cara cek:**
- Buka terminal di folder `back-end`
- Jalankan: `uvicorn main:app --reload --port 8001`
- Atau jika menggunakan script lain, pastikan server berjalan di port 8001

**Verifikasi:**
- Buka browser dan akses: `http://localhost:8001/docs`
- Jika muncul halaman Swagger UI, berarti backend berjalan dengan benar

### 2. Port Tidak Sesuai
**Problem:** Frontend menggunakan `http://localhost:8001` tapi backend berjalan di port lain.

**Solution:** 
- Pastikan backend berjalan di port **8001**
- Atau update `API_BASE_URL` di `front-end/app/lib/api.js` sesuai port backend Anda

### 3. CORS Error
**Problem:** Browser memblokir request karena CORS policy.

**Solution:** Pastikan backend sudah mengkonfigurasi CORS dengan benar. Cek di `back-end/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Firewall atau Antivirus
**Problem:** Firewall atau antivirus memblokir koneksi.

**Solution:**
- Tambahkan exception untuk Python/uvicorn di firewall
- Atau matikan sementara firewall untuk testing

### 5. Network Error
**Problem:** Koneksi internet atau network issue.

**Solution:**
- Cek koneksi internet
- Coba restart router/modem
- Coba akses backend langsung di browser: `http://localhost:8001/docs`

## Quick Fix Checklist

1. ✅ Backend server berjalan di port 8001
2. ✅ Frontend menggunakan `http://localhost:8001` sebagai API_BASE_URL
3. ✅ CORS sudah dikonfigurasi dengan benar
4. ✅ Tidak ada firewall yang memblokir
5. ✅ Backend bisa diakses langsung di browser (`http://localhost:8001/docs`)

## Testing Backend Connection

Buka browser dan akses:
- `http://localhost:8001/docs` - Swagger UI (harus muncul)
- `http://localhost:8001/health` - Health check (jika ada endpoint ini)

Jika tidak bisa diakses, berarti backend tidak berjalan atau ada masalah dengan konfigurasi.

## Environment Variables

Pastikan file `.env` di folder `back-end` sudah dikonfigurasi dengan benar, terutama:
- `DATABASE_URL` - untuk database connection
- `JWT_SECRET_KEY` - untuk JWT authentication
- Provider API keys (jika menggunakan video generation)

## Still Having Issues?

1. Cek console browser (F12) untuk error detail
2. Cek terminal backend untuk error logs
3. Pastikan semua dependencies sudah terinstall:
   - Backend: `pip install -r requirements.txt`
   - Frontend: `npm install` atau `pnpm install`

