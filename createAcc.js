
// Simple submit handler for Create Account form
document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('create-account-form');
	if (!form) return;

	const formMessage = document.getElementById('formMessage');

	function setError(fieldId, message) {
		const input = document.getElementById(fieldId);
		const err = document.getElementById(fieldId + 'Error');
		if (err) {
			err.textContent = message;
			err.classList.add('active');
		}
		if (input) input.classList.remove('input-valid');
	}

	function clearError(fieldId) {
		const input = document.getElementById(fieldId);
		const err = document.getElementById(fieldId + 'Error');
		if (err) {
			err.textContent = '';
			err.classList.remove('active');
		}
		if (input) input.classList.remove('input-valid');
	}

	function clearAllErrors() {
		['firstName', 'lastName', 'username', 'email', 'password', 'confirmPassword'].forEach(clearError);
		if (formMessage) {
			formMessage.textContent = '';
			formMessage.className = 'form-message';
		}
	}

	function showFormMessage(message, type) {
		if (!formMessage) return;
		formMessage.textContent = message;
		formMessage.className = 'form-message ' + (type === 'success' ? 'success' : 'error');
	}

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		clearAllErrors();

		const firstName = document.getElementById('firstName').value.trim();
		const lastName = document.getElementById('lastName').value.trim();
		const username = document.getElementById('username').value.trim();
		const email = document.getElementById('email').value.trim();
		const password = document.getElementById('password').value || '';
		const confirmPassword = document.getElementById('confirmPassword').value || '';

		let firstInvalid = null;

		if (!firstName) {
			setError('firstName', 'First name is required.');
			firstInvalid = firstInvalid || 'firstName';
		}

		if (!lastName) {
			setError('lastName', 'Last name is required.');
			firstInvalid = firstInvalid || 'lastName';
		}

		if (!username) {
			setError('username', 'Username is required.');
			firstInvalid = firstInvalid || 'username';
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			setError('email', 'Email is required.');
			firstInvalid = firstInvalid || 'email';
		} else if (!emailRegex.test(email)) {
			setError('email', 'Please enter a valid email address.');
			firstInvalid = firstInvalid || 'email';
		}

		// Password validation: min 8 chars, at least one lower, one upper, one digit, one special
		const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
		if (!password) {
			setError('password', 'Password is required.');
			firstInvalid = firstInvalid || 'password';
		} else if (!pwdRegex.test(password)) {
			setError('password', 'Password must be at least 8 characters and include lowercase, uppercase, a number, and a special character.');
			firstInvalid = firstInvalid || 'password';
		}

		if (!confirmPassword) {
			setError('confirmPassword', 'Please confirm your password.');
			firstInvalid = firstInvalid || 'confirmPassword';
		} else if (password && confirmPassword !== password) {
			setError('confirmPassword', 'Passwords do not match.');
			firstInvalid = firstInvalid || 'confirmPassword';
		}

		if (firstInvalid) {
			// focus the first invalid field
			const el = document.getElementById(firstInvalid);
			if (el && typeof el.focus === 'function') el.focus();
			showFormMessage('Please correct the highlighted errors and try again.', 'error');
			return;
		}

		// NOTE: For security do NOT store raw passwords in localStorage.
		// Store only non-sensitive user data for demo purposes.
		const user = { firstName, lastName, username, email, createdAt: new Date().toISOString() };
		try {
			const raw = localStorage.getItem('users');
			const users = raw ? JSON.parse(raw) : [];
			users.push(user);
			localStorage.setItem('users', JSON.stringify(users));
		} catch (err) {
			console.error('Failed to save user:', err);
		}

		showFormMessage(`Account created for ${username}.`, 'success');
		form.reset();
		// reset strength meter and show-password control
		resetPasswordUI();
	});

	// Password strength and show/hide handlers
	const passwordInput = document.getElementById('password');
	const confirmInput = document.getElementById('confirmPassword');
	const toggle = document.getElementById('toggleShowPassword');
	const strengthText = document.getElementById('strengthText');
	const strengthContainer = document.getElementById('passwordStrength');
	const strengthSegments = document.getElementById('strengthSegments');

	function scorePassword(pwd) {
		if (!pwd) return 0;
		let score = 0;
		if (pwd.length >= 8) score++;
		if (/[a-z]/.test(pwd)) score++;
		if (/[A-Z]/.test(pwd)) score++;
		if (/\d/.test(pwd)) score++;
		if (/[^\w\s]/.test(pwd)) score++;
		return score; // 0-5
	}

	function updateStrength(pwd) {
		const s = scorePassword(pwd);
		// segments to light up (max 4)
		const segs = Math.min(4, s);
		if (!strengthSegments) return;

		const segEls = Array.from(strengthSegments.querySelectorAll('.seg'));
		segEls.forEach((el, i) => {
			const idx = i + 1;
			el.classList.remove('active', 'color-1', 'color-2', 'color-3', 'color-4');
			if (idx <= segs) {
				el.classList.add('active', `color-${Math.min(idx,4)}`);
			}
		});

		if (!strengthText) return;
		if (segs === 0) strengthText.textContent = '';
		else if (segs === 1) strengthText.textContent = 'Very weak';
		else if (segs === 2) strengthText.textContent = 'Fair';
		else if (segs === 3) strengthText.textContent = 'Good';
		else strengthText.textContent = 'Strong';
	}

	function resetPasswordUI() {
		if (strengthText) strengthText.textContent = '';
		if (strengthSegments) {
			const segEls = Array.from(strengthSegments.querySelectorAll('.seg'));
			segEls.forEach(el => el.classList.remove('active', 'color-1', 'color-2', 'color-3', 'color-4'));
		}
		if (toggle) toggle.checked = false;
		if (passwordInput) passwordInput.type = 'password';
		if (confirmInput) confirmInput.type = 'password';
	}

	if (passwordInput) {
		passwordInput.addEventListener('input', function (e) {
			updateStrength(e.target.value || '');
		});
	}

	if (toggle) {
		toggle.addEventListener('change', function () {
			const show = !!toggle.checked;
			if (passwordInput) passwordInput.type = show ? 'text' : 'password';
			if (confirmInput) confirmInput.type = show ? 'text' : 'password';
		});
	}
});
