## Backend env setup (video generation)

Create `back-end/.env` (do **not** commit it) and add:

```env
# Required (existing)
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DBNAME
JWT_SECRET_KEY=CHANGE_ME_TO_A_RANDOM_SECRET

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
```

Notes:
- `REPLICATE_MODEL_VERSION` is the **model version id** (not just the model name). Different models require different input fields; if your chosen model doesn’t accept `prompt`/`duration`, tell me the model and I’ll adapt the payload.
- For Veo3: if your docs show different endpoints/fields (e.g. `task_id` vs `taskId`), paste one sample response and I’ll align parsing.


