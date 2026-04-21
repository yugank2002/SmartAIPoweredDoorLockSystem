# Python Microservices - Smart Lock System

Two Python services:

## 1. GUI (Tkinter) - `gui.py`

Desktop application for login and camera-based face verification.

### Features
- Login (uses backend `/api/auth/login`)
- Logout (calls `/api/auth/logout`)
- Live camera preview using OpenCV
- Capture button sends multipart POST to `/verify` with fields:
  - `photo` (file)
  - `userId` (current user id)

### Setup
```bash
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### Run
```bash
python gui.py
```

## 2. Deepface Microservice - `deepface_service.py`

Flask-based face matching service that performs 1:N face recognition using DeepFace.

### Features
- Receives a probe photo (captured from camera)
- Compares against multiple reference photos (visitor database)
- Returns ranked list of matches with distances and verification status
- Uses FaceNet512 model for embeddings

### Setup
```bash
pip install -r requirements.txt
```

**Note**: First run will download FaceNet512 model (~150MB).

### Run
```bash
python deepface_service.py
```

Service runs on `http://localhost:5001`

### API Endpoint

**POST /match**

Accepts multipart form:
```
- probe_image: captured photo (JPEG/PNG)
- reference_folder: path to folder with visitor reference photos
```

Response:
```json
{
  "success": true,
  "message": "Matching completed",
  "matches": [
    {
      "reference_image": "photo1.jpg",
      "distance": 0.25,
      "threshold": 0.6,
      "verified": true
    }
  ],
  "best_match": { /* same structure */ }
}
```

- **distance**: Cosine distance (lower = more similar, 0.6 is typical threshold)
- **verified**: Boolean indicating if distance < threshold
- **matches**: Sorted by distance (closest first)

## Backend Integration

The Node.js backend has a `/verify` endpoint that:
1. Receives captured photo + userId
2. Reads visitor photos from `static/<userId>/photos`
3. Calls the deepface microservice at `http://localhost:5001/match`
4. Returns matching results to the client

Set `DEEPFACE_SERVICE_URL` env var if using a different host/port:
```bash
DEEPFACE_SERVICE_URL=http://your-python-host:5001
```

## Architecture

```
GUI (Python) 
  -> Login: POST to Node /api/auth/login
  -> Capture: POST photo to Node /verify
  
Node Backend
  -> /verify: receives photo + userId
  -> reads static/<userId>/photos
  -> calls Python deepface service
  -> returns matched visitors

Python Deepface Service
  -> /match: performs 1:N face matching
  -> returns ranked matches
```

## Requirements

See `requirements.txt`:
- `opencv-python`: Camera and image handling
- `requests`: HTTP client
- `Pillow`: Image processing
- `numpy`: Array operations
- `deepface`: Face recognition
- `flask`: HTTP server

## Notes

- First run downloads the FaceNet512 model (~150MB)
- Face matching is CPU/GPU intensive; allow 5-30s per comparison
- For best results, ensure good lighting and clear face in photos
- Configure threshold in deepface service or client based on your requirements
