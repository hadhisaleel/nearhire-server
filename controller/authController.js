const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Worker = require("../models/Worker");
const Admin = require("../models/Admin");


const JWT_SECRET = process.env.JWT_SECRET;


exports.register = async (req, res) => {
  try {
    const { role, name, email, phone, password } = req.body;

    if (!role || !name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "user") {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "User exists" });

      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
      });

      return res.status(201).json({ message: "User registered" });
    }

    if (role === "worker") {
      const existing = await Worker.findOne({ email });
      if (existing) return res.status(400).json({ message: "Worker exists" });

      const worker = await Worker.create({
        name,
        email,
        phone,
        password: hashedPassword,
        skill: "Not set",
        experience: 0,
      });

      return res.status(201).json({ message: "Worker registered" });
    }

    return res.status(400).json({ message: "Invalid role" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { role, email, password } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    let account;

    if (role === "user") {
      account = await User.findOne({ email });
    } else if (role === "worker") {
      account = await Worker.findOne({ email });
    } else if (role === "admin") {
      account = await Admin.findOne({ email });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (account.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by admin",
      });
    }


    const token = jwt.sign(
      {
        id: account._id,
        role: account.role,
        name: account.name || "Admin",
        email: account.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: account.role,
      name: account.name || "Admin",
      email: account.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};