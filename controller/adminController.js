const User = require("../models/User");
const Worker = require("../models/Worker");
const ServiceRequest = require("../models/ServiceRequest");
const SupportTicket = require("../models/SupportTicket");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get all workers
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().select("-password");
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch workers" });
  }
};

// (Optional) View all service requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate("user", "name phone isActive")
      .populate("worker", "name skill isActive isVerified")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });

  } catch (err) {
    console.error("ADMIN REQUEST ERROR:", err); // 🔥 IMPORTANT
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};




// Verify worker


exports.verifyWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    if (!worker.verification || worker.verification.status !== "pending") {
      return res
        .status(400)
        .json({ message: "No pending verification request" });
    }

    worker.verification.status = "verified";   // 🔥 THIS WAS MISSING
    worker.verification.verifiedAt = new Date();
    worker.verification.reason = "";           // clear any old rejection
    worker.isVerified = true;

    await worker.save();

    res.json({
      message: "Worker verified successfully",
      worker,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify worker" });
  }
};


exports.rejectWorker = async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ message: "Rejection reason required" });
  }

  const worker = await Worker.findById(req.params.id);

  if (!worker || worker.verification.status !== "pending") {
    return res.status(400).json({ message: "No pending verification" });
  }

  worker.verification.status = "rejected";
  worker.verification.rejectionReason = reason;
  worker.isVerified = false;

  await worker.save();

  res.json({ message: "Worker verification rejected" });
};


exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "unblocked" : "blocked"} successfully`,
      data: { isActive: user.isActive },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

exports.toggleWorkerStatus = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    worker.isActive = !worker.isActive;
    await worker.save();

    res.json({
      success: true,
      message: `Worker ${worker.isActive ? "unblocked" : "blocked"} successfully`,
      data: { isActive: worker.isActive },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update worker status",
    });
  }
};


exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalWorkers,
      activeWorkers,
      blockedUsers,
      blockedWorkers,
      pendingVerifications,
      pendingRequests,
      completedRequests,
      rejectedRequests,
      openTickets,
    ] = await Promise.all([
      User.countDocuments(),
      Worker.countDocuments(),
      Worker.countDocuments({ availability: true, isActive: true }),
      User.countDocuments({ isActive: false }),
      Worker.countDocuments({ isActive: false }),
      Worker.countDocuments({ "verification.status": "pending" }),
      ServiceRequest.countDocuments({ status: "pending" }),
      ServiceRequest.countDocuments({ status: "completed" }),
      ServiceRequest.countDocuments({ status: "rejected" }),
      SupportTicket.countDocuments({ status: "open" }),
    ]);

    res.json({
      success: true,
      message: "Admin stats fetched successfully",
      data: {
        totalUsers,
        totalWorkers,
        activeWorkers,
        blockedUsers,
        blockedWorkers,
        pendingVerifications,
        pendingRequests,
        completedRequests,
        rejectedRequests,
        openTickets,
      },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
    });
  }
};