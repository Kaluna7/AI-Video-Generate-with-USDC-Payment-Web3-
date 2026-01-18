# Fix Kling AI Balance Error

## Problem
Error: `429 Account balance not enough` atau `code: 1102`

## Penjelasan

Error ini **BUKAN** dari sistem coin aplikasi Anda, tapi dari **provider Kling AI** (misalnya useapi.net, cometapi.com, dll).

### Perbedaan Balance:

1. **Coin di Aplikasi Anda** (di database aplikasi)
   - Ini adalah coin yang user top up dengan USDC
   - Digunakan untuk membayar biaya generate video di aplikasi
   - Dikelola oleh aplikasi Anda

2. **Balance di Provider Kling AI** (di akun provider)
   - Ini adalah balance/credit di akun provider Kling AI Anda
   - Dibutuhkan oleh provider untuk memproses request video generation
   - Dikelola oleh provider (useapi.net, cometapi.com, dll)

## Solution

### Step 1: Top Up Balance di Provider Kling AI

Anda perlu top up balance di akun provider Kling AI Anda:

1. **Login ke dashboard provider Anda:**
   - Jika menggunakan **useapi.net**: Login ke https://useapi.net
   - Jika menggunakan **cometapi.com**: Login ke https://cometapi.com
   - Atau provider lainnya yang Anda gunakan

2. **Top up balance:**
   - Masuk ke menu "Balance" atau "Top Up"
   - Isi balance sesuai kebutuhan
   - Tunggu sampai balance ter-update

### Step 2: Verifikasi Balance

Setelah top up, pastikan balance sudah ter-update di dashboard provider.

### Step 3: Coba Generate Video Lagi

Setelah balance cukup, coba generate video lagi dari aplikasi.

## Catatan Penting

- **Coin di aplikasi ≠ Balance di provider**
- Anda perlu memiliki **keduanya**:
  - Coin di aplikasi (untuk membayar aplikasi)
  - Balance di provider (untuk provider memproses video)

## Troubleshooting

**Q: Saya sudah top up coin di aplikasi, kenapa masih error?**
A: Coin di aplikasi berbeda dengan balance di provider. Anda perlu top up balance di provider Kling AI (useapi.net, cometapi.com, dll).

**Q: Di mana saya bisa top up balance provider?**
A: Login ke dashboard provider Anda (useapi.net, cometapi.com, dll) dan cari menu "Balance" atau "Top Up".

**Q: Berapa balance yang dibutuhkan?**
A: Tergantung provider dan model yang digunakan. Biasanya sekitar $0.01-0.10 per video generation.

**Q: Apakah balance di provider akan terpotong otomatis?**
A: Ya, setiap kali video generation berhasil, balance di provider akan terpotong otomatis.

