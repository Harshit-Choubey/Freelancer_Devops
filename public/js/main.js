// Main application JavaScript - no inline scripts needed

// Global variables
let currentUserEmail = '';
let currentUser = null;

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showLogin() {
    showModal('loginModal');
}

function showRegister(role = '') {
    if (role) {
        document.getElementById('role').value = role;
        toggleSkillsField();
    }
    showModal('registerModal');
}

function toggleSkillsField() {
    const role = document.getElementById('role').value;
    const skillsContainer = document.getElementById('skillsContainer');
    
    if (role === 'FREELANCER') {
        skillsContainer.classList.remove('hidden');
    } else {
        skillsContainer.classList.add('hidden');
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.innerHTML = `
        <div class="alert-content">${message}</div>
        <button class="alert-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add event listener to close button
    alertElement.querySelector('.alert-close').addEventListener('click', function() {
        this.parentElement.remove();
    });
    
    alertContainer.appendChild(alertElement);
    
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove();
        }
    }, 5000);
}

// Update UI based on authentication state
function updateAuthState(user) {
    if (user) {
        currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update navigation
        const authButtons = document.querySelector('.auth-buttons');
        authButtons.innerHTML = `
            <div class="user-menu">
                <span class="user-welcome">Welcome, ${user.firstName}!</span>
                <div class="nav-btn-group">
                    <button id="dashboardBtn" class="btn btn-nav btn-outline">
                        <i class="fas fa-tachometer-alt"></i>
                        Dashboard
                    </button>
                    <button id="profileBtn" class="btn btn-nav btn-nav-primary">
                        <i class="fas fa-user"></i>
                        Profile
                    </button>
                    <button id="logoutBtn" class="btn btn-nav btn-logout">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to new buttons
        document.getElementById('dashboardBtn').addEventListener('click', showDashboard);
        document.getElementById('profileBtn').addEventListener('click', showProfile);
        document.getElementById('logoutBtn').addEventListener('click', logout);
        
        // Show dashboard
        showDashboard();
        
        // Initialize WebSocket connection after successful authentication
        setTimeout(() => {
            initializeWebSocket().catch(error => {
                console.log('WebSocket initialization failed:', error);
            });
        }, 1000);
    } else {
        currentUser = null;
        localStorage.removeItem('user');
        api.removeToken();
        
        // Reset navigation
        const authButtons = document.querySelector('.auth-buttons');
        authButtons.innerHTML = `
            <button id="loginBtn" class="btn btn-outline">Login</button>
            <button id="signupBtn" class="btn btn-primary">Sign Up</button>
        `;
        
        // Add event listeners to auth buttons
        document.getElementById('loginBtn').addEventListener('click', showLogin);
        document.getElementById('signupBtn').addEventListener('click', () => showRegister());
        
        // Show hero section
        showHeroSection();
    }
}

function logout() {
    // Disconnect WebSocket
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    
    updateAuthState(null);
    showAlert('Logged out successfully', 'info');
}

function showDashboard() {
    const heroSection = document.querySelector('.hero');
    if (currentUser.role === 'CLIENT') {
        heroSection.innerHTML = `
            <div class="hero-container">
                <div style="text-align: center; margin-bottom: 3rem;">
                    <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #3b82f6, #1e40af); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3); animation: float 3s ease-in-out infinite; overflow: hidden;">
                        ${currentUser.profilePicture ? 
                            `<img src="${currentUser.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` :
                            `<i class="fas fa-user-tie" style="font-size: 3rem; color: white;"></i>`
                        }
                    </div>
                    <h1 style="font-size: 3.5rem; font-weight: 900; margin-bottom: 1rem; background: linear-gradient(135deg, #ffffff, #e5e7eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Welcome back, ${currentUser.firstName}!</h1>
                    <p style="font-size: 1.3rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 3rem; max-width: 600px; margin-left: auto; margin-right: auto;">Manage your projects and find the best freelancers for your needs. Your success is our priority.</p>
                </div>
                <div class="hero-buttons" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; max-width: 800px; margin: 0 auto;">
                    <button id="postJobBtn" class="btn btn-hero btn-hero-primary" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700; min-width: 280px; flex: 1; max-width: 350px;">
                        <i class="fas fa-plus-circle" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <div>Post a New Job</div>
                        <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Find talented freelancers</small>
                    </button>
                    <button id="browseMyJobsBtn" class="btn btn-hero btn-hero-outline" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700; min-width: 280px; flex: 1; max-width: 350px;">
                        <i class="fas fa-briefcase" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <div>My Posted Jobs</div>
                        <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Manage your projects</small>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to dashboard buttons
        document.getElementById('postJobBtn').addEventListener('click', showPostJobModal);
        document.getElementById('browseMyJobsBtn').addEventListener('click', showMyJobs);
    } else {
        heroSection.innerHTML = `
            <div class="hero-container">
                <div style="text-align: center; margin-bottom: 3rem;">
                    <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3); animation: float 3s ease-in-out infinite; overflow: hidden;">
                        ${currentUser.profilePicture ? 
                            `<img src="${currentUser.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` :
                            `<i class="fas fa-user-check" style="font-size: 3rem; color: white;"></i>`
                        }
                    </div>
                    <h1 style="font-size: 3.5rem; font-weight: 900; margin-bottom: 1rem; background: linear-gradient(135deg, #ffffff, #e5e7eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Welcome back, ${currentUser.firstName}!</h1>
                    <p style="font-size: 1.3rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">Find amazing projects and grow your freelance career. Your talent deserves recognition.</p>
                </div>
                ${currentUser.skills && currentUser.skills.length > 0 ? 
                    `<div style="margin: 3rem 0; text-align: center;">
                        <h3 style="margin-bottom: 1.5rem; font-size: 1.5rem; color: white; font-weight: 700;">Your Skills</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; max-width: 800px; margin: 0 auto;">
                            ${currentUser.skills.map(skill => 
                                `<span class="skill-tag-hover" style="background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); padding: 0.75rem 1.5rem; border-radius: 50px; font-size: 0.9rem; font-weight: 600; color: white; border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); transition: all 0.3s ease; cursor: default;">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>` : 
                    '<div style="margin: 2rem 0; padding: 2rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2);"><p style="margin: 0; opacity: 0.8; font-size: 1.1rem;">Add your skills to attract more clients and showcase your expertise!</p></div>'
                }
                <div class="hero-buttons" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 800px; margin: 3rem auto 0;">
                    <button id="browseJobsBtn" class="btn btn-hero btn-hero-primary" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700;">
                        <i class="fas fa-search" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <div>Browse Jobs</div>
                        <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Find your next project</small>
                    </button>
                    <button id="acceptedProjectsBtn" class="btn btn-hero btn-hero-outline" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700;">
                        <i class="fas fa-check-circle" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <div>Accepted Projects</div>
                        <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Your active work</small>
                    </button>
                    <button id="messagesBtn" class="btn btn-hero btn-hero-outline" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700;">
                        <i class="fas fa-comments" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <div>Messages</div>
                        <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Client communications</small>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to freelancer dashboard buttons
        document.getElementById('browseJobsBtn').addEventListener('click', showAllJobs);
        document.getElementById('acceptedProjectsBtn').addEventListener('click', showAcceptedProjects);
        document.getElementById('messagesBtn').addEventListener('click', showMyConversations);
    }
}

function showHeroSection() {
    const heroSection = document.querySelector('.hero');
    heroSection.innerHTML = `
        <div class="hero-container">
            <h1>Find the Perfect Freelancer for Your Project</h1>
            <p>Connect with talented professionals worldwide and get your work done efficiently.</p>
            <div class="hero-buttons">
                <button id="hireBtn" class="btn btn-hero btn-hero-primary">
                    <i class="fas fa-user-tie"></i>
                    Hire Freelancers
                </button>
                <button id="freelanceBtn" class="btn btn-hero btn-hero-outline">
                    <i class="fas fa-user-check"></i>
                    Start Freelancing
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to hero buttons
    document.getElementById('hireBtn').addEventListener('click', () => showRegister('CLIENT'));
    document.getElementById('freelanceBtn').addEventListener('click', () => showRegister('FREELANCER'));
}

