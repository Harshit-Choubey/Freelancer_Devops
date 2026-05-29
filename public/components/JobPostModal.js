import { Modals } from './Modals.js';
import { Toast } from './Toast.js';

export const JobPostModal = {
  render: (job = null) => `
    <div id="${job ? 'editJobModal' : 'postJobModal'}" class="modal">
      <div class="modal-content" style="max-width: 600px">
        <div class="modal-header">
          <h3 class="modal-title">${job ? 'Edit Job' : 'Post a New Job'}</h3>
          <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="jobForm">
            ${job ? `<input type="hidden" id="jobId" value="${job.id}" />` : ''}
            <div class="form-group">
              <label for="jobTitle">Job Title</label>
              <input type="text" id="jobTitle" required placeholder="e.g., Build a React Website" value="${job?.title || ''}" />
            </div>
            <div class="form-group">
              <label for="jobDescription">Job Description</label>
              <textarea id="jobDescription" required rows="4" placeholder="Describe your project in detail...">${job?.description || ''}</textarea>
            </div>
            <div class="form-row">
              <div>
                <label for="jobBudget">Budget ($)</label>
                <input type="number" id="jobBudget" required min="1" placeholder="1000" value="${job?.budget || ''}" />
              </div>
              <div>
                <label for="jobCategory">Category</label>
                <select id="jobCategory" required>
                  <option value="">Select category</option>
                  <option value="Web Development" ${job?.category === 'Web Development' ? 'selected' : ''}>Web Development</option>
                  <option value="Mobile Development" ${job?.category === 'Mobile Development' ? 'selected' : ''}>Mobile Development</option>
                  <option value="Design" ${job?.category === 'Design' ? 'selected' : ''}>Design</option>
                  <option value="Writing" ${job?.category === 'Writing' ? 'selected' : ''}>Writing</option>
                  <option value="Marketing" ${job?.category === 'Marketing' ? 'selected' : ''}>Marketing</option>
                  <option value="Data Science" ${job?.category === 'Data Science' ? 'selected' : ''}>Data Science</option>
                  <option value="Other" ${job?.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="jobSkills">Required Skills (comma-separated)</label>
              <input type="text" id="jobSkills" required placeholder="e.g., React, Node.js, MongoDB" value="${job?.requiredSkills?.join(', ') || ''}" />
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">
              <span id="jobSpinner" class="hidden"><i class="fas fa-spinner loading"></i></span>
              ${job ? 'Update Job' : 'Post Job'}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,

  show: (job = null, onSuccess) => {
    Modals.show(JobPostModal.render(job), (container) => {
      const form = container.querySelector('#jobForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
          title: container.querySelector('#jobTitle').value,
          description: container.querySelector('#jobDescription').value,
          budget: parseFloat(container.querySelector('#jobBudget').value),
          category: container.querySelector('#jobCategory').value,
          requiredSkills: container.querySelector('#jobSkills').value.split(',').map(s => s.trim()).filter(Boolean)
        };
        
        const spinner = container.querySelector('#jobSpinner');
        
        try {
          spinner.classList.remove('hidden');
          
          if (job) {
            await window.api.updateJob(job.id, formData);
            Toast.success('Job updated successfully!');
          } else {
            await window.api.createJob(formData);
            Toast.success('Job posted successfully!');
          }
          
          Modals.close();
          if (onSuccess) onSuccess();
          
        } catch (error) {
          Toast.error(error.message || 'Failed to save job');
        } finally {
          spinner.classList.add('hidden');
        }
      });
    });
  }
};
