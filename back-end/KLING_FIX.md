# Fix Kling AI 404 Error

## Problem
Error: `404 Not Found` pada path `/v1/jobs/createTask`

## Solution

Error ini terjadi karena environment variable `KLING_CREATE_PATH` masih menggunakan path lama. 

### Step 1: Update `.env` file

Hapus atau update environment variable berikut di file `.env` backend Anda:

```env
# HAPUS atau KOSONGKAN baris ini:
KLING_CREATE_PATH=/v1/jobs/createTask

# Atau update ke path yang benar:
KLING_CREATE_PATH=/v1/videos/text2video

# HAPUS atau KOSONGKAN baris ini:
KLING_STATUS_PATH=/v1/jobs/taskStatus

# Atau biarkan kosong (akan menggunakan default yang benar)
KLING_STATUS_PATH=
```

### Step 2: Pastikan Base URL benar

```env
KLING_BASE_URL=https://api.your-kling-provider.com
KLING_API_KEY=your_secret_key_or_access_key
```

### Step 3: Restart backend server

Setelah update `.env`, restart backend server Anda.

## Default Endpoints (jika tidak di-set)

Jika `KLING_CREATE_PATH` dan `KLING_STATUS_PATH` dikosongkan, sistem akan otomatis menggunakan:

- **Create Task**: `POST /v1/videos/text2video`
- **Get Status**: `GET /v1/videos/text2video/{task_id}`

## Verifikasi

Setelah update, coba generate video lagi. Error 404 seharusnya sudah hilang.

Jika masih error, pastikan:
1. Base URL sesuai dengan provider Anda
2. API key valid
3. Backend server sudah di-restart

