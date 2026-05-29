import { socketClient } from '../sockets/socketClient.js';

export const ChatWindow = {
  render: (jobTitle, messages, currentUser) => `
    <div id="messagingModal" class="modal show">
      <div class="modal-content" style="max-width: 700px; max-height: 90vh;">
        <div class="modal-header">
          <h3 class="modal-title" id="messagingTitle">${jobTitle} - Discussion</h3>
          <button class="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" style="padding: 0; display: flex; flex-direction: column; height: 500px;">
          <!-- Messages Area -->
          <div id="messagesArea" style="flex: 1; padding: 1rem; overflow-y: auto; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
            <div id="messagesList" style="display: flex; flex-direction: column; gap: 1rem;">
              ${messages.map(msg => ChatWindow.renderMessage(msg, currentUser)).join('')}
            </div>
          </div>
          
          <!-- Message Input -->
          <div style="padding: 1rem; background: white; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; gap: 0.5rem; align-items: flex-end;">
              <textarea id="messageInput" placeholder="Type your message..." style="flex: 1; min-height: 40px; max-height: 100px; resize: vertical; border-radius: 20px; padding: 0.75rem 1rem; border: 1px solid #d1d5db;"></textarea>
              <button id="sendMessageBtn" class="btn btn-primary" style="border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; padding: 0;">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
            <div id="typingIndicator" style="font-size: 0.8rem; color: #6b7280; margin-top: 0.5rem; min-height: 1rem;"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  renderMessage: (msg, currentUser) => {
    const isMine = msg.sender.id === currentUser.id;
    const align = isMine ? 'flex-end' : 'flex-start';
    const bg = isMine ? 'linear-gradient(135deg, #3b82f6, #1e40af)' : 'white';
    const color = isMine ? 'white' : '#1f2937';
    const border = isMine ? 'none' : '1px solid #e5e7eb';
    const radius = isMine ? '20px 20px 0 20px' : '20px 20px 20px 0';
    
    return `
      <div style="display: flex; flex-direction: column; align-items: ${align}; max-width: 80%; align-self: ${align};">
        <span style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem;">
          ${isMine ? 'You' : msg.sender.firstName} • ${new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
        <div style="background: ${bg}; color: ${color}; border: ${border}; padding: 0.75rem 1rem; border-radius: ${radius}; box-shadow: 0 2px 5px rgba(0,0,0,0.05); line-height: 1.5;">
          ${msg.content.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
  },

  setupRealtime: (container, jobId, currentUser) => {
    const messagesList = container.querySelector('#messagesList');
    const messagesArea = container.querySelector('#messagesArea');
    const messageInput = container.querySelector('#messageInput');
    const sendBtn = container.querySelector('#sendMessageBtn');
    const typingIndicator = container.querySelector('#typingIndicator');
    
    // Auto-scroll
    messagesArea.scrollTop = messagesArea.scrollHeight;
    
    // Join room
    socketClient.emit('join-job', jobId);
    
    const scrollToBottom = () => {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    };

    const handleNewMessage = (msg) => {
      // Append new message
      const msgHtml = ChatWindow.renderMessage(msg, currentUser);
      messagesList.insertAdjacentHTML('beforeend', msgHtml);
      scrollToBottom();
    };

    const handleTyping = (data) => {
      if (data.isTyping) {
        typingIndicator.textContent = `${data.userName} is typing...`;
      } else {
        typingIndicator.textContent = '';
      }
    };

    socketClient.on('new-message', handleNewMessage);
    socketClient.on('user-typing', handleTyping);

    const sendMessage = () => {
      const content = messageInput.value.trim();
      if (!content) return;
      
      socketClient.emit('send-message', { jobId, content });
      messageInput.value = '';
      messageInput.style.height = 'auto';
      socketClient.emit('typing', { jobId, isTyping: false });
    };

    sendBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    let typingTimer;
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
      
      socketClient.emit('typing', { jobId, isTyping: true });
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        socketClient.emit('typing', { jobId, isTyping: false });
      }, 1000);
    });
    
    // Cleanup on close
    return () => {
      socketClient.off('new-message', handleNewMessage);
      socketClient.off('user-typing', handleTyping);
    };
  }
};
