const ServiceRequest = require("../models/ServiceRequest");
const Worker = require("../models/Worker");


// ================= GET MY REQUESTS =================

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      worker: req.user.id,
    })
      .populate("user", "name phone isActive")
      .sort({ createdAt: -1 });

    res.json(requests);

  } catch {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};


// ================= ACCEPT REQUEST =================

exports.acceptRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate("user", "isActive");

    if (!request || request.worker.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be accepted",
      });
    }

    // Prevent accepting blocked users
    if (!request.user.isActive) {
      return res.status(400).json({
        message: "Cannot accept request from blocked user",
      });
    }

    request.status = "accepted";
    request.acceptedAt = new Date();

    await request.save();

    res.json({ message: "Request accepted", request });

  } catch {
    res.status(500).json({ message: "Failed to accept request" });
  }
};


// ================= REJECT REQUEST =================

exports.rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await ServiceRequest.findById(req.params.id);

    if (!request || request.worker.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be rejected",
      });
    }

    request.status = "rejected";
    request.rejectionReason = reason || null;

    await request.save();

    res.json({ message: "Request rejected", request });

  } catch {
    res.status(500).json({ message: "Failed to reject request" });
  }
};


// ================= COMPLETE REQUEST =================

exports.completeRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request || request.worker.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({
        message: "Only accepted requests can be completed",
      });
    }

    request.status = "completed";
    request.completedAt = new Date();

    await request.save();

    res.json({ message: "Job marked as completed", request });

  } catch {
    res.status(500).json({ message: "Failed to complete job" });
  }
};


// ================= UPDATE AVAILABILITY =================

exports.updateAvailability = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    worker.availability = req.body.availability;
    await worker.save();

    res.json({
      message: "Availability updated",
      availability: worker.availability,
    });

  } catch {
    res.status(500).json({ message: "Failed to update availability" });
  }
};


// ================= UPDATE PROFILE =================

exports.updateProfile = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const { skill, experience, location } = req.body;

    if (skill !== undefined) worker.skill = skill;
    if (experience !== undefined) worker.experience = experience;
    if (location !== undefined) worker.location = location;

    await worker.save();

    res.json({
      message: "Profile updated successfully",
      worker,
    });

  } catch {
    res.status(500).json({ message: "Failed to update profile" });
  }
};


// ================= GET PROFILE =================

exports.getProfile = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user.id).select("-password");

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    res.json(worker);

  } catch {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};


// ================= UPLOAD ID PROOF =================

exports.uploadIdProof = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user.id);

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    worker.verification = {
      documentUrl:` /uploads/ids/${req.file.filename}`,
      status: "pending",
      rejectionReason: null,
      submittedAt: new Date(),
    };

    worker.isVerified = false;

    await worker.save();

    res.json({
      message: "ID proof uploaded",
      verification: worker.verification,
    });

  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};


// ================= GET VERIFICATION STATUS =================

exports.getVerificationStatus = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user.id)
      .select("verification isVerified");

    res.json(worker);

  } catch {
    res.status(500).json({ message: "Failed to fetch verification status" });
  }
};