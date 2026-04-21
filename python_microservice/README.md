Python GUI microservice (Tkinter) for login and live camera capture

Features
- Login (uses backend `/api/auth/login`)
- Logout (calls `/api/auth/logout`)
- Live camera preview using OpenCV
- Capture button sends multipart POST to `/verify` with fields:
  - `photo` (file)
  - `name` (visitor name)
  - `userId` (current user id)

Setup
1. Create a virtualenv and install requirements:

```bash
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

2. Edit `gui.py` if your backend is on a different host/port (change `BACKEND_BASE`).

Run

```bash
python gui.py
```

Notes
- The backend must accept login at `/api/auth/login` and `POST /verify` for the image. The script will POST to `http://localhost:5000/verify` by default.
- The script uses a requests.Session to persist cookies (login cookie will be sent with the verify request).
- If your backend verify endpoint is `/api/verify`, update `VERIFY_URL` in `gui.py` accordingly.
