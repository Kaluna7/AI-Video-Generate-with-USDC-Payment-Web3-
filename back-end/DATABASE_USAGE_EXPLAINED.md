# 📊 Penjelasan Penggunaan Database di Code

## 🎯 Ringkasan

**Code Anda menggunakan database yang dinamis:**
- ✅ **Railway (Production)**: PostgreSQL (jika `DATABASE_URL` di-set)
- ⚠️ **Local (Development)**: SQLite fallback (jika `DATABASE_URL` tidak di-set)

## 📁 Struktur Database

### 1. **Video Metadata** → Database (PostgreSQL atau SQLite)
- Model: `StoredVideo` (table: `stored_videos`)
- Menyimpan: `user_id`, `provider_task_id`, `file_path`, `file_size`, `expires_at`, `created_at`
- **Lokasi**: PostgreSQL di Railway, atau SQLite (`dev.db`) di local

### 2. **Video Files** → Filesystem
- **Lokasi**: `back-end/storage/videos/`
- Format: `{user_id}_{provider_task_id}_{random}.mp4`
- **TIDAK** disimpan di database (baik SQLite maupun PostgreSQL)

### 3. **User Data** → Database (PostgreSQL atau SQLite)
- Models: `User`, `UserCoinBalance`, `CoinTopUpTx`
- **Lokasi**: PostgreSQL di Railway, atau SQLite (`dev.db`) di local

## 🔄 Logika Database Selection

Di `database.py`:

```python
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # ✅ Production: Pakai PostgreSQL dari Railway
    if DATABASE_URL.startswith("postgresql://"):
        # PostgreSQL dengan connection pooling
else:
    # ⚠️ Development: Fallback ke SQLite
    DATABASE_URL = "sqlite:///./dev.db"
```

## ✅ Di Railway (Production)

**Jika `DATABASE_URL` sudah di-set:**
- ✅ Semua data (users, coins, videos metadata) → **PostgreSQL**
- ✅ Video files → **Filesystem** (`storage/videos/`)
- ❌ SQLite **TIDAK** digunakan

**Cek di Railway:**
1. Backend Service → Variables
2. Pastikan ada: `DATABASE_URL=${{ Postgres.DATABASE_URL }}`
3. Cek logs: Harus muncul `[DB] ✅ Using PostgreSQL`

## ⚠️ Di Local (Development)

**Jika `DATABASE_URL` tidak di-set:**
- ⚠️ Semua data → **SQLite** (`dev.db`)
- ⚠️ Video files → **Filesystem** (`storage/videos/`)

**Untuk pakai PostgreSQL di local:**
```bash
# Set environment variable
export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Atau di .env file
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

## 🗂️ File `dev.db`

- **Lokasi**: `back-end/dev.db`
- **Fungsi**: SQLite database untuk development local
- **Production**: **TIDAK** digunakan di Railway (jika `DATABASE_URL` di-set)

**Rekomendasi:**
- Tambahkan `dev.db` ke `.gitignore` (jika belum)
- Jangan commit `dev.db` ke GitHub

## 📊 Tabel yang Ada

Semua tabel ini akan dibuat di **database yang aktif** (PostgreSQL atau SQLite):

1. `users` - Data user
2. `user_coin_balances` - Saldo coin user
3. `coin_topup_txs` - Transaksi top-up
4. `stored_videos` - Metadata video yang disimpan

## 🔍 Cara Cek Database yang Digunakan

### 1. Cek Logs Backend

**PostgreSQL:**
```
[DB] ✅ Using PostgreSQL: ...
[STARTUP] ✅ Using PostgreSQL (Railway production)
```

**SQLite:**
```
[DB] ⚠️  DATABASE_URL not set, using default SQLite: sqlite:///./dev.db
[DB] 🟡 Using SQLite engine (development mode)
```

### 2. Cek Environment Variable

```bash
# Di Railway
curl https://your-backend.railway.app/debug/env
# Harus return: "database": true

# Di local
echo $DATABASE_URL
# Jika kosong → pakai SQLite
# Jika ada → pakai PostgreSQL
```

### 3. Cek Database Type

```bash
curl -X POST https://your-backend.railway.app/admin/db/init
# Response akan menunjukkan: "database_type": "PostgreSQL" atau "SQLite"
```

## ✅ Kesimpulan

**Untuk Production (Railway):**
- ✅ Set `DATABASE_URL=${{ Postgres.DATABASE_URL }}` di Railway Variables
- ✅ Semua data akan disimpan di **PostgreSQL**
- ✅ SQLite **TIDAK** digunakan

**Untuk Development (Local):**
- ⚠️ Jika `DATABASE_URL` tidak di-set → pakai SQLite (`dev.db`)
- ✅ Jika `DATABASE_URL` di-set → pakai PostgreSQL

**Video Storage:**
- 📁 Video files → **Selalu di filesystem** (`storage/videos/`)
- 💾 Video metadata → **Di database** (PostgreSQL atau SQLite, tergantung `DATABASE_URL`)

