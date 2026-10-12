const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const educationSchema = new mongoose.Schema({
  qualification: { type: String, trim: true },
  institution: { type: String, trim: true },
  year: { type: Number, min: 1900, max: 2100 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["jobseeker", "employer", "admin"], default: "jobseeker" },
  skills: [{ type: String, trim: true }],
  experience: { type: Number, min: 0, default: 0 },
  education: [educationSchema],
  status: { type: String, enum: ["active", "blocked"], default: "active" }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model("User", userSchema);


