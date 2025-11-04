import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    id: String,     // product.id
    name: String,
    price: Number,
    qty: Number
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, index: true },
    customer: String,
    customerName: String,
    email: String,
    phone: String,
    total: Number,
    status: { type: String, default: "pendiente" },
    createdAt: { type: Date, default: Date.now },
    items: [itemSchema]
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