function showProfile() {
    if (!currentUser) return;
    
    const profileContent = document.getElementById('profileContent');
    profileContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, ${currentUser.role === 'CLIENT' ? '#3b82f6, #1e40af' : '#10b981, #059669'}); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; margin: 0 auto 1rem; overflow: hidden; box-shadow: 0 8px 25px rgba(${currentUser.role === 'CLIENT' ? '59, 130, 246' : '16, 185, 129'}, 0.3);">
                ${currentUser.profilePicture ? 
                    `<img src="${currentUser.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` :
                    `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`
                }
            </div>
            <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem; font-weight: 700;">${currentUser.firstName} ${currentUser.lastName}</h3>
            <p style="color: #6b7280; margin: 0.5rem 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <i class="fas fa-envelope" style="font-size: 0.875rem;"></i>
                ${currentUser.email}
            </p>
            <span style="background: linear-gradient(135deg, ${currentUser.role === 'CLIENT' ? '#3b82f6, #1e40af' : '#10b981, #059669'}); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 4px 12px rgba(${currentUser.role === 'CLIENT' ? '59, 130, 246' : '16, 185, 129'}, 0.3);">
                ${currentUser.role === 'CLIENT' ? '👔 Client' : '💼 Freelancer'}
            </span>
        </div>
        
        <div style="margin-bottom: 2rem;">
            ${currentUser.phone ? `
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #374151; display: block; margin-bottom: 0.5rem; font-size: 0.875rem;">Phone Number</label>
                    <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                        <i class="fas fa-phone" style="color: #6b7280; font-size: 0.875rem;"></i>
                        <span>${currentUser.phone}</span>
                    </div>
                </div>
            ` : ''}
            
            ${currentUser.bio ? `
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #374151; display: block; margin-bottom: 0.5rem; font-size: 0.875rem;">Bio</label>
                    <div style="padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb; line-height: 1.6;">
                        ${currentUser.bio}
                    </div>
                </div>
            ` : ''}
            
            ${currentUser.role === 'FREELANCER' && currentUser.skills && currentUser.skills.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <label style="font-weight: 600; color: #374151; display: block; margin-bottom: 0.5rem; font-size: 0.875rem;">Skills</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                        ${currentUser.skills.map(skill => 
                            `<span style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 0.375rem 0.75rem; border-radius: 50px; font-size: 0.8rem; font-weight: 500; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">${skill}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div style="text-align: center; margin: 2rem 0;">
                <button id="profileEditBtn" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 12px; box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);">
                    <i class="fas fa-edit" style="margin-right: 0.5rem;"></i>
                    Edit Profile
                </button>
            </div>
        </div>
    `;
    
    // Add event listener to edit profile button
    document.getElementById('profileEditBtn').addEventListener('click', () => {
        closeModal('profileModal');
        setTimeout(() => {
            showEditProfile();
        }, 300);
    });
    
    showModal('profileModal');
}

// Form submission handlers
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const spinner = document.getElementById('loginSpinner');
    
    try {
        spinner.classList.remove('hidden');
        
        const response = await api.login(email, password);
        
        showAlert('Login successful!', 'success');
        closeModal('loginModal');
        
        // Clear form
        document.getElementById('loginForm').reset();
        
        // Update UI for logged in user
        updateAuthState(response.user);
        
        // Initialize WebSocket connection
        setTimeout(() => {
            initializeWebSocket();
        }, 500);
        
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        spinner.classList.add('hidden');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        role: document.getElementById('role').value,
    };
    
    // Add skills if freelancer
    if (formData.role === 'FREELANCER') {
        const skillsInput = document.getElementById('skills').value;
        formData.skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
    }
    
    const spinner = document.getElementById('registerSpinner');
    
    try {
        spinner.classList.remove('hidden');
        
        const response = await api.register(formData);
        
        currentUserEmail = formData.email;
        
        // Note: OTP is now sent via email, no longer displayed in UI
        
        closeModal('registerModal');
        showModal('verificationModal');
        
        showAlert('Registration successful! Please check your email for verification code.', 'success');
        
        // Clear form
        document.getElementById('registerForm').reset();
        
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        spinner.classList.add('hidden');
    }
}

async function handleVerification(e) {
    e.preventDefault();
    
    const otp = document.getElementById('otpInput').value;
    const spinner = document.getElementById('verifySpinner');
    
    try {
        spinner.classList.remove('hidden');
        
        await api.verifyEmail(currentUserEmail, otp);
        
        closeModal('verificationModal');
        showAlert('Email verified successfully! You can now login.', 'success');
        
        // Clear form and reset
        document.getElementById('verificationForm').reset();
        
        setTimeout(() => showLogin(), 1000);
        
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        spinner.classList.add('hidden');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    // Add event listeners to forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('verificationForm').addEventListener('submit', handleVerification);
    document.getElementById('postJobForm').addEventListener('submit', handlePostJob);
    document.getElementById('editJobForm').addEventListener('submit', handleEditJob);
    document.getElementById('applicationForm').addEventListener('submit', handleJobApplication);
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);
    
    // Profile editing event listeners
    document.getElementById('changePictureBtn').addEventListener('click', () => {
        document.getElementById('profilePictureInput').click();
    });
    
    document.getElementById('profilePictureInput').addEventListener('change', handleProfilePictureChange);
    
    document.getElementById('addSkillBtn').addEventListener('click', addSkill);
    
    document.getElementById('skillInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
    
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        closeModal('editProfileModal');
    });
    
    // Messaging event listeners
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    document.getElementById('messageInput').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
    
    // Typing indicator
    let typingTimer;
    document.getElementById('messageInput').addEventListener('input', () => {
        if (socket && currentJobId) {
            socket.emit('typing', { jobId: currentJobId, isTyping: true });
            
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                socket.emit('typing', { jobId: currentJobId, isTyping: false });
            }, 1000);
        }
    });
    
    // Add event listener to role select
    document.getElementById('role').addEventListener('change', toggleSkillsField);
    
    // Add event listeners to initial auth buttons
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', showLogin);
    if (signupBtn) signupBtn.addEventListener('click', () => showRegister());
    
    // Add event listeners to hero buttons
    const hireBtn = document.getElementById('hireBtn');
    const freelanceBtn = document.getElementById('freelanceBtn');
    
    if (hireBtn) hireBtn.addEventListener('click', () => showRegister('CLIENT'));
    if (freelanceBtn) freelanceBtn.addEventListener('click', () => showRegister('FREELANCER'));
    
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    });
    
    // Add event listeners to modal close buttons
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Check if user is already logged in on page load
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await api.getProfile();
            updateAuthState(response.user);
        } catch (error) {
            // Token is invalid, clear it
            updateAuthState(null);
        }
    }
    
    console.log('GigMatrix loaded successfully!');
});

