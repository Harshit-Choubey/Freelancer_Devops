import { Modals } from './Modals.js';
import { Toast } from './Toast.js';
import { LoginModal } from './LoginModal.js';

export const VerificationModal = {
  render: () => `
    <div id="verificationModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Verify Your Email</h3>
          <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <p>We've sent a verification code to your email address. Please enter the 6-digit code below:</p>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #1e40af;">
              <i class="fas fa-envelope"></i>
              <span style="font-weight: 500;">Check your email inbox</span>
            </div>
          </div>
          <form id="verificationForm">
            <div class="form-group">
              <label for="otpInput">Verification Code</label>
              <input type="text" id="otpInput" maxlength="6" required style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;" />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">
              <span id="verifySpinner" class="hidden"><i class="fas fa-spinner loading"></i></span>
              Verify Email
            </button>
          </form>
        </div>
      </div>
    </div>
  `,

  show: (email) => {
    Modals.show(VerificationModal.render(), (container) => {
      const form = container.querySelector('#verificationForm');
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = container.querySelector('#otpInput').value;
        const spinner = container.querySelector('#verifySpinner');
        
        try {
          spinner.classList.remove('hidden');
          await window.AuthService.verifyEmail(email, otp);
          
          Modals.close();
          Toast.success('Email verified successfully! You can now login.');
          
          setTimeout(() => {
            LoginModal.show();
          }, 400);

        } catch (error) {
          Toast.error(error.message || 'Verification failed');
        } finally {
          spinner.classList.add('hidden');
        }
      });
    });
  }
};
