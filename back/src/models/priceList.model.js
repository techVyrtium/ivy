import mongoose from "mongoose";

const PriceListSchema = new mongoose.Schema(
  {
    id: { type: Number },
    service: { type: String },
    category: { type: String },
    type: { type: String },
    product: { type: String },
    description: { type: String },
    unit_value: { type: String },
    usd: { type: Number },
  },
  {
    timestamps: true,
  }
);

export const PriceList = mongoose.model("PriceList", PriceListSchema);
