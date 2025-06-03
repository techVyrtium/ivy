import jwt from "jsonwebtoken";
import { env } from "../Config/config.js";

const setCookiesAndSendResponse = (res, payload) => {
  const { code, success, message, token, data } = payload || {};
  let jwt_token = null;

  if (token) {
    jwt_token = jwt.sign(token, env.jwt_secret, { expiresIn: "365d" });

    res.cookie("ivy-auth-token", jwt_token, {
      httpOnly: false,
      secure: process.env.ISPRODUCTION, // Set to true in production
      sameSite: false, // Adjust as needed
      maxAge: 365 * (24 * 60 * 60 * 1000), // 365 days
    });
  }

  return res.status(code || 200).json({
    success: success || true,
    message: message || "",
    data: data || null,
    jwt_token,
  });
};

export default setCookiesAndSendResponse;
