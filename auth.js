
        // Your Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEvrtHxsIPBXzVro-WhtBwXO1Qvx9jKWk",
  authDomain: "abstore-1e937.firebaseapp.com",
  projectId: "abstore-1e937",
  storageBucket: "abstore-1e937.firebasestorage.app",
  messagingSenderId: "39833645659",
  appId: "1:39833645659:web:98022d92e05556f37d057e",
  measurementId: "G-XHGW8ZTGQZ"
};

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        lucide.createIcons();

        // UI Elements
        const authContainer = document.getElementById('auth-container');
        const userInfo = document.getElementById('user-info');
        const userEmail = document.getElementById('user-email');
        const signupForm = document.getElementById('signup-form-element');
        const signinForm = document.getElementById('signin-form-element');
        const googleSignIn = document.getElementById('google-signin');
        const logoutBtn = document.getElementById('logout-btn');
        // Additional JavaScript for profile management
        const accountIcon = document.getElementById('account-icon');
        const profileModal = document.getElementById('profile-modal');
        const closeModal = document.getElementById('close-modal');
        const profileForm = document.getElementById('profile-form');
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        const accountSection = document.getElementById('account-section');
        const setupComplete = document.getElementById('setup-complete');

        // Error and Success Messages
        const signupError = document.getElementById('signup-error');
        const signinError = document.getElementById('signin-error');
        const signupSuccess = document.getElementById('signup-success');
        const signinSuccess = document.getElementById('signin-success');

        // Modified auth state observer
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                authContainer.style.display = 'none';
                accountSection.style.display = 'block';

                // Check if profile exists
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.displayName) {
                        document.getElementById('display-name').value = userData.displayName;
                    }
                    if (userData.location) {
                        document.getElementById('location').value = userData.location;
                    }
                    if (userData.profileComplete) {
                        setupComplete.style.display = 'block';
                    }
                }
            } else {
                authContainer.style.display = 'block';
                accountSection.style.display = 'none';
                profileModal.style.display = 'none';
            }
        });
        
        // Sign Up
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;

            // Reset messages
            signupError.style.display = 'none';
            signupSuccess.style.display = 'none';

            if (password !== confirmPassword) {
                signupError.textContent = 'Passwords do not match';
                signupError.style.display = 'block';
                return;
            }

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                signupSuccess.textContent = 'Account created successfully!';
                signupSuccess.style.display = 'block';
                signupForm.reset();

                // Store additional user data
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: new Date(),
                    lastLogin: new Date()
                });
            } catch (error) {
                signupError.textContent = error.message;
                signupError.style.display = 'block';
            }
        });

        // Sign In
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;

            // Reset messages
            signinError.style.display = 'none';
            signinSuccess.style.display = 'none';

            try {
                await auth.signInWithEmailAndPassword(email, password);
                signinSuccess.textContent = 'Signed in successfully!';
                signinSuccess.style.display = 'block';
                signinForm.reset();
            } catch (error) {
                signinError.textContent = error.message;
                signinError.style.display = 'block';
            }
        });

        // Google Sign In
        googleSignIn.addEventListener('click', async () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                const result = await auth.signInWithPopup(provider);
                // Store user data
                await db.collection('users').doc(result.user.uid).set({
                    email: result.user.email,
                    displayName: result.user.displayName,
                    lastLogin: new Date()
                }, { merge: true });
            } catch (error) {
                signinError.textContent = error.message;
                signinError.style.display = 'block';
            }
        });

        // Logout
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });

        // Tab Switching Logic (previous code)
        const tabs = document.querySelectorAll('.tab');
        const forms = document.querySelectorAll('.form-container');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(form => {
                    form.classList.remove('active');
                    form.classList.add('previous');
                });
                
                tab.classList.add('active');
                const targetForm = document.getElementById(`${tab.dataset.tab}-form`);
                targetForm.classList.add('active');
                targetForm.classList.remove('previous');
            });
        });
        
                // Modal controls
        accountIcon.addEventListener('click', () => {
            profileModal.style.display = 'block';
        });

        closeModal.addEventListener('click', () => {
            profileModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                profileModal.style.display = 'none';
            }
        });

        // Profile form submission
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (user) {
                try {
                    await db.collection('users').doc(user.uid).update({
                        displayName: document.getElementById('display-name').value,
                        location: document.getElementById('location').value,
                        profileComplete: true,
                        updatedAt: new Date()
                    });
                    setupComplete.style.display = 'block';
                } catch (error) {
                    console.error('Error updating profile:', error);
                }
            }
        });

        // Delete account
// Delete account with proper error handling and re-authentication
deleteAccountBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        const user = auth.currentUser;
        if (user) {
            try {
                // First delete user data from Firestore
                await db.collection('users').doc(user.uid).delete();
                
                // Then attempt to delete the user account
                await user.delete();
                
                // Show success message
                alert('Your account has been successfully deleted.');
            } catch (error) {
                // Check if the error is due to requiring recent authentication
                if (error.code === 'auth/requires-recent-login') {
                    alert('For security reasons, please sign out and sign in again before deleting your account.');
                    // Sign out the user
                    await auth.signOut();
                } else {
                    alert('Error deleting account: ' + error.message);
                    console.error('Error deleting account:', error);
                }
            }
        }
    }
});
        
        // Password strength checker
        function checkPasswordStrength(password) {
            const strength = {
                length: password.length >= 8,
                hasUpperCase: /[A-Z]/.test(password),
                hasLowerCase: /[a-z]/.test(password),
                hasNumber: /\d/.test(password),
                hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };

            const strengthBar = document.getElementById('password-strength');
            const passedChecks = Object.values(strength).filter(Boolean).length;

            if (passedChecks <= 2) {
                strengthBar.className = 'password-strength strength-weak';
            } else if (passedChecks <= 4) {
                strengthBar.className = 'password-strength strength-medium';
            } else {
                strengthBar.className = 'password-strength strength-strong';
            }
        }
        
         // Password input enhancement
        document.getElementById('signup-password').addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });
        
      function navigateToLanding() {
        const button = document.querySelector('.quick-nav-button');
        button.classList.add('loading');
        button.innerHTML = 'Loading... <i data-lucide="loader" class="animate-spin"></i>';
        lucide.createIcons(); // Refresh icons

        // Preload the landing page
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = 'Landing page.html';
        document.head.appendChild(link);

        // Navigate after a brief delay to allow prefetch
        setTimeout(() => {
            window.location.href = 'Landing page.html';
        }, 100);

        // Fallback in case the navigation doesn't happen
        setTimeout(() => {
            button.classList.remove('loading');
            button.innerHTML = 'Go to Landing Page <i data-lucide="arrow-right"></i>';
            lucide.createIcons(); // Refresh icons
        }, 3000);
    }
