const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:8000',
            changeOrigin: true,
            pathRewrite: { '^/api': '' },
        })
    );

    app.use(
        '/ws',
        createProxyMiddleware({
            target: 'http://localhost:8000',
            changeOrigin: true,
            ws: true,
            onError: (err, req, res) => {
                console.error('Proxy error:', err);
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end('WebSocket proxy error');
            }
        })
    );
};