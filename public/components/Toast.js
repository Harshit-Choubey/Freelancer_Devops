export const Toast = {
  containerId: 'alertContainer',

  init: () => {
    if (!document.getElementById(Toast.containerId)) {
      const container = document.createElement('div');
      container.id = Toast.containerId;
      container.className = 'alert-container';
      document.body.appendChild(container);
    }
  },

  show: (message, type = 'info') => {
    Toast.init();
    const container = document.getElementById(Toast.containerId);
    
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.innerHTML = `
      <div class="alert-content">${message}</div>
      <button class="alert-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    alertElement.querySelector('.alert-close').addEventListener('click', function() {
      this.parentElement.remove();
    });
    
    container.appendChild(alertElement);
    
    setTimeout(() => {
      if (alertElement.parentNode) {
        alertElement.remove();
      }
    }, 5000);
  },

  success: (msg) => Toast.show(msg, 'success'),
  error: (msg) => Toast.show(msg, 'danger'),
  info: (msg) => Toast.show(msg, 'info')
};
