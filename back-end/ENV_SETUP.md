## Backend env setup (video generation)

Create `back-end/.env` (do **not** commit it) and add:

```env
# Required (existing)
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DBNAME
JWT_SECRET_KEY=CHANGE_ME_TO_A_RANDOM_SECRET

# Video generation
# Use `mock` first to verify wiring works, then switch to `replicate`.
VIDEO_PROVIDER=mock

# If VIDEO_PROVIDER=replicate:
REPLICATE_API_TOKEN=PASTE_YOUR_KEY_HERE
REPLICATE_MODEL_VERSION=PASTE_MODEL_VERSION_ID_HERE

# If VIDEO_PROVIDER=veo3:
# (Defaults assume a common Veo3 gateway; override if your provider uses a different base URL/header.)
VEO3_BASE_URL=https://api.veo3gen.co/api/veo
VEO3_API_KEY=PASTE_YOUR_KEY_HERE
# Optional:
VEO3_AUTH_HEADER_NAME=X-API-Key
VEO3_MODEL=veo-3.0-fast-generate-preview
VEO3_ASPECT_RATIO=16:9
VEO3_GENERATE_AUDIO=true
```

Notes:
- `REPLICATE_MODEL_VERSION` is the **model version id** (not just the model name). Different models require different input fields; if your chosen model doesn’t accept `prompt`/`duration`, tell me the model and I’ll adapt the payload.
- For Veo3: if your docs show different endpoints/fields (e.g. `task_id` vs `taskId`), paste one sample response and I’ll align parsing.


