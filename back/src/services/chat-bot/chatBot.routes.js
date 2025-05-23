import express from "express";
const router = express.Router();

import * as chatBotController from "./chatBot.controller.js";

// routes
router.post("/ask-to-agent", chatBotController.clientAskAgent);
router.post("/ask-to-client", chatBotController.agentAskClient);
router.get(
  "/conversation/:id",
  chatBotController.getConversationForASingleClient
);

export default router;
