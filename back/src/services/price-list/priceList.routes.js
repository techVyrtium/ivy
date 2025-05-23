import express from "express";
const router = express.Router();

import * as priceListController from "./priceLIst.controller.js";

// routes
router.get("/", priceListController.getPriceList);

export default router;
