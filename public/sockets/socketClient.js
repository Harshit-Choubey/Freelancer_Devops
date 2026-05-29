class SocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    // Map<event, Set<callback>> — prevents duplicate listener registration
    this.listeners = new Map();
    this._reconnectTimer = null;
  }

  connect() {
    // Prevent double-connect (e.g. from multiple tabs or re-mount)
    if (this.socket && this.connected) return;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const token = window.AuthService?.getToken();
    if (!token) {
      console.warn('[SOCKET] No auth token — skipping connection');
      return;
    }

    if (!window.io) {
      console.warn('[SOCKET] Socket.IO not loaded');
      return;
    }

    this.socket = window.io(window.AppConfig.SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.info('[SOCKET] Connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.info('[SOCKET] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[SOCKET] Connection error:', err.message);
    });

    this.socket.on('error', (error) => {
      console.error('[SOCKET] Server error:', error.message);
      if (window.Toast) window.Toast.error(error.message || 'Real-time connection error');
    });

    // Re-attach all previously registered listeners to the new socket
    for (const [event, callbackSet] of this.listeners.entries()) {
      callbackSet.forEach(cb => this.socket.on(event, cb));
    }
  }

  disconnect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
    // Clear listeners on full disconnect
    this.listeners.clear();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    // Set prevents duplicate registrations for same function reference
    if (this.listeners.get(event).has(callback)) return;

    this.listeners.get(event).add(callback);
    if (this.socket) this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    if (this.socket) this.socket.off(event, callback);
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`[SOCKET] Cannot emit '${event}' — not connected`);
    }
  }

  isConnected() {
    return this.connected && !!this.socket;
  }
}

export const socketClient = new SocketClient();
