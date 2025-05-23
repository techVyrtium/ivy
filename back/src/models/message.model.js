import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true },
    chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    sender: {
      type: String,
      enum: ["ai agent", "human agent", "client"],
      required: true,
    },
    receiver: {
      type: String,
      enum: ["ai agent", "human agent", "client"],
      required: true,
    },
    message: { type: String, required: true },
    // response_message: { type: String },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
