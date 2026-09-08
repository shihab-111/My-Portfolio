import { Router } from "express";
import User from "../models/User.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Enter your email and password." });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  // Same message either way, so the response can't be used to probe for
  // which email addresses exist.
  const ok = user && (await user.verifyPassword(password));
  if (!ok) {
    return res.status(401).json({ error: "That email and password don't match." });
  }

  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

router.post("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "Use a new password of at least 8 characters." });
  }
  if (!(await req.user.verifyPassword(currentPassword || ""))) {
    return res.status(401).json({ error: "Your current password is incorrect." });
  }

  req.user.passwordHash = await User.hashPassword(newPassword);
  await req.user.save();
  res.json({ ok: true });
});

export default router;
