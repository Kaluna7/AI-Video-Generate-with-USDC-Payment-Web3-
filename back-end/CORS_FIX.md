# Fix CORS Error

## Problem
Error: `Access to fetch at 'http://localhost:8001/video/text-to-video' from origin 'http://localhost:3000' has been blocked by CORS policy`

## Solution

### 1. Pastikan Backend Server Berjalan

CORS error bisa terjadi jika backend server tidak berjalan atau crash sebelum mengirim response.

**Cek backend:**
```bash
cd back-end
uvicorn main:app --reload --port 8001
```

**Verifikasi:**
- Buka browser: `http://localhost:8001/docs`
- Jika muncul Swagger UI, backend berjalan dengan benar
- Jika tidak muncul, ada masalah dengan backend

### 2. Cek Konfigurasi CORS

CORS sudah dikonfigurasi di `back-end/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)
```

### 3. Restart Backend Server

Setelah update kode, **restart backend server**:

```bash
# Stop server (Ctrl+C)
# Start lagi
cd back-end
uvicorn main:app --reload --port 8001
```

### 4. Cek Error di Backend

Jika backend crash atau error sebelum mengirim response, CORS header tidak akan dikirim.

**Cek terminal backend untuk error:**
- Jika ada error, fix error tersebut terlebih dahulu
- Error di endpoint bisa menyebabkan CORS error

### 5. Test dengan curl

Test endpoint langsung untuk memastikan backend berjalan:

```bash
curl -X POST http://localhost:8001/video/text-to-video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt": "test"}'
```

Jika curl berhasil tapi browser error, berarti masalah CORS.
Jika curl juga error, berarti masalah di backend.

### 6. Cek Browser Console

Buka browser console (F12) dan cek:
- Error detail
- Network tab untuk melihat request/response
- Apakah OPTIONS request (preflight) berhasil

### 7. Common Issues

**Issue: Backend tidak berjalan**
- Solution: Start backend server

**Issue: Port berbeda**
- Frontend: `http://localhost:8001`
- Backend: Pastikan berjalan di port 8001

**Issue: Error di endpoint**
- Cek terminal backend untuk error
- Fix error tersebut

**Issue: Authentication error**
- Pastikan token valid
- Cek `Authorization` header

## Quick Fix

1. **Restart backend:**
   ```bash
   cd back-end
   uvicorn main:app --reload --port 8001
   ```

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)

3. **Test endpoint:**
   - Buka: `http://localhost:8001/docs`
   - Coba POST `/video/text-to-video` dari Swagger UI

4. **Jika masih error:**
   - Cek terminal backend untuk error detail
   - Cek browser console (F12) untuk error detail

