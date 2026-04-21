
"""
Python deepface microservice for 1:N face matching
Runs on port 5001, provides /match endpoint
Uses DeepFace.find() for efficient 1:N matching
"""
from flask import Flask, request, jsonify
import os
import tempfile
import uuid
from deepface import DeepFace
import pandas as pd

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
