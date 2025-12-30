const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the blog API server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3301',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
