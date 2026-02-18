const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Worker = require("../models/Worker");
const Admin = require("../models/Admin");


const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const account =
  decoded.role === "user"
    ? await User.findById(decoded.id)
    : decoded.role === "worker"
      ? await Worker.findById(decoded.id)
      : decoded.role === "admin"
        ? await Admin.findById(decoded.id)
        : null;

    if (!account) {
      return res.status(401).json({ message: "Account not found" });
    }

    if (account.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is blocked",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;