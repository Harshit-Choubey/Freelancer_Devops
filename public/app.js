import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/Landing.js';
import { Dashboard } from './pages/Dashboard.js';
import { LoginModal } from './components/LoginModal.js';
import { SignupModal } from './components/SignupModal.js';
import { ProfileModal } from './components/ProfileModal.js';
import { JobPostModal } from './components/JobPostModal.js';
import { JobsPage } from './pages/Jobs.js';
import { ChatPage } from './pages/Chat.js';
import { Toast } from './components/Toast.js';

// ─── Loading Spinner Helper ──────────────────────────────────────────────────
const renderLoader = () =>
  '<div style="text-align:center;padding:5rem"><i class="fas fa-spinner loading" style="font-size:3rem;color:white"></i></div>';

const renderError = (msg = 'Something went wrong') =>
  `<div style="text-align:center;padding:5rem;color:white"><i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:1rem;display:block;opacity:0.7"></i>${msg}</div>`;

class App {
  constructor() {
    this.root = document.getElementById('app');
    this.user = null;

    // ─── Auth Route Guards ──────────────────────────────────────────────────
    // Fired by api.js interceptor when any API call returns 401
    window.addEventListener('auth-unauthorized', () => {
      Toast.info('Session expired. Please log in again.');
      this._setUser(null);
    });

    // Fired by AuthService.logout() — SPA logout without page reload
    window.addEventListener('auth-logout', () => {
      this._setUser(null);
    });

    this._bootstrap();
  }

  /** Bootstrap — validate existing token before mounting */
  async _bootstrap() {
    if (window.AuthService.isAuthenticated()) {
      try {
        // Re-hydrate user from localStorage (fast path)
        const localUser = window.AuthService.getCurrentUser();
        if (localUser) {
          // Validate session is still live on the server
          const res = await window.api.getMe();
          this._setUser(res.data.user);
          return;
        }
      } catch {
        // Token is invalid/expired — clear and show landing
        window.AuthService.logout();
      }
    }
    this._setUser(null);
  }

  _setUser(user) {
    this.user = user;
    this.render();
  }

  updateUser(user) {
    this._setUser(user);
  }

  /** Guard — redirect to landing if not authenticated */
  _requireAuth() {
    if (!this.user) {
      Toast.info('Please log in to continue.');
      this.mountLanding();
      LoginModal.show();
      return false;
    }
    return true;
  }

  /** Guard — redirect to dashboard if already authenticated */
  _requireGuest() {
    if (this.user) {
      this.mountDashboard();
      return false;
    }
    return true;
  }

  render() {
    this.root.innerHTML = `
      <nav id="navbar-root"></nav>
      <main id="main-content"></main>
      <footer id="footer-root" class="footer"></footer>
    `;
    this.mountNavbar();
    this.mountFooter();
    this.user ? this.mountDashboard() : this.mountLanding();
  }

  mountNavbar() {
    const navRoot = document.getElementById('navbar-root');
    navRoot.innerHTML = Navbar.render(this.user);

    Navbar.bindEvents({
      onHomeClick: () => this.render(),
      onDashboardClick: () => this._requireAuth() && this.mountDashboard(),
      onProfileClick: () => this._requireAuth() && ProfileModal.show(this.user),
      onLogoutClick: () => {
        window.AuthService.logout();
        // auth-logout event above will call _setUser(null) → render()
      },
      onLoginClick: () => this._requireGuest() && LoginModal.show(),
      onSignupClick: () => this._requireGuest() && SignupModal.show(),
    });
  }

  mountFooter() {
    document.getElementById('footer-root').innerHTML = Footer.render();
  }

  mountLanding() {
    const main = document.getElementById('main-content');
    main.innerHTML = LandingPage.render();
    LandingPage.bindEvents({
      onHireClick: () => SignupModal.show('CLIENT'),
      onFreelanceClick: () => SignupModal.show('FREELANCER'),
    });
  }

