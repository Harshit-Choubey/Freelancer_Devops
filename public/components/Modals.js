export const Modals = {
  containerId: 'modals-container',

  init: () => {
    if (!document.getElementById(Modals.containerId)) {
      const container = document.createElement('div');
      container.id = Modals.containerId;
      document.body.appendChild(container);
    }
  },

  show: (modalHtml, onMount) => {
    Modals.init();
    const container = document.getElementById(Modals.containerId);
    container.innerHTML = modalHtml;

    // The single child in the container should be the modal element with 'modal' class
    const modalElement = container.firstElementChild;
    if (modalElement) {
      modalElement.classList.add('show');
      
      // Close on background click
      modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement) Modals.close();
      });

      // Close button
      const closeBtn = modalElement.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', Modals.close);
      }
    }

    if (onMount) onMount(container);
  },

  close: () => {
    const container = document.getElementById(Modals.containerId);
    if (container && container.firstElementChild) {
      container.firstElementChild.classList.remove('show');
      // Delay removal to allow CSS animation to finish
      setTimeout(() => {
        container.innerHTML = '';
      }, 300);
    }
  }
};
