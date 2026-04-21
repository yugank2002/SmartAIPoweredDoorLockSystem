import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { visitorsAPI, historyAPI } from '../api/api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const [visitors, setVisitors] = useState([])
  const [visitorName, setVisitorName] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [visitorError, setVisitorError] = useState('')
  const [history, setHistory] = useState([])

  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '')

  useEffect(() => {
    const loadVisitors = async () => {
      try {
        const res = await visitorsAPI.getVisitors()
        setVisitors(res.data.visitors)
      } catch (err) {
        console.error('Failed to load visitors', err)
      }
    }

    const loadHistory = async () => {
      try {
        const res = await historyAPI.getHistory()
        setHistory(res.data.history)
      } catch (err) {
        console.error('Failed to load history', err)
      }
    }

    loadVisitors()
    loadHistory()
  }, [])

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0])
    setVisitorError('')
  }

  const handleAddVisitor = async (e) => {
    e.preventDefault()
    setVisitorError('')

    if (!visitorName) {
      setVisitorError('Please provide a name')
      return
    }
    if (!photoFile) {
      setVisitorError('Please select a photo')
      return
    }

    const formData = new FormData()
    formData.append('name', visitorName)
    formData.append('photo', photoFile)

    setUploading(true)
    try {
      const res = await visitorsAPI.addVisitor(formData)
      setVisitors(prev => [res.data.visitor, ...prev])
      setVisitorName('')
      setPhotoFile(null)
      document.getElementById('visitor-photo-input').value = ''
    } catch (err) {
      console.error(err)
      setVisitorError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteVisitor = async (visitorId, visitorName) => {
    if (!window.confirm(`Delete visitor "${visitorName}"?`)) {
      return
    }

    try {
      await visitorsAPI.deleteVisitor(visitorId)
      setVisitors(prev => prev.filter(v => v._id !== visitorId))
    } catch (err) {
      console.error(err)
      alert('Failed to delete visitor: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔐</span>
              <h1 className="text-lg font-bold text-gray-900">Smart Lock</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right text-sm">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-logout px-4 py-1.5"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="card bg-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              👋 Welcome back, {user?.name}!
            </h2>
            <p className="text-gray-600">Manage your smart lock visitors and access control</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-gradient from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Visitors</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{visitors.length}</p>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>

          <div className="card-gradient from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Access Attempts</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{history.length}</p>
              </div>
              <div className="text-5xl">🔓</div>
            </div>
          </div>

          <div className="card-gradient from-red-50 to-pink-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Rejected Access</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{history.filter(h => h.decision === 'rejected').length}</p>
              </div>
              <div className="text-5xl">❌</div>
            </div>
          </div>

          <div className="card-gradient from-purple-50 to-violet-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">System Status</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">Active</p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl mb-2">⚛️</p>
            <p className="text-sm text-gray-600">Frontend</p>
            <p className="font-bold text-blue-600">React + Vite</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl mb-2">🎨</p>
            <p className="text-sm text-gray-600">Styling</p>
            <p className="font-bold text-blue-600">Tailwind CSS</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl mb-2">🟢</p>
            <p className="text-sm text-gray-600">Backend</p>
            <p className="font-bold text-blue-600">Node + Express</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl mb-2">🗄️</p>
            <p className="text-sm text-gray-600">Database</p>
            <p className="font-bold text-blue-600">MongoDB</p>
          </div>
        </div>

        {/* Visitors Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-200">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">👥 Visitor Management</h3>
              <p className="text-gray-600 text-sm mt-1">Add and manage your door access visitors</p>
            </div>
            <div className="text-5xl">🚪</div>
          </div>

          {/* Add Visitor Form */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border-2 border-blue-200">
            <h4 className="text-xl font-bold text-gray-800 mb-4">➕ Add New Visitor</h4>
            <form onSubmit={handleAddVisitor} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="form-label">👤 Visitor Name</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Enter visitor's full name"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">📸 Photo</label>
                <input
                  id="visitor-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full disabled:opacity-70"
                disabled={uploading}
              >
                {uploading ? '⏳ Uploading...' : '📤 Add Visitor'}
              </button>
            </form>

            {visitorError && (
              <div className="error-message mt-4">
                <span className="font-bold">❌</span> {visitorError}
              </div>
            )}
          </div>

          {/* Visitors Gallery */}
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-4">📋 Your Visitors ({visitors.length})</h4>
            {visitors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-gray-600 text-lg">No visitors added yet</p>
                <p className="text-gray-500 text-sm mt-2">Add your first visitor to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {visitors.map(v => (
                  <div key={v._id} className="card hover:scale-105 transition-transform duration-300 group">
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <img
                        src={`${API_BASE}${v.face_url}`}
                        alt={v.name}
                        className="h-40 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </div>
                    <h5 className="font-bold text-gray-800 text-lg">{v.name}</h5>
                    <p className="text-xs text-gray-500 mt-1">
                      ⏰ {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDeleteVisitor(v._id, v.name)}
                      className="mt-4 w-full bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white py-2 px-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      🗑️ Delete Visitor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="card mt-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-200">
            <div>
              <h3 className="text-3xl font-bold text-gray-800">📜 Access History</h3>
              <p className="text-gray-600 text-sm mt-1">View all door lock and unlock attempts</p>
            </div>
            <div className="text-5xl">🕐</div>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-gray-600 text-lg">No access attempts yet</p>
              <p className="text-gray-500 text-sm mt-2">History will appear here when visitors try to access</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Captured Image</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map(h => (
                    <tr key={h._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg overflow-hidden ${
                            h.decision === 'allowed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {h.visitorImageUrl ? (
                              <img
                                src={`${API_BASE}${h.visitorImageUrl}`}
                                alt={h.visitorName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              h.decision === 'allowed' ? '✅' : '❌'
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{h.visitorName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(h.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          h.decision === 'allowed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {h.decision === 'allowed' ? '🔓 Allowed' : '🔒 Rejected'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={`${API_BASE}${h.photoUrl}`}
                          alt="Captured"
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
