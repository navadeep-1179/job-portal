const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/:jobId", protect, allowRoles("jobseeker"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || job.status !== "open") {
      return res.status(404).json({ message: "Open job not found" });
    }
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({ message: "The application deadline has passed" });
    }
    const existing = await Application.findOne({ job: job._id, jobSeeker: req.user._id });
    if (existing) return res.status(409).json({ message: "You have already applied for this job" });

    const application = await Application.create({
      job: job._id,
      jobSeeker: req.user._id,
      coverLetter: req.body.coverLetter || ""
    });
    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    next(error);
  }
});

router.get("/mine", protect, allowRoles("jobseeker"), async (req, res, next) => {
  try {
    const applications = await Application.find({ jobSeeker: req.user._id })
      .populate("job")
      .sort({ createdAt: -1 });
    res.json({ count: applications.length, applications });
  } catch (error) {
    next(error);
  }
});

router.get("/job/:jobId", protect, allowRoles("employer", "admin"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (req.user.role === "employer" && String(job.employer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can view applications only for your own jobs" });
    }
    const applications = await Application.find({ job: job._id })
      .populate("jobSeeker", "name email skills experience education")
      .populate("job", "title companyName");
    res.json({ count: applications.length, applications });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", protect, allowRoles("employer", "admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["reviewing", "shortlisted", "rejected", "accepted"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Status must be reviewing, shortlisted, rejected or accepted" });
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (req.user.role === "employer" &&
        String(application.job.employer) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can update applications only for your own jobs" });
    }

    application.status = status;
    await application.save();
    res.json({ message: "Application status updated", application });
  } catch (error) {
    next(error);
  }
});

module.exports = router;