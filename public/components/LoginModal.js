import { Modals } from './Modals.js';
import { Toast } from './Toast.js';

export const LoginModal = {
  render: () => `
    <div id="loginModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Login to Your Account</h3>
          <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="loginForm">
            <div class="form-group">
              <label for="loginEmail">Email</label>
              <input type="email" id="loginEmail" required />
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <input type="password" id="loginPassword" required />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">
              <span id="loginSpinner" class="hidden"><i class="fas fa-spinner loading"></i></span>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  `,

  show: () => {
    Modals.show(LoginModal.render(), (container) => {
      const form = container.querySelector('#loginForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = container.querySelector('#loginEmail').value;
        const password = container.querySelector('#loginPassword').value;
        const spinner = container.querySelector('#loginSpinner');
        
        try {
          spinner.classList.remove('hidden');
          const response = await window.AuthService.login(email, password);
          Toast.success('Login successful!');
          Modals.close();
          // Update app state
          if (window.app) window.app.updateUser(response.user);
        } catch (error) {
          Toast.error(error.message || 'Login failed');
        } finally {
          spinner.classList.add('hidden');
        }
      });
    });
  }
};
