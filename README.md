# Smart AI Powered Door Lock System

A comprehensive face recognition-based door lock system built with MERN stack (MongoDB, Express, React, Node.js) and Python microservices for AI-powered authentication.

## 🏗️ Architecture Overview

The system consists of three main components:

1. **Web Dashboard (React + Vite + Tailwind)** - Owner management interface
2. **Backend API (Node.js + Express)** - Authentication, user management, and API services
3. **Python Microservices** - Face recognition and desktop GUI for on-site verification

### System Flow
- **Owners** register and login via web dashboard
- **Visitors** are registered with photos stored in the system
- **Verification** happens via desktop GUI that captures live camera feed and matches against stored visitor photos using AI face recognition

## 📁 Project Structure

```
MAJOR PROJECT/
├── backend/                    # Node.js Express API Server
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # Owner user model
│   │   ├── Visitor.js         # Visitor model
│   │   └── Face.js            # Face data model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User management
│   │   ├── verify.js          # Face verification
│   │   └── visitors.js        # Visitor management
│   ├── static/                # Uploaded photos storage
│   ├── utils/
│   │   └── jwt.js             # JWT utilities
│   ├── app.js                 # Express app setup
│   ├── server.js              # Server entry point
│   └── package.json
│
├── frontend/                   # React Web Dashboard
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js         # Axios API client
│   │   ├── components/
│   │   │   ├── Login.jsx      # Login component
│   │   │   ├── Signup.jsx     # Registration component
│   │   │   ├── Dashboard.jsx  # Owner dashboard
│   │   │   ├── NavBar.jsx     # Navigation
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Home page
│   │   │   ├── Login.jsx      # Login page
│   │   │   ├── Signup.jsx     # Signup page
│   │   │   └── RegisterFace.jsx # Face registration
│   │   ├── App.jsx            # Main app
│   │   ├── main.jsx           # React entry point
│   │   ├── index.css          # Tailwind styles
│   │   └── styles.css         # Custom styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind config
│   └── postcss.config.js      # PostCSS config
│
├── python_microservice/        # Python AI Services
│   ├── deepface_service.py     # Flask face recognition API
│   ├── gui.py                  # Tkinter desktop GUI
│   ├── requirements.txt        # Python dependencies
│   ├── README.md               # GUI service docs
│   └── README_NEW.md           # Complete Python services docs
│
├── QUICKSTART.md               # Quick setup guide
├── VITE_TAILWIND_SETUP.md      # Frontend setup details
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- Python 3.8+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Database Setup
**Local MongoDB:**
```bash
# Install MongoDB locally or use MongoDB Atlas
# Default connection: mongodb://localhost:27017/smart-lock-db
```

**MongoDB Atlas (Cloud):**
- Create cluster at [MongoDB Atlas](https://cloud.mongodb.com)
- Get connection string and update `backend/.env`

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-lock-db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
DEEPFACE_SERVICE_URL=http://localhost:5001
```

Start backend:
```bash
npm start
# or for development: npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Opens at: http://localhost:3000

### 4. Python Microservices Setup
```bash
cd python_microservice
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Start DeepFace service:
```bash
python deepface_service.py
```
Runs on: http://localhost:5001

Start GUI (in another terminal):
```bash
python gui.py
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Owner registration
- `POST /api/auth/login` - Owner login
- `POST /api/auth/logout` - Logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Visitor Management
- `GET /api/visitors` - List visitors
- `POST /api/visitors` - Add visitor
- `PUT /api/visitors/:id` - Update visitor
- `DELETE /api/visitors/:id` - Delete visitor

### Face Verification
- `POST /verify` - Verify face (expects photo + userId)

## 🤖 AI Face Recognition

The system uses **DeepFace** library with **FaceNet512** model for 1:N face recognition:

### DeepFace Service API
**Endpoint:** `POST http://localhost:5001/match`

**Request:** Multipart form data
- `probe_image`: Captured photo (JPEG/PNG)
- `reference_folder`: Path to visitor photos folder

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "reference_image": "visitor1.jpg",
      "distance": 0.25,
      "threshold": 0.6,
      "verified": true
    }
  ],
  "best_match": { /* closest match */ }
}
```

- **Distance**: Cosine similarity (lower = more similar)
- **Threshold**: 0.6 (configurable)
- **Verified**: `distance < threshold`

## 🖥️ Desktop GUI Features

The Tkinter-based GUI provides:

- **Login/Logout** for owners
- **Live Camera Preview** using OpenCV
- **Photo Capture** for verification
- **Face Matching** against visitor database
- **Real-time Results** display

## 🛡️ Security Features

- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** with bcrypt
- **CORS Protection**
- **Input Validation**
- **Protected Routes**
- **Session Management**

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: express-validator

### Frontend
- **Build Tool**: Vite
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State**: React Context

### Python Services
- **GUI**: Tkinter + OpenCV
- **AI**: DeepFace + TensorFlow
- **API**: Flask
- **Image Processing**: Pillow + NumPy

## 📊 Database Models

### User (Owner)
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Visitor
```javascript
{
  name: String,
  userId: ObjectId (ref: User),
  photos: [String], // file paths
  createdAt: Date
}
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

