import mongoose from "mongoose";

const commercialSchema = new mongoose.Schema(
  {
    desiredProduct: { type: String }, //["logo/DGVX202504_001" | "brandManual/DGVX202504_00
    assistantProduct: { type: String }, // ["logo/DGVX202504_001" | "brandManual/DGVX202504_00
    consultedProduct: { type: String }, // ["logo/DGVX202504_001" | "brandManual/DGVX202504_00
    purchasedProduct: { type: String }, // ["logo/DGVX202504_001" | "brandManual/DGVX202504_00
    payment: { type: String }, // ("YES" | "NO")
    clientInstructions: { type: String }, // ["{{fileUrl1}}", "{{fileUrl2}}", "{{fileUrl3}}", "etc"] ("Links to fill)
  },
  {
    timestamps: true,
  }
);

export const Commercial = mongoose.model("Commercial", commercialSchema);
