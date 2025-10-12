import { readFile, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { resolve } from "path";

// Tomamos db.json desde la raíz del repo...Somos GRUPO 8
const DB_PATH = resolve(process.cwd(), "db.json");

async function readDB() {
  const txt = await readFile(DB_PATH, "utf8");
  return JSON.parse(txt);
}
async function writeDB(db) {
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function list(col) {
  const db = await readDB();
  return db[col] || [];
}
export async function findById(col, id) {
  const items = await list(col);
  return items.find(x => String(x.id) === String(id)) || null;
}
export async function insert(col, doc) {
  const db = await readDB();
  db[col] ||= [];
  const id = doc.id ?? randomUUID().slice(0, 4);
  const now = { ...doc, id };
  db[col].push(now);
  await writeDB(db);
  return now;
}
export async function update(col, id, patch) {
  const db = await readDB();
  const arr = db[col] || [];
  const i = arr.findIndex(x => String(x.id) === String(id));
  if (i === -1) return null;
  arr[i] = { ...arr[i], ...patch, id: arr[i].id };
  await writeDB(db);
  return arr[i];
}
export async function remove(col, id) {
  const db = await readDB();
  const arr = db[col] || [];
  const lenBefore = arr.length;
  db[col] = arr.filter(x => String(x.id) !== String(id));
  await writeDB(db);
  return db[col].length !== lenBefore;
}

export function paginate(items, { _page = 1, _limit = 10 }) {
  const page = Math.max(1, Number(_page));
  const limit = Math.max(1, Number(_limit));
  const start = (page - 1) * limit;
  const end = start + limit;
  const slice = items.slice(start, end);
  return { slice, total: items.length };
}
