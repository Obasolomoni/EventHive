
import { Router } from "express";
import { register, login } from "../controllers/authcontroller.js";

const router = Router();

// Register a new user
router.post("/register", register);

// Login an existing user
router.post("/login", login);

export default router;
