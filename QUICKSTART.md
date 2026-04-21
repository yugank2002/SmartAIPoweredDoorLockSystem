# Quick Start Guide - Vite + Tailwind

## 1. Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend (Vite + Tailwind)
```bash
cd frontend
npm install
```

## 2. Setup MongoDB

**Option A: Local MongoDB**
- Make sure MongoDB is running on your system
- Default connection: `mongodb://localhost:27017/doorlock`

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/doorlock`
- Update `backend/.env` with your connection string

## 3. Start the Application

### Terminal 1: Start Backend
```bash
cd backend
npm start
```
Backend runs on: `http://localhost:5000`

### Terminal 2: Start Frontend (Vite)
```bash
cd frontend
npm run dev
```
Frontend opens at: `http://localhost:3000` (automatically with Vite!)

## 4. Test the Application

### Create Account
1. Click "Sign up" on the login page
2. Enter Name, Email, Password
3. Click Sign Up button
4. Should redirect to Dashboard (styled with Tailwind CSS)

### Login
1. Go to `http://localhost:3000/login`
2. Enter your registered email and password
3. Click Login
4. Should redirect to Dashboard

### Protected Access
1. Click Logout on dashboard
2. Try accessing `http://localhost:3000/dashboard` directly
3. Should redirect to login page (authentication verified!)

## 5. Verify Cookie Authentication

Open Developer Tools (F12) → Application → Cookies:
- You should see a `token` cookie
- This cookie is HTTP-only (safe from JavaScript)
- It's automatically sent with API requests

## Frontend Technology Stack

- **Build Tool**: Vite (Lightning-fast development server)
- **Framework**: React 18
- **Styling**: Tailwind CSS (Utility-first CSS framework)
- **HTTP Client**: Axios
- **Routing**: React Router v6

## File Locations

- **Backend Server**: `backend/server.js`
- **Database Models**: `backend/models/User.js`
- **API Routes**: `backend/routes/auth.js`
- **Auth Middleware**: `backend/middleware/auth.js`
- **Frontend App**: `frontend/src/App.jsx`
- **Frontend Entry**: `frontend/src/main.jsx`
- **Auth Context**: `frontend/src/context/AuthContext.jsx`
- **Login Component**: `frontend/src/components/Login.jsx`
- **Signup Component**: `frontend/src/components/Signup.jsx`
- **Dashboard Component**: `frontend/src/components/Dashboard.jsx`

## Configuration Files

- **Backend Environment**: `backend/.env`
- **Frontend Environment**: `frontend/.env` (Vite uses `VITE_` prefix)
- **Tailwind Config**: `frontend/tailwind.config.js`
- **Vite Config**: `frontend/vite.config.js`
- **PostCSS Config**: `frontend/postcss.config.js`

## Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

**Important**: Vite requires `VITE_` prefix for client-side variables!

## Useful Commands

```bash
# Backend Development (with nodemon)
cd backend
npm run dev

# Frontend Development (Vite with HMR)
cd frontend
npm run dev

# Frontend Production Build
cd frontend
npm run build

# Preview Production Build
cd frontend
npm run preview
```

## Default Ports

- Backend API: http://localhost:5000
- Frontend App: http://localhost:3000
- MongoDB: localhost:27017 (local)

## Vite Features You Get

✨ **Instant Server Start** - No waiting for bundling
🔥 **Lightning-Fast HMR** - Changes reflect instantly
📦 **Optimized Builds** - Production-ready bundles
🎨 **Tailwind CSS** - Pre-configured utility CSS
📝 **ES Modules** - Modern JavaScript support

## Tailwind CSS Features

✨ **Utility-First** - Build designs without leaving HTML
🎯 **Responsive** - Mobile-first approach with breakpoints
🌙 **Dark Mode** - Easy dark mode support
🎨 **Customization** - Configure via `tailwind.config.js`
📦 **PurgeCSS** - Unused CSS automatically removed

## Security & Auth

- **Password**: Hashed with bcryptjs (10 rounds)
- **Token**: JWT stored in HTTP-only secure cookie
- **Session**: Expires in 7 days (configurable in .env)
- **CSRF**: SameSite cookie attribute protection
- **XSS**: HTTP-only cookies prevent JavaScript access

## Next: Add More Features

Once the basic auth is working, you can add:
1. User profile management
2. Email verification
3. Password reset
4. Two-factor authentication
5. Door lock control features
6. Activity logs
7. More Tailwind CSS components

Enjoy! 🚀

