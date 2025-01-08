const WidgetRequest = require("../models/widgetRequests.model");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

const widgetRequestController = {};

widgetRequestController.create = async (req, res) => {
	// #swagger.tags = ['Widget']
	// #swagger.summary = 'Create Widget Request'
	// #swagger.security = [{"apiKeyAuth": []}]
	try {
		const { email, type, details } = req.body;
		const userId = req.authID;

		if (!email || !type || !details)
			return res.status(404).send({ status: false, msg: "Please provide an email, type, and details!" });

		const request = await WidgetRequest.create({ email, type, details, requestedBy: userId });
		res.status(200).send({ status: true, msg: "Request created successfully!", data: request });

		// Handle email sending in the background
		setImmediate(async () => {
			try {
				const user = await User.findById(userId).select("email name userName");

				// Email content for the user
				const userContent = `
					<p>Hi ${user.name},</p>
					<p>Your widget request of type "<b>${type}</b>" has been successfully submitted.</p>
					<p>Details of your request:</p>
					<ul>
						<li><b>Type:</b> ${type}</li>
						<li><b>Details:</b> ${details}</li>
					</ul>
					<p>We will process your request and get back to you soon.</p>
					<p>Thank you for using our platform!</p>
				`;

				// Send email to the user
				await sendEmail(user.email, "Widget Request Submitted", userContent);

				// Email content for the admin
				const adminEmail = "rishab@pods365.com";
				const adminContent = `
					<p>Hi Admin,</p>
					<p>A new widget request has been submitted by <b>${user.name}</b> (${user.userName}).</p>
					<p>Details of the request:</p>
					<ul>
						<li><b>Email:</b> ${email}</li>
						<li><b>Type:</b> ${type}</li>
						<li><b>Details:</b> ${details}</li>
					</ul>
					<p>Please review and take the necessary actions.</p>
				`;

				// Send email to the admin
				await sendEmail(adminEmail, "New Widget Request Submitted", adminContent);
			} catch (error) {
				console.error("Error sending emails:", error);
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

widgetRequestController.usersRequests = async (req, res) => {
	// #swagger.tags = ['Widget']
	// #swagger.summary = 'Get User Widget Requests'
	// #swagger.security = [{"apiKeyAuth": []}]
	try {
		const userId = req.authID;
		if (!userId) {
			return res.status(401).send({
				status: 0,
				message: "Unauthorized access. User ID not found.",
			});
		}

		const filter = { requestedBy: userId };
		if (req.query.status) filter.status = req.query.status;

		// Fetch widget requests for the specific user
		const requests = await WidgetRequest.find(filter)
			.select("-updatedAt -__v")
			.sort({ createdAt: -1 })
			.populate("requestedBy", "name email userName profilePic")
			.exec();

		res.status(200).send({
			status: 1,
			requests,
			message: "User's widget requests fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching user's requests:", error);
		res.status(400).send({
			status: 0,
			message: "Error fetching user's requests",
			error: error.message,
		});
	}
};
widgetRequestController.list = async (req, res) => {
	// #swagger.tags = ['Widget']
	// #swagger.summary = 'Get All Widget Requests'
	// #swagger.security = [{"apiKeyAuth": []}]
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const filter = {};
		if (req.query.status) filter.status = req.query.status;

		// Aggregation pipeline
		const pipeline = [
			{ $match: filter }, 
			{ $sort: { createdAt: -1 } },
			{
				$group: {
					_id: "$requestedBy", // Group by user ID
					requests: {
						$push: {
							email: "$email",
							type: "$type",
							details: "$details",
							profilePic: "$profilePic",
							status: "$status",
							createdAt: "$createdAt",
						},
					},
					totalRequests: { $sum: 1 }, // Count requests per user
				},
			},
			{
				$lookup: {
					from: "users", // Name of the user collection
					localField: "_id", // Match `requestedBy` (_id from grouping)
					foreignField: "_id", // `_id` in User collection
					as: "userDetails",
				},
			},
			{ $unwind: "$userDetails" }, // Unwind user details
			{
				$project: {
					_id: 0, // Exclude _id field
					userId: "$_id", // Include userId
					userDetails: { name: 1, email: 1, userName: 1, profilePic: 1 }, // Include specific user fields
					requests: 1,
					totalRequests: 1,
				},
			},
			{ $skip: skip }, // Skip for pagination
			{ $limit: limit }, // Limit for pagination
		];

		// Execute aggregation
		const groupedRequests = await WidgetRequest.aggregate(pipeline);

		// Count total unique users for pagination
		const totalUsers = await WidgetRequest.distinct("requestedBy", filter).then((users) => users.length);

		res.status(200).send({
			status: 1,
			totalUsers,
			currentPage: page,
			groupedRequests,
			message: "Grouped requests fetched successfully",
		});
	} catch (error) {
		console.error("Error fetching grouped requests:", error);
		res.status(400).send({
			status: 0,
			message: "Error fetching grouped requests",
			error: error.message,
		});
	}
};

module.exports = widgetRequestController;
