const Dashboard = require("../models/dashboard.model");
const User = require("../models/user.model");

const dashboardController = {};

const sendEmail = require("../utils/sendEmail");

dashboardController.create = async (req, res) => {
	// #swagger.tags = ['Dashboard']
	// #swagger.summary = 'Create Dashboards'
	// #swagger.security = [{"apiKeyAuth": []}]
	const defaultLayout = [
		{ i: "box1", x: 0, y: 0, w: 12, h: 3, isDraggable: true, isResizable: true },
		{ i: "box2", x: 0, y: 3, w: 6, h: 3, isDraggable: true, isResizable: true },
		{ i: "box3", x: 6, y: 3, w: 6, h: 3, isDraggable: true, isResizable: true },
		{ i: "box4", x: 0, y: 6, w: 8, h: 3, isDraggable: true, isResizable: true },
		{ i: "box5", x: 8, y: 6, w: 4, h: 3, isDraggable: true, isResizable: true },
	];

	try {
		const { title, widgets, layout } = req.body;
		const createdBy = req.authID;

		const adjustedLayout = (layout ?? defaultLayout).map((item, index) => {
			const widget = widgets[index];
			return widget?.isLocked
				? { ...item, isDraggable: false, isResizable: false }
				: { ...item, isDraggable: true, isResizable: true };
		});

		const newDashboard = await Dashboard.create({
			title,
			widgets: widgets.map((widget) => ({
				...widget,
				isLocked: widget.isLocked ?? false,
				isCollapsed: widget.isCollapsed ?? false,
			})),
			layout: adjustedLayout,
			createdBy,
		});

		// Respond to the client immediately
		res.status(201).json({
			success: true,
			message: "Dashboard created successfully",
			data: newDashboard,
		});

		// Handle email sending in the background
		setImmediate(async () => {
			try {
				const user = await User.findById(createdBy).select("email name userName");

				// Send email to the user
				const userContent = `
                    <p>Hi ${user.name},</p>
                    <p>Your dashboard titled "<b>${title}</b>" has been created successfully.</p>
                    <p>Thank you for using our platform!</p>
                `;
				await sendEmail(user.email, "Dashboard Creation Successful", userContent);

				// Send email to the admin
				const adminEmail = "rishab@pods365.com";
				const adminContent = `
                    <p>Hi Admin,</p>
                    <p>User <b>${user.name}</b> has created a new dashboard titled "<b>${title}</b>".</p>
                    <p>Please review the details if necessary.</p>
                `;
				await sendEmail(adminEmail, "New Dashboard Created", adminContent);
			} catch (error) {
				console.error("Error sending emails:", error);
			}
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

dashboardController.createForUser = async (req, res) => {
	// #swagger.tags = ['Dashboard']
	// #swagger.summary = 'Create a dashboard for a user from Super Admin'
	// #swagger.security = [{"apiKeyAuth": []}]
	const defaultLayout = [
		{ i: "box1", x: 0, y: 0, w: 12, h: 3, isDraggable: true, isResizable: true },
		{ i: "box2", x: 0, y: 3, w: 6, h: 3, isDraggable: true, isResizable: true },
		{ i: "box3", x: 6, y: 3, w: 6, h: 3, isDraggable: true, isResizable: true },
		{ i: "box4", x: 0, y: 6, w: 8, h: 3, isDraggable: true, isResizable: true },
		{ i: "box5", x: 8, y: 6, w: 4, h: 3, isDraggable: true, isResizable: true },
	];

	try {
		const { title, widgets, layout, createdBy } = req.body;

		const adjustedLayout = (layout ?? defaultLayout).map((item, index) => {
			const widget = widgets[index];
			return widget?.isLocked
				? { ...item, isDraggable: false, isResizable: false }
				: { ...item, isDraggable: true, isResizable: true };
		});

		const newDashboard = await Dashboard.create({
			title,
			widgets: widgets.map((widget) => ({
				...widget,
				isLocked: widget.isLocked ?? false,
				isCollapsed: widget.isCollapsed ?? false,
			})),
			layout: adjustedLayout,
			createdBy,
		});

		// Respond to the client immediately
		res.status(201).json({
			success: true,
			message: "Dashboard created successfully..",
			data: newDashboard,
		});

		// Handle email sending in the background
		setImmediate(async () => {
			try {
				const user = await User.findById(createdBy).select("email name userName");

				// Send email to the user
				const userContent = `
                    <p>Hi ${user.name},</p>
                    <p>Dashboard titled "<b>${title}</b>" has been created for you.</p>
                    <p>Please review the details if necessary!</p>
                    <p>Thank you for using our platform!</p>
                `;
				await sendEmail(user.email, "Dashboard Creation Successful", userContent);

				// Send email to the admin
				const adminEmail = "rishab@pods365.com";
				const adminContent = `
                    <p>Hi Admin,</p>
                    <p>A Dashboard for <b>${user.name}</b> has been created successfully titled "<b>${title}</b>".</p>
                    <p>Please review the details if necessary.</p>
                `;
				await sendEmail(adminEmail, "New Dashboard Created", adminContent);
			} catch (error) {
				console.error("Error sending emails:", error);
			}
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Get all dashboards with sorting, grouping, and pagination
dashboardController.getAll = async (req, res) => {
	// #swagger.tags = ['Dashboard']
	// #swagger.summary = 'Get all Dashboards'
	// #swagger.security = [{"apiKeyAuth": []}]
	try {
		const { page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		// Fetch all dashboards, sort by createdAt, group by createdBy, and paginate
		const dashboards = await Dashboard.aggregate([
			{
				$group: {
					_id: "$createdBy", // Group by createdBy
					dashboards: { $push: "$$ROOT" }, // Push all matching dashboards into an array
				},
			},
			{
				$project: {
					createdBy: "$_id", // Rename _id to createdBy
					dashboards: 1, // Include dashboards in the output
					_id: 0, // Exclude _id from the output
				},
			},
			{
				$sort: { createdAt: -1 }, 
			},
			{
				$skip: skip, 
			},
			{
				$limit: parseInt(limit), 
			},
		]);

		const populatedDashboards = await Dashboard.populate(dashboards, {
			path: "createdBy",
			select: "name email userName profilePic createdAt", 
			model: "User", 
		});

		// Count total unique users who created dashboards
		const totalUsers = await Dashboard.distinct("createdBy").then((users) => users.length);

		res.status(200).json({
			success: true,
			page,
			limit,
			totalUsers,
			data: populatedDashboards,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Get all dashboards  of a user
dashboardController.getUserDashboards = async (req, res) => {
	// #swagger.tags = ['Dashboard']
	// #swagger.summary = 'Get all Dashboards of a user'
	// #swagger.security = [{"apiKeyAuth": []}]
	try {
		const { id } = req.params;
		const userType = req.userType;

		console.log(req.authID, id);
		if (userType === "User") {
			if (req.authID !== id) {
				return res.status(403).json({ status: false, message: "You are not Authorized to access another users dashboard..." });
			}
		}
		const dashboards = await Dashboard.find({ createdBy: id }).populate("createdBy", "name email username profilePic");

		res.status(200).json({
			success: true,
			data: dashboards,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Get a dashboard by ID
dashboardController.getById = async (req, res) => {
	// #swagger.tags = ['Dashboard']
	// #swagger.summary = 'Get a Dashboard by ID'
	// #swagger.security = [{"apiKeyAuth": []}]
	try {
		const { id } = req.params;

		const dashboard = await Dashboard.findById(id).populate("createdBy", "name email username profilePic");

		if (!dashboard) {
			return res.status(404).json({ success: false, message: "Dashboard not found" });
		}

		res.status(200).json({
			success: true,
			data: dashboard,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Update a dashboard
dashboardController.update = async (req, res) => {
	// #swagger.tags = ['Dashboard']
	// #swagger.summary = 'Update a Dashboard'

	try {
		const { id } = req.params;
		const { widgets, layout, title } = req.body;

		// Map the layout and widgets to enforce the isLocked behavior
		const adjustedLayout = layout.map((item, index) => {
			const widget = widgets[index];
			if (widget?.isLocked) {
				return { ...item, isDraggable: false, isResizable: false };
			} else return { ...item };
		});

		const updates = {
			title,
			widgets: widgets
				? widgets.map((widget) => ({
						name: widget.name,
						isLocked: widget.isLocked ?? false,
						isCollapsed: widget.isCollapsed ?? false,
				  }))
				: undefined,
			layout: adjustedLayout,
		};

		const updatedDashboard = await Dashboard.findByIdAndUpdate(id, updates, { new: true });

		if (!updatedDashboard) {
			return res.status(404).json({ success: false, message: "Dashboard not found" });
		}

		res.status(200).json({
			success: true,
			message: "Dashboard updated successfully",
			data: updatedDashboard,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Delete a dashboard permanently
dashboardController.delete = async (req, res) => {
	// #swagger.tags = ['Dashboard']
	// #swagger.summary = 'Delete a Dashboard'
	// #swagger.security = [{"apiKeyAuth": []}]
	try {
		const { id } = req.params;

		// if (req.authID) {
		// 	console.log(id, req.authID);
		// 	return res.status(404).json({ success: false, message: "You are not authorized to delete..." });
		// }

		const deletedDashboard = await Dashboard.findByIdAndDelete(id);

		if (!deletedDashboard) {
			return res.status(404).json({ success: false, message: "Dashboard not found" });
		}

		res.status(200).json({
			success: true,
			message: "Dashboard deleted permanently",
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = dashboardController;
