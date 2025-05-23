import express from "express";
const router = express.Router();

import * as clientController from "./client.controller.js";

// routes
router.post("/create", clientController.createClient);
router.post("/create-by-n8n", clientController.createClientThroughN8N);
router.get("/clients", clientController.getAllClients);

export default router;
