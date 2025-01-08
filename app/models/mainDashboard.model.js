const mongoose = require("mongoose");

const mainDashboardSchema = mongoose.Schema(
	{
		widgets: [
			{
				name: { type: String, required: true },
				isLocked: { type: Boolean, default: false },
				isCollapsed: { type: Boolean, default: false },
			},
		],
		layout: [
			{
				_id: false,
				i: { type: String, required: true },
				x: { type: Number, required: true },
				y: { type: Number, required: true },
				w: { type: Number, required: true },
				h: { type: Number, required: true },
				isDraggable: { type: Boolean, required: true },
				isResizable: { type: Boolean, required: true },
			},
		],
		createdBy: { type: mongoose.Schema.ObjectId, ref: "User" },
		isActive: { type: Boolean, default: true },
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("MainDashboard", mainDashboardSchema);
