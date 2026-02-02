// ---------------------------
// VALIDATE AUTHENTICATION
// ---------------------------
if (!isUserLoggedIn()) {
    window.location.href = 'auth.html';
}

// ---------------------------
// DASHBOARD FUNCTIONALITY
// ---------------------------

let allEntries = [];

function loadDashboard() {
    const planHistory = JSON.parse(localStorage.getItem('planHistory')) || [];
    allEntries = planHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    renderEntries(allEntries);
    populateDateOptions();
}

function populateDateOptions() {
    const dateFilter = document.getElementById('dateFilter');
    const uniqueDates = new Set();
    
    allEntries.forEach(entry => {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        uniqueDates.add(date);
    });
    
    // Set the max date to today
    const today = new Date().toISOString().split('T')[0];
    dateFilter.max = today;
}

function filterByDate() {
    const dateFilter = document.getElementById('dateFilter');
    const selectedDate = dateFilter.value;
    
    if (!selectedDate) {
        renderEntries(allEntries);
        return;
    }
    
    const filtered = allEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
        return entryDate === selectedDate;
    });
    
    renderEntries(filtered);
}

function clearDateFilter() {
    document.getElementById('dateFilter').value = '';
    renderEntries(allEntries);
}

function renderEntries(entries) {
    const entriesList = document.getElementById('entriesList');
    
    if (entries.length === 0) {
        entriesList.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                <p style="color: #999; font-size: 16px;">No entries found for the selected date.</p>
            </div>
        `;
        return;
    }
    
    const entriesHTML = entries.map((entry, index) => {
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();
        
        return `
            <div class="entry-card">
                <div class="entry-header">
                    <div class="entry-date">
                        <span class="date-badge">${dateStr}</span>
                        <span class="time-badge">${timeStr}</span>
                    </div>
                    <button class="expand-btn" onclick="toggleEntryDetails(this, ${index})" title="Expand/Collapse">▼</button>
                </div>
                
                <div class="entry-summary">
                    <div class="entry-stat">
                        <span class="stat-label">Weight:</span>
                        <span class="stat-value">${escapeHtml(entry.weight || 'N/A')}</span>
                    </div>
                    <div class="entry-stat">
                        <span class="stat-label">Height:</span>
                        <span class="stat-value">${escapeHtml(entry.height || 'N/A')}</span>
                    </div>
                    <div class="entry-stat">
                        <span class="stat-label">Conditions:</span>
                        <span class="stat-value">${entry.conditions && entry.conditions.length > 0 
                            ? entry.conditions.length + ' condition(s)' 
                            : 'None'}</span>
                    </div>
                </div>
                
                <div class="entry-details" style="display: none;">
                    ${entry.conditions && entry.conditions.length > 0 ? `
                    <div class="detail-section">
                        <strong style="color: #2e8b57;">Health Conditions:</strong>
                        <p>${entry.conditions.map(c => escapeHtml(c)).join(', ')}</p>
                    </div>
                    ` : ''}
                    
                    <div class="detail-section" style="border-top: 1px solid #e0e0e0; padding-top: 12px; margin-top: 12px;">
                        <strong style="color: #2e8b57;">AI Health Plan:</strong>
                        <div class="plan-content">
                            ${entry.response.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    
                    <div class="entry-actions">
                        <button onclick="downloadEntry(${index})" class="action-btn">💾 Download</button>
                        <button onclick="copyEntry(${index})" class="action-btn">📋 Copy</button>
                        <button onclick="printEntry(${index})" class="action-btn">🖨️ Print</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    entriesList.innerHTML = entriesHTML;
}

function toggleEntryDetails(btn, index) {
    const card = btn.closest('.entry-card');
    const details = card.querySelector('.entry-details');
    const isOpen = details.style.display === 'block';
    
    details.style.display = isOpen ? 'none' : 'block';
    btn.classList.toggle('open', !isOpen);
}

function downloadEntry(index) {
    const entry = allEntries[index];
    const date = new Date(entry.timestamp).toISOString().split('T')[0];
    const filename = `health-plan-${date}.txt`;
    
    let content = `SALUD+ HEALTH PLAN\n`;
    content += `Generated: ${new Date(entry.timestamp).toLocaleString()}\n\n`;
    content += `Weight: ${entry.weight}\n`;
    content += `Height: ${entry.height}\n`;
    content += `Conditions: ${entry.conditions.join(', ') || 'None'}\n\n`;
    content += `---\n\n`;
    content += entry.response;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    link.download = filename;
    link.click();
}

function copyEntry(index) {
    const entry = allEntries[index];
    let content = `Weight: ${entry.weight}\n`;
    content += `Height: ${entry.height}\n`;
    content += `Conditions: ${entry.conditions.join(', ') || 'None'}\n\n`;
    content += entry.response;
    
    navigator.clipboard.writeText(content).then(() => {
        alert('✅ Entry copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy to clipboard');
    });
}

function printEntry(index) {
    const entry = allEntries[index];
    const date = new Date(entry.timestamp).toLocaleString();
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Health Plan - ${date}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2e8b57; }
                .metadata { background: #f5faf8; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                .metadata p { margin: 5px 0; }
                .plan-content { margin-top: 20px; line-height: 1.6; }
            </style>
        </head>
        <body>
            <h1>Salud+ Health Plan</h1>
            <div class="metadata">
                <p><strong>Generated:</strong> ${date}</p>
                <p><strong>Weight:</strong> ${entry.weight}</p>
                <p><strong>Height:</strong> ${entry.height}</p>
                <p><strong>Conditions:</strong> ${entry.conditions.join(', ') || 'None'}</p>
            </div>
            <div class="plan-content">
                ${entry.response.replace(/\n/g, '<br>')}
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
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

// ---------------------------
// EVENT LISTENERS
// ---------------------------
document.getElementById('dateFilter').addEventListener('change', filterByDate);
document.getElementById('clearDateBtn').addEventListener('click', clearDateFilter);

// Load dashboard on page load
window.addEventListener('load', loadDashboard);
