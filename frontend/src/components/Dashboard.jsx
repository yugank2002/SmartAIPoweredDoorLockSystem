import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { visitorsAPI, historyAPI } from '../api/api'
import LiveFeed from './LiveFeed'

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
  const [activeSection, setActiveSection] = useState('overview')

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

  const renderIcon = (iconName) => {
    const iconClasses = "w-5 h-5 text-slate-600"
    switch (iconName) {
      case 'dashboard':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'people':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        )
      case 'history':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'lock':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      case 'camera':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      default:
        return <span className="text-lg">•</span>
    }
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'visitors', label: 'Visitors', icon: 'people' },
    { id: 'history', label: 'Access History', icon: 'history' },
    { id: 'live-feed', label: 'Live Feed', icon: 'camera' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-slate-200">Manage your smart lock visitors and access control system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Visitors</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{visitors.length}</p>
                  </div>
                  <div className="text-slate-400">
                    {renderIcon('people')}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Access Attempts</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{history.length}</p>
                  </div>
                  <div className="text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Rejected Access</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{history.filter(h => h.decision === 'rejected').length}</p>
                  </div>
                  <div className="text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">System Status</p>
                    <p className="text-xl font-bold text-green-600 mt-2">Active</p>
                  </div>
                  <div className="text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Technology Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl mb-2">⚛️</p>
                  <p className="text-sm text-slate-600 font-medium">Frontend</p>
                  <p className="font-bold text-slate-700">React + Vite</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl mb-2">🎨</p>
                  <p className="text-sm text-slate-600 font-medium">Styling</p>
                  <p className="font-bold text-slate-700">Tailwind CSS</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl mb-2">🟢</p>
                  <p className="text-sm text-slate-600 font-medium">Backend</p>
                  <p className="font-bold text-slate-700">Node + Express</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl mb-2">🗄️</p>
                  <p className="text-sm text-slate-600 font-medium">Database</p>
                  <p className="font-bold text-slate-700">MongoDB</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'visitors':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Visitor Management</h2>
                  <p className="text-slate-600 mt-1">Add and manage your door access visitors</p>
                </div>
                <div className="text-slate-400">
                  {renderIcon('lock')}
                </div>
              </div>
            </div>

            {/* Add Visitor Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Visitor</h3>
              <form onSubmit={handleAddVisitor} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Visitor Name</label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Enter visitor's full name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Photo</label>
                  <input
                    id="visitor-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors disabled:opacity-70 h-11"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Add Visitor'}
                </button>
              </form>

              {visitorError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-800 font-medium">{visitorError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Visitors Gallery */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Your Visitors ({visitors.length})</h3>
              {visitors.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <div className="text-5xl mb-3">
                    <svg className="w-16 h-16 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-lg">No visitors added yet</p>
                  <p className="text-slate-500 text-sm mt-2">Add your first visitor to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {visitors.map(v => (
                    <div key={v._id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="relative h-48 overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img
                          src={`${API_BASE}${v.face_url}`}
                          alt={v.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load visitor image:', `${API_BASE}${v.face_url}`, e)
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/%3E%3C/svg%3E'
                            e.target.className = 'w-12 h-12 text-slate-300'
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h5 className="font-bold text-slate-900 text-lg">{v.name}</h5>
                        <p className="text-xs text-slate-500 mt-1">
                          Added {new Date(v.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleDeleteVisitor(v._id, v.name)}
                          className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                        >
                          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Visitor
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      case 'history':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Access History</h2>
                  <p className="text-slate-600 mt-1">View all door lock and unlock attempts</p>
                </div>
                <div className="text-slate-400">
                  {renderIcon('history')}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">
                    <svg className="w-16 h-16 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-lg">No access attempts yet</p>
                  <p className="text-slate-500 text-sm mt-2">History will appear here when visitors try to access</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Visitor</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Decision</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Captured Image</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {history.map(h => (
                        <tr key={h._id} className="hover:bg-slate-50">
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
                                    onError={(e) => {
                                      console.error('Failed to load visitor thumbnail:', `${API_BASE}${h.visitorImageUrl}`, e)
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  h.decision === 'allowed' ? '✅' : '❌'
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">{h.visitorName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(h.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              h.decision === 'allowed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {h.decision === 'allowed' ? 'Allowed' : 'Rejected'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              src={`${API_BASE}${h.photoUrl}`}
                              alt="Captured"
                              className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                              onError={(e) => {
                                console.error('Failed to load history photo:', `${API_BASE}${h.photoUrl}`, e)
                                e.target.style.display = 'none'
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      case 'live-feed':
        return <LiveFeed />
      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              {renderIcon('lock')}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Smart Lock</h1>
              <p className="text-xs text-slate-500">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {sidebarItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-slate-100 text-slate-900 border-r-2 border-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {renderIcon(item.icon)}
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-slate-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeSection}</h1>
            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
