import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });
export const env = {
  port: process.env.PORT || 5000,
  database_url: process.env.DB_URL,
  backend_url: process.env.BACKEND_URL,
  salt: parseInt(process.env.BCRYPT_SALT),
  jwt_secret: process.env.JWT_SECRET,
  isProduction: process.env.ISPRODUCTION,
};
