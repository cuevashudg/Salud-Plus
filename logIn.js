const toggleBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');

// Sample valid credentials (replace with actual backend authentication)
const validCredentials = [
    { username: 'john.doe', password: 'password123' },
    { username: 'jane.smith', password: 'securepass456' },
    { username: 'user@example.com', password: 'mypassword789' }
];

toggleBtn.addEventListener('click', e => {
    e.preventDefault();
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.textContent = isPassword ? '👁️‍🗨️' : '👁️';
});

document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();
    
    // Validate input
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Check credentials
    const isValid = validCredentials.some(cred => 
        (cred.username === username || cred.username === username) && 
        cred.password === password
    );
    
    if (isValid) {
        errorMessage.classList.remove('show');
        localStorage.setItem('loggedInUser', username);
        window.location.href = '../LoggedIn/loggedIn.html';
    } else {
        showError('Invalid username/email or password');
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}
