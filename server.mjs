import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp'};
http.createServer((request,response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if(pathname === '/') pathname = '/index.html';
    const allowed = ['/index.html','/style.css','/app.js'].includes(pathname) || pathname.startsWith('/assets/');
    const filename = path.resolve(root,'.'+pathname);
    if(!allowed || !filename.startsWith(root+path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {response.writeHead(404).end('Not found');return;}
    response.writeHead(200,{'Content-Type':types[path.extname(filename)] || 'application/octet-stream'});
    fs.createReadStream(filename).pipe(response);
  } catch { response.writeHead(400).end('Bad request'); }
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
