import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { insert, list } from "../lib/db.mjs";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post("/register", async (req, res, next) => {
  try {
    const data = userSchema.parse(req.body);
    const users = await list("users");
    if (users.some(u => u.email === data.email)) {
      return res.status(400).json({ message: "Email ya registrado" });
    }
    const hash = await bcrypt.hash(data.password, 10);
    const user = await insert("users", { name: data.name, email: data.email, password: hash });
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = userSchema.pick({ email: true, password: true }).parse(req.body);
    const users = await list("users");
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { next(e); }
});

export default router;
