// server.cjs  (CommonJS)
const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, "public"),
});

// Middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);

// CORS
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Rutas JSON Server
server.use(router);

// Puerto (Render provee PORT)
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`JSON Server running on port ${port}`);
});

