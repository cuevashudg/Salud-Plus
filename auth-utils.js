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
    clearAllAuthData();
    window.location.href = 'auth.html';
}

function getUserEmail() {
    return getCurrentUser() || 'User';
}
