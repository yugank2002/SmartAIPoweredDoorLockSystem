# Frontend Setup Guide - Vite + Tailwind CSS

## Why Vite + Tailwind?

### Vite Advantages
- ⚡ **Instant Server Start**: No build step before dev server starts
- 🔥 **Lightning-Fast HMR**: Updates reflect in browser instantly (near instantaneous)
- 📦 **Optimized Builds**: Production bundles are highly optimized
- 🚀 **Modern Development**: Uses native ES modules in development
- 🎯 **Zero Config**: Works out of the box with sensible defaults

### Tailwind CSS Advantages
- 🎨 **Utility-First**: Build UIs by composing utility classes
- 📱 **Responsive Design**: Mobile-first approach with breakpoints
- 🎯 **Consistent Design**: Pre-defined color system and spacing
- 🌙 **Dark Mode**: Easy dark mode support
- 📦 **Performance**: Automatic PurgeCSS in production removes unused styles
- 🔧 **Customizable**: Easily extend colors, fonts, and more

## Project Structure

```
frontend/
├── index.html                 # Entry HTML file
├── public/                    # Static assets
├── src/
│   ├── api/
│   │   └── api.js            # Axios configuration
│   ├── components/
│   │   ├── Login.jsx         # Login component with Tailwind
│   │   ├── Signup.jsx        # Signup component with Tailwind
│   │   ├── Dashboard.jsx     # Dashboard with rich Tailwind layout
│   │   └── ProtectedRoute.jsx # Auth protection
│   ├── context/
│   │   └── AuthContext.jsx   # Global auth state
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind + custom styles
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind customization
├── postcss.config.js         # PostCSS with Tailwind
├── package.json
├── .env                       # Environment variables
└── .gitignore
```

## Installation Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- `react` & `react-dom`: UI framework
- `react-router-dom`: Client-side routing
- `axios`: HTTP client with cookie support
- `vite`: Build tool and dev server
- `@vitejs/plugin-react`: React support for Vite
- `tailwindcss`: Utility CSS framework
- `postcss` & `autoprefixer`: CSS processing

### 2. Environment Setup

Create/update `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

**Important**: Vite exposes variables with `VITE_` prefix to the client. Access them as:
```javascript
import.meta.env.VITE_API_URL
```

### 3. Configuration Files

**vite.config.js** - Already configured with:
- React plugin support
- Dev server on port 3000
- Auto-open in browser

**tailwind.config.js** - Includes:
- Custom primary colors
- Gradient utilities
- Extended theme configuration

**postcss.config.js** - Processes CSS with:
- Tailwind CSS
- Autoprefixer (adds vendor prefixes)

**index.css** - Contains:
- Tailwind directives (@tailwind)
- Custom component classes (@layer)

## Development Workflow

### Start Development Server

```bash
npm run dev
```

This:
1. Starts Vite dev server on http://localhost:3000
2. Opens browser automatically
3. Enables Hot Module Replacement (HMR) for instant updates
4. Shows compilation errors in browser

### Code Changes with HMR

- Edit any `.jsx` or `.css` file
- Changes reflect in browser **instantly** (within 100ms)
- State is preserved during updates
- No full page reload needed

### Build for Production

```bash
npm run build
```

This:
1. Bundles React and dependencies
2. Minifies code and CSS
3. Removes unused Tailwind styles (tree-shaking)
4. Creates optimized files in `dist/` folder

### Preview Production Build

```bash
npm run preview
```

This:
1. Builds the project
2. Serves the production build locally
3. Useful for testing before deployment

## Tailwind CSS Usage

### Using Utility Classes

```jsx
// Instead of writing CSS, use Tailwind utilities
<div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
  <h2 className="text-3xl font-bold text-primary mb-6">Title</h2>
  <button className="btn-primary w-full">Click Me</button>
</div>
```

### Responsive Design

```jsx
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

### Custom Component Classes

Defined in `src/index.css`:

