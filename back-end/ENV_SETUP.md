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
```

Notes:
- `REPLICATE_MODEL_VERSION` is the **model version id** (not just the model name). Different models require different input fields; if your chosen model doesn’t accept `prompt`/`duration`, tell me the model and I’ll adapt the payload.


