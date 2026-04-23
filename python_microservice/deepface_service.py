
"""
Python deepface microservice for 1:N face matching
Runs on port 5001, provides /match endpoint
Uses DeepFace.find() for efficient 1:N matching
Includes MJPEG video streaming for live camera feed
"""
from flask import Flask, request, jsonify, Response
import os
import tempfile
import uuid
from deepface import DeepFace
import pandas as pd
import cv2
import threading
import time
from queue import Queue
import platform

app = Flask(__name__)

# Global variables for streaming
cap = None
frame_queue = Queue(maxsize=1)
streaming_active = False
stream_thread = None

def init_camera(camera_index=0, max_retries=3):
    """Initialize camera with retries and fallback backends"""
    global cap
    
    # Try different backends on Windows
    backends = []
    if platform.system() == 'Windows':
        # Try DSHOW (DirectShow) first - more reliable than MSMF
        backends = [
            cv2.CAP_DSHOW,
            cv2.CAP_MSMF,
            cv2.CAP_VFW,
        ]
    else:
        backends = [cv2.CAP_V4L2, cv2.CAP_FFMPEG]
    
    # First, try default
    backends.insert(0, -1)  # Default backend
    
    for backend in backends:
        for attempt in range(max_retries):
            try:
                if backend == -1:
                    cap = cv2.VideoCapture(camera_index)
                else:
                    cap = cv2.VideoCapture(camera_index, backend)
                
                # Check if camera opened successfully
                if cap is None or not cap.isOpened():
                    print(f"[Attempt {attempt + 1}] Backend {backend}: Camera failed to open")
                    if cap:
                        cap.release()
                    cap = None
                    continue
                
                # Try to grab a frame to verify it works
                for _ in range(5):
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        # Camera is working!
                        print(f"[SUCCESS] Camera initialized with backend {backend}")
                        
                        # Set optimal camera properties
                        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                        cap.set(cv2.CAP_PROP_FPS, 15)
                        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                        
                        # Try to reduce latency
                        if platform.system() == 'Windows':
                            cap.set(cv2.CAP_PROP_AUTOFOCUS, 0)
                        
                        return cap
                    time.sleep(0.1)
                
                print(f"[Attempt {attempt + 1}] Backend {backend}: Could not grab frames")
                cap.release()
                cap = None
            except Exception as e:
                print(f"[Attempt {attempt + 1}] Backend {backend}: Error - {e}")
                if cap:
                    try:
                        cap.release()
                    except:
                        pass
                cap = None
            
            time.sleep(0.5)
    
    print("[FATAL] Could not initialize camera with any backend")
    return None

def capture_frames():
    """Background thread to continuously capture camera frames"""
    global cap, frame_queue, streaming_active
    
    if cap is None:
        cap = init_camera()
        if cap is None:
            print("[ERROR] Failed to initialize camera in capture_frames")
            streaming_active = False
            return
    
    frame_skip_counter = 0
    consecutive_errors = 0
    max_consecutive_errors = 30  # Stop after 30 consecutive errors
    
    while streaming_active:
        try:
            ret, frame = cap.read()
            if ret and frame is not None:
                consecutive_errors = 0  # Reset error counter on success
                # Skip some frames to reduce CPU usage
                frame_skip_counter += 1
                if frame_skip_counter % 2 == 0:  # Process every 2nd frame
                    # Clear queue and add new frame
                    try:
                        frame_queue.get_nowait()
                    except:
                        pass
                    frame_queue.put(frame)
            else:
                consecutive_errors += 1
                if consecutive_errors <= 5:  # Only log first few errors
                    print(f"[WARN] Failed to read frame (attempt {consecutive_errors})")
                if consecutive_errors > max_consecutive_errors:
                    print("[ERROR] Too many consecutive frame read failures, stopping stream")
                    break
        except Exception as e:
            consecutive_errors += 1
            if consecutive_errors <= 5:
                print(f"[ERROR] Exception in capture_frames: {e}")
            if consecutive_errors > max_consecutive_errors:
                break
        
        time.sleep(0.033)  # ~30fps

def generate_frames():
    """Generator function for MJPEG stream"""
    first_frame = True
    while streaming_active:
        try:
            frame = frame_queue.get(timeout=1)
            
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
            
            frame_bytes = buffer.tobytes()
            
            # Yield frame in MJPEG format
            # Send boundary
            if first_frame:
                yield b'--frame\r\n'
                first_frame = False
            
            # Send headers and frame
            yield (b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n'
                   b'Connection: close\r\n\r\n')
            yield frame_bytes
            yield b'\r\n--frame\r\n'
        except Exception as e:
            print(f"Error in generate_frames: {e}")
            continue

