import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) throw new Error("Falta MONGO_URL");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: "tp_grupal_utn" });
  console.log("MongoDB conectado");
}
