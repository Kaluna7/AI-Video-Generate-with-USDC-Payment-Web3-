## Backend env setup (video generation)

Create `back-end/.env` (do **not** commit it) and add:

```env
# Required (existing)
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DBNAME
JWT_SECRET_KEY=CHANGE_ME_TO_A_RANDOM_SECRET

# Circle (TESTNET / SANDBOX)
# Use the **API Key** (secret) only in the backend.
# The **Client Key** is for Circle Wallets SDK in the frontend (publishable),
# do NOT use it as a replacement for the API key on the backend.
CIRCLE_ENV=sandbox
CIRCLE_API_KEY=PASTE_YOUR_TEST_API_KEY_HERE
# Optional (only needed if you use Circle Wallets SDK on the frontend):
CIRCLE_CLIENT_KEY=PASTE_YOUR_CLIENT_KEY_HERE

# Gemini (Enhance with AI)
# Put your Google AI Studio / Gemini API key here (server-side only).
GEMINI_API_KEY=PASTE_YOUR_GEMINI_API_KEY_HERE
# Model name (example: gemini-3-flash, gemini-2.5-flash, gemini-1.5-flash)
GEMINI_MODEL=gemini-3-flash
# Optional: best-effort Google Search grounding (if supported by your model/account).
# If unsupported, backend will automatically fall back to non-search generation.
GEMINI_USE_GOOGLE_SEARCH=false

# Arc / Coins (Top Up -> Spend)
# Used by backend to verify top-up transactions
ARC_RPC_URL=https://rpc.testnet.arc.network
# Treasury receives USDC top-ups (same as NEXT_PUBLIC_ARC_TREASURY_ADDRESS on frontend)
ARC_TREASURY_ADDRESS=0xYOUR_TREASURY_ADDRESS
# Coin rate: 1 USDC -> 100 coins (so veo3-fast costs 25 coins = 0.25 USDC)
COIN_PER_USDC=100

# Google OAuth (Sign in with Google)
# Create these in Google Cloud Console (OAuth client: Web application)
GOOGLE_CLIENT_ID=PASTE_YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=PASTE_YOUR_CLIENT_SECRET_HERE
# Must be added as an Authorized redirect URI in Google console:
GOOGLE_REDIRECT_URI=http://localhost:8001/auth/google/callback
# Where backend should send the user after success/failure:
FRONTEND_URL=http://localhost:3000

# Video generation
# Use `mock` first to verify wiring works, then switch to `replicate`.
VIDEO_PROVIDER=mock

# If VIDEO_PROVIDER=replicate:
REPLICATE_API_TOKEN=PASTE_YOUR_KEY_HERE
REPLICATE_MODEL_VERSION=PASTE_MODEL_VERSION_ID_HERE

# If VIDEO_PROVIDER=veo3 (Veo 3.1 docs):
VEO3_BASE_URL=https://veo3api.com
VEO3_API_KEY=PASTE_YOUR_KEY_HERE
# Auth per docs:
VEO3_AUTH_HEADER_NAME=Authorization
# Optional:
VEO3_MODEL=veo3-fast
VEO3_ASPECT_RATIO=16:9
VEO3_WATERMARK=veo
# If true, after COMPLETED we call /get-1080p to fetch the free 1080p URL
VEO3_USE_1080P=true

# If VIDEO_PROVIDER=sora2:
# OpenAI Sora 2 API (Official OpenAI API)
# IMPORTANT: You need an OpenAI API key with access to Sora 2
# Get your API key from: https://platform.openai.com/api-keys
SORA2_API_KEY=PASTE_YOUR_OPENAI_API_KEY_HERE
# OR use OPENAI_API_KEY (will be used if SORA2_API_KEY is not set)
# OPENAI_API_KEY=PASTE_YOUR_OPENAI_API_KEY_HERE

# ⚠️ CRITICAL: Organization Verification Required for Sora-2
# Before using Sora-2 API, your OpenAI "organization" MUST be verified.
# 
# NOTE: Even if you're a personal user (not a company), OpenAI uses "organization" 
# as an administrative term. Every API account has an "organization" in OpenAI's system.
# You don't need to be a formal company - personal verification is sufficient.
#
# Steps to verify:
# 1. Login to: https://platform.openai.com
# 2. Go to: Settings → Organization → General
# 3. Click "Verify Organization" button
# 4. Provide valid government-issued ID (Passport, KTP, SIM, etc.)
#    - Must be clear, valid, and include photo
#    - Cannot be used for another organization verification in last 90 days
#    - Personal ID is acceptable (you don't need company documents)
# 5. Wait up to 15 minutes for access to propagate after verification
# 
# Error you'll see if not verified:
# "Your organization must be verified to use the model `sora-2`"
# 
# Documentation:
# - https://help.openai.com/en/articles/10910291 (Organization Verification)
# - https://help.openai.com/en/articles/10362446 (Model Access Requirements)

# Base URL (default: https://api.openai.com)
# Only override if you're using a proxy or custom endpoint
SORA2_BASE_URL=https://api.openai.com
# Optional: Organization ID (if you belong to multiple organizations)
# Find it in: https://platform.openai.com/settings/organization
# OPENAI_ORGANIZATION_ID=org-xxxxxxxxxxxxxxxxxxxx
# Optional: Project ID (if using projects)
# Find it in: https://platform.openai.com/settings/project
# OPENAI_PROJECT_ID=proj_xxxxxxxxxxxxxxxxxxxx
# Endpoints (default OpenAI endpoints - usually don't need to change)
# Create: POST /v1/videos
SORA2_CREATE_PATH=/v1/videos
# Status: GET /v1/videos/{video_id}
SORA2_STATUS_PATH=/v1/videos
# Download: GET /v1/videos/{video_id}/content (handled by proxy endpoint)
SORA2_DOWNLOAD_PATH=/v1/videos
# Backend URL for video download proxy (used to construct video URLs)
# Default: http://localhost:8001
# Change this to your production backend URL when deploying
BACKEND_URL=http://localhost:8001

# If VIDEO_PROVIDER=kling:
# Kling AI API configuration (Official API)
# IMPORTANT: Replace with your actual Kling AI provider's base URL
# Examples:
#   - https://api.useapi.net
#   - https://api.cometapi.com
#   - https://api.kie.ai
#   - Your provider's base URL
# DO NOT use placeholder URLs like "api.your-kling-provider.com"
KLING_BASE_URL=https://api.useapi.net
# IMPORTANT: Kling AI uses JWT authentication. You have 3 options:
# Option 1 (Recommended): Use Access Key and Secret Key (system will generate JWT automatically)
KLING_ACCESS_KEY=PASTE_YOUR_ACCESS_KEY_HERE
KLING_SECRET_KEY=PASTE_YOUR_SECRET_KEY_HERE
# Option 2: Use pre-generated JWT token
# KLING_JWT_TOKEN=PASTE_YOUR_PRE_GENERATED_JWT_TOKEN_HERE
# Option 3: Use API key (if your provider uses direct API key instead of JWT)
# KLING_API_KEY=PASTE_YOUR_API_KEY_HERE
# Optional: Custom auth header name (default: Authorization)
# KLING_AUTH_HEADER_NAME=Authorization
# Optional: Custom auth scheme (default: Bearer)
# If your provider uses different scheme, set it here (e.g., "Token", "ApiKey")
# KLING_AUTH_SCHEME=Bearer
# Model version: kling-v1, kling-v1-6, kling-v2-master, kling-v2-1-master, kling-v2-5-turbo, kling-v2-6
# Default: kling-v1
KLING_MODEL_VERSION=kling-v1
# IMPORTANT: Official API endpoints - LEAVE EMPTY to use defaults
# Default endpoints (if left empty):
#   KLING_CREATE_PATH=/v1/videos/text2video
#   KLING_STATUS_PATH=/v1/videos/text2video/{task_id}
# DO NOT use old paths like /v1/jobs/createTask - they will cause 404 errors!
# Only override if your provider uses different paths
KLING_CREATE_PATH=
KLING_STATUS_PATH=
# Optional: callback URL for webhook notifications
# LEAVE EMPTY (recommended) - system will automatically poll task status
# Only set this if you want to use webhooks (requires creating a webhook endpoint)
# Example: KLING_CALLBACK_URL=http://your-backend.com/api/kling/callback
KLING_CALLBACK_URL=

# Image Generation (Text to Image / Image to Image)
# Official Kling AI endpoints (from documentation):
#   Create: POST /v1/images/generations
#   Status: GET /v1/images/generations/{task_id}
# Default: system will use official endpoints if left empty
# Only override if your provider uses different paths
KLING_IMAGE_CREATE_PATH=
KLING_IMAGE_TO_IMAGE_CREATE_PATH=
KLING_IMAGE_STATUS_PATH=
```

Notes:
- `REPLICATE_MODEL_VERSION` is the **model version id** (not just the model name). Different models require different input fields; if your chosen model doesn't accept `prompt`/`duration`, tell me the model and I'll adapt the payload.
- For Veo3: if your docs show different endpoints/fields (e.g. `task_id` vs `taskId`), paste one sample response and I'll align parsing.
- For Sora2 (OpenAI): 
  - ⚠️ **REQUIRED**: Your OpenAI organization MUST be verified before using Sora-2
    - Go to: https://platform.openai.com/settings/organization/general
    - Click "Verify Organization" and provide valid government ID
    - Wait up to 15 minutes for access to propagate
  - You need an OpenAI API key with access to Sora 2 models (sora-2 or sora-2-pro)
  - The API uses JSON format (application/json) for video creation
  - Video content is downloaded via proxy endpoint: `/video/sora2/{video_id}/download`
  - Supported durations: 4, 8, or 12 seconds
  - Supported sizes: 720x1280, 1280x720, 1024x1792, 1792x1024
  - Models: `sora-2` (standard) or `sora-2-pro` (HD quality)
  - All API users (including low-tier users) need verified organization to access Sora-2


