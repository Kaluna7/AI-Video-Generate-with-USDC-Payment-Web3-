# ⚠️ PENTING: Set PostgreSQL di Railway

## Code Sudah Siap untuk PostgreSQL

Code Anda **SUDAH BENAR** dan akan otomatis menggunakan PostgreSQL jika `DATABASE_URL` di-set dengan format PostgreSQL.

## ✅ Yang Perlu Dilakukan di Railway

### Step 1: Set DATABASE_URL di Backend Service

1. Buka **Railway Dashboard** → **Backend Service** (bukan PostgreSQL service)
2. Klik tab **"Variables"**
3. Klik **"New Variable"**
4. Isi:
   - **Name**: `DATABASE_URL`
   - **Value**: `${{ Postgres.DATABASE_URL }}`
   - ⚠️ **PENTING**: Ganti `Postgres` dengan nama service PostgreSQL Anda (biasanya `Postgres` atau `postgres`)

### Step 2: Verify Format

Setelah set, Railway akan inject variable dengan format:
```
postgresql://postgres:PASSWORD@HOST:PORT/railway
```

Code akan otomatis:
- ✅ Deteksi format `postgresql://`
- ✅ Gunakan PostgreSQL engine dengan connection pooling
- ✅ Create tables di PostgreSQL

### Step 3: Redeploy Backend (WAJIB!)

1. Di **Backend Service**, klik **"Redeploy"**
2. Tunggu sampai status **"Running"**
3. **JANGAN SKIP!** Railway hanya inject ENV saat start

### Step 4: Verify di Logs

Setelah redeploy, cek logs dan cari:

```
[DB] DATABASE_URL exists: True
[DB] ✅ Using PostgreSQL: postgresql://postgres:***@***:***/railway
[DB] 🔵 Configuring PostgreSQL engine with connection pooling...
[DB] ✅ PostgreSQL engine ready
[STARTUP] Found 4 table(s) to create: ['users', 'user_coin_balances', 'coin_topup_txs', 'stored_videos']
[DB] ✅ Tables ready
```

## ❌ Jika Masih Pakai SQLite

Jika di logs muncul:
```
[DB] ⚠️  DATABASE_URL not set, using default SQLite
```

**Artinya:**
- ❌ `DATABASE_URL` belum di-set di Railway
- ❌ Atau di-set di service yang salah
- ❌ Atau belum di-redeploy setelah set

**Solusi:**
1. Pastikan set di **Backend Service** (bukan PostgreSQL service)
2. Format: `${{ Postgres.DATABASE_URL }}`
3. **Redeploy** setelah set

## ✅ Checklist

- [ ] PostgreSQL service sudah dibuat di Railway
- [ ] `DATABASE_URL` sudah di-set di **Backend Service** Variables
- [ ] Format: `${{ Postgres.DATABASE_URL }}` (ganti `Postgres` dengan nama service)
- [ ] Backend sudah di-redeploy setelah set variable
- [ ] Logs menunjukkan "✅ Using PostgreSQL"
- [ ] Logs menunjukkan "✅ PostgreSQL engine ready"
- [ ] Tables sudah terbuat (cek di PostgreSQL → Database → Data)

## 🧪 Test

Setelah semua setup, test dengan:

```bash
# Test API
curl https://your-backend.railway.app/

# Test database connection
curl https://your-backend.railway.app/debug/env
# Harus return: {"database": true, ...}

# Manual init tables (jika perlu)
curl -X POST https://your-backend.railway.app/admin/db/init
```

## 📝 Catatan

- Code **OTOMATIS** akan pakai PostgreSQL jika `DATABASE_URL` format `postgresql://`
- Tidak perlu ubah code, cukup set variable di Railway
- SQLite hanya untuk development local (jika `DATABASE_URL` tidak di-set)

