// ---------------------------
// VALIDATION UTILITIES
// ---------------------------
function validateName(name) {
    if (!name || name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
    }
    if (name.trim().length > 100) {
        return { valid: false, error: 'Name must be less than 100 characters' };
    }
    return { valid: true };
}

function validateAge(age) {
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum)) {
        return { valid: false, error: 'Age is required and must be a number' };
    }
    if (ageNum < 1 || ageNum > 150) {
        return { valid: false, error: 'Age must be between 1 and 150' };
    }
    return { valid: true };
}

function validateWeight(weight) {
    if (!weight || weight.trim().length === 0) {
        return { valid: false, error: 'Weight is required' };
    }
    return { valid: true };
}

function validateHeight(height) {
    if (!height || height.trim().length === 0) {
        return { valid: false, error: 'Height is required' };
    }
    return { valid: true };
}

function validateForm() {
    const errors = {};
    const nameField = document.getElementById('name');
    const ageField = document.getElementById('age');
    const weightField = document.getElementById('weight');
    const heightField = document.getElementById('height');

    // Validate each field
    const nameValidation = validateName(nameField.value);
    if (!nameValidation.valid) errors.name = nameValidation.error;

    const ageValidation = validateAge(ageField.value);
    if (!ageValidation.valid) errors.age = ageValidation.error;

    const weightValidation = validateWeight(weightField.value);
    if (!weightValidation.valid) errors.weight = weightValidation.error;

    const heightValidation = validateHeight(heightField.value);
    if (!heightValidation.valid) errors.height = heightValidation.error;

    // Update UI with errors
    updateFieldErrors(errors);

    return Object.keys(errors).length === 0;
}

function updateFieldErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.form-field.error').forEach(el => el.classList.remove('error'));

    // Add new errors
    const fields = { name: 'name', age: 'age', weight: 'weight', height: 'height' };
    Object.keys(fields).forEach(key => {
        const field = document.getElementById(fields[key]);
        if (errors[key]) {
            field.classList.add('error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'form-error';
            errorMsg.textContent = errors[key];
            field.parentElement.insertBefore(errorMsg, field.nextSibling);
        }
    });
}

function showLoadingState(show = true) {
    const submitBtn = document.querySelector('.cta-btn');
    const aiOutput = document.getElementById('aiOutput');
    
    if (show) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating Plan...';
        
        // Multi-stage loading experience
        const stages = [
            { icon: '🔍', text: 'Analyzing your health profile...', duration: 2000 },
            { icon: '🤖', text: 'Consulting Gemini AI for recommendations...', duration: 5000 },
            { icon: '✍️', text: 'Formatting your personalized plan...', duration: 2000 }
        ];
        
        let stageIndex = 0;
        const updateStage = () => {
            if (stageIndex < stages.length) {
                const stage = stages[stageIndex];
                const estimatedTotal = stages.reduce((sum, s) => sum + s.duration, 0);
                const elapsed = stages.slice(0, stageIndex).reduce((sum, s) => sum + s.duration, 0);
                const remaining = Math.ceil((estimatedTotal - elapsed) / 1000);
                
                aiOutput.innerHTML = `
                    <div class="loading-container">
                        <div class="spinner"></div>
                        <p style="font-size: 18px; margin: 10px 0;">${stage.icon}</p>
                        <p>${stage.text}</p>
                        <p style="font-size: 12px; color: #666;">⏱️ About ${remaining}s remaining...</p>
                    </div>
                `;
                stageIndex++;
                setTimeout(updateStage, stage.duration);
            }
        };
        updateStage();
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get AI Plan';
    }
}

function getErrorType(message) {
    if (message.includes('Failed to fetch') || message.includes('ERR_')) {
        return 'connection';
    } else if (message.includes('Invalid') || message.includes('required')) {
        return 'validation';
    } else if (message.includes('429') || message.includes('Rate limited')) {
        return 'ratelimit';
    } else if (message.includes('timeout')) {
        return 'timeout';
    }
    return 'unknown';
}

function getErrorTitle(type) {
    const titles = {
        connection: '🌐 Connection Failed',
        validation: '⚠️ Invalid Input',
        timeout: '⏱️ Request Timeout',
        ratelimit: '⏲️ Too Many Requests',
        unknown: '❌ Error Occurred'
    };
    return titles[type] || titles.unknown;
}

function getErrorSuggestion(type) {
    const suggestions = {
        connection: 'Make sure both servers are running: npm start in Salud-Plus and SaludPlusAPI directories',
        validation: 'Check that all required fields are filled correctly',
        timeout: 'Your connection might be slow. Please try again in a moment',
        ratelimit: 'Too many requests from your IP. Wait a few minutes and try again',
        unknown: 'An unexpected error occurred. Try refreshing the page'
    };
    return suggestions[type] || suggestions.unknown;
}

