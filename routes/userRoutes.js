const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  sendServiceRequest,
  getMyRequests,
  getVerifiedWorkers,
  rateWorker,
  getTopRatedWorkers,
  cancelRequest,
} = require("../controller/userController");

// ================= SERVICE REQUESTS =================

// User sends request to specific worker
router.post("/request/:workerId", auth, role(["user"]), sendServiceRequest);

// User views their sent requests
router.get("/my-requests", auth, role(["user"]), getMyRequests);

// ================= WORKERS =================

// Get all verified & available workers
router.get("/workers", auth, role(["user"]), getVerifiedWorkers);

router.post("/request/:id/rate", auth, role(["user"]), rateWorker);

router.get("/top-rated", auth, role(["user"]), getTopRatedWorkers);

router.patch("/request/:id/cancel", auth, role(["user"]), cancelRequest);

module.exports = router;