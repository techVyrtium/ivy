import express from "express";
const router = express.Router();
import chatBotRouter from "../services/chat-bot/chatBot.routes.js";
import clientRouter from "../services/client/client.routes.js";
// import priceLIstRouter from "../services/price-list/priceList.routes.js";

const moduleRouters = [
  {
    path: "/chat-bot",
    route: chatBotRouter,
  },
  {
    path: "/client",
    route: clientRouter,
  },
  // {
  //   path: "/price-list",
  //   route: priceLIstRouter,
  // },
];

moduleRouters.map((route) => router.use(route.path, route.route));

export default router;
