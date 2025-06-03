import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { urlencoded } from "express";
import useragent from "express-useragent";
import { env } from "./Config/config.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import notFound from "./middlewares/notFound.js";
import router from "./routers/index.js";

import { app, server } from "./socket/socket.js";
import logger from "./Config/logger.js";
import connectDB from "./Config/connectDB.js";
import generateFingerPrint from "./utilities/generateFingerPrint.js";
// const app = express();
// app.use(cors());
const corsOptions = {
  origin: [
    "https://ivy-2d-entrega-front-git-main-camilo-vyrtiums-projects.vercel.app",
    "https://ivy-2d-entrega-front.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Set-Cookie",
    "cookie",
    "x-forwarded-for",
    "accept",
    "accept-encoding",
    "accept-language",
  ],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// Middleware to log incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Add as middleware
app.use(useragent.express());
// it will generate finger print for user
app.use(generateFingerPrint);

// Root route
app.get("/", (req, res) => {
  res.send("Welcome.....");
});

// All routes
app.use("/api/v1", router);

// Global error handler
app.use(globalErrorHandler);

// 404 not found handler
app.use(notFound);

// Start the server after DB connection
const startServer = async () => {
  try {
    // Ensure DB connection before starting the server
    await connectDB();
    // app.listen(env.port, () => {
    server.listen(env.port, () => {
      console.log(`App listening on port ${env.port}`);
      console.log("Backend URL: ", env.backend_url);
    });
  } catch (error) {
    console.error(
      "Failed to connect to the database or start the server:",
      error
    );
    process.exit(1); // Exit with failure if the connection or server setup fails
  }
};

// Call the function to start the server
startServer();
