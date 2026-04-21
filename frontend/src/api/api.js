import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

export const authAPI = {
  signup: (name, email, password) =>
    api.post('/auth/signup', { name, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getCurrentUser: () =>
    api.get('/auth/me')
}

export const visitorsAPI = {
  addVisitor: (formData) =>
    api.post('/visitors', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getVisitors: () =>
    api.get('/visitors'),
  deleteVisitor: (visitorId) =>
    api.delete(`/visitors/${visitorId}`)
}

export const historyAPI = {
  getHistory: () =>
    api.get('/history')
}

export default api
