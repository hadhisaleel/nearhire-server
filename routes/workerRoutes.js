const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { uploadId } = require("../middleware/upload");
const { uploadIdProof } = require("../controller/workerController");
;

const {
  getMyRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
  updateAvailability,
  getProfile,
  updateProfile,
  getVerificationStatus
} = require("../controller/workerController");

// ===== REQUESTS =====
router.get("/requests", auth, role(["worker"]), getMyRequests);
router.patch("/request/:id/accept", auth, role(["worker"]), acceptRequest);
router.patch("/request/:id/reject", auth, role(["worker"]), rejectRequest);
router.patch("/request/:id/complete", auth, role(["worker"]), completeRequest);

// ===== SETTINGS =====
router.patch("/availability", auth, role(["worker"]), updateAvailability);
router.get("/profile", auth, role(["worker"]), getProfile);
router.patch("/profile", auth, role(["worker"]), updateProfile);

// ===== ID VERIFICATION =====
router.post(
  "/upload-id",
  auth,
  role(["worker"]),
  uploadId.single("idProof"),
  uploadIdProof
);


router.get("/verification", auth, role(["worker"]), getVerificationStatus);


module.exports = router;