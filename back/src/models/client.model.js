import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    session_id: { type: String },
    registrationDate: { type: Date, default: Date.now() },
    name: { type: String },
    company: { type: String },
    phone: { type: String },
    email: { type: String },
    location: { type: String }, // "{{location}}", ("countryCity")
    personType: { type: String, enum: ["natural", "legal"] },
    drive_url: { type: String },
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
