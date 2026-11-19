# Storage buckets (MVP)

Create a private bucket for evidence files:
- Name: `activity-evidences`
- Public: false
- Allowed MIME types (recommended): `image/jpeg,image/png,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Max file size: 5 MB (enforced in app + can be enforced via bucket policies if supported)

App uses signed URLs (server-side) for downloads/previews. Never expose service role key to client.
