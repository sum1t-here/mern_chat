import expres from "express";
import { isAuth } from "../middlewares/isAuth.middleware.js";
import { createNewChat, getAllChats } from "../controllers/chat.controller.js";
const router = expres.Router();
router.post("/chat/new", isAuth, createNewChat);
router.get("/chat/all", isAuth, getAllChats);
export default router;
