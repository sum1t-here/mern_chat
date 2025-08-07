import express from "express";
import { loginUser, verifyUser } from "../controllers/user.controller.js";
const router = express.Router();
router.post("/login", loginUser);
router.post("/verify-user", verifyUser);
export default router;
