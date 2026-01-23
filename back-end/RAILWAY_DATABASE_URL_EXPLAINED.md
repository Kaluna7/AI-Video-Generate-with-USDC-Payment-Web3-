# Penjelasan: ${{ Postgres.DATABASE_URL }}

## ❓ Apa itu `Postgres` di `${{ Postgres.DATABASE_URL }}`?

**`Postgres` = NAMA SERVICE PostgreSQL di Railway** (bukan nama database!)

## 🔍 Cara Cek Nama Service PostgreSQL

### Di Railway Dashboard:

1. Buka **Railway Dashboard** → **Project**
2. Lihat daftar services di project Anda
3. Cari service yang bertipe **"PostgreSQL"** atau **"Postgres"**
4. **Nama service** biasanya:
   - `Postgres` (default)
   - `postgres` 
   - `PostgreSQL`
   - Atau nama custom yang Anda berikan saat create

### Contoh:

Jika di Railway project Anda ada:
- Service 1: `backend` (Python/FastAPI)
- Service 2: `Postgres` (PostgreSQL) ← **INI NAMA SERVICENYA**

Maka gunakan: `${{ Postgres.DATABASE_URL }}`

## ✅ Format yang Benar

```
${{ NamaServicePostgreSQL.DATABASE_URL }}
```

**Contoh:**
- Jika nama service = `Postgres` → `${{ Postgres.DATABASE_URL }}`
- Jika nama service = `postgres` → `${{ postgres.DATABASE_URL }}`
- Jika nama service = `PostgreSQL` → `${{ PostgreSQL.DATABASE_URL }}`
- Jika nama service = `my-database` → `${{ my-database.DATABASE_URL }}`

## 🎯 Langkah Praktis

### Opsi 1: Gunakan Format Railway (Recommended)

1. Buka **Backend Service** → **Variables**
2. Klik **"New Variable"**
3. **Name**: `DATABASE_URL`
4. **Value**: `${{ Postgres.DATABASE_URL }}`
   - (Ganti `Postgres` dengan nama service PostgreSQL Anda)
5. Klik **"Add"**

### Opsi 2: Copy Connection String Manual (Jika Format Tidak Bekerja)

1. Buka **PostgreSQL Service** di Railway
2. Klik tab **"Connect"** atau **"Variables"**
3. Copy **"Connection URL"** atau **"DATABASE_URL"**
4. Format biasanya: `postgresql://postgres:PASSWORD@HOST:PORT/railway`
5. Paste sebagai value di **Backend Service** → **Variables** → `DATABASE_URL`

## 📝 Catatan Penting

- **Nama Database**: Biasanya `railway` (default Railway)
- **Nama Service**: Bisa `Postgres`, `postgres`, atau custom name
- **Format `${{ }}`**: Adalah cara Railway untuk reference variable dari service lain
- **Case Sensitive**: `Postgres` ≠ `postgres` (harus sesuai nama service)

## 🔍 Cara Cek Nama Service dengan Benar

1. Di Railway Dashboard, lihat **list services**
2. Service PostgreSQL biasanya punya icon **elephant** (PostgreSQL logo)
3. **Nama service** ada di bawah icon/logo
4. Gunakan nama itu (case-sensitive) di format `${{ NamaService.DATABASE_URL }}`

## ✅ Contoh Lengkap

**Scenario:**
- PostgreSQL service nama: `Postgres`
- Backend service nama: `backend`

**Setup:**
1. Buka service `backend` (bukan `Postgres`)
2. Variables → New Variable
3. Name: `DATABASE_URL`
4. Value: `${{ Postgres.DATABASE_URL }}` ← gunakan nama service PostgreSQL
5. Save & Redeploy

**Result:**
Railway akan otomatis inject:
```
postgresql://postgres:PASSWORD@HOST:PORT/railway
```

Ke environment variable `DATABASE_URL` di backend service.

