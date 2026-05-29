import { Modals } from './Modals.js';
import { Toast } from './Toast.js';

export const ProposalModal = {
  render: (jobId) => `
    <div id="applicationModal" class="modal">
      <div class="modal-content" style="max-width: 500px">
        <div class="modal-header">
          <h3 class="modal-title">Apply to Job</h3>
          <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="applicationForm">
            <input type="hidden" id="applicationJobId" value="${jobId}" />
            <div class="form-group">
              <label for="coverLetter">Cover Letter</label>
              <textarea id="coverLetter" required rows="5" placeholder="Explain why you're the perfect fit for this project..."></textarea>
            </div>
            <div class="form-group">
              <label for="bidAmount">Your Bid Amount ($)</label>
              <input type="number" id="bidAmount" required min="1" placeholder="Enter your bid" />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">
              <span id="applicationSpinner" class="hidden"><i class="fas fa-spinner loading"></i></span>
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  `,

  show: (jobId, onSuccess) => {
    Modals.show(ProposalModal.render(jobId), (container) => {
      const form = container.querySelector('#applicationForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          jobId: container.querySelector('#applicationJobId').value,
          coverLetter: container.querySelector('#coverLetter').value,
          bidAmount: parseFloat(container.querySelector('#bidAmount').value)
        };
        
        const spinner = container.querySelector('#applicationSpinner');
        
        try {
          spinner.classList.remove('hidden');
          
          await window.api.applyToJob(formData);
          
          Modals.close();
          Toast.success('Application submitted successfully!');
          
          if (onSuccess) onSuccess();
        } catch (error) {
          Toast.error(error.message || 'Failed to submit application');
        } finally {
          spinner.classList.add('hidden');
        }
      });
    });
  }
};
