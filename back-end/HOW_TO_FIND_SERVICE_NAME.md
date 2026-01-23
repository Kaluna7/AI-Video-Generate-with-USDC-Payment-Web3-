# 🔍 Cara Cek Nama Service PostgreSQL di Railway

## ❓ Apa itu `Postgres` di `${{ Postgres.DATABASE_URL }}`?

**`Postgres` = NAMA SERVICE PostgreSQL di Railway** (bukan nama database!)

Ini adalah **placeholder** yang harus diganti dengan nama service PostgreSQL yang sebenarnya di project Railway Anda.

---

## 🎯 Cara Cek Nama Service PostgreSQL

### STEP 1: Buka Railway Dashboard

1. Login ke [Railway Dashboard](https://railway.app)
2. Buka **Project** Anda

### STEP 2: Lihat Daftar Services

Di halaman project, Anda akan melihat **daftar services** seperti ini:

```
┌─────────────────────────────────┐
│  Your Project Name              │
├─────────────────────────────────┤
│                                 │
│  📦 backend                     │  ← Backend Service
│  🐘 Postgres                    │  ← PostgreSQL Service (INI NAMANYA!)
│  📦 frontend                    │  ← Frontend Service (jika ada)
│                                 │
└─────────────────────────────────┘
```

### STEP 3: Catat Nama Service PostgreSQL

- **Nama service** adalah teks di bawah icon/logo service
- Service PostgreSQL biasanya punya icon **elephant** (🐘) atau logo PostgreSQL
- **Nama service** bisa berupa:
  - `Postgres` (paling umum)
  - `PostgreSQL`
  - `postgres`
  - `database`
  - Atau nama custom yang Anda berikan saat create

---

## ✅ Contoh Nama Service

### Contoh 1: Nama Service = `Postgres`

Jika di Railway Anda melihat:
```
🐘 Postgres
```

Maka gunakan:
```
${{ Postgres.DATABASE_URL }}
```

### Contoh 2: Nama Service = `PostgreSQL`

Jika di Railway Anda melihat:
```
🐘 PostgreSQL
```

Maka gunakan:
```
${{ PostgreSQL.DATABASE_URL }}
```

### Contoh 3: Nama Service = `postgres` (lowercase)

Jika di Railway Anda melihat:
```
🐘 postgres
```

Maka gunakan:
```
${{ postgres.DATABASE_URL }}
```

### Contoh 4: Nama Service = `database`

Jika di Railway Anda melihat:
```
🐘 database
```

Maka gunakan:
```
${{ database.DATABASE_URL }}
```

---

## ⚠️ PENTING: Case-Sensitive!

**Nama service adalah CASE-SENSITIVE!**

- `Postgres` ≠ `postgres` ≠ `POSTGRES`
- `PostgreSQL` ≠ `postgresql` ≠ `POSTGRESQL`

**Harus sama persis** dengan yang ada di Railway Dashboard!

---

## 🎯 Langkah Praktis

### Opsi 1: Cek di Railway Dashboard (Visual)

1. Buka Railway → Project
2. Lihat daftar services
3. Cari service dengan icon **elephant** (PostgreSQL)
4. **Nama service** ada di bawah icon
5. Copy nama itu (case-sensitive!)
6. Ganti `Postgres` di `${{ Postgres.DATABASE_URL }}` dengan nama yang Anda copy

### Opsi 2: Cek di Railway Variables

1. Buka **PostgreSQL Service** di Railway
2. Klik tab **"Variables"**
3. Cari variable `DATABASE_URL` atau `PGDATABASE`
4. Lihat value-nya, biasanya ada clue tentang nama service

### Opsi 3: Cek di Railway Connect Tab

1. Buka **PostgreSQL Service** di Railway
2. Klik tab **"Connect"**
3. Lihat **"Connection URL"** atau **"Public Network URL"**
4. Biasanya ada informasi tentang service name

---

## 📋 Format Lengkap

```
${{ NamaServicePostgreSQL.DATABASE_URL }}
```

**Ganti `NamaServicePostgreSQL` dengan nama service yang sebenarnya!**

---

## ✅ Contoh Lengkap

**Scenario:**
- Di Railway project Anda ada service: `🐘 Postgres`
- Backend service: `📦 backend`

**Setup:**
1. Buka service `backend` (bukan `Postgres`)
2. Variables → New Variable
3. **Name:** `DATABASE_URL`
4. **Value:** `${{ Postgres.DATABASE_URL }}` ← gunakan nama service PostgreSQL
5. Save & Redeploy

**Result:**
Railway akan otomatis inject connection string ke environment variable `DATABASE_URL`.

---

## 🔍 Jika Tidak Yakin Nama Service

### Cara 1: Coba Nama Umum

Coba satu per satu (case-sensitive):
- `${{ Postgres.DATABASE_URL }}`
- `${{ PostgreSQL.DATABASE_URL }}`
- `${{ postgres.DATABASE_URL }}`
- `${{ database.DATABASE_URL }}`

Setelah set, redeploy dan cek logs. Jika benar, akan muncul:
```
[DB] ✅ Using PostgreSQL: ...
```

### Cara 2: Pakai Hardcode (Alternatif)

Jika format Railway reference tidak bekerja, bisa pakai hardcode:

**Name:** `DATABASE_URL`  
**Value:** 
```
postgresql://postgres:PASSWORD@HOST:PORT/railway
```

(Copy dari PostgreSQL service → Connect tab → Connection URL)

---

## 🚀 Quick Answer

**Pertanyaan:** Ganti apa di `${{ Postgres.DATABASE_URL }}`?

**Jawaban:** 
- Ganti `Postgres` dengan **nama service PostgreSQL** yang sebenarnya di Railway Anda
- Nama service bisa dilihat di Railway Dashboard → Project → List Services
- Nama service biasanya: `Postgres`, `PostgreSQL`, `postgres`, atau custom name
- **Case-sensitive!** Harus sama persis dengan yang di Railway

**Contoh:**
- Jika nama service = `Postgres` → `${{ Postgres.DATABASE_URL }}`
- Jika nama service = `PostgreSQL` → `${{ PostgreSQL.DATABASE_URL }}`
- Jika nama service = `postgres` → `${{ postgres.DATABASE_URL }}`

