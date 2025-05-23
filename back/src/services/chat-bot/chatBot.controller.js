import Chat from "../../models/chat.model.js";
import { Client } from "../../models/client.model.js";
import Message from "../../models/message.model.js";
import axiosInstance from "../../utilities/axiosInstance.js";
import catchAsync from "../../utilities/catchAsync.js";
import sendResponse from "../../utilities/sendResponse.js";

// question from client
export const clientAskAgent = catchAsync(async (req, res, next) => {
  const fingerprint = req.userFingerprint;
  const deviceShortInfo = req.deviceShortInfo;
  const { message, receiver } = req.body || {};

  if (!message || typeof message !== "string") {
    return next({ message: "Message is required", code: 400 });
  }

  // checking if client available
  const client = await Client.findOne({ session_id: fingerprint }).select(
    "-registrationDate"
  );

  let chat = await Chat.findOne({ session_id: fingerprint });

  if (!chat) {
    chat = await Chat.create({
      session_id: fingerprint,
      deviceInfo: deviceShortInfo,
      messages: [],
    });
  }

  const newClientMessage = await Message.create({
    session_id: fingerprint,
    chat_id: chat._id,
    sender: "client",
    receiver: receiver || "ai agent",
    message,
  });

  chat.messages.push(newClientMessage._id); // Add client message to beginning

  let response;
  if (receiver === "human agent") {
    // TODO message has to send human agent using socket.io
    console.log("Human agent is loading........");
  }
  // ai agent
  else {
    response = await axiosInstance.post("/", {
      message,
      sessionId: fingerprint,
      client,
    });

    if (!response.data?.output) {
      return next({ message: "Invalid response from AI agent" });
    }

    const newAgentMessage = await Message.create({
      session_id: fingerprint,
      chat_id: chat._id,
      sender: "ai agent",
      receiver: "client",
      message: response?.data?.output || null,
    });

    chat.messages.push(newAgentMessage._id); // Add ai agent's response message to beginning
  }

  await chat.save();

  // return sendResponse(res, {
  //   code: 200,
  //   success: true,
  //   message: "Response from AI agent",
  //   data: response?.data?.output || null,
  // });

  return sendResponse(res, {
    code: 200,
    success: true,
    message: "Response from AI agent",
    data: {
      threadId: fingerprint,
      runId: "",
      response: response?.data?.output || null,
      processingStatus: "success",
      timestamp: null,
      folderUrl: null,
    },
  });
});

// question from ai/human agent
export const agentAskClient = catchAsync(async (req, res, next) => {
  const { sessionId, message, sender } = req.body;

  if (!sessionId || !message || !sender) {
    return next({
      message: "sessionId, sender and message are required",
      code: 400,
    });
  }

  if (sender !== "ai agent" && sender !== "human agent") {
    return next({ message: "Sender can only be ai or human agent", code: 400 });
  }

  let chat = await Chat.findOne({ session_id: sessionId });

  if (!chat) {
    return next({ message: "Chat session not found", code: 404 });
  }

  const newMessage = await Message.create({
    session_id: sessionId,
    chat_id: chat._id,
    sender: sender,
    message: message,
    receiver: "client",
  });

  chat.messages.push(newMessage._id);
  await chat.save();

  // TODO socket.io
  // io.to(sessionId).emit("new-agent-message", {
  //   message,
  //   messageId: newMessage._id,
  // });

  return sendResponse(res, {
    code: 200,
    success: true,
    message: "Agent's message sent to client",
    data: newMessage,
  });
});

// chat / all message of a conversation
export const getConversationForASingleClient = catchAsync(
  async (req, res, next) => {
    const fingerprint = req.userFingerprint;
    let id = req.params.id;

    if (id == "0") {
      id = fingerprint; //TODO has to take care of it
    }

    const chats = await Chat.findOne({ session_id: id }).populate("messages");

    return sendResponse(res, {
      code: 200,
      success: true,
      message: "Chat retrieved successfully",
      data: chats,
    });
  }
);
