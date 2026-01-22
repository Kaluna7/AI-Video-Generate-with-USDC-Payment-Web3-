# Video Storage System

## Overview
Sistem penyimpanan video untuk Sora AI yang menyimpan video di server kita selama 2 hari, kemudian otomatis terhapus.

## Fitur
1. **Auto-save**: Video dari Sora AI otomatis disimpan ke server saat pertama kali diakses
2. **Expiry**: Video otomatis expired setelah 2 hari
3. **Cleanup**: Endpoint untuk menghapus video yang expired

## Database Model
- `StoredVideo`: Menyimpan metadata video yang sudah disimpan
  - `user_id`: ID user pemilik video
  - `provider_task_id`: ID video dari OpenAI
  - `job_id`: ID job internal kita
  - `file_path`: Path file video di server
  - `file_size`: Ukuran file dalam bytes
    - `expires_at`: Tanggal expired (2 hari dari created_at)
  - `created_at`: Tanggal dibuat

## Storage Location
Video disimpan di: `back-end/storage/videos/`
Format filename: `{user_id}_{provider_task_id}_{random}.mp4`

## Endpoints

### Download Video (Auto-save)
`GET /video/sora2/{video_id}/download?token={jwt_token}`

Endpoint ini akan:
1. Cek apakah video sudah tersimpan di server kita
2. Jika sudah, serve dari storage kita
3. Jika belum, download dari OpenAI, simpan ke server, lalu serve

### Cleanup Expired Videos
`POST /admin/videos/cleanup`

Endpoint untuk menghapus video yang sudah expired. Bisa dipanggil manual atau dijadwalkan dengan cron job.

**Response:**
```json
{
  "deleted_count": 5,
  "deleted_size_bytes": 52428800,
  "deleted_size_mb": 50.0,
  "message": "Cleaned up 5 expired videos"
}
```

## Setup Cron Job (Optional)

Untuk auto-cleanup, tambahkan ke crontab:
```bash
# Cleanup expired videos setiap hari jam 2 pagi
0 2 * * * curl -X POST http://localhost:8001/admin/videos/cleanup -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Catatan
- Video disimpan per user, jadi setiap user hanya bisa mengakses video mereka sendiri
- Video otomatis terhapus setelah 2 hari untuk menghemat storage
- Jika penyimpanan gagal, video tetap di-stream langsung dari OpenAI sebagai fallback

