import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isHtmlRequest = (req) => {
  return req.headers.accept && req.headers.accept.includes('text/html');
};

const createProxyRule = (target = 'http://127.0.0.1:8000') => ({
  target,
  changeOrigin: true,
  bypass: (req) => {
    if (isHtmlRequest(req)) {
      return '/index.html';
    }
  },
});

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': createProxyRule(),
      '/users': createProxyRule(),
      '/engineers': createProxyRule(),
      '/projects': createProxyRule(),
      '/houses': createProxyRule(),
      '/compliance': createProxyRule(),
      '/review': createProxyRule(),
      '/ai': createProxyRule(),
      '/handover': createProxyRule(),
      '/reports': createProxyRule(),
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
