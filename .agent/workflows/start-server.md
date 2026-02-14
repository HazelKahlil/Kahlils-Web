---
description: Start the local development server for Kahlil Portfolio admin panel
---

# Start Portfolio Server

Always use `server.py` to start the development server. This ensures:
- Port is always **5002**
- POST API endpoints (`/api/save`, `/api/publish`, `/api/upload`) work correctly
- Touch ID / biometric login credentials persist (they are bound to `localhost:5002`)

## Steps

1. Check if port 5002 is already in use:

// turbo
```bash
lsof -iTCP:5002 -sTCP:LISTEN 2>/dev/null
```

2. If port is in use, the server is already running. Skip to step 4.

3. If port is NOT in use, start the server:

```bash
cd "/Users/kahlilhazel/Documents/700-AI tools/710-AI-Kahlils/AI-分身/共享工作区/项目文档/Kahlil_Portfolio" && python3 server.py
```

4. Confirm admin panel is accessible:
- URL: http://localhost:5002/admin.html
- Password: hazel2026

## ⚠️ IMPORTANT: Never use `python3 -m http.server`

Using `python3 -m http.server` will:
- Use a random or different port
- NOT support POST API endpoints (save/publish/upload will fail)
- Break Touch ID registration (credentials are bound to origin)

Always use `python3 server.py` which is hardcoded to port 5002.
