const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Please log in first" });
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Account is unavailable" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired authentication token" });
  }
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action" });
  }
  next();
};

module.exports = { protect, allowRoles };
