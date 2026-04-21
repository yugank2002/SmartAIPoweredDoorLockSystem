import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-lg border border-gray-200">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">Smart Lock</h2>
          <p className="text-gray-500 text-sm font-medium">Intelligent Door Access System</p>
        </div>

        {/* Header */}
        <h3 className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome Back</h3>
        <p className="text-center text-gray-500 mb-6">Sign in to your account to continue</p>

        {/* Error Message */}
        {error && (
          <div className="error-message mb-6 animate-pulse">
            <span className="font-bold">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="form-label">
              📧 Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="you@example.com"
              className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="form-label">
              🔑 Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="••••••••"
              className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-70 disabled:cursor-not-allowed text-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span> Logging in...
              </span>
            ) : (
              '🚀 Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-400 text-sm">New here?</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