```css
@layer components {
  .btn {
    @apply px-6 py-3 rounded-lg font-semibold transition-all;
  }
  
  .btn-primary {
    @apply btn bg-gradient-to-r from-primary to-primaryDark text-white;
  }
}
```

Use them in JSX:
```jsx
<button className="btn-primary">Login</button>
```

### Tailwind Theme Customization

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#667eea',      // Custom primary
      primaryDark: '#764ba2',  // Custom dark
    },
    spacing: {
      '128': '32rem',  // Custom spacing
    }
  }
}
```

Then use in classes:
```jsx
<div className="bg-primary text-primaryDark">Custom colors</div>
```

## API Integration

### API Service (src/api/api.js)

```javascript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true  // Important for cookies!
})
```

### Using API in Components

```jsx
import { authAPI } from '../api/api'

const handleLogin = async (email, password) => {
  const response = await authAPI.login(email, password)
  // Cookie automatically set and sent with future requests
}
```

## Authentication Flow

1. User fills login/signup form
2. Component calls `authAPI.login()` or `authAPI.signup()`
3. Backend validates and sets JWT in cookie
4. Frontend stores user in AuthContext
5. Protected routes check `isAuthenticated`
6. Cookie auto-sent with all API requests
7. Refresh page → Session persists from cookie

## Debugging

### Browser DevTools

- **Elements**: Inspect Tailwind-styled elements
- **Network**: Check API requests and cookies
- **Console**: View error messages
- **Application**: See HTTP-only token cookie

### Vite Error Display

Vite shows compilation errors directly in browser:
- Syntax errors
- Import errors
- Module resolution issues

### Tailwind CSS Not Applying?

1. Check file is in `content` array in `tailwind.config.js`
2. Ensure class names match Tailwind syntax
3. Verify PostCSS is processing your CSS
4. Check browser DevTools for CSS in `<style>` tag

## Performance Tips

### Code Splitting

Vite automatically code-splits at route boundaries:
```jsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./components/Dashboard'))

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### CSS Optimization

- Tailwind only includes used classes
- Production build is tree-shaken and minified
- Consider using CSS variables for theming

### Image Optimization

- Use relative paths for assets: `import img from './image.png'`
- Vite optimizes images in production
- Use responsive images with Tailwind

## Deployment

### Build for Deployment

```bash
npm run build
```

Generates `dist/` folder with:
- Optimized HTML
- Bundled and minified JavaScript
- Processed CSS with only used Tailwind styles
- Compressed assets

### Deploy Steps

1. Run `npm run build`
2. Upload `dist/` folder to hosting (Vercel, Netlify, etc.)
3. Configure backend API URL in `.env` for production
4. Set `withCredentials: true` for CORS cookies

### Environment Variables for Production

Create `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

Build will automatically use this for production builds.

## Common Issues & Solutions

### CORS Error with Cookies

**Problem**: Cookies not being sent with requests
**Solution**: Ensure:
```javascript
// In axios config
withCredentials: true

// In backend
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

### Tailwind Classes Not Working

**Problem**: Styles not applying
**Solution**: Check:
1. Class names are exactly correct
2. File is in `content` array in `tailwind.config.js`
3. Run `npm run build` to test production

### Hot Module Replacement (HMR) Not Working

**Problem**: Changes don't auto-update
**Solution**:
1. Check browser console for errors
2. Restart dev server: `npm run dev`
3. Clear browser cache
4. Check file is being saved

### API Calls Failing in Production

**Problem**: 404 or CORS errors
**Solution**:
1. Verify `VITE_API_URL` in `.env` and `.env.production`
2. Check backend is running
3. Verify CORS headers in backend
4. Check cookie domain settings

## Resources

- [Vite Docs](https://vitejs.dev/)
- [React + Vite](https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router v6](https://reactrouter.com/)
- [Axios Docs](https://axios-http.com/)

## Next Steps

1. ✅ Vite + Tailwind setup complete
2. Next: Add backend API integration
3. Next: Add more pages/features
4. Next: Deploy to production
5. Next: Add authentication features (email, 2FA, etc.)

Happy coding! 🚀
