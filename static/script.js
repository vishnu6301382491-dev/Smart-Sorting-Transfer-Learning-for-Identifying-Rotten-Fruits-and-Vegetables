// Smart Sorting JavaScript - Interactive Functionality

// Global variables
let selectedFile = null;

// DOM Elements
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const previewSection = document.getElementById('previewSection');
const imagePreview = document.getElementById('imagePreview');
const resultSection = document.getElementById('resultSection');
const fileName = document.getElementById('fileName');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    if (imageInput) {
        imageInput.addEventListener('change', handleFileSelect);
    }
    
    if (uploadArea) {
        // Click to upload
        uploadArea.addEventListener('click', function() {
            imageInput.click();
        });
        
        // Drag and drop functionality
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        displayImagePreview(file);
        fileName.textContent = `Selected: ${file.name}`;
    } else {
        alert('Please select a valid image file (JPG, PNG, WEBP)');
    }
}

// Display image preview
function displayImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        previewSection.classList.add('active');
        resultSection.classList.remove('active');
    };
    
    reader.readAsDataURL(file);
}

// Handle drag over event
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.add('dragover');
}

// Handle drag leave event
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.remove('dragover');
}

// Handle drop event
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            selectedFile = file;
            imageInput.files = files; // Update input element
            displayImagePreview(file);
            fileName.textContent = `Selected: ${file.name}`;
        } else {
            alert('Please drop a valid image file (JPG, PNG, WEBP)');
        }
    }
}

// Predict function - sends image to backend
async function predict() {
    if (!selectedFile) {
        alert('Please select an image first!');
        return;
    }
    
    // Show loading overlay
    loadingOverlay.classList.add('active');
    
    try {
        // Create FormData to send the image
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        // Send to backend
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Prediction failed');
        }
        
        const data = await response.json();
        
        // Hide loading overlay
        loadingOverlay.classList.remove('active');
        
        // Display results
        displayResults(data);
        
    } catch (error) {
        console.error('Error:', error);
        loadingOverlay.classList.remove('active');
        alert('Error during prediction. Please try again.');
    }
}

// Display prediction results
function displayResults(data) {
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const predictionText = document.getElementById('predictionText');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceText = document.getElementById('confidenceText');
    const resultDetails = document.getElementById('resultDetails');
    
    // Extract prediction and confidence
    const prediction = data.prediction || 'Unknown';
    const confidence = data.confidence || 0;
    
    // Parse prediction to get item and status
    const parts = prediction.split('_');
    const item = parts[0] || 'Unknown';
    const status = parts[1] || 'Unknown';
    
    // Set result text
    predictionText.textContent = prediction.replace('_', ' - ');
    
    // Set confidence
    confidenceText.textContent = `${confidence}%`;
    setTimeout(() => {
        confidenceFill.style.width = `${confidence}%`;
    }, 100);
    
    // Set icon and color based on status
    if (status.toLowerCase() === 'healthy') {
        resultCard.classList.add('healthy');
        resultCard.classList.remove('rotten');
        resultIcon.textContent = '✅';
        resultDetails.innerHTML = `This <strong>${item}</strong> appears to be <strong style="color: #d1fae5;">HEALTHY</strong> and safe for consumption.`;
    } else if (status.toLowerCase() === 'rotten') {
        resultCard.classList.add('rotten');
        resultCard.classList.remove('healthy');
        resultIcon.textContent = '⚠️';
        resultDetails.innerHTML = `This <strong>${item}</strong> appears to be <strong style="color: #fee2e2;">ROTTEN</strong> and should not be consumed.`;
    } else {
        resultCard.classList.remove('healthy', 'rotten');
        resultIcon.textContent = '🔍';
        resultDetails.innerHTML = `Classification: <strong>${prediction}</strong>`;
    }
    
    // Show result section
    resultSection.classList.add('active');
    
    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Reset upload - clear everything
function resetUpload() {
    // Clear file input
    imageInput.value = '';
    selectedFile = null;
    
    // Clear file name
    fileName.textContent = '';
    
    // Hide preview and results
    previewSection.classList.remove('active');
    resultSection.classList.remove('active');
    
    // Reset image preview
    imagePreview.src = '';
    
    // Scroll to top
    uploadArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Emoji mapping for fruits
const emojiMap = {
    'apple': '🍎',
    'banana': '🍌',
    'tomato': '🍅',
    'potato': '🥔',
    'strawberry': '🍓'
};

// Get emoji for item
function getEmoji(item) {
    const itemLower = item.toLowerCase();
    return emojiMap[itemLower] || '🍏';
}
