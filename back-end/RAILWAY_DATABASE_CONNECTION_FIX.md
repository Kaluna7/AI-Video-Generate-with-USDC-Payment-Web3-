# 🔧 Fix: Railway Database Connection Error

## ❌ Error yang Terjadi

```
could not translate host name "postgres.railway.internal" to address: Name or service not known
```

## 🎯 Penyebab

Error ini terjadi karena:
1. **Service name salah** di `DATABASE_URL` (misalnya `Postgres` tapi service name sebenarnya `PostgreSQL`)
2. **PostgreSQL service belum running** atau belum terhubung dengan Backend service
3. **Format `DATABASE_URL` salah** di Railway Variables

## ✅ Solusi Lengkap

### STEP 1: Cek Nama Service PostgreSQL di Railway

1. Buka **Railway Dashboard**
2. Lihat daftar services di project Anda
3. **Catat nama service PostgreSQL** yang sebenarnya
   - Contoh: `PostgreSQL`, `Postgres`, `postgres`, `database`, dll
   - **PENTING**: Nama ini case-sensitive!

### STEP 2: Set DATABASE_URL dengan Service Name yang Benar

1. Buka **Backend Service** (bukan PostgreSQL service!)
2. Klik tab **"Variables"**
3. Cari atau buat variable `DATABASE_URL`
4. **Value** harus menggunakan format:
   ```
   ${{ PostgreSQL.DATABASE_URL }}
   ```
   **Ganti `PostgreSQL` dengan nama service PostgreSQL Anda yang sebenarnya!**

   **Contoh:**
   - Jika service name = `PostgreSQL` → `${{ PostgreSQL.DATABASE_URL }}`
   - Jika service name = `Postgres` → `${{ Postgres.DATABASE_URL }}`
   - Jika service name = `database` → `${{ database.DATABASE_URL }}`

5. Klik **"Save"** atau **"Add"**

### STEP 3: Pastikan PostgreSQL Service Sudah Running

1. Buka **PostgreSQL Service** di Railway
2. Pastikan status adalah **"Running"**
3. Jika tidak running, klik **"Deploy"** atau **"Start"**

### STEP 4: Pastikan Services Terhubung

1. Di Railway Dashboard, pastikan **Backend Service** dan **PostgreSQL Service** ada di project yang sama
2. Jika perlu, buat **Network** atau pastikan mereka dalam **Environment** yang sama

### STEP 5: Redeploy Backend (WAJIB!)

1. Setelah set `DATABASE_URL`, **WAJIB** redeploy Backend Service
2. Klik **"Redeploy"** di Backend Service
3. Tunggu sampai status **"Running"**

### STEP 6: Cek Logs

Setelah redeploy, cek logs Backend Service:

**✅ BENAR:**
```
[DB] DATABASE_URL exists: True
[DB] ✅ Using PostgreSQL: postgresql://postgres:password@hostname:5432/railway
[STARTUP] ✅ Database connection successful
```

**❌ SALAH (masih error):**
```
[DB] DATABASE_URL exists: True
[DB] ⚠️  DATABASE_URL format: postgres.railway.internal...
[STARTUP] ❌ Database connection failed: could not translate host name...
```

## 🔍 Troubleshooting

### Masalah: Masih error setelah set DATABASE_URL

**Solusi:**
1. **Cek service name** - Pastikan nama service di `${{ ServiceName.DATABASE_URL }}` sesuai dengan nama service PostgreSQL yang sebenarnya
2. **Cek format** - Harus `${{ ServiceName.DATABASE_URL }}` (dengan `${{` dan `}}`)
3. **Redeploy** - Setelah set variable, wajib redeploy

### Masalah: Service name tidak ditemukan

**Solusi:**
1. Buka PostgreSQL service di Railway
2. Lihat nama service di bagian atas (biasanya di sidebar atau header)
3. Gunakan nama yang **exact** (case-sensitive)
4. Jika service name ada spasi, ganti dengan underscore atau tanpa spasi

### Masalah: PostgreSQL service tidak running

**Solusi:**
1. Buka PostgreSQL service
2. Klik **"Deploy"** atau **"Start"**
3. Tunggu sampai status **"Running"**

### Masalah: Backend dan PostgreSQL di project berbeda

**Solusi:**
1. Pastikan kedua service ada di **project yang sama**
2. Jika perlu, pindahkan salah satu service ke project yang sama

## 📝 Format DATABASE_URL yang Benar

### ✅ BENAR

```
${{ PostgreSQL.DATABASE_URL }}
${{ Postgres.DATABASE_URL }}
${{ database.DATABASE_URL }}
```

**Catatan:** Ganti nama service sesuai dengan yang ada di Railway Anda!

### ❌ SALAH

```
postgres.railway.internal  # ❌ Jangan hardcode hostname internal
${{ Postgres.DATABASE_URL }}  # ❌ Jika service name sebenarnya "PostgreSQL"
postgresql://...  # ❌ Jangan hardcode connection string
```

## 🧪 Test Connection

Setelah fix, test dengan:

```bash
# 1. Cek backend health
curl https://your-backend.railway.app/

# 2. Cek environment variables
curl https://your-backend.railway.app/debug/env
# Harus return: "database": true

# 3. Test database connection
curl -X POST https://your-backend.railway.app/admin/db/init
# Harus return success dengan database_type: "PostgreSQL"
```

## 📋 Checklist

- [ ] Nama service PostgreSQL sudah dicatat dengan benar
- [ ] `DATABASE_URL` di-set di **Backend Service** (bukan PostgreSQL service)
- [ ] Format: `${{ ServiceName.DATABASE_URL }}` (ganti `ServiceName` dengan nama service yang benar)
- [ ] PostgreSQL service status **"Running"**
- [ ] Backend service sudah di-redeploy setelah set variable
- [ ] Logs menunjukkan "✅ Using PostgreSQL"
- [ ] Logs menunjukkan "✅ Database connection successful"
- [ ] Test endpoint `/admin/db/init` berhasil

## 🚀 Quick Fix (Copy-Paste)

1. Buka Railway → Backend Service → Variables
2. Set `DATABASE_URL` = `${{ PostgreSQL.DATABASE_URL }}`
   (Ganti `PostgreSQL` dengan nama service PostgreSQL Anda)
3. Redeploy Backend Service
4. Cek logs - harus muncul "✅ Using PostgreSQL"

