import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true }, // fingerprint
    deviceInfo: {
      userIp: { type: String },
      browser: { type: String },
      deviceType: {
        type: String,
        enum: ["mobile", "desktop", "tablet", "unknown"],
      },
    },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    drive_folder_link: { type: String },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
