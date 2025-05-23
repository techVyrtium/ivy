import mongoose from "mongoose";

const commercialSchema = new mongoose.Schema(
  {
    market: { type: String },
    niche: { type: String },
    targetAudience: { type: String },
    businessType: { type: String }, // "{{businessType}}", ("personalBrand" | "startup" | "sme" | "establishedComp
    clientType: { type: String }, //  "{{clientType}}", ("A" | "AA" | "AAA" | "B" | "BB" | "BBB")
    monthlyBilling: { type: String }, // "{{monthlyBilling}}",
    deliveryTime: { type: String }, // "{{deliveryTime}}", ("urgent24h" | "medium48h" | "standard3to5d")
    budget: { type: String }, // "{{budget}}",
    leadStatus: { type: String }, // "{{leadStatus}}", ("dataCaptured" | "proposalSent" | "saleClosed")
    budget: { type: String }, // "{{budget}}",
    whatMakesYourBusinessUnique: { type: String }, // "{{whatMakesYourBusinessUnique}}",
  },
  {
    timestamps: true,
  }
);

export const Commercial = mongoose.model("Commercial", commercialSchema);
