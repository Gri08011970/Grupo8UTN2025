import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Conexión y modelos deL backend 
import { connectDB } from "../backend/db.mjs";
import { User } from "../backend/models/user.mjs";
import { Product } from "../backend/models/product.mjs";
import { Order } from "../backend/models/order.mjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utilidad
function isHashed(pwd) {
  return typeof pwd === "string" && pwd.startsWith("$2");
}

// Normaliza email a minúsculas
function lower(s) {
  return (s || "").toLowerCase();
}

async function run() {
  const DRY = process.argv.includes("--dry");
  if (!process.env.MONGO_URL) {
    throw new Error("Falta MONGO_URL en .env");
  }

  // 1) Conectar Mongo
  await connectDB(process.env.MONGO_URL);

  // 2) Leer db.json
  const dbPath = path.join(__dirname, "..", "db.json");
  if (!fs.existsSync(dbPath)) {
    throw new Error(`No se encontró ${dbPath}`);
  }
  const raw = fs.readFileSync(dbPath, "utf-8");
  const data = JSON.parse(raw);

  const summary = { users: { upserted: 0 }, products: { upserted: 0 }, orders: { upserted: 0 } };

  // 3) Usuarios
  if (Array.isArray(data.users)) {
    for (const u of data.users) {
      const doc = { ...u, email: lower(u.email) };
      if (doc.password && !isHashed(doc.password)) {
        // si vienen en claro, los hasheamos
        doc.password = await bcrypt.hash(doc.password, 10);
      }
      if (!doc.id) {
        //  compatible con  front (corto). 
        doc.id = Math.random().toString(16).slice(2, 10);
      }
      if (DRY) continue;
      await User.updateOne({ email: doc.email }, { $set: doc }, { upsert: true });
      summary.users.upserted++;
    }
  }

  // 4) Productos
  if (Array.isArray(data.products)) {
    for (const p of data.products) {
      const doc = { ...p };
      if (!doc.id) doc.id = Math.random().toString(16).slice(2, 10);
      if (DRY) continue;
      await Product.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
      summary.products.upserted++;
    }
  }

  // 5) Órdenes
  if (Array.isArray(data.orders)) {
    for (const o of data.orders) {
      const doc = { ...o };
      if (!doc.id) doc.id = Math.random().toString(16).slice(2, 10);
      if (!doc.createdAt) doc.createdAt = new Date();
      if (!doc.customerName) doc.customerName = doc.customer || "";
      if (DRY) continue;
      await Order.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
      summary.orders.upserted++;
    }
  }

  console.log("Resumen migración:", summary);
  console.log(DRY ? "DRY-RUN: no se escribieron cambios en Mongo" : "Migración completada ");
  process.exit(0);
}

run().catch((e) => {
  console.error("Fallo en migración:", e);
  process.exit(1);
});
