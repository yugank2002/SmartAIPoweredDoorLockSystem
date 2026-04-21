# Owner Dashboard (frontend)

Development (Windows PowerShell):

```powershell
cd 'C:\Users\Yugank Prajapati\Desktop\MAJOR PROJECT\frontend'
npm install
npm run dev
```

The frontend expects the backend API at `http://127.0.0.1:8000`.

Important: enable CORS in the backend so the frontend (Vite) can make requests. In your FastAPI app add:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Login flow:
- Open `/login` and submit email + password. The login form posts as `application/x-www-form-urlencoded` (OAuth2 form) to `/login` and stores the returned token in `localStorage`.
- After successful login the app navigates to the blank `Home` page.
