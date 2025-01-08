const mongoose = require("mongoose");

const widgetRequestSchema = mongoose.Schema(
	{
		email: { type: String },
		type: { type: String, required: true },
		details: { type: String },
		status: { type: String, enum: ["requested", "created"], default: "requested" },
		requestedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("WidgetRequest", widgetRequestSchema);
