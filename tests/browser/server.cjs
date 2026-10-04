const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.poscar': 'text/plain', '.xyz': 'text/plain', '.xdatcar': 'text/plain' };

http.createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
        const file = path.resolve(root, relative);
        if (!file.startsWith(root + path.sep) || relative.split('/').some(part => part.startsWith('.') || part === 'node_modules') || !types[path.extname(file)]) {
            response.writeHead(404).end();
            return;
        }
        const content = await fs.readFile(file);
        response.writeHead(200, { 'Content-Type': types[path.extname(file)] }).end(content);
    } catch {
        response.writeHead(404).end();
    }
}).listen(4173, '127.0.0.1');
