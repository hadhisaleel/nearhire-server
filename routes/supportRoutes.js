const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { uploadSupport } = require("../middleware/upload");

const {
    createTicket,
    getAllTickets,
    resolveTicket,
} = require("../controller/supportController");

// User & Worker create ticket
router.post("/", auth, role(["user", "worker"]), uploadSupport.single("attachment"), createTicket);

// Admin views tickets
router.get("/", auth, role(["admin"]), getAllTickets);

// Admin resolves ticket
router.patch("/:id/resolve", auth, role(["admin"]), resolveTicket);

module.exports = router;