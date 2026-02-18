const ServiceRequest = require("../models/ServiceRequest");
const Worker = require("../models/Worker");


// ================= SEND SERVICE REQUEST =================

exports.sendServiceRequest = async (req, res) => {
  try {
    const { problemDescription, location, preferredDate } = req.body;

    if (!problemDescription || !preferredDate) {
      return res.status(400).json({
        success: false,
        message: "Problem description and date required",
      });
    }

    // Prevent duplicate active request
    const existingRequest = await ServiceRequest.findOne({
      user: req.user.id,
      worker: req.params.workerId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have an active request with this worker",
      });
    }

    const request = await ServiceRequest.create({
      user: req.user.id,
      worker: req.params.workerId,
      problemDescription,
      location,
      preferredDate,
    });

    res.status(201).json({
      success: true,
      message: "Service request sent successfully",
      data: request,
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to send request" });
  }
};


// ================= GET MY REQUESTS =================

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ user: req.userId })
      .populate("worker", "name skill location phone")
      .lean();

    // Hide phone unless accepted or completed
    const filtered = requests.map((reqItem) => {
      if (reqItem.status !== "accepted" && reqItem.status !== "completed") {
        if (reqItem.worker) {
          reqItem.worker.phone = undefined;
        }
      }
      return reqItem;
    });

    res.json(filtered);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};


// ================= GET VERIFIED WORKERS =================

exports.getVerifiedWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({
      isActive: true,                    // ✅ not blocked
      isVerified: true,                  // ✅ verified
      "verification.status": "verified", // ✅ verified status
      availability: true,                // ✅ currently working
    }).select("-password");

    res.json(workers);

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch workers",
    });
  }
};



// ================= RATE WORKER =================

exports.rateWorker = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (request.status !== "completed" || !request.completedAt) {
      return res.status(400).json({
        success: false,
        message: "Can only rate completed jobs",
      });
    }

    if (request.rating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this job",
      });
    }

    request.rating = rating;
    request.review = review;
    request.ratedAt = new Date();
    await request.save();

    const worker = await Worker.findById(request.worker);

    worker.ratingSum += rating;
    worker.totalRatings += 1;
    worker.rating = worker.ratingSum / worker.totalRatings;

    await worker.save();

    res.json({
      success: true,
      message: "Rating submitted successfully",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to submit rating",
    });
  }
};


// ================= GET TOP RATED WORKERS =================

exports.getTopRatedWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({
      isActive: true,
      isVerified: true,
      "verification.status": "verified",
      availability: true,
      totalRatings: { $gt: 0 },
    })
      .sort({ rating: -1 })
      .limit(5)
      .select("-password");

    res.json({
      success: true,
      data: workers,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch top workers",
    });
  }
};



// ================= CANCEL REQUEST =================

exports.cancelRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be cancelled",
      });
    }

    request.status = "cancelled";
    request.cancelledAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: "Request cancelled successfully",
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to cancel request" });
  }
};
