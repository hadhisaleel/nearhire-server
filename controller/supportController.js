const SupportTicket = require("../models/SupportTicket");

exports.createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject and description required",
      });
    }

    const ticket = await SupportTicket.create({
      raisedBy: req.user.id,
      role: req.user.role === "user" ? "User" : "Worker", // ✅ FIXED
      subject,
      description,
      attachment: req.file
        ? `/uploads/tickets/${req.file.filename}`
        : null,
    });

    res.json({
      success: true,
      message: "Ticket submitted successfully",
      data: ticket,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to submit ticket",
    });
  }
};



exports.getAllTickets = async (req, res) => {
    const tickets = await SupportTicket.find()
        .populate("raisedBy", "name email")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: tickets,
    });
};

exports.resolveTicket = async (req, res) => {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            message: "Ticket not found",
        });
    }

    ticket.status = "resolved";
    await ticket.save();

    res.json({
        success: true,
        message: "Ticket marked as resolved",
    });
};