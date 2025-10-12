// backend/routes/orders.mjs
import { Router } from "express";
import { readFile, writeFile } from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../../db.json");

async function loadDB() {
  const txt = await readFile(DB_PATH, "utf8");
  return JSON.parse(txt);
}
async function saveDB(db) {
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");
const isPhone = (s) => /^[0-9+\-()\s]{6,20}$/.test(s || "");

router.get("/", async (req, res, next) => {
  try {
    const db = await loadDB();
    let list = db.orders || [];
    const { page = 1, limit = 10, status } = req.query;

    if (status) list = list.filter((o) => o.status === status);

    const p = Number(page);
    const l = Number(limit);
    const start = (p - 1) * l;

    res.json({ total: list.length, page: p, limit: l, data: list.slice(start, start + l) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { customer, email, phone, items, total } = req.body || {};

    if (!customer || !email || !phone)
      return res.status(400).json({ message: "Nombre, email y teléfono son obligatorios." });
    if (!isEmail(email)) return res.status(400).json({ message: "Email inválido." });
    if (!isPhone(phone)) return res.status(400).json({ message: "Teléfono inválido." });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Carrito vacío." });
    if (typeof total !== "number" || total <= 0)
      return res.status(400).json({ message: "Total inválido." });

    const db = await loadDB();
    db.orders = db.orders || [];

    const id = randomUUID().slice(0, 8);
    const order = {
      id,
      customer,
      email,
      phone,
      total,
      status: "pendiente",
      createdAt: new Date().toISOString(),
      items,
    };

    db.orders.push(order);
    await saveDB(db);

    res.status(201).json({
      message: "Pedido realizado con éxito. ¡En breve nos estaremos comunicando con vos! ¡Gracias por tu compra!",
      order,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await loadDB();
    const i = (db.orders || []).findIndex((o) => String(o.id) === String(id));
    if (i === -1) return res.status(404).json({ message: "Orden no encontrada" });
    db.orders[i] = { ...db.orders[i], ...req.body };
    await saveDB(db);
    res.json(db.orders[i]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await loadDB();
    const before = (db.orders || []).length;
    db.orders = db.orders.filter((o) => String(o.id) !== String(id));
    if (db.orders.length === before) return res.status(404).json({ message: "Orden no encontrada" });
    await saveDB(db);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;

