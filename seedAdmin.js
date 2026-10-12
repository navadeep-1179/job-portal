require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const run = async () => {
  try {
    if (!process.env.MONGO_URI || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD ||
        !process.env.ADMIN_NAME) {
      throw new Error("Set MONGO_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    }
    if (process.env.ADMIN_PASSWORD.length < 12) {
      throw new Error("ADMIN_PASSWORD must contain at least 12 characters");
    }

    await mongoose.connect(process.env.MONGO_URI);
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("An account with ADMIN_EMAIL already exists. No changes made.");
    } else {
      const admin = await User.create({
        name: process.env.ADMIN_NAME,
        email,
        password: process.env.ADMIN_PASSWORD,
        role: "admin"
      });
      console.log(`Admin account created: ${admin.email}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();