// ---------------------------
// CALL BACKEND API FOR GEMINI
// ---------------------------
async function generateAIResponse(userData) {
    const output = document.getElementById("aiOutput");
    output.innerHTML = "<p style='color: #2e8b57;'>🔄 Generating your personalized health guidance...</p>";

    try {
        console.log("Making request to backend API...");

        const response = await fetch("http://localhost:3000/api/generateHealth", {
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
            output.innerHTML = `<div style='text-align: left; line-height: 1.6;'>${aiResponse.replace(/\n/g, '<br>')}</div>`;
            
            // Save to history
            saveToHistory(userData, aiResponse);
        } else {
            output.innerHTML = "<p style='color: #d9534f;'>❌ No response generated. Please try again.</p>";
        }
    } catch (err) {
        console.error("Error:", err);
        output.innerHTML = `<p style='color: #d9534f;'>❌ Error generating guidance: ${err.message}</p><p style='font-size: 12px; color: #666;'>Make sure the backend server is running (npm start or npm run dev)</p>`;
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

        // Validate that required fields are filled
        if (!userData.name || !userData.age || !userData.weight || !userData.height) {
            alert("Please fill in name, age, weight, and height fields.");
            return;
        }

        // Save to localStorage for history
        localStorage.setItem("healthPlanUserData", JSON.stringify(userData));

        // Generate and display AI response
        await generateAIResponse(userData);
    } catch (err) {
        console.error("Form submission error:", err);
        document.getElementById("aiOutput").innerHTML = `<p style='color: #d9534f;'>❌ Error: ${err.message}</p>`;
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
    
    // Set today's date as default in the date input
    const historyDateInput = document.getElementById("historyDate");
    const today = new Date().toISOString().split('T')[0];
    historyDateInput.value = today;
    
    // Load history for today by default
    loadHistory(today);
    
    // Add event listener for date input changes
    historyDateInput.addEventListener("change", (e) => {
        loadHistory(e.target.value);
    });
    
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