### Environment Variables
```env
# Backend
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production_secret
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-api-domain.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

ISC License

## 📞 Support

For issues and questions, please create an issue in the repository.

## Technology Stack

- **Frontend**: React 18 with Vite (fast build tool)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT tokens with HTTP-only cookies
- **API Client**: Axios with credential support

## Features

### Authentication System

- **User Registration (Signup)**
  - Name, Email, and Password validation
  - Secure password hashing using bcryptjs
  - Automatic login after signup

- **User Login**
  - Email and password validation
  - Session management with JWT tokens
  - Secure HTTP-only cookies

- **Protected Routes**
  - Dashboard accessible only to authenticated users
  - Automatic redirection to login for unauthenticated users
  - Session persistence on page refresh

- **Logout**
  - Cookie clearing
  - Session termination

### Cookie-Based Authentication

- **HTTP-Only Cookies**: Secure, cannot be accessed by JavaScript (prevents XSS)
- **SameSite Protection**: Prevents CSRF attacks
- **Secure Flag**: Only sent over HTTPS in production
- **7-Day Expiration**: Configurable session length

## API Endpoints

### Authentication Routes (`/api/auth`)

- **POST /signup**
  - Register a new user
  - Body: `{ name, email, password }`
  - Returns: User object and sets auth cookie

- **POST /login**
  - Login existing user
  - Body: `{ email, password }`
  - Returns: User object and sets auth cookie

- **GET /me** (Protected)
  - Get current logged-in user
  - Requires valid auth cookie
  - Returns: Current user object

- **POST /logout** (Protected)
  - Logout user
  - Clears auth cookie
  - Returns: Success message

## Components

### Frontend Components

- **Login.jsx**: Login form with email and password (styled with Tailwind)
- **Signup.jsx**: Registration form with name, email, and password confirmation
- **Dashboard.jsx**: Protected user dashboard with comprehensive status display
- **ProtectedRoute.jsx**: Route wrapper to protect pages from unauthorized access
- **AuthContext.jsx**: React context for managing authentication state globally

### Tailwind CSS Customization

The project includes custom Tailwind configuration:
- Primary colors: `#667eea` (primary) and `#764ba2` (primaryDark)
- Gradient backgrounds: `gradient-primary` class for quick gradient access
- Custom component classes: `.btn`, `.btn-primary`, `.form-input`, `.error-message`, etc.

## Authentication Flow

1. User fills signup/login form
2. Frontend sends credentials to backend API
3. Backend validates credentials and password
4. Backend generates JWT token
5. JWT token stored in HTTP-only cookie
6. Frontend stores user data in AuthContext
7. ProtectedRoute checks auth state before rendering
8. For subsequent requests, cookie automatically sent with each API call
9. Middleware verifies token from cookie on protected routes
10. User session persists on page refresh

## Security Features

✅ Password hashing with bcryptjs (10 salt rounds)
✅ JWT token-based authentication
✅ HTTP-only cookies (safe from XSS attacks)
✅ SameSite cookie attribute (CSRF protection)
✅ Input validation on both frontend and backend
✅ CORS configuration with credentials enabled
✅ Protected API routes with middleware

## Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-lock-db
JWT_SECRET=your_secret_key_here
VITE_API_URL=http://localhost:5000/api
```

Note: Vite uses `VITE_` prefix for environment variables that are exposed to the client.E_ENV=development
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Common Issues & Solutions

### CORS Error
- Ensure backend `.env` has correct MongoDB URI
- Check CORS origin matches frontend URL
- Ensure `withCredentials: true` in axios config

### MongoDB Connection Error
- Verify MongoDB is running locally
- Check MongoDB URI in `.env`
- For MongoDB Atlas, whitelist your IP in network access

### Cookie Not Storing
- Ensure `withCredentials: true` in axios requests
- Check backend CORS settings include `credentials: true`
- Browser might have cookies disabled

### 401 Unauthorized After Login
- Clear browser cookies and try again
- Verify JWT_SECRET matches between restarts
- Check token expiration time

## Testing the Application

1. **Test Signup**
   - Go to `http://localhost:3000/signup`
   - Enter name, email, and password
   - Should redirect to dashboard

2. **Test Login**
   - Go to `http://localhost:3000/login`
   - Enter registered email and password
   - Should redirect to dashboard

3. **Test Protected Route**
   - Try accessing `/dashboard` without login
   - Should redirect to login page

4. **Test Session Persistence**
   - Login and refresh page
   - Should remain logged in

5. **Test Logout**
   - Click logout button
   - Should clear cookie and redirect to login

## Next Steps

Future enhancements:
- Add email verification
- Implement password reset functionality
- Add user profile management
- Implement refresh token rotation
- Add two-factor authentication
- Add social login (Google, GitHub)
- Add door lock control features
- Add activity logs and notifications

## Troubleshooting

### Backend won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Frontend shows blank page
- Check browser console for errors
- Verify backend is running on port 5000
- Clear browser cache and refresh

### API requests failing
- Check both backend and frontend are running
- Verify environment variables are set
- Check network tab in browser DevTools

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
