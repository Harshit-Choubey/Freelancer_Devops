export const Navbar = {
  render: (user) => {
    if (user) {
      return `
        <div class="nav-container">
          <a href="#" class="logo" id="logoLink">GigMatrix</a>
          <div class="auth-buttons">
            <div class="user-menu">
              <span class="user-welcome">Welcome, ${user.firstName}!</span>
              <div class="nav-btn-group">
                <button id="dashboardBtn" class="btn btn-nav btn-outline">
                  <i class="fas fa-tachometer-alt"></i> Dashboard
                </button>
                <button id="profileBtn" class="btn btn-nav btn-nav-primary">
                  <i class="fas fa-user"></i> Profile
                </button>
                <button id="logoutBtn" class="btn btn-nav btn-logout">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="nav-container">
          <a href="#" class="logo" id="logoLink">GigMatrix</a>
          <div class="auth-buttons">
            <button id="loginBtn" class="btn btn-outline">Login</button>
            <button id="signupBtn" class="btn btn-primary">Sign Up</button>
          </div>
        </div>
      `;
    }
  },

  bindEvents: (handlers) => {
    document.getElementById('logoLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      handlers.onHomeClick?.();
    });

    document.getElementById('dashboardBtn')?.addEventListener('click', handlers.onDashboardClick);
    document.getElementById('profileBtn')?.addEventListener('click', handlers.onProfileClick);
    document.getElementById('logoutBtn')?.addEventListener('click', handlers.onLogoutClick);
    
    document.getElementById('loginBtn')?.addEventListener('click', handlers.onLoginClick);
    document.getElementById('signupBtn')?.addEventListener('click', handlers.onSignupClick);
  }
};
