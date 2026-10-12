const express = require("express");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.use(protect, allowRoles("admin"));

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    next(error);
  }
});

router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ message: "Status must be active or blocked" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot change your own account status" });
    }
    user.status = status;
    await user.save();
    res.json({ message: "User status updated", user });
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const jobs = await Job.find({ employer: user._id }).select("_id");
    const jobIds = jobs.map(job => job._id);
    await Application.deleteMany({ $or: [{ jobSeeker: user._id }, { job: { $in: jobIds } }] });
    await Job.deleteMany({ employer: user._id });
    await user.deleteOne();
    res.json({ message: "User and related data deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/jobs", async (req, res, next) => {
  try {
    const jobs = await Job.find().populate("employer", "name email").sort({ createdAt: -1 });
    res.json({ count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
});

router.get("/jobs/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ job });
  } catch (error) {
    next(error);
  }
});

router.delete("/jobs/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();
    res.json({ message: "Job removed by admin" });
  } catch (error) {
    next(error);
  }
});

router.get("/applications", async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate("job", "title companyName")
      .populate("jobSeeker", "name email")
      .sort({ createdAt: -1 });
    res.json({ count: applications.length, applications });
  } catch (error) {
    next(error);
  }
});

module.exports = router;