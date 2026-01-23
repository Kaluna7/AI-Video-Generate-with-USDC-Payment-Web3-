# Quick Fix: Create Tables di Railway PostgreSQL

## ⚡ SOLUSI CEPAT (2 MENIT)

### Step 1: Pastikan DATABASE_URL Sudah Di-Set

1. Buka **Backend Service** (bukan PostgreSQL service)
2. Klik tab **"Variables"**
3. Pastikan ada variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `${{ Postgres.DATABASE_URL }}`
   - (Ganti `Postgres` dengan nama service PostgreSQL Anda)

### Step 2: Redeploy Backend (PENTING!)

1. Di **Backend Service**, klik **"Redeploy"**
2. Tunggu sampai status **"Running"**
3. **JANGAN SKIP STEP INI!** Railway hanya inject ENV saat start

### Step 3: Cek Logs

Setelah redeploy, buka **"Logs"** tab dan cari:

```
[DB] DATABASE_URL exists: True
[STARTUP] DATABASE_URL exists: True
[STARTUP] Found 4 table(s) to create: ['users', 'user_coin_balances', 'coin_topup_txs', 'stored_videos']
[DB] ✅ Tables ready
```

**Jika tidak muncul atau ada error** → lanjut ke Step 4

### Step 4: Manual Create Tables (Jika Auto-Init Gagal)

Buka terminal atau gunakan Railway Shell, lalu:

```bash
# Ganti URL dengan backend Railway Anda
curl -X POST https://your-backend.railway.app/admin/db/init
```

**Response yang diharapkan:**
```json
{
  "success": true,
  "message": "Database tables initialized successfully",
  "tables": ["users", "user_coin_balances", "coin_topup_txs", "stored_videos"]
}
```

### Step 5: Verify Tables Created

1. Buka **PostgreSQL service** → **"Database"** tab → **"Data"**
2. Refresh halaman
3. Seharusnya sekarang muncul 4 tables:
   - `users`
   - `user_coin_balances`
   - `coin_topup_txs`
   - `stored_videos`

## 🔍 Troubleshooting

### Masalah: "DATABASE_URL exists: False" di logs

**Solusi:**
1. Pastikan variable di-set di **Backend Service**, bukan PostgreSQL service
2. Pastikan format: `${{ Postgres.DATABASE_URL }}` (ganti `Postgres` dengan nama service)
3. **Redeploy** setelah set variable

### Masalah: "Found 0 table(s)" di logs

**Solusi:**
- Models tidak ter-import (tapi ini sudah benar di code)
- Cek apakah ada error di logs saat import models

### Masalah: Manual init endpoint error

**Solusi:**
1. Cek apakah backend URL benar
2. Cek logs untuk error detail
3. Pastikan DATABASE_URL sudah benar

## ✅ Checklist

- [ ] DATABASE_URL sudah di-set di Backend Service Variables
- [ ] Format: `${{ Postgres.DATABASE_URL }}`
- [ ] Backend sudah di-redeploy setelah set variable
- [ ] Cek logs - harus ada "DATABASE_URL exists: True"
- [ ] Cek logs - harus ada "Found 4 table(s)"
- [ ] Jika auto-init gagal, gunakan `/admin/db/init` endpoint
- [ ] Refresh PostgreSQL Data tab untuk verify tables

