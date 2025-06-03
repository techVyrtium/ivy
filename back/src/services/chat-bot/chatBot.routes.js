import express from "express";
const router = express.Router();

import * as chatBotController from "./chatBot.controller.js";
import extractOrGenerateSessionId from "../../utilities/extractOrGenerateSessionId.js";

// routes
router.post(
  "/ask-to-agent",
  extractOrGenerateSessionId,
  chatBotController.clientAskAgent
);

router.get(
  "/conversation",
  extractOrGenerateSessionId,
  chatBotController.getMyConversation
);
router.get(
  "/conversation/:id",
  chatBotController.getConversationForASingleClientBySessionId
);

export default router;
