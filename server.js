const http = require('http');

const hostname = '127.0.0.1';
const port = 3001;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Voilà la réponse du serveur !\n');
});

server.listen(port, hostname, () => {
  console.log(`Serveur en ligne sur http://${hostname}:${port}/`);
});