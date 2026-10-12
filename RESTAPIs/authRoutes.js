const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

const createToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must contain at least 8 characters" });
    }
    if (role && !["jobseeker", "employer"].includes(role)) {
      return res.status(400).json({ message: "Role must be jobseeker or employer" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "Email is already registered" });

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role || "jobseeker"
    });

    const token = createToken(user);
    res.cookie("token", token, cookieOptions());
    res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.status !== "active") {
      return res.status(403).json({ message: "This account has been blocked" });
    }

    res.cookie("token", createToken(user), cookieOptions());
    res.json({ message: "Login successful", user });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax"
  });
  res.json({ message: "Logged out successfully" });
});

router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;