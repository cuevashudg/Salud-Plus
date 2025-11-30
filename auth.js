// ---------------------------
// PASSWORD VALIDATION
// ---------------------------
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };

    return {
        isValid: Object.values(requirements).every(req => req),
        requirements: requirements
    };
}

function updatePasswordRequirements(password) {
    const validation = validatePassword(password);
    const requirements = ['length', 'uppercase', 'lowercase', 'number', 'special'];
    
    requirements.forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (validation.requirements[req]) {
            element.classList.add('met');
            element.classList.remove('unmet');
        } else {
            element.classList.add('unmet');
            element.classList.remove('met');
        }
    });

    return validation.isValid;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ---------------------------
// FORM VALIDATION
// ---------------------------
function validateSignupForm() {
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    let isValid = true;

    // Clear previous errors
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';

    // Validate email
    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required';
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        isValid = false;
    } else if (emailExists(email)) {
        document.getElementById('emailError').textContent = 'This email is already registered';
        isValid = false;
    }

    // Validate password
    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required';
        isValid = false;
    } else if (!updatePasswordRequirements(password)) {
        document.getElementById('passwordError').textContent = 'Password does not meet requirements';
        isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Please confirm your password';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        isValid = false;
    }

    return isValid;
}

function validateLoginForm() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    let isValid = true;

    // Clear previous errors
    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';

    // Validate email
    if (!email) {
        document.getElementById('loginEmailError').textContent = 'Email is required';
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('loginEmailError').textContent = 'Please enter a valid email address';
        isValid = false;
    }

    // Validate password
    if (!password) {
        document.getElementById('loginPasswordError').textContent = 'Password is required';
        isValid = false;
    }

    return isValid;
}

// ---------------------------
// AUTHENTICATION LOGIC
// ---------------------------
function getUsers() {
    return JSON.parse(localStorage.getItem('salud_users')) || {};
}

function saveUsers(users) {
    localStorage.setItem('salud_users', JSON.stringify(users));
}

function emailExists(email) {
    const users = getUsers();
    return users.hasOwnProperty(email);
}

function hashPassword(password) {
    // Simple hash function (in production, use proper bcrypt or similar)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return 'hash_' + Math.abs(hash).toString(36);
}

function verifyPassword(inputPassword, storedHash) {
    return hashPassword(inputPassword) === storedHash;
}

// ---------------------------
// FORM HANDLERS
// ---------------------------
function handleSignup(event) {
    event.preventDefault();

    if (!validateSignupForm()) {
        return;
    }

    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    try {
        const users = getUsers();
        const passwordHash = hashPassword(password);

        users[email] = {
            email: email,
            passwordHash: passwordHash,
            createdAt: new Date().toISOString()
        };

        saveUsers(users);

        // Set current user session
        localStorage.setItem('salud_currentUser', email);
        localStorage.setItem('salud_sessionToken', 'session_' + Date.now());

        // Show success message
        showAuthMessage('Account created successfully! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = 'LoggedIn.html';
        }, 1500);
    } catch (error) {
        showAuthMessage('An error occurred. Please try again.', 'error');
    }
}

function handleLogin(event) {
    event.preventDefault();

    if (!validateLoginForm()) {
        return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const users = getUsers();

        if (!users.hasOwnProperty(email)) {
            document.getElementById('loginEmailError').textContent = 'Email not found';
            return;
        }

        const user = users[email];

        if (!verifyPassword(password, user.passwordHash)) {
            document.getElementById('loginPasswordError').textContent = 'Incorrect password';
            return;
        }

        // Set current user session
        localStorage.setItem('salud_currentUser', email);
        localStorage.setItem('salud_sessionToken', 'session_' + Date.now());

        // Show success message
        showAuthMessage('Login successful! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = 'LoggedIn.html';
        }, 1500);
    } catch (error) {
        showAuthMessage('An error occurred. Please try again.', 'error');
    }
}

function toggleForm(event) {
    event.preventDefault();
    
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    
    signupForm.classList.toggle('active');
    loginForm.classList.toggle('active');
    
    // Clear form fields
    document.getElementById('signupFormElement').reset();
    document.getElementById('loginFormElement').reset();
    
    // Clear error messages
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function showAuthMessage(message, type) {
    const container = document.querySelector('.auth-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-message-${type}`;
    messageDiv.textContent = message;
    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// ---------------------------
// PASSWORD STRENGTH INDICATOR
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordRequirements(e.target.value);
        });
    }
});

// ---------------------------
// CHECK IF ALREADY LOGGED IN
// ---------------------------
window.addEventListener('load', () => {
    const currentUser = localStorage.getItem('salud_currentUser');
    const sessionToken = localStorage.getItem('salud_sessionToken');
    
    if (currentUser && sessionToken) {
        // User is already logged in, redirect to home
        window.location.href = 'LoggedIn.html';
    }
});
