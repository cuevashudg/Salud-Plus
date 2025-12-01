// ---------------------------
// AUTHENTICATION UTILITIES
// ---------------------------

function getCurrentUser() {
    return localStorage.getItem('salud_currentUser');
}

function isUserLoggedIn() {
    const currentUser = localStorage.getItem('salud_currentUser');
    const sessionToken = localStorage.getItem('salud_sessionToken');
    return currentUser && sessionToken;
}

function checkAuthentication() {
    if (!isUserLoggedIn()) {
        // Redirect to auth page
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('salud_currentUser');
    localStorage.removeItem('salud_sessionToken');
    // Clear profile data when logging out (optional - comment out to keep data)
    // localStorage.removeItem('userProfile');
    // localStorage.removeItem('planHistory');
    window.location.href = 'auth.html';
}

function getUserEmail() {
    return getCurrentUser() || 'User';
}
