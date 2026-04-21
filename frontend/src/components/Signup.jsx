import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signup } = useAuth()

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signup(formData.name, formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
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
        <h3 className="text-3xl font-bold text-gray-800 mb-2 text-center">Join Now</h3>
        <p className="text-center text-gray-500 mb-6">Create your account to get started</p>

        {/* Error Message */}
        {error && (
          <div className="error-message mb-6 animate-pulse">
            <span className="font-bold">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="form-label">
              👤 Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="John Doe"
              className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

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

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">
              ✓ Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="••••••••"
              className="form-input disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-70 disabled:cursor-not-allowed text-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span> Creating Account...
              </span>
            ) : (
              '✨ Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-400 text-sm">Have account?</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <p className="text-center text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
