// ---------------------------
// LOAD AND DISPLAY RESULTS ON PAGE LOAD
// ---------------------------
window.addEventListener("load", () => {
    const output = document.getElementById("aiOutput");
    
    // Get the AI response from sessionStorage
    const aiResponse = sessionStorage.getItem("aiResponse");
    
    if (!aiResponse) {
        output.innerHTML = "<p style='color: #d9534f;'>❌ No results found. Please create a plan first.</p>";
        return;
    }

    // Display the AI response with proper formatting
    output.innerHTML = `<div style='text-align: left; line-height: 1.6;'>${aiResponse.replace(/\n/g, '<br>')}</div>`;
    
    // Clear the session storage after displaying
    sessionStorage.removeItem("aiResponse");
});
