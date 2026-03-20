const http = require('http');
const { router } = require('./modules/router');

const server = http.createServer(async (req, res) => {
    await router(req, res);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> ${res.statusCode}`);
});

server.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
