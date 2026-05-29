/**
 * AuthService — Frontend Authentication Manager
 * Fully decoupled from direct API calls.
 * Reads from the standardized { success, data: { user, token } } envelope.
 */
const AuthService = {

  // ─── Login ────────────────────────────────────────────────────────────────
  async login(email, password) {
    const response = await window.api.post('/auth/login', { email, password });
    // Backend now returns: { success, data: { user, token } }
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { user, token };
  },

  // ─── Register ────────────────────────────────────────────────────────────
  async register(userData) {
    const response = await window.api.post('/auth/register', userData);
    return response;
  },

  // ─── Verify Email ─────────────────────────────────────────────────────────
  async verifyEmail(email, otp) {
    const response = await window.api.post('/auth/verify-email', { email, otp });
    return response;
  },

  // ─── Logout ───────────────────────────────────────────────────────────────
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch event so app.js SPA router can react without full page reload
    window.dispatchEvent(new Event('auth-logout'));
  },

  // ─── Get Current User ─────────────────────────────────────────────────────
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch {
      // Corrupted localStorage — clear it
      localStorage.removeItem('user');
      return null;
    }
  },

  // ─── Token Checks ─────────────────────────────────────────────────────────
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    // Decode expiry without verifying signature (server will reject if invalid)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        this.logout(); // Token expired — proactively clear
        return false;
      }
      return true;
    } catch {
      return !!token;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },
};

window.AuthService = AuthService;
