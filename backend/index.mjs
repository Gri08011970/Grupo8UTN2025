import express from "express";
import morgan from "morgan";
import jsonServer from "json-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs, { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { body, validationResult } from "express-validator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- ENV ----------
const PORT = Number(process.env.PORT ||4001);
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || "";              // prod (Static Site)
const LOCAL_ORIGIN = "http://localhost:5173";                      // dev (Vite)
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@tienda.com").toLowerCase();

// ---------- APP ----------
const app = express();

// ---------- CORS (incluye preflight) ----------
app.use((req, res, next) => {
  const allowed = [FRONT_ORIGIN, LOCAL_ORIGIN].filter(Boolean);
  const origin = req.headers.origin;

  if (!origin || allowed.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || allowed[0] || "*");
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  const requested = req.header("Access-Control-Request-Headers");
  res.header("Access-Control-Allow-Headers", requested || "Content-Type, Authorization");
  res.header("Vary", "Origin");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ---------- LOGGERS ----------
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

app.use(
  morgan("combined", {
    stream: fs.createWriteStream(path.join(logsDir, "access.log"), { flags: "a" }),
  })
);
app.use(morgan("dev"));
app.use(express.json());

// ---------- json-server ----------
const router = jsonServer.router(path.join(__dirname, "..", "db.json"));
const middlewares = jsonServer.defaults();
const db = router.db;

// ---------- helpers ----------
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

function authRequired(req, res, next) {
  try {
    const auth = req.header("Authorization") || "";
    const [, token] = auth.split(" ");
    if (!token) return res.status(401).json({ message: "Token requerido" });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Solo para administradores" });
}

function validateOr400(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ errors: errors.array(), message: "HTTP 400" });
}

// ---------- AUTH ----------
app.post(
  "/api/auth/signup",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Nombre muy corto"),
    body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
    body("phone").optional({ checkFalsy: true, nullable: true }).trim().isLength({ min: 6 }).withMessage("Teléfono inválido"),
  ],
  validateOr400,
  async (req, res) => {
    try {
      const { name, email, password, phone } = req.body || {};
      const emailL = email.toLowerCase();

      const exists = db.get("users").find({ email: emailL }).value();
      if (exists) return res.status(409).json({ message: "Email ya registrado" });

      const hash = await bcrypt.hash(password, 10);
      const id = Math.random().toString(16).slice(2, 6);
      const role = emailL === ADMIN_EMAIL ? "admin" : "user";

      db.get("users")
        .push({ id, name, email: emailL, password: hash, phone: phone || "", role })
        .write();

      const token = signToken({ id, email: emailL, role, name });
      return res.status(201).json({
        user: { id, name, email: emailL, phone: phone || "", role },
        token,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error creando usuario" });
    }
  }
);

app.post(
  "/api/auth/login",
  [
    body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
    body("password").isLength({ min: 1 }).withMessage("Contraseña requerida"),
  ],
  validateOr400,
  async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const emailL = email.toLowerCase();

      const user = db.get("users").find({ email: emailL }).value();
      if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

      const role = emailL === ADMIN_EMAIL ? "admin" : (user.role || "user");
      if (role !== user.role) {
        db.get("users").find({ email: emailL }).assign({ role }).write();
      }

      const token = signToken({ id: user.id, email: emailL, role, name: user.name });
      const { id, name, phone } = user;
      res.json({ user: { id, name, email: emailL, phone: phone || "", role }, token });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error de login" });
    }
  }
);

app.post("/api/auth/logout", (req, res) => res.sendStatus(204));

app.get("/api/profile", authRequired, (req, res) => {
  const user = db.get("users").find({ id: req.user.id }).value();
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  const { id, name, email, phone, role } = user;
  res.json({ id, name, email, phone: phone || "", role });
});

// ---------- Validaciones ----------
const validateProduct = [
  body("name").trim().isLength({ min: 2 }).withMessage("Nombre requerido"),
  body("price").isFloat({ min: 0 }).withMessage("Precio inválido"),
  body("category").trim().isLength({ min: 1 }).withMessage("Categoría requerida"),
  body("subcategory").trim().isLength({ min: 1 }).withMessage("Subcategoría requerida"),
  body("image").trim().isLength({ min: 1 }).withMessage("Imagen requerida"),
  body("description").optional().isString(),
  validateOr400,
];

const STATUS = ["pendiente", "pagado", "enviado", "cancelado"];

const validateOrderCreateOrPut = [
  body("customer").trim().isLength({ min: 2 }).withMessage("Cliente requerido"),
  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
  body("phone").optional({ checkFalsy: true, nullable: true }).trim().isLength({ min: 6 }).withMessage("Teléfono inválido"),
  body("total").isFloat({ min: 0 }).withMessage("Total inválido"),
  body("status").isIn(STATUS).withMessage("Estado inválido"),
  body("items").optional().isArray().withMessage("Items debe ser array"),
  validateOr400,
];

const validateOrderStatusPatch = [
  body("status").isIn(STATUS).withMessage("Estado inválido"),
  validateOr400,
];

// ---------- Guardias de escritura ----------
app.use("/api", (req, res, next) => {
  const write = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  if (!write) return next();

  const p = req.path || "";
  const touchesOrders = p.startsWith("/orders");
  const touchesProducts = p.startsWith("/products");

  if (touchesOrders) {
    if (req.method === "POST") return authRequired(req, res, next);
    return authRequired(req, res, () => adminOnly(req, res, next));
  }

  if (touchesProducts) {
    return authRequired(req, res, () => adminOnly(req, res, next));
  }

  return next();
});

// Validaciones ANTES del router
app.post("/api/products", authRequired, adminOnly, validateProduct, (req, res, next) => next());
app.put("/api/products/:id", authRequired, adminOnly, validateProduct, (req, res, next) => next());
app.patch("/api/products/:id", authRequired, adminOnly, validateProduct, (req, res, next) => next());

app.post("/api/orders", authRequired, validateOrderCreateOrPut, (req, res, next) => next());
app.put("/api/orders/:id", authRequired, adminOnly, validateOrderCreateOrPut, (req, res, next) => next());
app.patch("/api/orders/:id", authRequired, adminOnly, validateOrderStatusPatch, (req, res, next) => next());
app.delete("/api/orders/:id", authRequired, adminOnly, (req, res, next) => next());

// Completar createdAt y customerName al crear orden
app.post("/api/orders", (req, res, next) => {
  if (!req.body.createdAt) req.body.createdAt = new Date().toISOString();
  if (!req.body.customerName) req.body.customerName = req.body.customer || "";
  next();
});

// ---------- MONTAR JSON-SERVER (una sola vez) ----------
app.use("/api", jsonServer.defaults(), jsonServer.router(path.join(__dirname, "..", "db.json")));


// ---------- SERVIR FRONT (build de Vite) ----------

const distPath = path.join(__dirname, "..", "dist");

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // Fallback SPA: todo lo que no sea /api sirve index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ---------- ERRORES ----------
app.use((err, req, res, next) => {
  const line = `[${new Date().toISOString()}] ${req.method} ${req.url} :: ${err.stack || err}\n`;
  fs.appendFile(path.join(logsDir, "error.log"), line, () => {});
  res.status(500).json({ message: "Error del servidor" });
});

// ---------- START ----------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en http://localhost:${PORT}/api (PORT env=${process.env.PORT || 'n/a'})`);
});
