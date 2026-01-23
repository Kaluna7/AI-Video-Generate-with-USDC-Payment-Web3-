# 🎯 Railway DATABASE_URL - Opsi Lengkap

## ✅ OPSI 1: Pakai DATABASE_PUBLIC_URL (PALING MUDAH)

Jika Railway sudah provide `DATABASE_PUBLIC_URL`, langsung pakai:

### Di Railway → Backend Service → Variables:

**Name:** `DATABASE_URL`  
**Value:** 
```
${{ Postgres.DATABASE_PUBLIC_URL }}
```

**ATAU jika variable sudah ada langsung:**

**Name:** `DATABASE_URL`  
**Value:** 
```
postgresql://postgres:LJRgxXLhwUXCeiNRAxxeelseADedODLx@shortline.proxy.rlwy.net:47160/railway
```

---

## ✅ OPSI 2: Pakai Railway Reference (RECOMMENDED)

### Di Railway → Backend Service → Variables:

**Name:** `DATABASE_URL`  
**Value:** 
```
${{ Postgres.DATABASE_URL }}
```

**Catatan:** Ganti `Postgres` dengan nama service PostgreSQL Anda yang sebenarnya.

---

## ✅ OPSI 3: Pakai Public Hostname (Jika Opsi Lain Tidak Bisa)

### Di Railway → Backend Service → Variables:

**Name:** `DATABASE_URL`  
**Value:** 
```
postgresql://postgres:LJRgxXLhwUXCeiNRAxxeelseADedODLx@shortline.proxy.rlwy.net:47160/railway
```

---

## 📋 Langkah Lengkap (Copy-Paste)

### STEP 1: Buka Railway Dashboard

1. Login ke Railway
2. Buka **Project** Anda
3. Klik **Backend Service** (bukan PostgreSQL service)

### STEP 2: Set DATABASE_URL

1. Klik tab **"Variables"**
2. Cari variable `DATABASE_URL` atau klik **"New Variable"**
3. **Name:** `DATABASE_URL`
4. **Value:** Pilih salah satu opsi di bawah:

#### OPSI A: Pakai DATABASE_PUBLIC_URL (Jika Tersedia)
```
${{ Postgres.DATABASE_PUBLIC_URL }}
```

#### OPSI B: Pakai Railway Reference (Recommended)
```
${{ Postgres.DATABASE_URL }}
```
*(Ganti `Postgres` dengan nama service PostgreSQL Anda)*

#### OPSI C: Hardcode Public URL
```
postgresql://postgres:LJRgxXLhwUXCeiNRAxxeelseADedODLx@shortline.proxy.rlwy.net:47160/railway
```

5. Klik **"Save"** atau **"Add"**

### STEP 3: Redeploy Backend (WAJIB!)

1. Setelah set variable, klik **"Redeploy"** di Backend Service
2. Tunggu sampai status **"Running"**

### STEP 4: Verify

Cek logs Backend Service, harus muncul:
```
[DB] DATABASE_URL exists: True
[DB] ✅ Using PostgreSQL: postgresql://postgres:***@shortline.proxy.rlwy.net:***/railway
[STARTUP] ✅ Database connection successful
```

---

## 🔍 Cara Cek Nama Service PostgreSQL

1. Di Railway Dashboard, lihat **list services**
2. Cari service dengan icon **elephant** (PostgreSQL)
3. **Nama service** ada di bawah icon
4. Gunakan nama itu (case-sensitive) di format `${{ NamaService.DATABASE_URL }}`

---

## ⚠️ Troubleshooting

### Masalah: Masih error "could not translate host name"

**Solusi:**
- Pastikan pakai **public hostname** (`shortline.proxy.rlwy.net`), bukan internal (`postgres.railway.internal`)
- Atau pakai format Railway reference: `${{ Postgres.DATABASE_URL }}`

### Masalah: "Service not found"

**Solusi:**
- Cek nama service PostgreSQL di Railway
- Pastikan case-sensitive (Postgres ≠ postgres)
- Gunakan nama yang exact

---

## ✅ Checklist

- [ ] `DATABASE_URL` sudah di-set di **Backend Service** (bukan PostgreSQL service)
- [ ] Value menggunakan public hostname atau Railway reference
- [ ] Backend sudah di-redeploy setelah set variable
- [ ] Logs menunjukkan "✅ Using PostgreSQL"
- [ ] Logs menunjukkan "✅ Database connection successful"

