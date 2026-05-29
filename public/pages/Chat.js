import { ChatWindow } from '../components/ChatWindow.js';
import { socketClient } from '../sockets/socketClient.js';

export const ChatPage = {
  renderConversations: (jobs) => `
    <div class="hero-container">
      <div style="text-align: center; margin-bottom: 3rem;">
        <h1 style="margin: 0 0 1.5rem 0; font-size: 3rem; font-weight: 800; color: white; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">Messages</h1>
        <button id="backToDashboardBtn" class="btn btn-hero btn-hero-outline" style="margin: 0 auto;">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>
      
      <div id="conversationsList" style="display: grid; gap: 1.5rem; max-width: 800px; margin: 0 auto;">
        ${jobs.length === 0 ? `
          <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(20px);">
            <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
            <h3>No active conversations</h3>
            <p style="opacity: 0.8;">Conversations will appear here when you apply to jobs or hire freelancers.</p>
          </div>
        ` : jobs.map(job => `
          <div class="dashboard-card" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 1.5rem;" data-job-id="${job.id}" data-job-title="${job.title}">
            <div>
              <h3 style="color: white; margin-bottom: 0.5rem; font-size: 1.25rem;">${job.title}</h3>
              <p style="color: rgba(255,255,255,0.8); margin: 0;">Click to view discussion</p>
            </div>
            <div style="background: rgba(255,255,255,0.2); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `,

  bindEvents: (handlers) => {
    document.getElementById('backToDashboardBtn')?.addEventListener('click', handlers.onBackClick);
    
    document.getElementById('conversationsList')?.addEventListener('click', (e) => {
      const card = e.target.closest('.dashboard-card');
      if (card) {
        handlers.onConversationClick(card.dataset.jobId, card.dataset.jobTitle);
      }
    });
  },
  
  openChat: async (jobId, jobTitle, currentUser) => {
    try {
      const response = await window.api.getJobMessages(jobId);
      const messages = response.messages;
      
      // We will render ChatWindow inside a Modals container since it's designed as a modal
      import('../components/Modals.js').then(({ Modals }) => {
        Modals.show(ChatWindow.render(jobTitle, messages, currentUser), (container) => {
          socketClient.connect();
          const cleanup = ChatWindow.setupRealtime(container, jobId, currentUser);
          
          // Overwrite modal close to cleanup socket
          const oldClose = Modals.close;
          Modals.close = () => {
            cleanup();
            socketClient.disconnect();
            Modals.close = oldClose; // Restore
            oldClose();
          };
        });
      });
      
    } catch (error) {
      console.error(error);
      import('../components/Toast.js').then(({ Toast }) => {
        Toast.error('Failed to load messages');
      });
    }
  }
};
