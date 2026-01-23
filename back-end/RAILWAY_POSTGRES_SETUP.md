# Railway PostgreSQL Setup Guide

## Cara Connect Backend ke PostgreSQL Database

### Step 1: Create PostgreSQL Database di Railway

1. Buka Railway Dashboard → Project
2. Klik **"New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway akan membuat PostgreSQL service baru

### Step 2: Connect Backend Service ke Database

1. Di Railway Dashboard, buka **Backend Service** (bukan PostgreSQL service)
2. Klik tab **"Variables"**
3. Klik **"New Variable"**
4. Isi:
   - **Name**: `DATABASE_URL`
   - **Value**: `${{ Postgres.DATABASE_URL }}`
   - **Note**: Ganti `Postgres` dengan nama service PostgreSQL Anda (biasanya `Postgres` atau `postgres`)

### Step 3: Verify Connection

Setelah set variable, Railway akan otomatis:
- Redeploy backend service
- Inject `DATABASE_URL` ke environment variables
- Backend akan connect ke PostgreSQL

### Step 4: Check Logs

Setelah deploy, cek logs untuk melihat:

```
[DB] Using database: postgresql://postgres:***@***:***/railway
[STARTUP] Initializing database...
[STARTUP] Found 4 table(s) to create: ['users', 'user_coin_balances', 'coin_topup_txs', 'stored_videos']
[DB] Creating tables if they don't exist...
[DB] ✅ Tables ready
[STARTUP] ✅ Database initialization complete
```

### Troubleshooting

#### Issue: Variable tidak ter-set
**Solution**: 
- Pastikan Anda set variable di **Backend Service**, bukan di PostgreSQL service
- Pastikan nama service PostgreSQL benar (case-sensitive)
- Format: `${{ Postgres.DATABASE_URL }}` (ganti `Postgres` dengan nama service Anda)

#### Issue: "relation does not exist" atau "You have no tables"
**Solution**:
1. Cek logs untuk melihat apakah `init_db()` berhasil
2. Jika gagal, gunakan manual init:
   ```bash
   curl -X POST https://your-backend.railway.app/admin/db/init
   ```

#### Issue: Connection refused
**Solution**:
- Pastikan PostgreSQL service sudah running (status: "Active")
- Pastikan variable `DATABASE_URL` sudah di-set dengan benar
- Redeploy backend service setelah set variable

### Alternative: Manual DATABASE_URL

Jika `${{ Postgres.DATABASE_URL }}` tidak bekerja, bisa copy connection string manual:

1. Buka PostgreSQL service → **"Connect"** tab
2. Copy **"Connection URL"**
3. Set sebagai `DATABASE_URL` di Backend Service Variables
4. Format: `postgresql://postgres:PASSWORD@HOST:PORT/railway`

### Verify Database Connection

Test dengan endpoint:

```bash
# Test API
curl https://your-backend.railway.app/

# Should return:
# {"message":"Web3 Auth API is running"}

# Test database (manual init if needed)
curl -X POST https://your-backend.railway.app/admin/db/init
```

### Important Notes

- ✅ `DATABASE_URL` akan otomatis di-inject ke environment variables
- ✅ Backend code sudah siap menggunakan `DATABASE_URL` dari environment
- ✅ Tables akan auto-create saat startup (via `@app.on_event("startup")`)
- ✅ Jika auto-create gagal, gunakan `/admin/db/init` endpoint

