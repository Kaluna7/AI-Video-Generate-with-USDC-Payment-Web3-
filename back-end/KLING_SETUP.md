# Kling AI Setup Guide

## Apa itu KLING_CALLBACK_URL?

`KLING_CALLBACK_URL` adalah **opsional** (tidak wajib). Ini adalah URL webhook yang akan dipanggil oleh Kling AI API ketika video generation selesai.

### Opsi 1: Kosongkan (Recommended untuk sekarang)
```
KLING_CALLBACK_URL=
```
**Cara kerja:**
- Sistem akan otomatis polling status task setiap 2 detik
- Tidak perlu setup webhook endpoint
- Lebih sederhana untuk development

### Opsi 2: Gunakan Webhook (Advanced)
Jika Anda ingin menggunakan webhook (lebih efisien untuk production):
```
KLING_CALLBACK_URL=http://your-backend-url.com/api/kling/callback
```

**Cara kerja:**
- Kling AI akan mengirim POST request ke URL ini ketika task selesai
- Anda perlu membuat endpoint di backend untuk menerima webhook
- Lebih efisien karena tidak perlu polling

## Setup API Key

Anda hanya perlu **satu** dari berikut:
- **Secret Key** (recommended)
- **Access Key**

Masukkan salah satunya di `.env`:
```env
KLING_API_KEY=your_secret_key_or_access_key_here
```

Sistem akan otomatis menggunakan format yang benar (Bearer token).

## Provider yang Didukung

Kling AI bisa digunakan melalui berbagai provider dengan format API yang berbeda:

### 1. KIE API (api.kie.ai)
```env
KLING_BASE_URL=https://api.kie.ai
KLING_API_FORMAT=kie
# Auto-detected paths:
# KLING_CREATE_PATH=/api/v1/jobs/createTask
# KLING_STATUS_PATH=/api/v1/jobs/taskStatus
```

### 2. PiAPI (api.piapi.ai)
```env
KLING_BASE_URL=https://api.piapi.ai
KLING_API_FORMAT=piapi
# Auto-detected paths:
# KLING_CREATE_PATH=/api/v1/task
# KLING_STATUS_PATH=/api/v1/task/status
```

### 3. Kling26AI (kling26ai.org)
```env
KLING_BASE_URL=https://kling26ai.org
KLING_API_FORMAT=kling26
# Auto-detected paths:
# KLING_CREATE_PATH=/api/generate
# KLING_STATUS_PATH=/api/status
```

### 4. useapi.net / cometapi.com (Standard format)
```env
KLING_BASE_URL=https://api.useapi.net
# atau
KLING_BASE_URL=https://api.cometapi.com
KLING_API_FORMAT=standard
# Auto-detected paths:
# KLING_CREATE_PATH=/v1/jobs/createTask
# KLING_STATUS_PATH=/v1/jobs/taskStatus
```

### Custom Provider
Jika provider Anda berbeda, sesuaikan:
```env
KLING_BASE_URL=https://api.your-provider.com
KLING_API_FORMAT=standard  # atau kosongkan untuk auto-detect
KLING_CREATE_PATH=/your/custom/path  # Override jika perlu
KLING_STATUS_PATH=/your/custom/status/path  # Override jika perlu
```

**Catatan:** Sistem akan otomatis mendeteksi format API dari base URL, tapi Anda bisa override dengan `KLING_API_FORMAT`.

## Model Versi yang Tersedia

- **V1.0** - 25 coins (standard quality)
- **V1.5** - 25 coins (standard quality)
- **V2.0** - 180 coins (high quality)
- **V2.1 Standard** - 180 coins (high quality)
- **V2.1 Pro** - 180 coins (premium quality)
- **V2.1 Master** - 180 coins (premium quality)

## Fitur yang Didukung

✅ Text to Video
✅ Image to Video
✅ Multi-Image to Image
✅ Image Expansion
✅ Image Recognize

## Quick Start

1. Dapatkan API key dari provider Kling AI (secret key atau access key)
2. Tambahkan ke `.env`:
   ```env
   VIDEO_PROVIDER=kling
   KLING_API_KEY=your_key_here
   KLING_BASE_URL=https://api.useapi.net  # atau provider Anda
   ```
3. **Kosongkan** `KLING_CALLBACK_URL` (biarkan kosong)
4. Sistem akan otomatis polling status - tidak perlu setup webhook!

## Troubleshooting

**Error: "Kling AI unauthorized"**
- Pastikan API key benar
- Pastikan format key sesuai (secret key atau access key)

**Error: "Kling AI provider error"**
- Cek `KLING_BASE_URL` sesuai dengan provider Anda
- Cek `KLING_CREATE_PATH` dan `KLING_STATUS_PATH` sesuai dokumentasi provider

**Task tidak selesai**
- Sistem akan otomatis polling setiap 2 detik
- Jika masih pending, cek status manual di provider dashboard

