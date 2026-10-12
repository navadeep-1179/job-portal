const express = require("express");
const User = require("../models/User");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/profile", protect, allowRoles("jobseeker"), (req, res) => {
  res.json({ user: req.user });
});

router.patch("/profile", protect, allowRoles("jobseeker"), async (req, res, next) => {
  try {
    const allowed = ["name", "skills", "experience", "education"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Provide at least one profile field to update" });
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });
    res.json({ message: "Profile updated", user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;