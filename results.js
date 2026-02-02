// ---------------------------
// UTILITY FUNCTIONS FOR RESULTS PAGE
// ---------------------------
function downloadPlan() {
    const element = document.getElementById('aiOutput');
    const text = element.innerText;
    const link = document.createElement('a');
    const file = new Blob([text], {type: 'text/plain'});
    link.href = URL.createObjectURL(file);
    link.download = `health-plan-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
}

function copyToClipboard() {
    const element = document.getElementById('aiOutput');
    const text = element.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = originalText; }, 2000);
    }).catch(err => {
        alert('Failed to copy to clipboard');
    });
}

function shareViaEmail() {
    const planText = document.getElementById('aiOutput').innerText;
    const subject = encodeURIComponent('My Personalized Health Plan from Salud+');
    const body = encodeURIComponent(`Here's my personalized health plan:\n\n${planText}\n\nGenerated at ${new Date().toLocaleString()}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function printPlan() {
    window.print();
}

function saveToProfile() {
    const userData = JSON.parse(localStorage.getItem('healthPlanUserData'));
    const aiResponse = document.getElementById('aiOutput').innerText;
    
    if (!userData) {
        alert('Error: User data not found. Please create a plan first.');
        return;
    }
    
    // Save to user profile (most recent data)
    const profileData = {
        name: userData.name,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        conditions: userData.conditions,
        otherCondition: userData.otherCondition,
        additionalInfo: userData.additionalInfo,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    // Also save to plan history
    const planEntry = {
        timestamp: new Date().toISOString(),
        weight: userData.weight,
        height: userData.height,
        conditions: userData.conditions,
        response: aiResponse
    };
    
    let history = JSON.parse(localStorage.getItem('planHistory')) || [];
    history.push(planEntry);
    localStorage.setItem('planHistory', JSON.stringify(history));
    
    // Show success message
    const btn = document.getElementById('saveProfileBtn');
    const originalText = btn.textContent;
    btn.textContent = '✅ Saved to Profile!';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
    }, 3000);
}

// ---------------------------
// LOAD AND DISPLAY RESULTS ON PAGE LOAD
// ---------------------------
window.addEventListener("load", () => {
    const output = document.getElementById("aiOutput");
    const actionsDiv = document.querySelector('.results-actions');
    
    // Get the AI response from sessionStorage
    const aiResponse = sessionStorage.getItem("aiResponse");
    
    if (!aiResponse) {
        output.innerHTML = "<p style='color: #d9534f;'>❌ No results found. Please create a plan first.</p>";
        return;
    }

    // Display the AI response with proper formatting and styling
    output.innerHTML = `
        <div style='text-align: left; line-height: 1.8; color: #2b3a34;'>
            ${aiResponse.replace(/\n/g, '<br>')}
        </div>
    `;
    
    // Add action buttons before existing content
    const actionButtons = document.createElement('div');
    actionButtons.className = 'results-action-buttons';
    actionButtons.innerHTML = `
        <button class="results-btn results-btn-primary" onclick="printPlan()" title="Print your health plan">🖨️ Print</button>
        <button class="results-btn results-btn-primary" onclick="downloadPlan()" title="Download as text file">💾 Download</button>
        <button class="results-btn results-btn-primary" onclick="copyToClipboard()" title="Copy to clipboard">📋 Copy</button>
        <button class="results-btn results-btn-primary" onclick="shareViaEmail()" title="Share via email">📧 Share</button>
    `;
    
    // Insert action buttons before the results-actions div
    if (actionsDiv) {
        actionsDiv.parentElement.insertBefore(actionButtons, actionsDiv);
    }
    
    // Attach event listener to save profile button (only if user is logged in)
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        if (isUserLoggedIn()) {
            saveProfileBtn.addEventListener('click', saveToProfile);
        } else {
            // If not logged in, show auth prompt
            saveProfileBtn.textContent = '🔐 Sign In to Save';
            saveProfileBtn.onclick = (e) => {
                e.preventDefault();
                const confirmed = confirm('You need to sign in to save your profile. Would you like to sign in now?');
                if (confirmed) {
                    window.location.href = 'auth.html';
                }
            };
        }
    }
    
    // Clear the session storage after displaying
    sessionStorage.removeItem("aiResponse");
});