  mountDashboard() {
    if (!this._requireAuth()) return;
    const main = document.getElementById('main-content');
    main.innerHTML = Dashboard.render(this.user);

    Dashboard.bindEvents({
      onPostJobClick: () => JobPostModal.show(null, () => this.mountMyJobs()),
      onMyJobsClick: () => this.mountMyJobs(),
      onBrowseJobsClick: () => this.mountAllJobs(),
      onAcceptedProjectsClick: () => this.mountMessages(),
      onMessagesClick: () => this.mountMessages(),
    }, this.user);
  }

  async mountMyJobs() {
    if (!this._requireAuth()) return;
    const main = document.getElementById('main-content');
    main.innerHTML = renderLoader();

    try {
      const response = await window.api.getMyJobs();
      // Backend envelope: { success, message, data: { jobs } }
      const jobs = response.data?.jobs || response.jobs || [];
      main.innerHTML = JobsPage.renderMyJobs(jobs);

      JobsPage.bindEvents({
        onBackClick: () => this.mountDashboard(),
        onPostJobClick: () => JobPostModal.show(null, () => this.mountMyJobs()),
        onEditJobClick: async (id) => {
          try {
            const res = await window.api.getJobById(id);
            const job = res.job || res.data?.job;
            JobPostModal.show(job, () => this.mountMyJobs());
          } catch { Toast.error('Failed to load job'); }
        },
        onDeleteJobClick: async (id) => {
          if (confirm('Are you sure you want to delete this job?')) {
            try {
              await window.api.deleteJob(id);
              Toast.success('Job deleted.');
              this.mountMyJobs();
            } catch { Toast.error('Failed to delete job'); }
          }
        },
        onViewApplicantsClick: async (id) => {
          const { ApplicationsModal } = await import('./components/ApplicationsModal.js');
          ApplicationsModal.show(id);
        },
      });
    } catch (err) {
      console.error('[APP] mountMyJobs failed:', err);
      main.innerHTML = renderError('Failed to load jobs. Please try again.');
    }
  }

  async mountAllJobs() {
    if (!this._requireAuth()) return;
    const main = document.getElementById('main-content');
    main.innerHTML = renderLoader();

    try {
      const response = await window.api.getAllJobsAuth();
      const jobs = response.data?.jobs || response.jobs || [];
      main.innerHTML = JobsPage.renderAllJobs(jobs);

      JobsPage.bindEvents({
        onBackClick: () => this.mountDashboard(),
        onApplyJobClick: async (id) => {
          const { ProposalModal } = await import('./components/ProposalModal.js');
          ProposalModal.show(id, () => this.mountAllJobs());
        },
      });
    } catch (err) {
      console.error('[APP] mountAllJobs failed:', err);
      main.innerHTML = renderError('Failed to load jobs. Please try again.');
    }
  }

  async mountMessages() {
    if (!this._requireAuth()) return;
    const main = document.getElementById('main-content');
    main.innerHTML = renderLoader();

    try {
      let jobs = [];
      if (this.user.role === 'CLIENT') {
        const res = await window.api.getMyJobs();
        jobs = res.data?.jobs || res.jobs || [];
      } else {
        // Freelancer: browse with hasApplied flag populated
        const res = await window.api.getAllJobsAuth();
        const all = res.data?.jobs || res.jobs || [];
        jobs = all.filter(j => j.hasApplied);
      }

      main.innerHTML = ChatPage.renderConversations(jobs);
      ChatPage.bindEvents({
        onBackClick: () => this.mountDashboard(),
        onConversationClick: (jobId, jobTitle) => ChatPage.openChat(jobId, jobTitle, this.user),
      });
    } catch (err) {
      console.error('[APP] mountMessages failed:', err);
      main.innerHTML = renderError('Failed to load conversations. Please try again.');
    }
  }
}

// ─── Initialize App ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
