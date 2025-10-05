import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'db.json');
if (!fs.existsSync(DB_PATH)) {
  console.error('❌ No se encontró db.json en:', DB_PATH);
  process.exit(1);
}

const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);

// Sirve estáticos desde /dist si existe (para tu frontend build de Vite)
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, 'dist')
});

const PORT = process.env.PORT || 4000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Prefijo /api para no chocar con rutas del SPA
server.use('/api', router);

// Fallback SPA: si existe dist/index.html lo sirve para rutas no-API
server.get('*', (req, res, next) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  next();
});

server.listen(PORT, () => {
  console.log(`✅ JSON Server corriendo en puerto ${PORT}`);
});


