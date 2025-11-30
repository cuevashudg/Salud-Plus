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
    
    // Clear the session storage after displaying
    sessionStorage.removeItem("aiResponse");
});
