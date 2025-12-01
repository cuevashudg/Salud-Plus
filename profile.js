// ---------------------------
// VALIDATE AUTHENTICATION
// ---------------------------
if (!isUserLoggedIn()) {
    window.location.href = 'auth.html';
}

// ---------------------------
// LOAD AND DISPLAY PROFILE
// ---------------------------
function loadProfile() {
    const profileContent = document.getElementById('profileContent');
    const profileData = JSON.parse(localStorage.getItem('userProfile')) || {};
    
    if (!profileData.name) {
        profileContent.innerHTML = `
            <p style="color: #999; text-align: center;">No profile data found. Create a health plan to get started!</p>
        `;
        return;
    }

    // Display profile information
    const profileHTML = `
        <div class="profile-card">
            <h2 style="color: #2e8b57; margin-top: 0;">Profile Information</h2>
            
            <div class="profile-field">
                <strong>Name:</strong>
                <p>${escapeHtml(profileData.name)}</p>
            </div>
            
            <div class="profile-field">
                <strong>Age:</strong>
                <p>${profileData.age} years old</p>
            </div>
            
            <div class="profile-field">
                <strong>Weight:</strong>
                <p>${profileData.weight} ${profileData.weightUnit || 'lbs'}</p>
            </div>
            
            <div class="profile-field">
                <strong>Height:</strong>
                <p>${profileData.height} ${profileData.heightUnit || 'feet'}</p>
            </div>
            
            <div class="profile-field">
                <strong>Health Conditions:</strong>
                <p>${profileData.conditions && profileData.conditions.length > 0 
                    ? profileData.conditions.map(c => escapeHtml(c)).join(', ') 
                    : 'None'}</p>
            </div>
            
            ${profileData.otherCondition ? `
            <div class="profile-field">
                <strong>Additional Condition:</strong>
                <p>${escapeHtml(profileData.otherCondition)}</p>
            </div>
            ` : ''}
            
            ${profileData.additionalInfo ? `
            <div class="profile-field">
                <strong>Additional Information:</strong>
                <p>${escapeHtml(profileData.additionalInfo).replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            
            ${profileData.lastUpdated ? `
            <div class="profile-field" style="border-top: 1px solid #ddd; padding-top: 12px; margin-top: 12px;">
                <strong>Last Updated:</strong>
                <p>${new Date(profileData.lastUpdated).toLocaleDateString()} at ${new Date(profileData.lastUpdated).toLocaleTimeString()}</p>
            </div>
            ` : ''}
        </div>

        <div class="profile-stats">
            <div class="stat-box">
                <div class="stat-number" id="totalPlans">0</div>
                <div class="stat-label">Total Plans</div>
            </div>
            <div class="stat-box">
                <div class="stat-number" id="lastPlanDate">-</div>
                <div class="stat-label">Last Plan</div>
            </div>
        </div>
    `;
    
    profileContent.innerHTML = profileHTML;
    updateProfileStats();
}

function updateProfileStats() {
    const history = JSON.parse(localStorage.getItem('planHistory')) || [];
    const totalPlans = document.getElementById('totalPlans');
    const lastPlanDate = document.getElementById('lastPlanDate');
    
    totalPlans.textContent = history.length;
    
    if (history.length > 0) {
        const lastPlan = new Date(history[history.length - 1].timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPlan.toLocaleDateString() === today.toLocaleDateString()) {
            lastPlanDate.textContent = 'Today';
        } else if (lastPlan.toLocaleDateString() === yesterday.toLocaleDateString()) {
            lastPlanDate.textContent = 'Yesterday';
        } else {
            lastPlanDate.textContent = lastPlan.toLocaleDateString();
        }
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Load profile on page load
window.addEventListener('load', loadProfile);
