# ⚠️ PENTING: Nama Service Harus Exact Match!

## ❌ TIDAK BISA Pakai Nama Acak

**Format `${{ ServiceName.DATABASE_URL }}` TIDAK bisa pakai nama acak!**

Nama service harus **exact match** dengan nama service PostgreSQL yang sebenarnya di Railway Dashboard.

---

## ❌ Contoh yang SALAH

```
${{ kaluna.DATABASE_URL }}        ❌ SALAH (jika service name bukan "kaluna")
${{ mydb.DATABASE_URL }}          ❌ SALAH (jika service name bukan "mydb")
${{ database123.DATABASE_URL }}   ❌ SALAH (jika service name bukan "database123")
```

**Apa yang terjadi jika pakai nama salah?**
- Railway tidak bisa resolve variable
- `DATABASE_URL` akan menjadi `null` atau empty
- Backend akan pakai SQLite fallback
- Atau error "could not translate host name"

---

## ✅ Yang BENAR

Nama service harus **sama persis** dengan yang ada di Railway Dashboard.

**Contoh:**
- Jika di Railway service name = `Postgres` → `${{ Postgres.DATABASE_URL }}`
- Jika di Railway service name = `PostgreSQL` → `${{ PostgreSQL.DATABASE_URL }}`
- Jika di Railway service name = `postgres` → `${{ postgres.DATABASE_URL }}`
- Jika di Railway service name = `kaluna` → `${{ kaluna.DATABASE_URL }}` ✅ (jika memang nama servicenya "kaluna")

---

## 🔍 Cara Cek Nama Service yang Benar

### STEP 1: Buka Railway Dashboard

1. Login ke Railway
2. Buka **Project** Anda

### STEP 2: Lihat Daftar Services

Di halaman project, lihat daftar services:

```
┌─────────────────────────────────┐
│  Your Project Name              │
├─────────────────────────────────┤
│                                 │
│  📦 backend                     │
│  🐘 Postgres                    │  ← Nama service PostgreSQL
│  📦 frontend                    │
│                                 │
└─────────────────────────────────┘
```

### STEP 3: Catat Nama Service PostgreSQL

- **Nama service** adalah teks di bawah icon elephant (🐘)
- Bisa `Postgres`, `PostgreSQL`, `postgres`, `kaluna`, atau nama lain
- **Harus sama persis** (case-sensitive!)

---

## ✅ Jika Nama Service Benar-benar "kaluna"

Jika di Railway Dashboard, service PostgreSQL Anda memang bernama `kaluna`, maka:

**BENAR:**
```
${{ kaluna.DATABASE_URL }}
```

**Tapi jika service name sebenarnya `Postgres`, maka:**
```
${{ kaluna.DATABASE_URL }}  ❌ SALAH
${{ Postgres.DATABASE_URL }} ✅ BENAR
```

---

## 🧪 Cara Test Apakah Nama Service Benar

### Test 1: Set Variable dan Redeploy

1. Set `DATABASE_URL = ${{ kaluna.DATABASE_URL }}`
2. Redeploy Backend Service
3. Cek logs

**Jika BENAR:**
```
[DB] DATABASE_URL exists: True
[DB] ✅ Using PostgreSQL: postgresql://postgres:***@***:***/railway
```

**Jika SALAH:**
```
[DB] DATABASE_URL exists: False
[DB] ⚠️  DATABASE_URL not set, using default SQLite
```

### Test 2: Cek di Railway Variables

1. Buka **PostgreSQL Service** di Railway
2. Klik tab **"Variables"**
3. Lihat variable `DATABASE_URL`
4. Copy connection string-nya
5. Bandingkan dengan yang di-inject ke Backend Service

---

## 🎯 Solusi: Pakai Hardcode (Jika Tidak Yakin)

Jika tidak yakin nama service atau format Railway reference tidak bekerja, pakai hardcode:

**Name:** `DATABASE_URL`  
**Value:** 
```
postgresql://postgres:LJRgxXLhwUXCeiNRAxxeelseADedODLx@shortline.proxy.rlwy.net:47160/railway
```

Ini **selalu bekerja** karena tidak perlu resolve service name.

---

## 📋 Checklist

- [ ] Sudah cek nama service PostgreSQL di Railway Dashboard
- [ ] Nama service di `${{ ServiceName.DATABASE_URL }}` sama persis dengan yang di Railway
- [ ] Case-sensitive: `Postgres` ≠ `postgres` ≠ `POSTGRES`
- [ ] Sudah redeploy setelah set variable
- [ ] Logs menunjukkan "✅ Using PostgreSQL" (bukan SQLite)

---

## 🚀 Quick Answer

**Pertanyaan:** Boleh pakai `${{ kaluna.DATABASE_URL }}`?

**Jawaban:** 
- ✅ **Boleh**, **HANYA JIKA** nama service PostgreSQL di Railway Dashboard memang `kaluna`
- ❌ **Tidak boleh**, jika nama service sebenarnya bukan `kaluna`

**Cara cek:**
1. Buka Railway Dashboard → Project
2. Lihat nama service PostgreSQL (di bawah icon elephant)
3. Jika memang `kaluna` → ✅ Pakai `${{ kaluna.DATABASE_URL }}`
4. Jika bukan `kaluna` → ❌ Ganti dengan nama yang benar

**Alternatif:**
Jika tidak yakin, pakai hardcode connection string langsung (tidak perlu resolve service name).

