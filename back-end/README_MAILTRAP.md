# Mailtrap Email Setup Guide

## Step 1: Create Mailtrap Account
1. Go to https://mailtrap.io
2. Sign up for a free account
3. Verify your email

## Step 2: Get API Token
1. Login to your Mailtrap dashboard
2. Go to **API Tokens** in the left sidebar (atau Settings → API Tokens)
3. Click **Add Token** atau **Create API Token**
4. Give it a name like "PrimeStudio Password Reset"
5. Copy the API token (format: akan terlihat seperti token panjang)

## Step 3: Configure Environment Variables
Create a file `back-end/.env` with:

```env
# Mailtrap Configuration
MAILTRAP_API_TOKEN=your_actual_api_token_here
FROM_EMAIL=noreply@primestudio.ai

# Other settings...
DATABASE_URL=sqlite:///./dev.db
JWT_SECRET_KEY=CHANGE_ME_TO_A_RANDOM_SECRET
```

**Catatan:** Jangan sertakan `MAILTRAP_DOMAIN` karena endpoint sudah menggunakan `sandbox.api.mailtrap.io` secara default.

## Step 4: Test Email Sending
1. Restart the backend server
2. Try the forgot password flow
3. Check your Mailtrap inbox at https://mailtrap.io/inboxes

## Alternative: Mailtrap SMTP (RECOMMENDED - Lebih Mudah)
Gunakan SMTP credentials dari dashboard Mailtrap:

```env
# Mailtrap SMTP Configuration (dari dashboard Anda)
SMTP_SERVER=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USERNAME=156857a36b656d
SMTP_PASSWORD=****2e71
FROM_EMAIL=noreply@primestudio.ai
```

**Keuntungan SMTP:**
- ✅ Lebih sederhana setup
- ✅ Menggunakan credentials yang sudah ada
- ✅ Tidak perlu API token tambahan
- ✅ Port 587 (recommended) atau 2525

## Mailtrap Free Plan Limits
- 500 emails per month
- 1 inbox
- Email testing and API access

## Troubleshooting
- Make sure your API token is correct
- Check that FROM_EMAIL is a valid email format
- Verify your Mailtrap account is active
- Check the Mailtrap logs for any errors
