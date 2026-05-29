import { JobCard } from '../components/JobCard.js';

export const JobsPage = {
  renderMyJobs: (jobs) => `
    <div class="hero-container">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="margin: 0 0 1.5rem 0; font-size: 3rem; font-weight: 800; color: white; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">My Posted Jobs</h1>
        <button id="backToDashboardBtn" class="btn btn-hero btn-hero-outline" style="margin: 0 auto;">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
      
      <div id="jobsListContainer" style="display: grid; gap: 1.5rem; max-width: 1000px; margin: 0 auto;">
        ${jobs.length === 0 ? `
          <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(20px);">
            <i class="fas fa-briefcase" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
            <h3>No jobs posted yet</h3>
            <p style="opacity: 0.8; margin-bottom: 2rem;">Start by posting your first job to find talented freelancers</p>
            <button id="postFirstJobBtn" class="btn btn-hero btn-hero-primary">
              <i class="fas fa-plus-circle"></i>Post Your First Job
            </button>
          </div>
        ` : jobs.map(job => JobCard.renderMyJob(job)).join('')}
      </div>
    </div>
  `,

  renderAllJobs: (jobs) => `
    <div class="hero-container">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="margin: 0 0 1.5rem 0; font-size: 3rem; font-weight: 800; color: white; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">Browse Available Jobs</h1>
        <button id="backToDashboardBtn" class="btn btn-hero btn-hero-outline" style="margin: 0 auto;">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
      
      <div id="jobsListContainer" style="display: grid; gap: 1.5rem; max-width: 1000px; margin: 0 auto;">
        ${jobs.length === 0 ? `
          <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(20px);">
            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
            <h3>No jobs available</h3>
            <p style="opacity: 0.8;">Check back later for new opportunities</p>
          </div>
        ` : jobs.map(job => JobCard.renderFreelancerJob(job)).join('')}
      </div>
    </div>
  `,

  bindEvents: (handlers) => {
    document.getElementById('backToDashboardBtn')?.addEventListener('click', handlers.onBackClick);
    document.getElementById('postFirstJobBtn')?.addEventListener('click', handlers.onPostJobClick);
    
    // Bind action buttons in cards
    document.getElementById('jobsListContainer')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      
      if (action === 'applicants' && handlers.onViewApplicantsClick) handlers.onViewApplicantsClick(id);
      if (action === 'edit' && handlers.onEditJobClick) handlers.onEditJobClick(id);
      if (action === 'delete' && handlers.onDeleteJobClick) handlers.onDeleteJobClick(id);
      if (action === 'apply' && handlers.onApplyJobClick) handlers.onApplyJobClick(id);
    });
  }
};
