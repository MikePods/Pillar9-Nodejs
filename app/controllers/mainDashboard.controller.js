const MainDashboard = require("../models/mainDashboard.model");

const mainDashboardController = {};
// Create or Update the Main Dashboard
mainDashboardController.createOrUpdate = async (req, res) => {
	// #swagger.tags = ['Main Dashboard']
	// #swagger.summary = 'Create or update Main Dashboard'
	try {
		const defaultLayout = [
			{ i: "box1", x: 0, y: 0, w: 12, h: 8, isDraggable: true, isResizable: true },
			{ i: "box2", x: 0, y: 8, w: 6, h: 8, isDraggable: true, isResizable: true },
			{ i: "box3", x: 6, y: 8, w: 6, h: 8, isDraggable: true, isResizable: true },
			{ i: "box4", x: 0, y: 16, w: 8, h: 8, isDraggable: true, isResizable: true },
			{ i: "box5", x: 8, y: 16, w: 4, h: 8, isDraggable: true, isResizable: true },
		];

		const { widgets, layout } = req.body;
		const createdBy = req.query.userId;

		if (!createdBy) {
			return res.status(400).json({ success: false, message: "User ID is required" });
		}

		// Check if the main dashboard already exists for the user
		let dashboard = await MainDashboard.findOne({ createdBy });

		// Map the layout and widgets to enforce the isLocked behavior
		const adjustedLayout = (layout ?? defaultLayout).map((item, index) => {
			const widget = widgets[index];
			if (widget?.isLocked) {
				return { ...item, isDraggable: false, isResizable: false };
			} else {
				return { ...item, isDraggable: true, isResizable: true };
			}
		});

		if (dashboard) {
			// Update the existing dashboard
			dashboard.widgets = widgets
				? widgets.map((widget) => ({
						name: widget.name,
						isLocked: widget.isLocked ?? false,
						isCollapsed: widget.isCollapsed ?? false,
				  }))
				: dashboard.widgets;
			dashboard.layout = adjustedLayout;

			await dashboard.save();

			// Populate createdBy
			dashboard = await dashboard.populate("createdBy", "name email username profilePic");
		} else {
			// Create a new dashboard
			dashboard = await MainDashboard.create({
				widgets: widgets.map((widget) => ({
					...widget,
					isLocked: widget.isLocked ?? false,
					isCollapsed: widget.isCollapsed ?? false,
				})),
				layout: adjustedLayout,
				createdBy,
			});

			// Populate createdBy
			dashboard = await MainDashboard.findById(dashboard._id).populate(
				"createdBy",
				"name email username profilePic"
			);
		}

		res.status(200).json({
			success: true,
			message: "Main Dashboard created or updated successfully",
			data: dashboard,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Get the Main Dashboard for a user
mainDashboardController.getUserDashboard = async (req, res) => {
	// #swagger.tags = ['Main Dashboard']
	// #swagger.summary = 'Get user's Main Dashboard'
	try {
		const dashboard = await MainDashboard.findOne({ createdBy: req.query.userId }).populate(
			"createdBy",
			"name email username profilePic"
		);

		if (!dashboard) {
			return res.status(404).json({ success: false, message: "Main Dashboard not found,Please create" });
		}

		res.status(200).json({
			success: true,
			data: dashboard,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};



module.exports = mainDashboardController;
