// ==========================================
// REGISTER PAGE JAVASCRIPT
// ==========================================

const registerForm = document.getElementById('registerForm');
const alertContainer = document.getElementById('alertContainer');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Password validation helper
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password)
    };

    return requirements;
}

// Update password requirements display
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const requirements = validatePassword(this.value);
        const reqDiv = document.querySelector('.password-requirements');
        
        if (this.value) {
            reqDiv.classList.add('show');
            
            // Update requirement indicators
            document.getElementById('req-length').className = 
                requirements.length ? 'valid' : '';
            document.getElementById('req-length').innerHTML = 
                (requirements.length ? '✓' : '✗') + ' At least 8 characters';
            
            document.getElementById('req-upper').className = 
                requirements.upper ? 'valid' : '';
            document.getElementById('req-upper').innerHTML = 
                (requirements.upper ? '✓' : '✗') + ' Uppercase letter (A-Z)';
            
            document.getElementById('req-lower').className = 
                requirements.lower ? 'valid' : '';
            document.getElementById('req-lower').innerHTML = 
                (requirements.lower ? '✓' : '✗') + ' Lowercase letter (a-z)';
            
            document.getElementById('req-number').className = 
                requirements.number ? 'valid' : '';
            document.getElementById('req-number').innerHTML = 
                (requirements.number ? '✓' : '✗') + ' Number (0-9)';
            
            document.getElementById('req-special').className = 
                requirements.special ? 'valid' : '';
            document.getElementById('req-special').innerHTML = 
                (requirements.special ? '✓' : '✗') + ' Special character (@$!%*?&)';
        } else {
            reqDiv.classList.remove('show');
        }
    });
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
}

// Handle register form submission
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        // Clear previous errors
        ['email', 'username', 'firstName', 'lastName', 'password', 'confirmPassword', 'terms']
            .forEach(field => {
                const el = document.getElementById(field + 'Error');
                if (el) el.textContent = '';
            });
        alertContainer.innerHTML = '';

        let hasError = false;

        // Validation
        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            hasError = true;
        } else if (!email.includes('@')) {
            document.getElementById('emailError').textContent = 'Invalid email format';
            hasError = true;
        }

        if (!username || username.length < 3) {
            document.getElementById('usernameError').textContent = 'Username must be at least 3 characters';
            hasError = true;
        }

        const requirements = validatePassword(password);
        if (!requirements.length || !requirements.upper || !requirements.lower || 
            !requirements.number || !requirements.special) {
            document.getElementById('passwordError').textContent = 'Password does not meet requirements';
            hasError = true;
        }

        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            hasError = true;
        }

        if (!terms) {
            document.getElementById('termsError').textContent = 'You must agree to terms and privacy policy';
            hasError = true;
        }

        if (hasError) return;

        // Show loading state
        const buttonText = document.getElementById('buttonText');
        const spinner = document.getElementById('loadingSpinner');
        buttonText.style.display = 'none';
        spinner.style.display = 'flex';
        registerForm.querySelector('button').disabled = true;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    username,
                    firstName,
                    lastName,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem('token', data.token);
                
                // Show success message
                showAlert('Registration successful! Redirecting to dashboard...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                if (data.errors && Array.isArray(data.errors)) {
                    data.errors.forEach(err => {
                        const field = err.param + 'Error';
                        const errorEl = document.getElementById(field);
                        if (errorEl) {
                            errorEl.textContent = err.msg;
                        }
                    });
                } else {
                    showAlert(data.message || 'Registration failed', 'error');
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            showAlert('An error occurred. Please try again.', 'error');
        } finally {
            // Reset loading state
            buttonText.style.display = 'inline';
            spinner.style.display = 'none';
            registerForm.querySelector('button').disabled = false;
        }
    });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
}
