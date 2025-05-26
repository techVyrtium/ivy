import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    services_id: [{ type: Number }],
    client_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Client" }],
    status: { type: String, enum: ["requested", "created"] },
    url: { type: String },
    invoice_url: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Quotation = mongoose.model("Quotation", quotationSchema);
