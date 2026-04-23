import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const LiveFeed = () => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef(null)
  const streamIntervalRef = useRef(null)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const PYTHON_API = 'http://localhost:5001'

  // Function to continuously fetch and display frames
  const displayVideoStream = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      const response = await fetch(`${PYTHON_API}/video_feed`)
      if (!response.ok) throw new Error('Stream not available')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Look for JPEG frames in the MJPEG stream
        const frameStart = buffer.indexOf('\xff\xd8\xff')
        const frameEnd = buffer.indexOf('\xff\xd9')

        if (frameStart !== -1 && frameEnd !== -1 && frameEnd > frameStart) {
          try {
            // Extract JPEG frame
            const jpegData = buffer.substring(frameStart, frameEnd + 2)
            const blob = new Blob([jpegData], { type: 'image/jpeg' })
            const blobUrl = URL.createObjectURL(blob)

            // Create image and draw on canvas
            const img = new Image()
            img.onload = () => {
              canvas.width = img.width
              canvas.height = img.height
              ctx.drawImage(img, 0, 0)
              URL.revokeObjectURL(blobUrl)
            }
            img.onerror = () => {
              URL.revokeObjectURL(blobUrl)
            }
            img.src = blobUrl

            // Remove processed frame from buffer
            buffer = buffer.substring(frameEnd + 2)
          } catch (err) {
            console.error('Error processing frame:', err)
            buffer = buffer.substring(frameEnd + 2)
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err)
      setError('Failed to display video stream: ' + err.message)
    }
  }

  // Start streaming when isStreaming changes
  useEffect(() => {
    if (isStreaming) {
      displayVideoStream()
    }
  }, [isStreaming])

  const handleStartStream = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${PYTHON_API}/start_stream`)
      if (response.data.success) {
        setIsStreaming(true)
      } else {
        setError(response.data.message || 'Failed to start stream')
      }
    } catch (err) {
      setError('Failed to connect to camera service: ' + (err.message || 'Unknown error'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStopStream = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${PYTHON_API}/stop_stream`)
      if (response.data.success) {
        setIsStreaming(false)
      } else {
        setError(response.data.message || 'Failed to stop stream')
      }
    } catch (err) {
      setError('Failed to stop stream: ' + (err.message || 'Unknown error'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Live Camera Feed</h2>
            <p className="text-slate-600 mt-1">View real-time camera stream</p>
          </div>
          <div className="text-slate-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleStartStream}
            disabled={isStreaming || loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {loading && isStreaming === false ? 'Starting...' : 'Start Feed'}
          </button>

          <button
            onClick={handleStopStream}
            disabled={!isStreaming || loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
            {loading && isStreaming === true ? 'Stopping...' : 'Stop Feed'}
          </button>

          {/* Status Indicator */}
          <div className={`px-4 py-3 rounded-lg font-semibold flex items-center gap-2 ${
            isStreaming
              ? 'bg-green-100 text-green-800'
              : 'bg-slate-100 text-slate-800'
          }`}>
            <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
            {isStreaming ? 'Stream Active' : 'Stream Inactive'}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video Feed Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Camera Stream</h3>
        
        {isStreaming ? (
          <div className="rounded-lg overflow-hidden bg-black flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ display: 'block' }}
            />
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-slate-400 font-medium">Click "Start Feed" to view camera</p>
              <p className="text-slate-500 text-sm mt-2">Make sure your camera is connected</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex gap-4">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900">How it works</h4>
            <ul className="text-blue-800 text-sm mt-2 space-y-1">
              <li>• Click "Start Feed" to begin streaming from your camera</li>
              <li>• The live feed will display real-time video</li>
              <li>• Click "Stop Feed" to terminate the stream</li>
              <li>• This feed is independent of verification process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveFeed
