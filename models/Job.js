const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  companyName: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 10000 },
  location: { type: String, required: true, trim: true },
  employmentType: {
    type: String,
    required: true,
    enum: ["full-time", "part-time", "internship", "contract"]
  },
  salaryRange: {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 }
  },
  requiredSkills: [{ type: String, trim: true }],
  experienceRequired: { type: Number, min: 0, default: 0 },
  postedDate: { type: Date, default: Date.now },
  applicationDeadline: { type: Date },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

jobSchema.pre("validate", function () {
  if (this.salaryRange?.min != null && this.salaryRange?.max != null &&
      this.salaryRange.max < this.salaryRange.min) {
    this.invalidate("salaryRange.max", "Maximum salary must be at least the minimum salary");
  }
});

module.exports = mongoose.model("Job", jobSchema);

 