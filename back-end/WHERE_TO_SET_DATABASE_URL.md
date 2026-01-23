# 📍 Di Mana Set DATABASE_URL?

## ❌ TIDAK Perlu Edit File Code!

**DATABASE_URL TIDAK perlu di-set di file code atau `.env` untuk Railway production!**

---

## ✅ Yang Benar: Set di Railway Dashboard

### STEP 1: Buka Railway Dashboard

1. Login ke Railway
2. Buka **Project** Anda (misalnya "diplomatic-youth")
3. Klik **Backend Service** (bukan PostgreSQL service)

### STEP 2: Set di Variables Tab

1. Klik tab **"Variables"** (bukan "Settings" atau "Code")
2. Cari variable `DATABASE_URL` atau klik **"New Variable"**
3. **Name:** `DATABASE_URL`
4. **Value:** `${{ Postgres.DATABASE_URL }}`
5. Klik **"Save"** atau **"Add"**

### STEP 3: Redeploy (WAJIB!)

1. Setelah set variable, klik **"Redeploy"** di Backend Service
2. Tunggu sampai status **"Running"**

---

## 📁 File .env (Hanya untuk Development Local)

File `.env` di folder `back-end/` hanya untuk development local, bukan untuk Railway production.

### Di Local (Development):
```bash
# back-end/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### Di Railway (Production):
- ❌ **JANGAN** edit file `.env`
- ✅ **Set di Railway Dashboard** → Backend Service → Variables

---

## 🔄 Bagaimana Railway Bekerja?

1. **Anda set variable** di Railway Dashboard → Backend Service → Variables
2. **Railway inject** variable ke environment saat runtime
3. **Code membaca** dari `os.getenv("DATABASE_URL")` (sudah ada di `database.py`)
4. **Tidak perlu** edit file code!

---

## ✅ Checklist

- [ ] Buka Railway Dashboard (bukan edit file code)
- [ ] Buka Backend Service (bukan PostgreSQL service)
- [ ] Klik tab "Variables"
- [ ] Set `DATABASE_URL = ${{ Postgres.DATABASE_URL }}`
- [ ] Redeploy Backend Service
- [ ] Cek logs - harus muncul "✅ Using PostgreSQL"

---

## 🎯 Quick Answer

**Pertanyaan:** Berarti ganti di backend ya DATABASE_URL-nya?

**Jawaban:**
- ✅ **Ya**, tapi di **Railway Dashboard** → Backend Service → Variables
- ❌ **Bukan** di file code atau `.env`
- ✅ Set via web interface Railway
- ✅ Redeploy setelah set

---

## 📋 Langkah Lengkap (Copy-Paste)

1. **Buka Railway** → Login
2. **Pilih Project** → "diplomatic-youth"
3. **Klik Backend Service** (bukan PostgreSQL)
4. **Klik tab "Variables"**
5. **New Variable** atau edit yang ada:
   - **Name:** `DATABASE_URL`
   - **Value:** `${{ Postgres.DATABASE_URL }}`
6. **Save**
7. **Redeploy** Backend Service
8. **Cek logs** - harus muncul "✅ Using PostgreSQL"

---

## ⚠️ Catatan Penting

- **File `.env`** di local hanya untuk development
- **Railway Variables** untuk production
- **Tidak perlu** commit `.env` ke GitHub (sudah di `.gitignore`)
- **Railway inject** environment variables saat runtime
- **Code sudah siap** membaca dari `os.getenv("DATABASE_URL")`

