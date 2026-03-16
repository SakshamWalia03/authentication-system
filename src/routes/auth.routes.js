import express from "express";
import authController from "../controller/auth.controller.js";
import { validateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/details", validateUser, authController.getDetails);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", validateUser, authController.logout);
router.post("/logout-all", validateUser, authController.logoutAll);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-otp", authController.resendOTP);


export default router;
