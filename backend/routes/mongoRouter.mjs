// backend/routes/mongoRouter.mjs
import { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { User } from "../models/user.mjs";
import { Product } from "../models/product.mjs";
import { Order } from "../models/order.mjs";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@tienda.com").toLowerCase();

const signToken = (p) => jwt.sign(p, JWT_SECRET, { expiresIn: "7d" });
const validateOr400 = (req, res, next) => {
  const errs = validationResult(req);
  if (errs.isEmpty()) return next();
  return res.status(400).json({ errors: errs.array(), message: "HTTP 400" });
};

function authRequired(req, res, next) {
  try {
    const auth = req.header("Authorization") || "";
    const [, token] = auth.split(" ");
    if (!token) return res.status(401).json({ message: "Token requerido" });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}
function adminOnly(req, res, next) {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Solo para administradores" });
}

/* ===== AUTH ===== */
router.post(
  "/auth/signup",
  [
    body("name").trim().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("phone").optional({ checkFalsy: true, nullable: true }).trim().isLength({ min: 6 }),
  ],
  validateOr400,
  async (req, res) => {
    const { name, email, password, phone } = req.body || {};
    const emailL = (email || "").toLowerCase();
    const exists = await User.findOne({ email: emailL });
    if (exists) return res.status(409).json({ message: "Email ya registrado" });

    const hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID().slice(0, 8);
    const role = emailL === ADMIN_EMAIL ? "admin" : "user";
    await User.create({ id, name, email: emailL, password: hash, phone: phone || "", role });

    const token = signToken({ id, email: emailL, role, name });
    res.status(201).json({ user: { id, name, email: emailL, phone: phone || "", role }, token });
  }
);

router.post(
  "/auth/login",
  [body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 1 })],
  validateOr400,
  async (req, res) => {
    const { email, password } = req.body || {};
    const emailL = (email || "").toLowerCase();
    const user = await User.findOne({ email: emailL });
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const role = emailL === ADMIN_EMAIL ? "admin" : (user.role || "user");
    if (role !== user.role) { user.role = role; await user.save(); }

    const token = signToken({ id: user.id, email: emailL, role, name: user.name });
    const { id, name, phone } = user;
    res.json({ user: { id, name, email: emailL, phone: phone || "", role }, token });
  }
);

router.post("/auth/logout", (_req, res) => res.sendStatus(204));
router.get("/profile", authRequired, async (req, res) => {
  const user = await User.findOne({ id: req.user.id }).lean();
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  const { id, name, email, phone, role } = user;
  res.json({ id, name, email, phone: phone || "", role });
});

/* ===== PRODUCTS ===== */
const validateProduct = [
  body("name").trim().isLength({ min: 2 }),
  body("price").isFloat({ min: 0 }),
  body("category").trim().isLength({ min: 1 }),
  body("subcategory").trim().isLength({ min: 1 }),
  body("image").trim().isLength({ min: 1 }),
  body("description").optional().isString(),
  validateOr400,
];

// LIST with filters: ?category=..&subcategory=..&q=..&active=true|false
router.get("/products", async (req, res) => {
  const { category, subcategory, q, active } = req.query || {};
  const filter = {};
  if (category) filter.category = { $regex: `^${category}$`, $options: "i" };
  if (subcategory) filter.subcategory = { $regex: `^${subcategory}$`, $options: "i" };
  if (typeof active !== "undefined") {
    const bool = String(active).toLowerCase();
    if (bool === "true" || bool === "false") filter.active = bool === "true";
  }
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { code: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { subcategory: { $regex: q, $options: "i" } },
    ];
  }
  const products = await Product.find(filter).lean();
  res.json(products);
});

// 🔥 GET by ID (lo que faltaba)
router.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ id }).lean();
  if (!product) return res.status(404).json({ message: "Producto no encontrado" });
  res.json(product);
});

router.post("/products", authRequired, adminOnly, validateProduct, async (req, res) => {
  const data = req.body || {};
  if (!data.id) data.id = crypto.randomUUID().slice(0, 8);
  const created = await Product.create(data);
  res.status(201).json(created);
});

router.put("/products/:id", authRequired, adminOnly, validateProduct, async (req, res) => {
  const { id } = req.params;
  const updated = await Product.findOneAndUpdate({ id }, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "No encontrado" });
  res.json(updated);
});

router.patch("/products/:id", authRequired, adminOnly, validateProduct, async (req, res) => {
  const { id } = req.params;
  const updated = await Product.findOneAndUpdate({ id }, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "No encontrado" });
  res.json(updated);
});

router.delete("/products/:id", authRequired, adminOnly, async (req, res) => {
  const { id } = req.params;
  await Product.deleteOne({ id });
  res.sendStatus(204);
});

/* ===== ORDERS ===== */
const STATUS = ["pendiente", "pagado", "enviado", "cancelado"];
const validateOrderCreateOrPut = [
  body("customer").trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("phone").optional({ checkFalsy: true, nullable: true }).trim().isLength({ min: 6 }),
  body("total").isFloat({ min: 0 }),
  body("status").isIn(STATUS),
  body("items").optional().isArray(),
  validateOr400,
];
const validateOrderStatusPatch = [body("status").isIn(STATUS), validateOr400];

// LIST with filters: ?status=...&from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/orders", authRequired, adminOnly, async (req, res) => {
  const { status, from, to } = req.query || {};
  const filter = {};
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  res.json(orders);
});

router.post("/orders", authRequired, validateOrderCreateOrPut, async (req, res) => {
  const body = req.body || {};
  if (!body.id) body.id = crypto.randomUUID().slice(0, 8);
  if (!body.createdAt) body.createdAt = new Date();
  if (!body.customerName) body.customerName = body.customer || "";
  const created = await Order.create(body);
  res.status(201).json(created);
});

router.put("/orders/:id", authRequired, adminOnly, validateOrderCreateOrPut, async (req, res) => {
  const { id } = req.params;
  const updated = await Order.findOneAndUpdate({ id }, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "No encontrado" });
  res.json(updated);
});

router.patch("/orders/:id", authRequired, adminOnly, validateOrderStatusPatch, async (req, res) => {
  const { id } = req.params;
  const updated = await Order.findOneAndUpdate({ id }, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "No encontrado" });
  res.json(updated);
});

router.delete("/orders/:id", authRequired, adminOnly, async (req, res) => {
  const { id } = req.params;
  await Order.deleteOne({ id });
  res.sendStatus(204);
});

export default router;
