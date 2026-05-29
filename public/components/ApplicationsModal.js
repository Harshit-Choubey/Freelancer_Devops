import { Modals } from './Modals.js';
import { Toast } from './Toast.js';

export const ApplicationsModal = {
  renderApplication: (app) => {
    const statusColors = {
      PENDING: 'rgba(245, 158, 11, 0.9)',
      ACCEPTED: 'rgba(16, 185, 129, 0.9)',
      REJECTED: 'rgba(239, 68, 68, 0.9)',
    };
    const color = statusColors[app.status] || 'rgba(107, 114, 128, 0.9)';

    return `
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h4 style="color: white; margin: 0 0 0.25rem; font-size: 1.1rem; font-weight: 700;">
              ${app.freelancer?.firstName || 'Freelancer'} ${app.freelancer?.lastName || ''}
            </h4>
            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 0.85rem;">${app.freelancer?.email || ''}</p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="background: ${color}; color: white; padding: 0.35rem 0.9rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600;">
              ${app.status}
            </span>
            <span style="background: linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9)); color: white; padding: 0.35rem 0.9rem; border-radius: 50px; font-size: 0.85rem; font-weight: 700;">
              $${app.bidAmount || 'N/A'}
            </span>
          </div>
        </div>
        ${app.coverLetter ? `
          <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
            <p style="color: rgba(255,255,255,0.85); margin: 0; line-height: 1.6; font-size: 0.9rem;">${app.coverLetter}</p>
          </div>
        ` : ''}
        ${app.freelancer?.skills?.length ? `
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
            ${app.freelancer.skills.map(s => `
              <span style="background: rgba(255,255,255,0.1); color: white; padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.75rem; border: 1px solid rgba(255,255,255,0.2);">${s}</span>
            `).join('')}
          </div>
        ` : ''}
        ${app.status === 'PENDING' ? `
          <div style="display: flex; gap: 0.75rem;">
            <button data-action="accept" data-id="${app.id}" class="btn btn-nav btn-nav-primary" style="flex: 1; border-radius: 10px;">
              <i class="fas fa-check" style="margin-right: 0.5rem;"></i>Accept
            </button>
            <button data-action="reject" data-id="${app.id}" class="btn btn-outline" style="flex: 1; border-radius: 10px; border-color: rgba(239,68,68,0.5); color: #ef4444;">
              <i class="fas fa-times" style="margin-right: 0.5rem;"></i>Reject
            </button>
          </div>
        ` : ''}
      </div>
    `;
  },

  render: (jobId, applications) => `
    <div id="applicationsModal" class="modal">
      <div class="modal-content" style="max-width: 680px; background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98)); color: white;">
        <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <h3 class="modal-title" style="color: white;">Applicants (${applications.length})</h3>
          <button class="modal-close" style="color: rgba(255,255,255,0.7);"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" id="applicationsBody" style="max-height: 60vh; overflow-y: auto;">
          ${applications.length === 0 ? `
            <div style="text-align: center; padding: 3rem; opacity: 0.7;">
              <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
              <p>No applications yet. Share your job to attract freelancers!</p>
            </div>
          ` : applications.map(app => ApplicationsModal.renderApplication(app)).join('')}
        </div>
      </div>
    </div>
  `,

  show: async (jobId) => {
    try {
      const res = await window.api.get(`/jobs/${jobId}/applications`);
      const applications = res.data?.applications || res.applications || [];

      Modals.show(ApplicationsModal.render(jobId, applications), (container) => {
        container.querySelector('#applicationsBody')?.addEventListener('click', async (e) => {
          const btn = e.target.closest('button[data-action]');
          if (!btn) return;

          const { action, id } = btn.dataset;
          const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

          try {
            btn.disabled = true;
            await window.api.patch(`/jobs/applications/${id}/status`, { status });
            Toast.success(`Application ${status.toLowerCase()} successfully`);
            Modals.close();
            // Re-open to refresh
            setTimeout(() => ApplicationsModal.show(jobId), 400);
          } catch (err) {
            Toast.error(err.message || 'Action failed');
            btn.disabled = false;
          }
        });
      });
    } catch (err) {
      Toast.error('Failed to load applications');
    }
  },
};