function showErrorMessage(message) {
    const aiOutput = document.getElementById('aiOutput');
    const errorType = getErrorType(message);
    const title = getErrorTitle(errorType);
    const suggestion = getErrorSuggestion(errorType);
    
    let actionButton = '';
    if (errorType === 'connection') {
        actionButton = '<button class="error-action-btn" onclick="location.reload()">🔄 Retry</button>';
    } else if (errorType === 'validation') {
        actionButton = '<button class="error-action-btn" onclick="document.getElementById(\'planForm\').reset()">Clear Form</button>';
    } else if (errorType === 'timeout') {
        actionButton = '<button class="error-action-btn" onclick="location.reload()">Try Again</button>';
    } else {
        actionButton = '<button class="error-action-btn" onclick="location.reload()">Refresh Page</button>';
    }
    
    aiOutput.innerHTML = `
        <div class="error-container">
            <p style='color: #d9534f; font-weight: bold; font-size: 16px;'>${title}</p>
            <p style='color: #d9534f; margin: 10px 0;'>${message}</p>
            <div style='margin: 15px 0;'>${actionButton}</div>
            <p style='font-size: 12px; color: #666; margin-top: 10px;'>${suggestion}</p>
        </div>
    `;
}

// ---------------------------
// CALL BACKEND API FOR AI SERVICES
// ---------------------------
async function generateAIResponse(userData, endpoint = '/api/generateHealth') {
    try {
        console.log(`Making request to ${endpoint}...`);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userData: userData
            })
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.response) {
            const aiResponse = data.response;
            
            // Save to history
            saveToHistory(userData, aiResponse);
            
            // Store response in sessionStorage and redirect to results page
            sessionStorage.setItem("aiResponse", aiResponse);
            window.location.href = "results.html";
        } else {
            showErrorMessage('No response generated. Please try again.');
        }
    } catch (err) {
        console.error("Error:", err);
        showErrorMessage(err.message);
    } finally {
        showLoadingState(false);
    }
}

// ---------------------------
// HANDLE FORM SUBMISSION
// ---------------------------
document.getElementById("planForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
        const userData = {
            name: document.getElementById("name").value.trim(),
            age: document.getElementById("age").value,
            weight: document.getElementById("weight").value,
            height: document.getElementById("height").value,
            conditions: Array.from(document.querySelectorAll('input[name="condition[]"]:checked'))
                .map(cb => cb.value),
            otherCondition: document.getElementById("otherCondition").value.trim(),
            additionalInfo: document.getElementById("additionalInfo").value.trim()
        };

        // Validate form before submission
        if (!validateForm()) {
            return; // validateForm() displays errors automatically
        }

        // Show loading state
        showLoadingState(true);

        // Save to localStorage for history
        localStorage.setItem("healthPlanUserData", JSON.stringify(userData));

        // Generate and display AI response
        await generateAIResponse(userData);
    } catch (err) {
        console.error("Form submission error:", err);
        showErrorMessage(err.message);
    }
});

// ---------------------------
// WEIGHT TOGGLE
// ---------------------------
const weightInput = document.getElementById('weight');
const weightLabel = document.getElementById('weightLabel');
const weightToggle = document.getElementById('weightToggle');
let isLbs = true;

weightToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const value = parseFloat(weightInput.value);
    if (isNaN(value)) return alert("Enter a valid weight.");

    if (isLbs) {
        weightInput.value = (value * 0.453592).toFixed(1);
        weightLabel.textContent = "Weight (kg):";
        weightToggle.textContent = "Switch to lbs";
    } else {
        weightInput.value = (value * 2.20462).toFixed(1);
        weightLabel.textContent = "Weight (lbs):";
        weightToggle.textContent = "Switch to kg";
    }
    isLbs = !isLbs;
});

// ---------------------------
// HEIGHT TOGGLE
// ---------------------------
const heightInput = document.getElementById('height');
const heightLabel = document.getElementById('heightLabel');
const heightToggle = document.getElementById('heightToggle');
let isFeet = true;

const parseFeet = (input) => {
    const match = input.match(/(\d+)'(\d+)/);
    if (!match) return NaN;
    return parseInt(match[1]) + parseInt(match[2]) / 12;
};

heightToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const value = heightInput.value.trim();

    if (isFeet) {
        const feet = parseFeet(value);
        if (isNaN(feet)) return alert("Enter a valid height like 5'10\"");

        heightInput.value = (feet * 0.3048).toFixed(2);
        heightLabel.textContent = "Height (m):";
        heightToggle.textContent = "Switch to feet";
    } else {
        const meters = parseFloat(value);
        if (isNaN(meters)) return alert("Enter a valid height in meters");

        const feet = meters * 3.28084;
        const ft = Math.floor(feet);
        const inches = Math.round((feet - ft) * 12);
        heightInput.value = `${ft}'${inches}"`;

        heightLabel.textContent = "Height (feet):";
        heightToggle.textContent = "Switch to m";
    }

    isFeet = !isFeet;
});

