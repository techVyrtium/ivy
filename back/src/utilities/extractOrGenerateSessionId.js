import jwt from "jsonwebtoken";
import { env } from "../Config/config.js";
import { v4 as uuidv4 } from "uuid";
import { Client } from "../models/client.model.js";

export const generateNewToken = async (sessionType, role = "guest") => {
  let newSessionId = uuidv4();

  let clientInfo = await Client.findOne({
    session_id: newSessionId,
  });

  while (clientInfo) {
    newSessionId = uuidv4();
    clientInfo = await Client.findOne({
      session_id: newSessionId,
    });
  }

  return {
    sessionId: newSessionId,
    role: role,
    sessionType: sessionType, // tokenInvalid, tokenNotFound, verified
  };
};

const extractOrGenerateSessionId = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  try {
    if (token) {
      const decoded = jwt.verify(token, env.jwt_secret);
      req.token = decoded;
    } else {
      const newToken = await generateNewToken("tokenNotFound");
      req.token = newToken;
    }
    next(); // Don't forget to call next() on success
  } catch (err) {
    // Handle JWT errors (malformed, expired, etc.)
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      const newToken = await generateNewToken("tokenInvalid");
      req.token = newToken;
      next(); // Continue with new token
    } else {
      next(err); // Pass other errors to error handler
    }
  }
};

export default extractOrGenerateSessionId;
