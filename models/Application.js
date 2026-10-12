const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  jobSeeker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  coverLetter: { type: String, trim: true, maxlength: 3000, default: "" },
  status: {
    type: String,
    enum: ["submitted", "reviewing", "shortlisted", "rejected", "accepted"],
    default: "submitted"
  }
}, { timestamps: true });

applicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);