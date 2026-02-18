const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const { getAllUsers, getAllWorkers, verifyWorker,
  getAllRequests, rejectWorker, toggleUserStatus,
  toggleWorkerStatus, getAdminStats, } = require("../controller/adminController");

// View all users
router.get("/users", auth, role(["admin"]), getAllUsers);

// View all workers
router.get("/workers", auth, role(["admin"]), getAllWorkers);

// Verify worker
router.patch("/worker/:id/verify",auth,role(["admin"]),verifyWorker);

// (Optional) View all service requests
router.get("/requests", auth, role(["admin"]), getAllRequests);

router.patch("/worker/:id/reject",auth,role(["admin"]),rejectWorker);

router.patch("/user/:id/toggle-status",auth,role(["admin"]),toggleUserStatus);

router.patch("/worker/:id/toggle-status",auth,role(["admin"]),toggleWorkerStatus);

router.get("/stats",auth,role(["admin"]),getAdminStats);


module.exports = router;