import { env } from "../../Config/config.js";
import Chat from "../../models/chat.model.js";
import { Client } from "../../models/client.model.js";
import Message from "../../models/message.model.js";
import axiosInstance from "../../utilities/axiosInstance.js";
import catchAsync from "../../utilities/catchAsync.js";
import sendResponse from "../../utilities/sendResponse.js";
import jwt from "jsonwebtoken";

// question from client
export const clientAskAgent = catchAsync(async (req, res, next) => {
  const deviceShortInfo = req.deviceShortInfo;
  const { sessionId, role, sessionType } = req.token;

  const { message, receiver } = req.body || {};

  if (!message || typeof message !== "string") {
    return next({ message: "Message is required", code: 400 });
  }

  // checking if client available
  const client = await Client.findOne({ session_id: sessionId }).select(
    "-registrationDate"
  );

  let chat = await Chat.findOne({ session_id: sessionId });

  if (!chat) {
    chat = await Chat.create({
      session_id: sessionId,
      deviceInfo: deviceShortInfo,
      messages: [],
    });
  }

  const newClientMessage = await Message.create({
    chat_id: chat._id,
    sender: "client",
    receiver: receiver || "ai agent",
    message,
  });

  chat.messages.push(newClientMessage._id);

  let response;

  let jwtToken = "";
  if (sessionType === "verified") {
    jwtToken = req.header("Authorization")?.replace("Bearer ", "");
  } else {
    const token = { sessionId, role: "user", sessionType: "verified" };
    jwtToken = jwt.sign(token, env.jwt_secret, { expiresIn: "365d" });
  }

  const old_messages = await Message.find({ chat_id: chat._id })
    .sort({ createdAt: -1 })
    .skip(1)
    .limit(5)
    .select("sender message -_id");

  // sending query to ai agent
  response = await axiosInstance.post(
    "/",
    {
      message,
      sessionId: sessionId,
      client,
      five_prev_messages: old_messages,
    },
    {
      dynamicToken: jwtToken,
    }
  );

  if (!response.data?.output) {
    return next({ message: "Invalid response from AI agent" });
  }

  const newAgentMessage = await Message.create({
    chat_id: chat._id,
    sender: "ai agent",
    receiver: "client",
    message: response?.data?.output || null,
  });

  chat.messages.push(newAgentMessage._id);

  await chat.save();

  return sendResponse(res, {
    code: 200,
    success: true,
    message: "Response from AI agent",
    data: {
      response: response?.data?.output || null,
      processingStatus: "success",
      timestamp: null,
      folderUrl: null,
    },
  });
});

// get my conversation
export const getMyConversation = catchAsync(async (req, res, next) => {
  const token = req.token;
  const page = parseInt(req.query?.page || 1);
  const limit = parseInt(req.query?.limit || 10000);
  const skip = (page - 1) * limit;
  const id = token.sessionId;

  if (!token?.sessionType || token?.sessionType !== "verified") {
    return sendResponse(res, {
      code: 200,
      success: true,
      message: "Session is not verified. You will be treated as new user",
      data: { messages: [] },
      pagination: {
        page,
        limit,
        total: 0,
      },
    });
  }

  const client = await Client.findOne({ session_id: id });

  if (!client) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: "Client not found",
      data: { messages: [] },
      remove_token: true,
      pagination: {
        page,
        limit,
        total: 0,
      },
    });
  }

  const chat = await Chat.findOne({ session_id: id });

  if (!chat) {
    return sendResponse(res, {
      code: 404,
      success: false,
      message: "Chat session not found",
      data: { messages: [] },
      pagination: {
        page,
        limit,
        total: 0,
      },
    });
  }

  // const chats = await Chat.findOne({ session_id: id }).populate("messages");

  const messages = await Message.find({
    $or: [
      { chat_id: chat._id.toString() }, // String version
      { chat_id: chat._id }, // ObjectId version
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalMessages = await Message.countDocuments({ chat_id: chat._id });

  return sendResponse(res, {
    code: 200,
    success: true,
    message: "Chat retrieved successfully",
    data: { messages: messages.reverse() },
    pagination: {
      page,
      limit,
      total: totalMessages,
    },
  });
});

// chat / all message of a conversation by session id
export const getConversationForASingleClientBySessionId = catchAsync(
  async (req, res, next) => {
    const token = req.token;
    const id = req.params.id;

    const page = parseInt(req.query?.page || 1);
    const limit = parseInt(req.query?.limit || 10000);
    const skip = (page - 1) * limit;

    const chat = await Chat.findOne({ session_id: id });

    if (!chat) {
      return sendResponse(res, {
        code: 404,
        success: false,
        message: "Chat session not found",
        data: { messages: [] },
        pagination: {
          page,
          limit,
          total: 0,
        },
      });
    }

    // const chats = await Chat.findOne({ session_id: id }).populate("messages");
    const messages = await Message.find({
      $or: [
        { chat_id: chat._id.toString() }, // String version
        { chat_id: chat._id }, // ObjectId version
      ],
    });

    const totalMessages = await Message.countDocuments({ chat_id: chat._id });

    return sendResponse(res, {
      code: 200,
      success: true,
      message: "Chat retrieved successfully",
      data: { messages: messages.reverse() },
      pagination: {
        page,
        limit,
        total: totalMessages,
      },
    });
  }
);
