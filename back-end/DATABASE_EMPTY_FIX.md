# 🔧 Fix: Database Masih Kosong di Railway

## ❌ Masalah

Database PostgreSQL di Railway masih kosong (tidak ada tables) meskipun sudah set `DATABASE_URL`.

## 🎯 Penyebab Umum

1. **DATABASE_URL belum di-set** di Railway Backend Service
2. **Sudah di-set tapi belum di-redeploy** (Railway hanya inject ENV saat start)
3. **Error saat create_all()** tapi tidak terlihat di logs
4. **Connection ke PostgreSQL gagal** tapi app tetap jalan

## ✅ Solusi Lengkap (Ikuti Urut!)

### STEP 1: Pastikan DATABASE_URL Sudah Di-Set

1. Buka **Railway Dashboard**
2. Buka **Backend Service** (bukan PostgreSQL service!)
3. Klik tab **"Variables"**
4. Cek apakah ada variable `DATABASE_URL`
5. Jika belum ada atau salah:
   - Klik **"New Variable"** atau edit yang ada
   - **Name**: `DATABASE_URL`
   - **Value**: `${{ Postgres.DATABASE_URL }}`
   - (Ganti `Postgres` dengan nama service PostgreSQL Anda, contoh: `${{ PostgreSQL.DATABASE_URL }}`)
   - Klik **"Add"** atau **"Save"**

### STEP 2: Redeploy Backend (WAJIB!)

1. Masih di **Backend Service**
2. Klik tombol **"Redeploy"** (biasanya di pojok kanan atas)
3. Tunggu sampai status berubah menjadi **"Running"**
4. **JANGAN SKIP STEP INI!** Railway hanya inject ENV saat start

### STEP 3: Cek Logs Backend

1. Setelah redeploy, klik tab **"Logs"** di Backend Service
2. Scroll ke atas dan cari log startup (ada tanda `[STARTUP]`)
3. Harus muncul:
   ```
   [STARTUP] 🚀 Starting database initialization...
   [STARTUP] DATABASE_URL exists: True
   [STARTUP] ✅ Using PostgreSQL (Railway production)
   [STARTUP] Found 4 table(s) to create: ['users', 'user_coin_balances', 'coin_topup_txs', 'stored_videos']
   [STARTUP] ✅ Database connection successful
   [DB] Creating tables if they don't exist...
   [DB] ✅ Tables ready
   [STARTUP] Found 4 table(s) in database: ['users', 'user_coin_balances', 'coin_topup_txs', 'stored_videos']
   [STARTUP] ✅ All expected tables exist in database
   ```

### STEP 4: Jika Auto-Init Gagal - Manual Init

Jika di logs tidak muncul "Tables ready" atau ada error, gunakan endpoint manual:

1. Buka terminal atau browser
2. Ganti `your-backend.railway.app` dengan URL Railway Anda
3. Jalankan:
   ```bash
   curl -X POST https://your-backend.railway.app/admin/db/init
   ```

**Response yang diharapkan:**
```json
{
  "success": true,
  "message": "Database tables initialized successfully",
  "expected_tables": ["users", "user_coin_balances", "coin_topup_txs", "stored_videos"],
  "created_tables": ["users", "user_coin_balances", "coin_topup_txs", "stored_videos"],
  "database_url_set": true,
  "database_type": "PostgreSQL"
}
```

### STEP 5: Verify Tables Created

1. Buka **PostgreSQL service** di Railway
2. Klik tab **"Data"**
3. Refresh halaman
4. Seharusnya sekarang muncul 4 tables:
   - `users`
   - `user_coin_balances`
   - `coin_topup_txs`
   - `stored_videos`

## 🔍 Troubleshooting

### Masalah: "DATABASE_URL exists: False" di logs

**Penyebab:**
- Variable belum di-set di Backend Service
- Atau di-set di PostgreSQL service (salah!)

**Solusi:**
1. Pastikan variable di-set di **Backend Service**, bukan PostgreSQL service
2. Pastikan format: `${{ Postgres.DATABASE_URL }}` (ganti `Postgres` dengan nama service)
3. **Redeploy** setelah set variable

### Masalah: "Database connection failed" di logs

**Penyebab:**
- `DATABASE_URL` salah format
- PostgreSQL service belum running
- Network issue

**Solusi:**
1. Cek PostgreSQL service status (harus "Running")
2. Verify `DATABASE_URL` format di Railway Variables
3. Coba redeploy PostgreSQL service

### Masalah: "Found 0 table(s)" di logs

**Penyebab:**
- Models tidak ter-import

**Solusi:**
- Ini seharusnya tidak terjadi karena models sudah di-import di `main.py`
- Cek logs untuk error import

### Masalah: Tables tidak muncul setelah init

**Penyebab:**
- `create_all()` gagal tapi error tidak terlihat
- Connection ke database salah

**Solusi:**
1. Gunakan manual init endpoint: `POST /admin/db/init`
2. Cek response untuk detail error
3. Verify `DATABASE_URL` benar

## 📝 Checklist

- [ ] `DATABASE_URL` sudah di-set di **Backend Service** (bukan PostgreSQL service)
- [ ] Format: `${{ Postgres.DATABASE_URL }}` (ganti `Postgres` dengan nama service)
- [ ] Backend sudah di-redeploy setelah set variable
- [ ] Logs menunjukkan "DATABASE_URL exists: True"
- [ ] Logs menunjukkan "✅ Database connection successful"
- [ ] Logs menunjukkan "✅ Tables ready"
- [ ] Logs menunjukkan "✅ All expected tables exist in database"
- [ ] Tables muncul di PostgreSQL → Data tab
- [ ] Jika auto-init gagal, manual init via `POST /admin/db/init` berhasil

## 🧪 Quick Test

Setelah setup, test dengan:

```bash
# 1. Cek backend health
curl https://your-backend.railway.app/

# 2. Cek environment variables
curl https://your-backend.railway.app/debug/env

# 3. Manual init (jika perlu)
curl -X POST https://your-backend.railway.app/admin/db/init
```

## 🚀 Next Steps

Setelah tables berhasil dibuat:
1. Test register/login user
2. Test coin balance
3. Test video generation

