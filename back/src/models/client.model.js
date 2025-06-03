import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    session_id: { type: String, unique: true },
    registrationDate: { type: Date, default: Date.now() },
    name: { type: String },
    phoneNumber: { type: String, unique: true },
    email: { type: String, unique: true },
    country: { type: String },
    industry: { type: String },
    budgetRange: { type: String },

    language: { type: String, default: "english" },
    deliveryTime: { type: String },
    businessTypes: { type: [String] },
    otherBusinessType: { type: String },

    personType: { type: String, enum: ["natural", "legal"] },
    drive_url: { type: String, default: "" },

    cus_code: { type: String }, // xx xx xx xx -> country-industry-amount_size-unique_id

    deviceInfo: {
      userIp: { type: String },
      browser: { type: String },
      deviceType: {
        type: String,
        enum: ["mobile", "desktop", "tablet", "unknown"],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Client = mongoose.model("Client", clientSchema);
