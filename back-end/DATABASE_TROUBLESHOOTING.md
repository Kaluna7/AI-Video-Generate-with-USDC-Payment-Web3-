# Database Troubleshooting Guide

## Masalah: "You have no tables" di Railway

### 1. Cek Environment Variables di Railway

Pastikan `DATABASE_URL` sudah di-set dengan benar:

1. Buka Railway Dashboard → Project → Variables
2. Pastikan ada `DATABASE_URL` dengan format:
   ```
   postgresql://postgres:PASSWORD@HOST:PORT/railway
   ```
3. Copy connection string dari Railway PostgreSQL service

### 2. Cek Build Logs di Railway

Setelah deploy, cek build logs untuk melihat:
- `[DB] Using database: ...` - harus muncul
- `[DB] Found X table(s) to create: [...]` - harus menampilkan 4 tables
- `[DB] ✅ Tables ready` - harus muncul

Jika tidak muncul, ada masalah dengan:
- Database connection
- Models tidak ter-import dengan benar

### 3. Manual Table Creation (Jika Auto-generate Gagal)

Jika auto-generate tidak bekerja, bisa create tables manual:

```python
# Connect ke Railway PostgreSQL via Railway CLI atau psql
# Lalu jalankan SQL:

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR,
    reset_token_expires_at TIMESTAMP,
    reset_code VARCHAR,
    reset_code_expires_at TIMESTAMP
);

CREATE TABLE user_coin_balances (
    user_id INTEGER PRIMARY KEY,
    coins INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coin_topup_txs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    tx_hash VARCHAR UNIQUE NOT NULL,
    amount_wei VARCHAR NOT NULL,
    coins_added INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stored_videos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    provider_task_id VARCHAR NOT NULL,
    job_id VARCHAR,
    file_path VARCHAR NOT NULL,
    file_size INTEGER,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_coin_topup_txs_user_id ON coin_topup_txs(user_id);
CREATE INDEX idx_coin_topup_txs_tx_hash ON coin_topup_txs(tx_hash);
CREATE INDEX idx_stored_videos_user_id ON stored_videos(user_id);
CREATE INDEX idx_stored_videos_provider_task_id ON stored_videos(provider_task_id);
CREATE INDEX idx_stored_videos_expires_at ON stored_videos(expires_at);
CREATE INDEX idx_stored_videos_created_at ON stored_videos(created_at);
```

### 4. Cek Database Connection

Test koneksi database dengan endpoint:

```bash
curl https://your-backend.railway.app/
```

Harus return: `{"message":"Web3 Auth API is running"}`

### 5. Common Issues

#### Issue: DATABASE_URL tidak ter-set
**Solution**: Set `DATABASE_URL` di Railway Variables

#### Issue: Connection refused
**Solution**: 
- Pastikan PostgreSQL service sudah running di Railway
- Pastikan `DATABASE_URL` menggunakan hostname yang benar

#### Issue: Tables tidak terbuat
**Solution**:
- Cek build logs untuk error
- Pastikan models.py di-import dengan benar
- Coba manual create tables (lihat #3)

#### Issue: "relation does not exist"
**Solution**: Tables belum terbuat. Jalankan `init_db()` atau create manual

### 6. Debug di Local

Test di local dengan PostgreSQL:

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Run app
python main.py
# atau
uvicorn main:app --reload
```

Cek logs untuk:
- `[DB] Using database: ...`
- `[DB] Found 4 table(s) to create: ['users', 'user_coin_balances', 'coin_topup_txs', 'stored_videos']`
- `[DB] ✅ Tables ready`

### 7. Manual Database Initialization (Fallback)

Jika auto-init gagal, gunakan endpoint manual:

```bash
# Call manual init endpoint
curl -X POST https://your-backend.railway.app/admin/db/init
```

Ini akan create tables secara manual. Response:
```json
{
  "success": true,
  "message": "Database tables initialized successfully",
  "tables": ["users", "user_coin_balances", "coin_topup_txs", "stored_videos"]
}
```

### 8. Test Database dengan Script

Di Railway, jalankan test script:

```bash
# Via Railway CLI
railway run python test_db.py

# Atau via Railway Dashboard → Shell
python test_db.py
```

Script ini akan:
- Test database connection
- Verify models imported
- Check tables registered
- Create tables
- Verify tables exist

### 9. Verify Tables Created

Setelah deploy, test dengan:

```bash
# Test register endpoint
curl -X POST https://your-backend.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'
```

Jika berhasil, berarti tables sudah ada dan bekerja.

