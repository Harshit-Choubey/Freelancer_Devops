export const JobCard = {
  renderMyJob: (job) => `
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
          <button data-action="applicants" data-id="${job.id}" class="btn btn-nav-primary" style="padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;" title="View Applicants">
            <i class="fas fa-users" style="margin-right: 0.5rem;"></i> Applicants (${job._count?.applications || 0})
          </button>
          <button data-action="edit" data-id="${job.id}" class="btn btn-outline edit-btn-hover" style="padding: 0.75rem; border-color: rgba(255,255,255,0.3); color: white; border-radius: 12px;" title="Edit Job">
            <i class="fas fa-edit"></i>
          </button>
          <button data-action="delete" data-id="${job.id}" class="btn btn-outline delete-btn-hover" style="padding: 0.75rem; border-color: rgba(239,68,68,0.5); color: #ef4444; border-radius: 12px;" title="Delete Job">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <p style="color: rgba(255,255,255,0.85); margin-bottom: 1.5rem; line-height: 1.7; font-size: 1rem;">${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
        ${job.requiredSkills.map(skill => `
          <span class="job-skill-hover" style="background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 500; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px);">${skill}</span>
        `).join('')}
      </div>
    </div>
  `,

  renderFreelancerJob: (job) => `
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
              👤 ${job.client?.firstName || 'Client'} ${job.client?.lastName || ''}
            </span>
          </div>
        </div>
        ${job.hasApplied ? 
          `<button class="btn btn-hero" style="padding: 1rem 2rem; border-radius: 15px; font-weight: 700; background: linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9)); color: white; cursor: default; box-shadow: 0 8px 25px rgba(16,185,129,0.4);">
            <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>Applied
          </button>` :
          `<button data-action="apply" data-id="${job.id}" class="btn btn-hero btn-hero-primary" style="padding: 1rem 2rem; border-radius: 15px; font-weight: 700; box-shadow: 0 8px 25px rgba(59,130,246,0.4);">
            <i class="fas fa-paper-plane" style="margin-right: 0.5rem;"></i>Apply Now
          </button>`
        }
      </div>
      <p style="color: rgba(255,255,255,0.85); margin-bottom: 1.5rem; line-height: 1.7; font-size: 1rem;">${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
        ${job.requiredSkills.map(skill => `
          <span class="job-skill-hover" style="background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); color: white; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 500; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px);">${skill}</span>
        `).join('')}
      </div>
    </div>
  `
};
