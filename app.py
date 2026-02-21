from flask import Flask, render_template, request, jsonify
import numpy as np
import os
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Class labels for fruits/vegetables
class_labels = ['Apple_Healthy', 'Apple_Rotten', 'Banana_Healthy', 'Banana_Rotten',
                'Tomato_Healthy', 'Tomato_Rotten', 'Potato_Healthy', 'Potato_Rotten',
                'Strawberry_Healthy', 'Strawberry_Rotten']

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/inspect')
def inspect():
    """Model information page"""
    return render_template('inspect.html')

@app.route('/test')
def test():
    """Test/prediction page"""
    return render_template('inner.html')

@app.route('/predict', methods=['POST'])
def predict():
    """Handle image upload and prediction"""
    try:
        # Check if image file is present in request
        if 'image' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image file provided'
            }), 400
        
        file = request.files['image']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400
        
        # Check if file is allowed
        if file and allowed_file(file.filename):
            # Secure the filename
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            
            # Save the file
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # TODO: In a real implementation, load and process the image here
            # For now, we'll use demo prediction logic
            
            # Demo prediction logic (replace with actual model inference)
            prediction = np.random.choice(class_labels)
            confidence = round(np.random.uniform(85, 99), 2)
            
            return jsonify({
                'prediction': prediction,
                'confidence': confidence,
                'status': 'success',
                'filename': filename
            })
        
        return jsonify({
            'status': 'error',
            'message': 'Invalid file type. Allowed types: PNG, JPG, JPEG, WEBP'
        }), 400
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred during prediction'
        }), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'NUTRIGAZE Smart Sorting API is running',
        'classes': len(class_labels),
        'supported_formats': list(app.config['ALLOWED_EXTENSIONS'])
    })

if __name__ == '__main__':
    print('\n' + '='*60)
    print('✅ NUTRIGAZE - Smart Sorting System')
    print('='*60)
    print('✅ Flask Application Created!')
    print('✅ Routes configured:')
    print('   • GET  / - Home page')
    print('   • GET  /test - Test/Prediction page')
    print('   • GET  /inspect - Model information page')
    print('   • POST /predict - Prediction API endpoint')
    print('   • GET  /health - Health check')
    print('✅ Upload folder created')
    print('✅ Starting Flask development server...')
    print('='*60)
    print(f'🌐 Server will be available at: http://127.0.0.1:5000')
    print('='*60 + '\n')
    
    app.run(debug=True, port=5000)
