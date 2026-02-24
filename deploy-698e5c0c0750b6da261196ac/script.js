let photoData = null;
let isFlipped = false;
let currentBadgeId = null;

// Check if we have a saved badge on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedBadgeId = localStorage.getItem('currentBadgeId');
    if (savedBadgeId) {
        const badgeData = JSON.parse(localStorage.getItem(savedBadgeId));
        if (badgeData) {
            loadBadge(badgeData);
        }
    }
});

// Form validation
const form = document.getElementById('badgeForm');
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const createBtn = document.getElementById('createBtn');

photoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoData = e.target.result;
            photoPreview.src = photoData;
            photoPreview.classList.add('active');
            checkFormValidity();
        };
        reader.readAsDataURL(file);
    }
});

function checkFormValidity() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const title = document.getElementById('title').value;
    const department = document.getElementById('department').value;
    
    createBtn.disabled = !(firstName && lastName && title && department && photoData);
}

document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', checkFormValidity);
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const title = document.getElementById('title').value;
    const department = document.getElementById('department').value;

    const badgeData = {
        firstName: firstName,
        lastName: lastName,
        title: title,
        department: department,
        photo: photoData,
        timestamp: Date.now()
    };

    // Save badge data
    const badgeId = `badge-${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
    localStorage.setItem(badgeId, JSON.stringify(badgeData));
    localStorage.setItem('currentBadgeId', badgeId);
    currentBadgeId = badgeId;

    // Load and display badge
    loadBadge(badgeData);
});

function loadBadge(badgeData) {
    // Update badge display
    document.getElementById('displayFirstName').textContent = badgeData.firstName.toUpperCase();
    document.getElementById('displayLastName').textContent = badgeData.lastName.toUpperCase();
    document.getElementById('displayTitle').textContent = badgeData.title.toUpperCase();
    document.getElementById('displayDepartment').textContent = badgeData.department.toUpperCase();
    document.getElementById('employeePhoto').src = badgeData.photo;

    // Generate QR code
    const canvas = document.getElementById('qrcode');
    const qr = new QRious({
        element: canvas,
        value: 'https://www.opendoor.com/rental-scam',
        size: 200,
        foreground: '#000000',
        background: '#ffffff'
    });

    // Show badge view
    document.getElementById('creatorView').classList.add('hidden');
    document.getElementById('badgeView').classList.add('active');
    document.body.style.background = '#0a0e27';
}

function clearForm() {
    form.reset();
    photoPreview.classList.remove('active');
    photoData = null;
    checkFormValidity();
}

function flipCard() {
    isFlipped = !isFlipped;
    document.getElementById('cardFlipper').classList.toggle('flipped');
    document.getElementById('viewLabel').textContent = 
        isFlipped ? 'BACK VIEW PREVIEW' : 'FRONT VIEW PREVIEW';
}

function goBack() {
    // Clear current badge and go to form
    localStorage.removeItem('currentBadgeId');
    currentBadgeId = null;
    
    document.getElementById('badgeView').classList.remove('active');
    document.getElementById('creatorView').classList.remove('hidden');
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    // Reset flip
    if (isFlipped) {
        flipCard();
    }
    
    // Clear form
    clearForm();
}

function downloadBadge() {
    // Create a temporary container for export
    const badge = document.querySelector('.card-front').cloneNode(true);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    
    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw blue header
    ctx.fillStyle = '#0066FF';
    ctx.fillRect(0, 0, canvas.width, 180);
    
    // Draw OPENDOOR text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('OPENDOOR', canvas.width/2, 120);
    
    // Get employee photo
    const photoImg = document.getElementById('employeePhoto');
    if (photoImg.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            // Draw circular photo
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width/2, 340, 140, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, canvas.width/2 - 140, 200, 280, 280);
            ctx.restore();
            
            // Draw badge icon
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(canvas.width - 120, 240, 70, 70);
            
            // Draw name
            const firstName = document.getElementById('displayFirstName').textContent;
            const lastName = document.getElementById('displayLastName').textContent;
            
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 64px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(firstName, canvas.width/2, 540);
            
            ctx.fillStyle = '#0066FF';
            ctx.fillText(lastName, canvas.width/2, 610);
            
            // Draw title
            const title = document.getElementById('displayTitle').textContent;
            ctx.fillStyle = '#000000';
            ctx.fillRect(50, 650, canvas.width - 100, 80);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 26px Arial';
            ctx.fillText(title, canvas.width/2, 700);
            
            // Draw department
            const dept = document.getElementById('displayDepartment').textContent;
            ctx.fillStyle = '#999999';
            ctx.font = '28px Arial';
            ctx.fillText(dept, canvas.width/2, 780);
            
            // Draw contact section
            ctx.fillStyle = '#0066FF';
            ctx.fillRect(0, 900, canvas.width, 200);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '22px Arial';
            ctx.fillText('CONTACT', canvas.width/2, 950);
            
            ctx.font = 'bold 30px Arial';
            ctx.fillText('trust@opendoor.com', canvas.width/2, 1000);
            ctx.fillText('or call 888-352-7075', canvas.width/2, 1050);
            
            // Download
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `${firstName}-${lastName}-badge.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            });
        };
        img.src = photoImg.src;
    }
}