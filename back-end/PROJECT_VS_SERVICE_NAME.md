# 🔍 Perbedaan: Project Name vs Service Name

## ❓ Apa Bedanya?

### 📁 Project Name (Nama Project)
- **Lokasi**: Di sidebar kiri Railway Dashboard
- **Contoh**: `diplomatic-youth`, `skillful-victory`, `melodious-luck`
- **Fungsi**: Container/wadah untuk beberapa services
- **TIDAK dipakai** di `${{ ProjectName.DATABASE_URL }}`

### 🐘 Service Name (Nama Service)
- **Lokasi**: Di card kanan, di bawah icon service
- **Contoh**: `Postgres`, `PostgreSQL`, `backend`, `frontend`
- **Fungsi**: Nama service individual (PostgreSQL, Backend, dll)
- **INI YANG DIPAKAI** di `${{ ServiceName.DATABASE_URL }}`

---

## 🎯 Dari Screenshot Anda

### Di Sidebar Kiri:
```
✅ diplomatic-youth        ← NAMA PROJECT (bukan service!)
   skillful-victory
   melodious-luck
   intuitive-freedom
   + New Project
```

### Di Card Kanan:
```
🐘 Postgres               ← NAMA SERVICE PostgreSQL (INI YANG BENAR!)
   ● Online
   💾 postgres-volume
```

---

## ✅ Yang Harus Dipakai

**Name:** `DATABASE_URL`  
**Value:** 
```
${{ Postgres.DATABASE_URL }}
```

**BUKAN:**
```
${{ diplomatic-youth.DATABASE_URL }}  ❌ SALAH (ini project name, bukan service name)
```

---

## 📋 Cara Identifikasi

### Project Name:
- ✅ Di sidebar kiri
- ✅ Biasanya ada banyak project dalam list
- ✅ Bisa diklik untuk switch project
- ❌ TIDAK dipakai di `${{ }}`

### Service Name:
- ✅ Di card kanan (detail view)
- ✅ Ada icon service (elephant untuk PostgreSQL)
- ✅ Status: Online/Offline
- ✅ INI YANG DIPAKAI di `${{ ServiceName.DATABASE_URL }}`

---

## 🎯 Quick Answer

**Pertanyaan:** "diplomatic-youth" itu nama service?

**Jawaban:** 
- ❌ **Bukan!** "diplomatic-youth" adalah **nama project**
- ✅ **Nama service PostgreSQL** adalah **"Postgres"** (terlihat di card kanan dengan icon elephant)

**Yang harus dipakai:**
```
${{ Postgres.DATABASE_URL }}
```

---

## ✅ Langkah Lengkap

1. Buka Railway Dashboard
2. Pilih project "diplomatic-youth" (di sidebar kiri)
3. Lihat card kanan dengan icon elephant (🐘)
4. Nama service = **"Postgres"** (di bawah icon)
5. Pakai: `${{ Postgres.DATABASE_URL }}`

---

## 📝 Checklist

- [ ] Sudah bedakan project name vs service name
- [ ] Project name = "diplomatic-youth" (di sidebar)
- [ ] Service name = "Postgres" (di card kanan)
- [ ] Pakai `${{ Postgres.DATABASE_URL }}` (bukan project name)

