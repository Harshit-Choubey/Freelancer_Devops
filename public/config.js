// In a production environment without a bundler, 
// these would be populated dynamically by the serving infrastructure (e.g. NGINX subs_filter)
// or determined relatively.

window.AppConfig = {
  API_BASE_URL: '/api',
  SOCKET_URL: window.location.origin,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
};
