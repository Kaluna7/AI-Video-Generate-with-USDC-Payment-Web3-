# Kling AI Units & Balance Guide

## Understanding Units vs Balance

Kling AI menggunakan sistem **units** untuk menghitung penggunaan. Setiap model membutuhkan jumlah units yang berbeda.

## Model Units Consumption

Berdasarkan dokumentasi Kling AI, konsumsi units bervariasi per model:

- **V1.0 / V1.5**: Konsumsi units lebih sedikit (lebih murah)
- **V2.0**: Konsumsi units sedang
- **V2.1 (Standard/Pro/Master)**: Konsumsi units lebih banyak (lebih mahal)
- **V2.5 Turbo / V2.6**: Konsumsi units paling banyak (paling mahal)

## Trial Package Information

Dari informasi yang Anda berikan:
- **Trial Package**: $2.39 untuk 1000 units
- **Valid**: 30 hari
- **Concurrent**: 6 requests
- **Note**: Unused units cannot be extended after expiration

## Troubleshooting "Account balance not enough"

### 1. Cek Balance/Units di Dashboard Provider

Login ke dashboard provider Anda (useapi.net, cometapi.com, dll) dan cek:
- Berapa units yang tersisa
- Apakah package sudah aktif
- Apakah units sudah expired

### 2. Cek Konsumsi Units per Model

Jika Anda menggunakan model V2.1 atau V2.6, mereka membutuhkan lebih banyak units. Coba:
- Gunakan model V1.0 atau V1.5 terlebih dahulu (lebih hemat units)
- Atau top up lebih banyak units

### 3. Verifikasi Package Status

Pastikan:
- Package sudah aktif
- Package belum expired (valid 30 hari)
- Units masih tersisa

### 4. Cek Concurrent Limit

Trial package memiliki limit 6 concurrent requests. Jika Anda membuat banyak request bersamaan, mungkin perlu menunggu.

## Tips Menghemat Units

1. **Gunakan model yang lebih murah untuk testing:**
   - V1.0 atau V1.5 untuk testing
   - V2.1 hanya untuk production/final output

2. **Gunakan duration yang lebih pendek:**
   - 5 seconds lebih murah daripada 10 seconds

3. **Monitor usage:**
   - Cek dashboard provider secara berkala
   - Track berapa units yang digunakan per video

## Cara Cek Balance/Units

### Via Dashboard Provider:
1. Login ke dashboard provider (useapi.net, cometapi.com, dll)
2. Masuk ke menu "Balance" atau "Account"
3. Lihat units yang tersisa

### Via API (jika tersedia):
Beberapa provider mungkin menyediakan endpoint untuk cek balance. Cek dokumentasi provider Anda.

## Solusi

Jika units habis atau tidak cukup:

1. **Top up units baru:**
   - Beli package baru di dashboard provider
   - Atau top up balance untuk membeli units

2. **Gunakan model yang lebih hemat:**
   - Switch ke V1.0 atau V1.5 untuk testing
   - Hanya gunakan V2.1 untuk output final

3. **Kurangi concurrent requests:**
   - Jangan membuat terlalu banyak request bersamaan
   - Tunggu sampai request sebelumnya selesai

## FAQ

**Q: Saya sudah beli package tapi masih error "balance not enough"?**
A: 
- Cek apakah package sudah aktif
- Cek apakah units masih tersisa
- Cek apakah package sudah expired
- Cek apakah model yang digunakan membutuhkan units yang lebih banyak

**Q: Berapa units yang dibutuhkan per video?**
A: Tergantung model:
- V1.0/V1.5: ~10-50 units (estimasi)
- V2.0: ~50-100 units (estimasi)
- V2.1: ~100-200 units (estimasi)
- V2.6: ~200+ units (estimasi)

*Catatan: Estimasi ini bisa berbeda tergantung provider dan konfigurasi.*

**Q: Apakah units bisa di-refund jika video gagal?**
A: Tergantung kebijakan provider. Biasanya units sudah terpotong saat request dibuat, bukan saat video selesai.

**Q: Bagaimana cara tahu berapa units yang tersisa?**
A: Login ke dashboard provider Anda dan cek menu "Balance" atau "Account".

