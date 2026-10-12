const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = { status: "open" };
    if (req.query.search) {
      const search = String(req.query.search).trim();
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { requiredSkills: { $regex: search, $options: "i" } }
      ];
    }
    if (req.query.employmentType) filter.employmentType = req.query.employmentType;
    const jobs = await Job.find(filter).populate("employer", "name");
    res.json({ count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
});

router.get("/mine", protect, allowRoles("employer"), async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    res.json({ count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, allowRoles("employer"), async (req, res, next) => {
  try {
    const {
      title, companyName, description, location, employmentType, salaryRange,
      requiredSkills, experienceRequired, applicationDeadline, status
    } = req.body;

    if (!title || !companyName || !description || !location || !employmentType) {
      return res.status(400).json({
        message: "Title, company name, description, location and employment type are required"
      });
    }
    if (salaryRange?.min != null && salaryRange?.max != null && Number(salaryRange.max) < Number(salaryRange.min)) {
      return res.status(400).json({ message: "Maximum salary must be at least the minimum salary" });
    }
    if (applicationDeadline && new Date(applicationDeadline).toString() === "Invalid Date") {
      return res.status(400).json({ message: "Application deadline is invalid" });
    }

    const job = await Job.create({
      title, companyName, description, location, employmentType, salaryRange,
      requiredSkills, experienceRequired, applicationDeadline, status,
      employer: req.user._id
    });
    res.status(201).json({ message: "Job created", job });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer", "name");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ job });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", protect, allowRoles("employer", "admin"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (req.user.role === "employer" && String(job.employer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can update only your own jobs" });
    }

    const allowed = [
      "title", "companyName", "description", "location", "employmentType",
      "salaryRange", "requiredSkills", "experienceRequired", "applicationDeadline", "status"
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) job[key] = req.body[key];
    }
    await job.save();
    res.json({ message: "Job updated", job });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, allowRoles("employer", "admin"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (req.user.role === "employer" && String(job.employer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can delete only your own jobs" });
    }
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();
    res.json({ message: "Job deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;