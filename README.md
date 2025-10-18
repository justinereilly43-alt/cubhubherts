
# Cub Hub Herts — Complete Fixed Package

This repo is ready for GitHub → Netlify:
- Static HTML/CSS/JS in root
- `assets/` contains `styles.css`, `script.js`, and `images/`
- `netlify/functions/` contains all serverless functions
- Forms are Netlify-enabled; submissions create live listings (with photos) using Netlify Blobs
- `/admin.html` for edit/delete (requires `ADMIN_KEY` env var)

## Netlify settings
- Base directory: *(blank)*
- Build command: *(blank)*
- Publish directory: `.`
- Environment variable: `ADMIN_KEY` set to your secret

After deploy, **Clear cache and deploy site** once so Netlify re-scans forms.