@app.route('/match', methods=['POST'])
def match_face():
    """
    Accepts multipart form with:
    - probe_image: captured photo from camera
    - reference_folder: path to folder with visitor reference photos
    
    Returns 1:N matching results using DeepFace.find()
    """
    try:
        # Get uploaded image
        if 'probe_image' not in request.files:
            return jsonify({'success': False, 'message': 'No probe_image provided'}), 400
        
        probe_file = request.files['probe_image']
        reference_folder = request.form.get('reference_folder')
        
        if not reference_folder or not os.path.isdir(reference_folder):
            return jsonify({'success': False, 'message': 'Invalid reference_folder'}), 400
        
        # Check if folder has images
        reference_images = [
            f for f in os.listdir(reference_folder)
            if f.lower().endswith(('.jpg', '.jpeg', '.png'))
        ]
        
        if not reference_images:
            return jsonify({
                'success': True,
                'message': 'No reference images found',
                'matches': [],
                'best_match': None
            }), 200
        
        # Save probe image temporarily with more reliable handling
        temp_dir = tempfile.gettempdir()
        probe_filename = f"probe_{uuid.uuid4()}.jpg"
        probe_path = os.path.join(temp_dir, probe_filename)
        
        # Save the probe image file
        probe_file.save(probe_path)
        
        # Verify file exists before processing
        if not os.path.exists(probe_path):
            return jsonify({'success': False, 'message': 'Failed to save probe image'}), 400
        
        try:
            # Use DeepFace.find() for efficient 1:N matching
            results = DeepFace.find(
                img_path=probe_path,
                db_path=reference_folder,
                model_name="ArcFace",
                distance_metric="cosine",
                enforce_detection=False,
                silent=True
            )
            
            matches = []
            
            # DeepFace.find() returns a list of DataFrames (one per model)
            # Extract matches from the first result
            if results and len(results) > 0:
                df = results[0]
                if not df.empty:
                    # Convert DataFrame to list of matches
                    for idx, row in df.iterrows():
                        matches.append({
                            'reference_image': os.path.basename(row['identity']),
                            'distance': float(row['distance']),
                            'threshold': 0.6,  # Default threshold for ArcFace
                            'verified': float(row['distance']) < 0.6
                        })
            
            # Sort by distance (closest match first) - already sorted by DeepFace.find()
            matches = sorted(matches, key=lambda x: x['distance'])
            
            # Return results
            return jsonify({
                'success': True,
                'message': 'Matching completed',
                'matches': matches,
                'best_match': matches[0] if matches else None
            }), 200
        
        finally:
            # Clean up temp file
            try:
                if os.path.exists(probe_path):
                    os.remove(probe_path)
            except Exception as cleanup_err:
                print(f"Warning: Could not clean up temp file {probe_path}: {cleanup_err}")
    
    except Exception as e:
        print(f"Error in match_face: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'deepface-microservice'}), 200

@app.route('/start_stream', methods=['POST'])
def start_stream():
    """Start video streaming"""
    global streaming_active, stream_thread, cap
    
    if streaming_active:
        return jsonify({'success': False, 'message': 'Stream already running'}), 400
    
    try:
        # Initialize camera
        if cap is None:
            cap = cv2.VideoCapture(0)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 15)
        
        if not cap.isOpened():
            return jsonify({'success': False, 'message': 'Failed to open camera'}), 500
        
        streaming_active = True
        stream_thread = threading.Thread(target=capture_frames, daemon=True)
        stream_thread.start()
        
        return jsonify({'success': True, 'message': 'Stream started'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/stop_stream', methods=['POST'])
def stop_stream():
    """Stop video streaming"""
    global streaming_active, cap
    
    streaming_active = False
    
    # Wait a moment for thread to stop
    time.sleep(0.5)
    
    # Release camera
    if cap is not None:
        cap.release()
        cap = None
    
    return jsonify({'success': True, 'message': 'Stream stopped'}), 200

@app.route('/video_feed')
def video_feed():
    """Video streaming endpoint (MJPEG)"""
    if not streaming_active:
        return jsonify({'error': 'Stream not active'}), 400
    
    response = Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

if __name__ == '__main__':
    from flask_cors import CORS
    CORS(app)
    app.run(host='0.0.0.0', port=5001, debug=False)