// ---------------------------
// CONDITIONS DROPDOWN
// ---------------------------
function initializeDropdown() {
    const dropdownToggle = document.getElementById("dropdownToggle");
    const dropdownOptions = document.getElementById("conditionOptions");
    const checkboxes = dropdownOptions.querySelectorAll("input[type='checkbox']");
    const placeholder = document.getElementById("dropdownPlaceholder");
    const otherWrapper = document.getElementById("otherConditionWrapper");
    const otherInput = document.getElementById("otherCondition");

    if (!dropdownToggle) {
        console.error("Dropdown toggle not found");
        return;
    }

    dropdownToggle.addEventListener("click", (e) => {
        e.preventDefault();
        dropdownOptions.style.display =
            dropdownOptions.style.display === "block" ? "none" : "block";
    });

    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const selected = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.value);

            placeholder.textContent = selected.length ? selected.join(", ") : "Select conditions...";

            if (selected.includes("Other")) {
                otherWrapper.style.display = "block";
                otherInput.required = true;
            } else {
                otherWrapper.style.display = "none";
                otherInput.required = false;
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#conditionDropdown")) {
            dropdownOptions.style.display = "none";
        }
    });
}

// ---------------------------
// ONBOARDING TOOLTIPS
// ---------------------------
function initializeTooltips() {
    const tooltips = {
        'name': 'Used to personalize your plan recommendations',
        'age': 'Helps determine appropriate health guidelines for your age group',
        'weight': 'Used to calculate personalized nutrition and fitness recommendations',
        'height': 'Used with weight to calculate your BMI and other metrics',
        'dropdownToggle': 'Select existing health conditions to get safe, targeted advice',
        'additionalInfo': 'Share medications, allergies, or specific goals (optional but helpful)'
    };
    
    Object.keys(tooltips).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            const label = element.parentElement.querySelector('label') || element.previousElementSibling;
            if (label) {
                const tooltipIcon = document.createElement('span');
                tooltipIcon.className = 'tooltip-icon';
                tooltipIcon.textContent = '?';
                tooltipIcon.title = tooltips[fieldId];
                tooltipIcon.style.cursor = 'help';
                label.appendChild(tooltipIcon);
            }
        }
    });
}

// ---------------------------
// SAVE TO HISTORY
// ---------------------------
function saveToHistory(userData, aiResponse) {
    let history = JSON.parse(localStorage.getItem("planHistory")) || [];
    const entry = {
        timestamp: new Date().toISOString(),
        weight: userData.weight,
        height: userData.height,
        conditions: userData.conditions,
        response: aiResponse
    };
    history.push(entry);
    localStorage.setItem("planHistory", JSON.stringify(history));
}

// ---------------------------
// LOAD AND DISPLAY HISTORY
// ---------------------------
function loadHistory(selectedDate = null) {
    const history = JSON.parse(localStorage.getItem("planHistory")) || [];
    const container = document.getElementById("historyContainer");

    if (history.length === 0) {
        container.innerHTML = "<p style='color: #999;'>No saved plans yet.</p>";
        return;
    }

    // Use selected date or today's date
    const filterDate = selectedDate ? new Date(selectedDate) : new Date();
    const filterDateString = filterDate.toLocaleDateString();
    
    // Find plan matching the selected/today's date
    const matchingPlan = history.find(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate.toLocaleDateString() === filterDateString;
    });

    if (!matchingPlan) {
        container.innerHTML = `<p style='color: #999;'>No saved plans for ${filterDateString}.</p>`;
        return;
    }

    // Display the matching plan
    const date = new Date(matchingPlan.timestamp);
    const displayDate = isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
    const displayTime = isNaN(date.getTime()) ? "" : date.toLocaleTimeString();
    
    let responseHTML = '';
    if (matchingPlan.response) {
        responseHTML = `
            <div style='margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd;'>
                <div style='text-align: left; line-height: 1.6; font-size: 14px;'>${matchingPlan.response.replace(/\n/g, '<br>')}</div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div style='background: #f5faf8; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #2e8b57;'>
            <strong>Plan from ${displayDate}</strong> ${displayTime ? '@ ' + displayTime : ''}<br>
            <small>Weight: ${matchingPlan.weight} | Height: ${matchingPlan.height} | Conditions: ${matchingPlan.conditions.length > 0 ? matchingPlan.conditions.join(", ") : "None"}</small>
            ${responseHTML}
        </div>
    `;
}

// ---------------------------
// INITIALIZE ON PAGE LOAD
// ---------------------------
window.addEventListener("load", () => {
    initializeDropdown();
    initializeTooltips();
    
    // Auto-load existing plan data if available
    const raw = localStorage.getItem("healthPlanUserData");
    if (raw) {
        const data = JSON.parse(raw);
        document.getElementById("weight").value = data.weight || "";
        document.getElementById("height").value = data.height || "";
        document.getElementById("additionalInfo").value = data.additionalInfo || "";
        
        // Restore conditions
        data.conditions.forEach(condition => {
            const checkbox = Array.from(document.querySelectorAll('input[name="condition[]"]'))
                .find(cb => cb.value === condition);
            if (checkbox) checkbox.checked = true;
        });
        
        if (data.otherCondition) {
            document.getElementById("otherCondition").value = data.otherCondition;
            document.getElementById("otherConditionWrapper").style.display = "block";
        }
    }
});
