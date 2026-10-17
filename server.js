// خادم بدون أي مكتبات خارجية — يحفظ البيانات في data.json
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const PUBLIC = path.join(__dirname, 'public');

if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}');

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return {}; }
}
function save(data) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}
function send(res, code, body, type = 'application/json; charset=utf-8', extra = {}) {
  res.writeHead(code, { 'Content-Type': type, ...extra });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', c => { s += c; if (s.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(s || '{}')); } catch (e) { reject(e); } });
  });
}
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/api/guests' && req.method === 'GET') return send(res, 200, load());

    if (url.pathname === '/api/guests' && req.method === 'POST') {
      const { table, name } = await readBody(req);
      const t = parseInt(table, 10), n = String(name || '').trim();
      if (!(t >= 1 && t <= 74) || !n) return send(res, 400, { error: 'بيانات غير صحيحة' });
      const data = load();
      data[t] = data[t] || [];
      data[t].push(n);
      save(data);
      return send(res, 200, data);
    }

    if (url.pathname === '/api/guests' && req.method === 'DELETE') {
      const { table, index } = await readBody(req);
      const data = load();
      if (data[table] && data[table][index] !== undefined) {
        data[table].splice(index, 1);
        if (!data[table].length) delete data[table];
        save(data);
      }
      return send(res, 200, data);
    }

    if (url.pathname === '/data.json') // تحميل نسخة احتياطية
      return send(res, 200, fs.readFileSync(DATA_FILE), 'application/json', { 'Content-Disposition': 'attachment; filename="data.json"' });

    // ملفات ثابتة
    let p = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = path.join(PUBLIC, path.normalize(p));
    if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'Not found', 'text/plain');
    send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
  } catch (e) {
    send(res, 500, { error: String(e.message || e) });
  }
}).listen(PORT, () => console.log('Running on http://localhost:' + PORT));
