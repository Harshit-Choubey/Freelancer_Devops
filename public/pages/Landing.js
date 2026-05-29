export const LandingPage = {
  render: () => {
    return `
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-container">
          <h1>Find the Perfect Freelancer for Your Project</h1>
          <p>
            Connect with talented professionals worldwide and get your work done
            efficiently. Join thousands of successful collaborations happening
            every day.
          </p>
          <div class="hero-buttons">
            <button id="hireBtn" class="btn btn-hero btn-hero-primary">
              <i class="fas fa-user-tie"></i> Hire Freelancers
            </button>
            <button id="freelanceBtn" class="btn btn-hero btn-hero-outline">
              <i class="fas fa-user-check"></i> Start Freelancing
            </button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="features-container">
          <div class="features-header">
            <h2>Why Choose GigMatrix?</h2>
            <p>Experience the future of freelancing with our cutting-edge platform designed for success</p>
          </div>
          <div class="features-grid">
            ${LandingPage.renderFeatures()}
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="stats-grid">
          ${LandingPage.renderStats()}
        </div>
      </section>
    `;
  },

  renderFeatures: () => {
    const features = [
      { icon: 'fa-shield-alt', title: 'Secure & Trusted', desc: 'Advanced security measures protect your payments and data. Our escrow system ensures safe transactions.' },
      { icon: 'fa-rocket', title: 'Fast Matching', desc: 'AI-powered matching algorithm connects you with the perfect freelancer in minutes.' },
      { icon: 'fa-globe', title: 'Global Talent Pool', desc: 'Access skilled professionals from around the world. Work with experts in every timezone.' },
      { icon: 'fa-comments', title: 'Real-time Communication', desc: 'Built-in messaging system keeps you connected. Share files, track progress seamlessly.' },
      { icon: 'fa-chart-line', title: 'Analytics & Insights', desc: 'Detailed analytics help you make informed decisions and optimize your strategy.' },
      { icon: 'fa-headset', title: '24/7 Support', desc: 'Our dedicated support team is always here to help round-the-clock.' }
    ];

    return features.map(f => `
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas ${f.icon}"></i>
        </div>
        <h3>${f.title}</h3>
        <p>${f.desc}</p>
      </div>
    `).join('');
  },

  renderStats: () => {
    const stats = [
      { number: '50K+', label: 'Active Freelancers' },
      { number: '25K+', label: 'Happy Clients' },
      { number: '100K+', label: 'Projects Completed' },
      { number: '99.8%', label: 'Success Rate' },
    ];

    return stats.map(s => `
      <div class="stat-item">
        <span class="stat-number">${s.number}</span>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');
  },

  bindEvents: (handlers) => {
    document.getElementById('hireBtn')?.addEventListener('click', () => handlers.onHireClick?.('CLIENT'));
    document.getElementById('freelanceBtn')?.addEventListener('click', () => handlers.onFreelanceClick?.('FREELANCER'));
  }
};
