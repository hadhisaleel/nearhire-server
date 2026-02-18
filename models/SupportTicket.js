const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
    {
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "role",
        },

        role: {
            type: String,
            enum: ["User", "Worker"],
            required: true,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        attachment: String,

        status: {
            type: String,
            enum: ["open", "resolved"],
            default: "open",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);