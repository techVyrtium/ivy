import jwt from "jsonwebtoken";
import { env } from "../Config/config.js";
import sendResponse from "../utilities/sendResponse.js";

const authenticateUserMiddleware = (req, res, next) => {
  const token = req.cookies?.["ivy-auth-token"];

  try {
    if (token) {
      const decoded = jwt.verify(token, env.jwt_secret);
      if (!decoded) {
        return sendResponse(res, {
          status: false,
          message: "Unauthorized access!",
          code: 403,
        });
      }

      req.id = decoded.id;
      next();
    } else {
      return sendResponse(res, {
        status: false,
        message: "Forbidden access!",
        code: 401,
      });
    }
  } catch (err) {
    next(err);
  }
};

export default authenticateUserMiddleware;
