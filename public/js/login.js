// ==========================================
// LOGIN PAGE JAVASCRIPT
// ==========================================

const loginForm = document.getElementById('loginForm');
const alertContainer = document.getElementById('alertContainer');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

// Toggle password visibility
if (togglePassword) {
    togglePassword.addEventListener('click', (e) => {
        e.preventDefault();
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
}

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Clear previous errors
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        alertContainer.innerHTML = '';

        // Validation
        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            return;
        }

        if (!password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            return;
        }

        // Show loading state
        const buttonText = document.getElementById('buttonText');
        const spinner = document.getElementById('loadingSpinner');
        buttonText.style.display = 'none';
        spinner.style.display = 'flex';
        loginForm.querySelector('button').disabled = true;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token
                localStorage.setItem('token', data.token);
                
                // Show success message
                showAlert('Login successful! Redirecting...', 'success');
                
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
                    showAlert(data.message || 'Login failed', 'error');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            showAlert('An error occurred. Please try again.', 'error');
        } finally {
            // Reset loading state
            buttonText.style.display = 'inline';
            spinner.style.display = 'none';
            loginForm.querySelector('button').disabled = false;
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
