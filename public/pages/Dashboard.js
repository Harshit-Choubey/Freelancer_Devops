export const Dashboard = {
  renderClient: (user) => {
    return `
      <div class="hero-container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #3b82f6, #1e40af); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3); animation: float 3s ease-in-out infinite; overflow: hidden;">
            ${user.profilePicture ? 
              `<img src="${user.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` :
              `<i class="fas fa-user-tie" style="font-size: 3rem; color: white;"></i>`
            }
          </div>
          <h1 style="font-size: 3.5rem; font-weight: 900; margin-bottom: 1rem; background: linear-gradient(135deg, #ffffff, #e5e7eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Welcome back, ${user.firstName}!</h1>
          <p style="font-size: 1.3rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 3rem; max-width: 600px; margin-left: auto; margin-right: auto;">Manage your projects and find the best freelancers for your needs.</p>
        </div>
        <div class="hero-buttons" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; max-width: 800px; margin: 0 auto;">
          <button id="postJobBtn" class="btn btn-hero btn-hero-primary" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700; min-width: 280px; flex: 1; max-width: 350px;">
            <i class="fas fa-plus-circle" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            <div>Post a New Job</div>
            <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Find talented freelancers</small>
          </button>
          <button id="browseMyJobsBtn" class="btn btn-hero btn-hero-outline" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700; min-width: 280px; flex: 1; max-width: 350px;">
            <i class="fas fa-briefcase" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            <div>My Posted Jobs</div>
            <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Manage your projects</small>
          </button>
        </div>
      </div>
    `;
  },

  renderFreelancer: (user) => {
    return `
      <div class="hero-container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3); animation: float 3s ease-in-out infinite; overflow: hidden;">
            ${user.profilePicture ? 
              `<img src="${user.profilePicture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">` :
              `<i class="fas fa-user-check" style="font-size: 3rem; color: white;"></i>`
            }
          </div>
          <h1 style="font-size: 3.5rem; font-weight: 900; margin-bottom: 1rem; background: linear-gradient(135deg, #ffffff, #e5e7eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Welcome back, ${user.firstName}!</h1>
          <p style="font-size: 1.3rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">Find amazing projects and grow your freelance career.</p>
        </div>
        ${user.skills && user.skills.length > 0 ? 
          `<div style="margin: 3rem 0; text-align: center;">
            <h3 style="margin-bottom: 1.5rem; font-size: 1.5rem; color: white; font-weight: 700;">Your Skills</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; max-width: 800px; margin: 0 auto;">
              ${user.skills.map(skill => 
                `<span class="skill-tag-hover" style="background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); padding: 0.75rem 1.5rem; border-radius: 50px; font-size: 0.9rem; font-weight: 600; color: white; border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); transition: all 0.3s ease; cursor: default;">${skill}</span>`
              ).join('')}
            </div>
          </div>` : 
          '<div style="margin: 2rem 0; padding: 2rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2);"><p style="margin: 0; opacity: 0.8; font-size: 1.1rem;">Add your skills to attract more clients and showcase your expertise!</p></div>'
        }
        <div class="hero-buttons" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 800px; margin: 3rem auto 0;">
          <button id="browseJobsBtn" class="btn btn-hero btn-hero-primary" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700;">
            <i class="fas fa-search" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            <div>Browse Jobs</div>
            <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Find your next project</small>
          </button>
          <button id="acceptedProjectsBtn" class="btn btn-hero btn-hero-outline" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700;">
            <i class="fas fa-check-circle" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            <div>Accepted Projects</div>
            <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Your active work</small>
          </button>
          <button id="messagesBtn" class="btn btn-hero btn-hero-outline" style="padding: 2rem; border-radius: 20px; font-size: 1.2rem; font-weight: 700;">
            <i class="fas fa-comments" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            <div>Messages</div>
            <small style="opacity: 0.8; font-weight: 400; font-size: 0.9rem;">Client communications</small>
          </button>
        </div>
      </div>
    `;
  },

  render: (user) => {
    return `
      <section class="hero">
        ${user.role === 'CLIENT' ? Dashboard.renderClient(user) : Dashboard.renderFreelancer(user)}
      </section>
    `;
  },

  bindEvents: (handlers, user) => {
    if (user.role === 'CLIENT') {
      document.getElementById('postJobBtn')?.addEventListener('click', handlers.onPostJobClick);
      document.getElementById('browseMyJobsBtn')?.addEventListener('click', handlers.onMyJobsClick);
    } else {
      document.getElementById('browseJobsBtn')?.addEventListener('click', handlers.onBrowseJobsClick);
      document.getElementById('acceptedProjectsBtn')?.addEventListener('click', handlers.onAcceptedProjectsClick);
      document.getElementById('messagesBtn')?.addEventListener('click', handlers.onMessagesClick);
    }
  }
};
