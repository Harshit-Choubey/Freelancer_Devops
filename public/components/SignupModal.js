import { Modals } from './Modals.js';
import { Toast } from './Toast.js';
import { VerificationModal } from './VerificationModal.js';

export const SignupModal = {
  render: (role = '') => `
    <div id="registerModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Create Your Account</h3>
          <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="registerForm">
            <div class="form-row">
              <div>
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" required />
              </div>
              <div>
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" required />
              </div>
            </div>
            <div class="form-group">
              <label for="registerEmail">Email</label>
              <input type="email" id="registerEmail" required />
            </div>
            <div class="form-group">
              <label for="registerPassword">Password</label>
              <input type="password" id="registerPassword" required />
              <div class="form-text">Password must be at least 8 characters long</div>
            </div>
            <div class="form-group">
              <label for="role">I want to</label>
              <select id="role" required>
                <option value="">Select role</option>
                <option value="CLIENT" ${role === 'CLIENT' ? 'selected' : ''}>Hire freelancers</option>
                <option value="FREELANCER" ${role === 'FREELANCER' ? 'selected' : ''}>Work as a freelancer</option>
              </select>
            </div>
            <div id="skillsContainer" class="form-group ${role === 'FREELANCER' ? '' : 'hidden'}">
              <label for="skills">Skills (comma-separated)</label>
              <input type="text" id="skills" placeholder="e.g., JavaScript, Python, Design" />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">
              <span id="registerSpinner" class="hidden"><i class="fas fa-spinner loading"></i></span>
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  `,

  show: (initialRole = '') => {
    Modals.show(SignupModal.render(initialRole), (container) => {
      const roleSelect = container.querySelector('#role');
      const skillsContainer = container.querySelector('#skillsContainer');
      
      roleSelect.addEventListener('change', (e) => {
        if (e.target.value === 'FREELANCER') {
          skillsContainer.classList.remove('hidden');
        } else {
          skillsContainer.classList.add('hidden');
        }
      });

      const form = container.querySelector('#registerForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          firstName: container.querySelector('#firstName').value,
          lastName: container.querySelector('#lastName').value,
          email: container.querySelector('#registerEmail').value,
          password: container.querySelector('#registerPassword').value,
          role: roleSelect.value,
        };
        
        if (formData.role === 'FREELANCER') {
          const skillsInput = container.querySelector('#skills').value;
          formData.skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
        }

        const spinner = container.querySelector('#registerSpinner');
        
        try {
          spinner.classList.remove('hidden');
          await window.AuthService.register(formData);
          Modals.close();
          Toast.success('Registration successful! Please check your email.');
          
          // Show verification modal
          setTimeout(() => {
            VerificationModal.show(formData.email);
          }, 400);

        } catch (error) {
          Toast.error(error.message || 'Registration failed');
        } finally {
          spinner.classList.add('hidden');
        }
      });
    });
  }
};