// Job Management Functions

function showPostJobModal() {
    showModal('postJobModal');
}

function showMyJobs() {
    loadMyJobs();
}

function showAllJobs() {
    loadAllJobs();
}

async function loadMyJobs() {
    try {
        const response = await api.getMyJobs();
        displayMyJobs(response.jobs);
    } catch (error) {
        showAlert('Failed to load jobs: ' + error.message, 'danger');
    }
}

async function loadAllJobs() {
    try {
        const response = await api.getAllJobs();
        displayAllJobs(response.jobs);
    } catch (error) {
        showAlert('Failed to load jobs: ' + error.message, 'danger');
    }
}

function displayMyJobs(jobs) {
    const heroSection = document.querySelector('.hero');
    heroSection.innerHTML = `
        <div class="hero-container">
            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="margin: 0 0 1.5rem 0; font-size: 3rem; font-weight: 800; color: white; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">My Posted Jobs</h1>
                <button id="backToDashboardBtn" class="btn btn-hero btn-hero-outline" style="margin: 0 auto;">
                    <i class="fas fa-arrow-left"></i>
                    Back to Dashboard
                </button>
            </div>
            
            <div style="display: grid; gap: 1.5rem; max-width: 1000px; margin: 0 auto;">
                ${jobs.length === 0 ? `
                    <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(20px);">
                        <i class="fas fa-briefcase" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No jobs posted yet</h3>
                        <p style="opacity: 0.8; margin-bottom: 2rem;">Start by posting your first job to find talented freelancers</p>
                        <button id="postFirstJobBtn" class="btn btn-hero btn-hero-primary">
                            <i class="fas fa-plus-circle"></i>Post Your First Job
                        </button>
                    </div>
                ` : jobs.map(job => `
                    <div class="dashboard-card" style="margin-bottom: 1.5rem; animation: fadeInUp 0.6s ease-out;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
                            <div style="flex: 1;">
                                <h3 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${job.title}</h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                                    <span style="background: linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 4px 15px rgba(59,130,246,0.3);">
                                        💰 $${job.budget}
                                    </span>
                                    <span style="background: linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">
                                        📊 ${job.status}
                                    </span>
                                    <span style="background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 500; backdrop-filter: blur(10px);">
                                        👥 ${job._count?.applications || 0} applications
                                    </span>
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.75rem;">
                                <button id="viewApplicantsBtn_${job.id}" class="btn btn-nav-primary" style="padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;" title="View Applicants">
                                    <i class="fas fa-users" style="margin-right: 0.5rem;"></i>
                                    Applicants (${job._count?.applications || 0})
                                </button>
                                <button id="editBtn_${job.id}" class="btn btn-outline edit-btn-hover" style="padding: 0.75rem; border-color: rgba(255,255,255,0.3); color: white; border-radius: 12px; transition: all 0.3s ease;" title="Edit Job">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button id="deleteBtn_${job.id}" class="btn btn-outline delete-btn-hover" style="padding: 0.75rem; border-color: rgba(239,68,68,0.5); color: #ef4444; border-radius: 12px; transition: all 0.3s ease;" title="Delete Job">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p style="color: rgba(255,255,255,0.85); margin-bottom: 1.5rem; line-height: 1.7; font-size: 1rem;">${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                            ${job.requiredSkills.map(skill => `
                                <span style="background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 500; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); transition: all 0.3s ease;" class="job-skill-hover" >${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add event listener to back button
    document.getElementById('backToDashboardBtn').addEventListener('click', showDashboard);
    
    // Add event listeners to view applicants, edit and delete buttons
    jobs.forEach(job => {
        const viewApplicantsBtn = document.getElementById(`viewApplicantsBtn_${job.id}`);
        const editBtn = document.getElementById(`editBtn_${job.id}`);
        const deleteBtn = document.getElementById(`deleteBtn_${job.id}`);
        
        if (viewApplicantsBtn) {
            viewApplicantsBtn.addEventListener('click', () => viewJobApplicants(job.id, job.title));
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => editJob(job.id));
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteJob(job.id));
        }
    });
    
    // Add event listener for "Post Your First Job" button if it exists
    const postFirstJobBtn = document.getElementById('postFirstJobBtn');
    if (postFirstJobBtn) {
        postFirstJobBtn.addEventListener('click', showPostJobModal);
    }
}

function displayAllJobs(jobs) {
    const heroSection = document.querySelector('.hero');
    heroSection.innerHTML = `
        <div class="hero-container">
            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="margin: 0 0 1.5rem 0; font-size: 3rem; font-weight: 800; color: white; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">Browse Available Jobs</h1>
                <button id="backToDashboardBtn2" class="btn btn-hero btn-hero-outline" style="margin: 0 auto;">
                    <i class="fas fa-arrow-left"></i>
                    Back to Dashboard
                </button>
            </div>
            
            <div style="display: grid; gap: 1.5rem; max-width: 1000px; margin: 0 auto;">
                ${jobs.length === 0 ? `
                    <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(20px);">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No jobs available</h3>
                        <p style="opacity: 0.8;">Check back later for new opportunities</p>
                    </div>
                ` : jobs.map(job => `
                    <div class="dashboard-card" style="margin-bottom: 1.5rem; animation: fadeInUp 0.6s ease-out;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
                            <div style="flex: 1;">
                                <h3 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${job.title}</h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                                    <span style="background: linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 4px 15px rgba(59,130,246,0.3);">
                                        💰 $${job.budget}
                                    </span>
                                    <span style="background: linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">
                                        📂 ${job.category}
                                    </span>
                                    <span style="background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 500; backdrop-filter: blur(10px);">
                                        👤 ${job.client.firstName} ${job.client.lastName}
                                    </span>
                                </div>
                            </div>
                            ${job.hasApplied ? 
                                `<button class="btn btn-hero" style="padding: 1rem 2rem; border-radius: 15px; font-weight: 700; background: linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9)); color: white; cursor: default; box-shadow: 0 8px 25px rgba(16,185,129,0.4);">
                                    <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>Applied
                                </button>` :
                                `<button id="applyBtn_${job.id}" class="btn btn-hero btn-hero-primary" style="padding: 1rem 2rem; border-radius: 15px; font-weight: 700; box-shadow: 0 8px 25px rgba(59,130,246,0.4);">
                                    <i class="fas fa-paper-plane" style="margin-right: 0.5rem;"></i>Apply Now
                                </button>`
                            }
                        </div>
                        <p style="color: rgba(255,255,255,0.85); margin-bottom: 1.5rem; line-height: 1.7; font-size: 1rem;">${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                            ${job.requiredSkills.map(skill => `
                                <span style="background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 500; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); transition: all 0.3s ease;" class="job-skill-hover" >${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add event listener to back button
    document.getElementById('backToDashboardBtn2').addEventListener('click', showDashboard);
    
    // Add event listeners to apply buttons (only for jobs not applied to)
    jobs.forEach(job => {
        if (!job.hasApplied) {
            const applyBtn = document.getElementById(`applyBtn_${job.id}`);
            if (applyBtn) {
                applyBtn.addEventListener('click', () => applyToJob(job.id));
            }
        }
    });
}

async function handlePostJob(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('jobTitle').value,
        description: document.getElementById('jobDescription').value,
        budget: parseFloat(document.getElementById('jobBudget').value),
        category: document.getElementById('jobCategory').value,
        requiredSkills: document.getElementById('jobSkills').value.split(',').map(skill => skill.trim()).filter(skill => skill)
    };
    
    const spinner = document.getElementById('postJobSpinner');
    
    try {
        spinner.classList.remove('hidden');
        
        await api.createJob(formData);
        
        closeModal('postJobModal');
        showAlert('Job posted successfully!', 'success');
        
        // Clear form
        document.getElementById('postJobForm').reset();
        
        // Show the updated jobs list instead of dashboard
        setTimeout(() => {
            loadMyJobs();
        }, 500);
        
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        spinner.classList.add('hidden');
    }
}

async function editJob(jobId) {
    try {
        const response = await api.getJobById(jobId);
        const job = response.job;
        
        // Populate edit form
        document.getElementById('editJobId').value = job.id;
        document.getElementById('editJobTitle').value = job.title;
        document.getElementById('editJobDescription').value = job.description;
        document.getElementById('editJobBudget').value = job.budget;
        document.getElementById('editJobCategory').value = job.category;
        document.getElementById('editJobSkills').value = job.requiredSkills.join(', ');
        
        showModal('editJobModal');
    } catch (error) {
        showAlert('Failed to load job details: ' + error.message, 'danger');
    }
}

async function handleEditJob(e) {
    e.preventDefault();
    
    const jobId = document.getElementById('editJobId').value;
    const formData = {
        title: document.getElementById('editJobTitle').value,
        description: document.getElementById('editJobDescription').value,
        budget: parseFloat(document.getElementById('editJobBudget').value),
        category: document.getElementById('editJobCategory').value,
        requiredSkills: document.getElementById('editJobSkills').value.split(',').map(skill => skill.trim()).filter(skill => skill)
    };
    
    const spinner = document.getElementById('editJobSpinner');
    
    try {
        spinner.classList.remove('hidden');
        
        await api.updateJob(jobId, formData);
        
        closeModal('editJobModal');
        showAlert('Job updated successfully!', 'success');
        
        // Refresh jobs list
        loadMyJobs();
        
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        spinner.classList.add('hidden');
    }
}

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        return;
    }
    
    try {
        await api.deleteJob(jobId);
        showAlert('Job deleted successfully!', 'success');
        
        // Refresh jobs list
        loadMyJobs();
        
    } catch (error) {
        showAlert('Failed to delete job: ' + error.message, 'danger');
    }
}

async function applyToJob(jobId) {
    // Show application modal
    document.getElementById('applicationJobId').value = jobId;
    showModal('applicationModal');
}

async function handleJobApplication(e) {
    e.preventDefault();
    
    const jobId = document.getElementById('applicationJobId').value;
    const formData = {
        coverLetter: document.getElementById('coverLetter').value,
        bidAmount: parseFloat(document.getElementById('bidAmount').value)
    };
    
    const spinner = document.getElementById('applicationSpinner');
    
    try {
        spinner.classList.remove('hidden');
        
        await api.applyToJob(jobId, formData);
        
        closeModal('applicationModal');
        showAlert('Application submitted successfully!', 'success');
        
        // Clear form
        document.getElementById('applicationForm').reset();
        
        // Refresh the jobs list to show updated status
        if (currentUser.role === 'FREELANCER') {
            setTimeout(() => {
                loadAllJobs();
            }, 500);
        }
        
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        spinner.classList.add('hidden');
    }
}

async function viewJobApplicants(jobId, jobTitle) {
    try {
        const response = await api.getJobApplications(jobId);
        displayJobApplicants(response.applications, jobTitle, jobId);
    } catch (error) {
        showAlert('Failed to load applicants: ' + error.message, 'danger');
    }
}

function displayJobApplicants(applications, jobTitle, jobId) {
    const applicantsContent = document.getElementById('applicantsContent');
    applicantsContent.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <h3 style="color: #1f2937; margin-bottom: 0.5rem; font-size: 1.5rem; font-weight: 700;">Applicants for "${jobTitle}"</h3>
            <p style="color: #6b7280; font-size: 0.9rem;">${applications.length} ${applications.length === 1 ? 'application' : 'applications'} received</p>
        </div>
        
        ${applications.length === 0 ? `
            <div style="text-align: center; padding: 3rem; background: #f9fafb; border-radius: 12px; border: 2px dashed #d1d5db;">
                <i class="fas fa-inbox" style="font-size: 3rem; color: #9ca3af; margin-bottom: 1rem;"></i>
                <h4 style="color: #6b7280; margin-bottom: 0.5rem;">No applications yet</h4>
                <p style="color: #9ca3af; font-size: 0.9rem;">Applications will appear here when freelancers apply to your job.</p>
            </div>
        ` : `
            <div style="display: grid; gap: 1.5rem;">
                ${applications.map(app => `
                    <div class="applicant-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">
                                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #3b82f6, #1e40af); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                                        ${app.freelancer.firstName.charAt(0)}${app.freelancer.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 style="color: #1f2937; margin: 0; font-size: 1.1rem; font-weight: 600;">${app.freelancer.firstName} ${app.freelancer.lastName}</h4>
                                        <p style="color: #6b7280; margin: 0; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                                            <i class="fas fa-envelope" style="font-size: 0.8rem;"></i>
                                            ${app.freelancer.email}
                                        </p>
                                    </div>
                                </div>
                                
                                ${app.freelancer.skills && app.freelancer.skills.length > 0 ? `
                                    <div style="margin-bottom: 1rem;">
                                        <h5 style="color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                            <i class="fas fa-tools" style="font-size: 0.8rem;"></i>
                                            Skills:
                                        </h5>
                                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                            ${app.freelancer.skills.map(skill => `
                                                <span class="skill-tag" style="background: #eff6ff; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.8rem; font-weight: 500; border: 1px solid #bfdbfe;">${skill}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div style="text-align: right;">
                                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); text-align: center;">
                                    $${app.bidAmount}
                                </div>
                                <div style="color: #6b7280; font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end; margin-bottom: 1rem;">
                                    <i class="fas fa-calendar-alt"></i>
                                    ${new Date(app.createdAt).toLocaleDateString()}
                                </div>
                                
                                <!-- Application Status & Actions -->
                                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                    <div style="background: ${app.status === 'ACCEPTED' ? 'linear-gradient(135deg, #10b981, #059669)' : app.status === 'REJECTED' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #f59e0b, #d97706)'}; color: white; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-align: center;">
                                        ${app.status === 'ACCEPTED' ? 'Accepted' : app.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                                    </div>
                                    
                                    ${app.status === 'PENDING' ? `
                                        <div style="display: flex; gap: 0.5rem;">
                                            <button data-action="accept" data-app-id="${app.id}" class="btn-modal-outline app-action-btn" style="padding: 0.5rem 1rem; font-size: 0.75rem; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-weight: 600; min-width: 70px;" title="Accept Application">
                                                Accept
                                            </button>
                                            <button data-action="reject" data-app-id="${app.id}" class="btn-modal-outline app-action-btn" style="padding: 0.5rem 1rem; font-size: 0.75rem; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 8px; font-weight: 600; min-width: 70px;" title="Reject Application">
                                                Reject
                                            </button>
                                            <button data-action="message" data-job-id="${jobId}" data-freelancer-id="${app.freelancer.id}" data-freelancer-name="${app.freelancer.firstName} ${app.freelancer.lastName}" class="btn-modal-outline message-btn" style="padding: 0.5rem 1rem; font-size: 0.75rem; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; border: none; border-radius: 8px; font-weight: 600; min-width: 70px;" title="Message Freelancer">
                                                Message
                                            </button>
                                        </div>
                                    ` : app.status === 'ACCEPTED' ? `
                                        <button data-action="message" data-job-id="${jobId}" data-freelancer-id="${app.freelancer.id}" data-freelancer-name="${app.freelancer.firstName} ${app.freelancer.lastName}" class="btn-modal-outline message-btn" style="padding: 0.75rem 1.5rem; font-size: 0.85rem; background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; border: none; border-radius: 8px; font-weight: 600; width: 100%;">
                                            Message
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-radius: 8px; padding: 1rem; border-left: 4px solid #3b82f6; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);">
                            <h5 style="color: #374151; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-file-alt" style="font-size: 0.8rem;"></i>
                                Cover Letter:
                            </h5>
                            <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 0.9rem;">${app.coverLetter}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
    
    showModal('applicantsModal');
    
    // Add event listeners for application action buttons
    setTimeout(() => {
        // Accept/Reject buttons
        document.querySelectorAll('.app-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                const appId = this.dataset.appId;
                if (action === 'accept') {
                    updateApplicationStatus(appId, 'ACCEPTED');
                } else if (action === 'reject') {
                    updateApplicationStatus(appId, 'REJECTED');
                }
            });
        });
        
        // Message buttons
        document.querySelectorAll('.message-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const jobId = this.dataset.jobId;
                const freelancerId = this.dataset.freelancerId;
                const freelancerName = this.dataset.freelancerName;
                openMessaging(jobId, freelancerId, freelancerName);
            });
        });
    }, 100);
}

// Application Management Functions
async function updateApplicationStatus(applicationId, status) {
    try {
        await api.updateApplicationStatus(applicationId, status);
        showAlert(`Application ${status.toLowerCase()} successfully!`, 'success');
        
        // Refresh the applicants list
        setTimeout(() => {
            // Find the current job ID and refresh
            const modal = document.getElementById('applicantsModal');
            if (modal.classList.contains('show')) {
                // Re-trigger the view applicants for current job
                location.reload(); // Simple refresh for now
            }
        }, 1000);
        
    } catch (error) {
        showAlert('Failed to update application: ' + error.message, 'danger');
    }
}

// WebSocket and Messaging Functions
let socket = null;
let currentJobId = null;
let currentFreelancerId = null;

function initializeWebSocket() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found, skipping WebSocket connection');
        return Promise.reject('No token');
    }

    if (socket && socket.connected) {
        console.log('WebSocket already connected');
        return Promise.resolve(socket);
    }

    // Disconnect existing socket if any
    if (socket) {
        socket.disconnect();
    }

    console.log('Initializing WebSocket connection...');
    console.log('Token found:', token ? 'Yes' : 'No');
    console.log('Token length:', token ? token.length : 0);
    
    return new Promise((resolve, reject) => {
        socket = io({
            auth: { token },
            timeout: 10000
        });

        socket.on('connect', () => {
            console.log('✅ Connected to WebSocket:', socket.id);
            resolve(socket);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket');
        });

        socket.on('new-message', (message) => {
            console.log('📨 New message received:', message);
            displayMessage(message);
        });

        socket.on('user-typing', (data) => {
            showTypingIndicator(data);
        });

        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            showAlert('Connection error: ' + error.message, 'danger');
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            showAlert('Failed to connect to messaging service', 'danger');
            reject(error);
        });

        // Set timeout for connection
        setTimeout(() => {
            if (!socket.connected) {
                reject(new Error('Connection timeout'));
            }
        }, 10000);
    });
}

async function openMessaging(jobId, freelancerId, freelancerName) {
    currentJobId = jobId;
    currentFreelancerId = freelancerId;
    
    console.log('📱 Opening messaging:', { jobId, freelancerId, freelancerName });
    document.getElementById('messagingTitle').textContent = `Discussion with ${freelancerName}`;
    
    try {
        // Ensure WebSocket is connected
        if (!socket || !socket.connected) {
            console.log('🔌 Initializing WebSocket connection...');
            await initializeWebSocket();
        }
        
        // Join job room
        if (socket && socket.connected) {
            console.log('🏠 Joining job room:', jobId);
            socket.emit('join-job', jobId);
        } else {
            throw new Error('WebSocket not connected');
        }
        
        // Load existing messages
        await loadMessages(jobId);
        
        showModal('messagingModal');
        
    } catch (error) {
        console.error('Error opening messaging:', error);
        showAlert('Failed to initialize messaging. Please try again.', 'danger');
    }
}

async function loadMessages(jobId) {
    try {
        const response = await api.getJobMessages(jobId);
        const messagesList = document.getElementById('messagesList');
        messagesList.innerHTML = '';
        
        console.log('Messages response:', response);
        console.log('Current user:', currentUser);
        console.log('Messages array:', response.messages);
        
        if (response.messages && response.messages.length > 0) {
            response.messages.forEach(message => {
                displayMessage(message);
            });
        } else {
            messagesList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <i class="fas fa-comments" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
        }
        
        // Scroll to bottom
        const messagesArea = document.getElementById('messagesArea');
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
    } catch (error) {
        console.error('Message loading error:', error);
        showAlert('Failed to load messages: ' + error.message, 'danger');
    }
}

function displayMessage(message) {
    console.log('Displaying message:', message);
    console.log('Current user ID:', currentUser?.id);
    console.log('Message sender ID:', message.sender?.id);
    
    const messagesList = document.getElementById('messagesList');
    const isOwnMessage = message.sender.id === currentUser.id;
    
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
        display: flex;
        justify-content: ${isOwnMessage ? 'flex-end' : 'flex-start'};
        margin-bottom: 1rem;
    `;
    
    messageElement.innerHTML = `
        <div style="
            max-width: 70%;
            background: ${isOwnMessage ? 'linear-gradient(135deg, #3b82f6, #1e40af)' : '#ffffff'};
            color: ${isOwnMessage ? 'white' : '#374151'};
            padding: 0.75rem 1rem;
            border-radius: ${isOwnMessage ? '20px 20px 5px 20px' : '20px 20px 20px 5px'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: ${isOwnMessage ? 'none' : '1px solid #e5e7eb'};
        ">
            <div style="font-weight: 500; font-size: 0.8rem; margin-bottom: 0.25rem; opacity: 0.8;">
                ${message.sender.firstName} ${message.sender.lastName}
            </div>
            <div style="line-height: 1.4;">
                ${message.content}
            </div>
            <div style="font-size: 0.7rem; margin-top: 0.25rem; opacity: 0.7;">
                ${new Date(message.createdAt).toLocaleTimeString()}
            </div>
        </div>
    `;
    
    messagesList.appendChild(messageElement);
    
    // Scroll to bottom
    const messagesArea = document.getElementById('messagesArea');
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content || !currentJobId) {
        console.log('Cannot send message:', { hasContent: !!content, hasJobId: !!currentJobId });
        return;
    }
    
    if (!socket || !socket.connected) {
        console.log('WebSocket not connected, cannot send message');
        showAlert('Connection lost. Please refresh the page.', 'danger');
        return;
    }
    
    console.log('📤 Sending message:', { jobId: currentJobId, content });
    socket.emit('send-message', {
        jobId: currentJobId,
        content: content
    });
    
    messageInput.value = '';
    messageInput.style.height = 'auto';
}

function showTypingIndicator(data) {
    const indicator = document.getElementById('typingIndicator');
    if (data.isTyping && data.userId !== currentUser.id) {
        indicator.textContent = `${data.userName} is typing...`;
    } else {
        indicator.textContent = '';
    }
}

// Freelancer Dashboard Functions
async function showAcceptedProjects() {
    try {
        const response = await api.getMyApplications();
        const acceptedApplications = response.applications.filter(app => app.status === 'ACCEPTED');
        displayAcceptedProjects(acceptedApplications);
    } catch (error) {
        showAlert('Failed to load accepted projects: ' + error.message, 'danger');
    }
}

function displayAcceptedProjects(applications) {
    const heroSection = document.querySelector('.hero');
    heroSection.innerHTML = `
        <div class="hero-container">
            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="margin: 0 0 1.5rem 0; font-size: 3rem; font-weight: 800; color: white; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">Accepted Projects</h1>
                <button id="backToDashboardBtn3" class="btn btn-hero btn-hero-outline" style="margin: 0 auto;">
                    <i class="fas fa-arrow-left"></i>
                    Back to Dashboard
                </button>
            </div>
            
            <div style="display: grid; gap: 1.5rem; max-width: 1000px; margin: 0 auto;">
                ${applications.length === 0 ? `
                    <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(20px);">
                        <i class="fas fa-briefcase" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No accepted projects yet</h3>
                        <p style="opacity: 0.8;">Your accepted projects will appear here</p>
                    </div>
                ` : applications.map(app => `
                    <div class="dashboard-card" style="margin-bottom: 1.5rem; animation: fadeInUp 0.6s ease-out;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem;">
                            <div style="flex: 1;">
                                <h3 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">${app.job.title}</h3>
                                <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                                    <span style="background: linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 4px 15px rgba(59,130,246,0.3);">
                                        $${app.bidAmount}
                                    </span>
                                    <span style="background: linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">
                                        ✅ Accepted
                                    </span>
                                    <span style="background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 500; backdrop-filter: blur(10px);">
                                        👤 ${app.job.client.firstName} ${app.job.client.lastName}
                                    </span>
                                </div>
                            </div>
                            
                            <button data-job-id="${app.job.id}" data-client-id="${app.job.client.id}" data-client-name="${app.job.client.firstName} ${app.job.client.lastName}" class="btn btn-hero btn-hero-primary message-client-btn" style="padding: 1rem 2rem; border-radius: 15px; font-weight: 700; box-shadow: 0 8px 25px rgba(59,130,246,0.4);">
                                <i class="fas fa-comments" style="margin-right: 0.5rem;"></i>Message Client
                            </button>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
                            <h5 style="color: white; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600;">Your Proposal:</h5>
                            <p style="color: rgba(255,255,255,0.85); margin: 0; line-height: 1.6; font-size: 0.9rem;">${app.coverLetter}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add event listener to back button
    document.getElementById('backToDashboardBtn3').addEventListener('click', showDashboard);
    
    // Add event listeners for message client buttons
    setTimeout(() => {
        document.querySelectorAll('.message-client-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const jobId = this.dataset.jobId;
                const clientId = this.dataset.clientId;
                const clientName = this.dataset.clientName;
                openMessaging(jobId, clientId, clientName);
            });
        });
    }, 100);
}

async function showMyConversations() {
    try {
        const response = await api.getMyConversations();
        displayConversations(response.conversations);
    } catch (error) {
        showAlert('Failed to load conversations: ' + error.message, 'danger');
    }
}

function displayConversations(conversations) {
    const heroSection = document.querySelector('.hero');
    heroSection.innerHTML = `
        <div class="hero-container">
            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="margin: 0 0 1.5rem 0; font-size: 3rem; font-weight: 800; color: white; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">Messages</h1>
                <button id="backToDashboardBtn4" class="btn btn-hero btn-hero-outline" style="margin: 0 auto;">
                    <i class="fas fa-arrow-left"></i>
                    Back to Dashboard
                </button>
            </div>
            
            <div style="display: grid; gap: 1.5rem; max-width: 1000px; margin: 0 auto;">
                ${conversations.length === 0 ? `
                    <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(20px);">
                        <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <h3>No conversations yet</h3>
                        <p style="opacity: 0.8;">Your project conversations will appear here</p>
                    </div>
                ` : conversations.map(conv => {
                    const otherUser = currentUser.role === 'CLIENT' ? conv.freelancer : conv.client;
                    return `
                        <div class="dashboard-card conversation-card" data-job-id="${conv.jobId}" data-user-id="${otherUser?.id}" data-user-name="${otherUser?.firstName} ${otherUser?.lastName}" style="margin-bottom: 1.5rem; animation: fadeInUp 0.6s ease-out; cursor: pointer;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                <div style="flex: 1;">
                                    <h3 style="color: white; margin-bottom: 0.5rem; font-size: 1.3rem; font-weight: 700;">${conv.jobTitle}</h3>
                                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                        <span style="background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.875rem; font-weight: 500; backdrop-filter: blur(10px);">
                                            👤 ${otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User'}
                                        </span>
                                        <span style="background: rgba(59,130,246,0.8); color: white; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600;">
                                            💬 ${conv.messageCount} messages
                                        </span>
                                    </div>
                                </div>
                                
                                <div style="text-align: right;">
                                    <div style="color: rgba(255,255,255,0.7); font-size: 0.8rem;">
                                        ${conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : 'No messages'}
                                    </div>
                                </div>
                            </div>
                            
                            ${conv.lastMessage ? `
                                <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; border-left: 4px solid #3b82f6;">
                                    <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem; margin-bottom: 0.25rem;">
                                        Last message from ${conv.lastMessage.sender.firstName}:
                                    </div>
                                    <p style="color: rgba(255,255,255,0.9); margin: 0; line-height: 1.4;">${conv.lastMessage.content.substring(0, 100)}${conv.lastMessage.content.length > 100 ? '...' : ''}</p>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Add event listener to back button
    document.getElementById('backToDashboardBtn4').addEventListener('click', showDashboard);
    
    // Add event listeners for conversation cards
    setTimeout(() => {
        document.querySelectorAll('.conversation-card').forEach(card => {
            card.addEventListener('click', function() {
                const jobId = this.dataset.jobId;
                const userId = this.dataset.userId;
                const userName = this.dataset.userName;
                openMessaging(jobId, userId, userName);
            });
        });
    }, 100);
}

// Profile Management Functions
function showEditProfile() {
    populateEditProfileForm();
    showModal('editProfileModal');
}

function populateEditProfileForm() {
    // Populate form with current user data
    document.getElementById('editFirstName').value = currentUser.firstName || '';
    document.getElementById('editLastName').value = currentUser.lastName || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    
    // Show/hide skills section based on role
    const skillsSection = document.getElementById('skillsSection');
    if (currentUser.role === 'FREELANCER') {
        skillsSection.style.display = 'block';
        populateSkills(currentUser.skills || []);
    } else {
        skillsSection.style.display = 'none';
    }
    
    // Update profile picture preview
    updateProfilePicturePreview();
}

function updateProfilePicturePreview() {
    const preview = document.getElementById('profilePicturePreview');
    if (currentUser.profilePicture) {
        preview.innerHTML = `<img src="${currentUser.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        preview.innerHTML = `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`;
    }
}

function populateSkills(skills) {
    const skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = '';
    
    if (skills.length === 0) {
        skillsList.innerHTML = '<p style="color: #9ca3af; font-style: italic; margin: 0;">No skills added yet. Add your first skill above.</p>';
        return;
    }
    
    skills.forEach(skill => {
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-item';
        skillElement.style.cssText = `
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-size: 0.875rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        `;
        
        skillElement.innerHTML = `
            <span>${skill}</span>
            <button type="button" onclick="removeSkill('${skill}')" style="background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; font-size: 0.75rem;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        skillsList.appendChild(skillElement);
    });
}

function addSkill() {
    const skillInput = document.getElementById('skillInput');
    const skill = skillInput.value.trim();
    
    if (!skill) return;
    
    // Get current skills
    const currentSkills = getCurrentSkills();
    
    // Check if skill already exists
    if (currentSkills.includes(skill)) {
        showAlert('Skill already added!', 'info');
        skillInput.value = '';
        return;
    }
    
    // Add skill
    currentSkills.push(skill);
    populateSkills(currentSkills);
    skillInput.value = '';
}

function removeSkill(skillToRemove) {
    const currentSkills = getCurrentSkills();
    const updatedSkills = currentSkills.filter(skill => skill !== skillToRemove);
    populateSkills(updatedSkills);
}

function getCurrentSkills() {
    const skillItems = document.querySelectorAll('#skillsList .skill-item span');
    return Array.from(skillItems).map(item => item.textContent);
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        phone: document.getElementById('editPhone').value,
        bio: document.getElementById('editBio').value,
    };
    
    // Add skills for freelancers
    if (currentUser.role === 'FREELANCER') {
        formData.skills = getCurrentSkills();
    }
    
    const spinner = document.getElementById('editProfileSpinner');
    
    try {
        spinner.classList.remove('hidden');
        
        const response = await api.updateProfile(formData);
        
        // Update current user data
        currentUser = { ...currentUser, ...response.user };
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        closeModal('editProfileModal');
        showAlert('Profile updated successfully!', 'success');
        
        // Refresh dashboard to show updated info
        showDashboard();
        
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        spinner.classList.add('hidden');
    }
}

async function handleProfilePictureChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showAlert('Please select an image file', 'danger');
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('File size must be less than 5MB', 'danger');
        return;
    }
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    try {
        showAlert('Uploading profile picture...', 'info');
        
        const response = await api.uploadProfilePicture(formData);
        
        // Update current user data
        currentUser.profilePicture = response.profilePicture;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        // Update preview
        updateProfilePicturePreview();
        
        showAlert('Profile picture updated successfully!', 'success');
        
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}