import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, index: true },
    code: String,
    name: String,
    price: Number,
    category: String,
    subcategory: String,
    stock: Number,
    image: String,
    description: String,
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
