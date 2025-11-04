import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, index: true },     //  id "corto" que ya usa el front
    name: String,
    email: { type: String, unique: true, index: true },
    phone: String,
    password: String,                       // hash
    role: { type: String, default: "user" }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
