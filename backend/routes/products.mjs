import { Router } from "express";
import { findById, insert, list, paginate, remove, update } from "../lib/db.mjs";
import { z } from "zod";
import authRequired from "../lib/authRequired.mjs";

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  image: z.string().min(1),
  description: z.string().optional()
});

// Lista con filtros y paginado (igual que json-server).Somos GRUPO 8
router.get("/", async (req, res, next) => {
  try {
    let items = await list("products");
    const { category, subcategory, q } = req.query;
    if (category) items = items.filter(p => p.category === category);
    if (subcategory) items = items.filter(p => p.subcategory === subcategory);
    if (q) items = items.filter(p => p.name.toLowerCase().includes(String(q).toLowerCase()));
    const { slice, total } = paginate(items, req.query);
    res.set("X-Total-Count", String(total));
    res.json(slice);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await findById("products", req.params.id);
    if (!item) return res.status(404).json({ message: "No encontrado" });
    res.json(item);
  } catch (e) { next(e); }
});

// ABM protegido (opcional para Admin)
router.post("/", authRequired, async (req, res, next) => {
  try {
    const payload = productSchema.parse({
      ...req.body,
      price: Number(req.body.price)
    });
    const created = await insert("products", payload);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put("/:id", authRequired, async (req, res, next) => {
  try {
    const payload = productSchema.partial().parse({
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined
    });
    const upd = await update("products", req.params.id, payload);
    if (!upd) return res.status(404).json({ message: "No encontrado" });
    res.json(upd);
  } catch (e) { next(e); }
});

router.delete("/:id", authRequired, async (req, res, next) => {
  try {
    const ok = await remove("products", req.params.id);
    if (!ok) return res.status(404).json({ message: "No encontrado" });
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
