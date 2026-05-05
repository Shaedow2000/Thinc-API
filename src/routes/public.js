import express from "express";

import {
  register,
  verification,
  reset_password_verification,
  resend_code,
  abortChangingPassword,
  login,
  reset_password,
  deleteAccountRequest,
  deleteAccountConfirmation,
  tokenAuth,
} from "../controllers/authController.js";

const publicRouter = express.Router();

publicRouter.post("/login", login);
publicRouter.post("/register", register);
publicRouter.post("/verify", verification);
publicRouter.post("/reverify", resend_code);
publicRouter.post("/reset_verification", reset_password_verification);
publicRouter.post("/abort", abortChangingPassword);

publicRouter.patch("/password_reset", reset_password);

publicRouter.get("/tokenAuth", tokenAuth);

publicRouter.post("/unregister", deleteAccountRequest);
publicRouter.delete("/confirmation", deleteAccountConfirmation);

export default publicRouter;
