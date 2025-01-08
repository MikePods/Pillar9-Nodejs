const Admin = require("../models/admin.model");
const User = require("../models/user.model");
const { imageUpload } = require("../utils/imageUpload");

const adminController = {};

adminController.login = async (req, res) => {
	// #swagger.tags = ['Admin']
	// #swagger.summary = 'Admin Login'
	try {
		const { email, password } = req.body;

		if (!email || !password) return res.status(404).send({ status: false, msg: "Please provide a email or password !!" });
		const adminRecord = await Admin.findOne({ email });

		if (!adminRecord) return res.status(400).send({ status: false, msg: "No admin found for this email!!", data: null });

		if (!adminRecord.validPassword(password)) {
			return res.status(400).send({
				status: 0,
				message: "Please enter the correct password",
				error: "Invalid password",
			});
		}
		const token = adminRecord.generateJWT();

		return res.status(200).send({ status: true, msg: "Login successfully !!", data: { admin: adminRecord, token } });
	} catch (error) {
		console.log(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

adminController.create = async (req, res) => {
	// #swagger.tags = ['Admin']
	// #swagger.summary = 'Create Admin'
	try {
		const { name, email, password, phone, address, country, city, pinCode, state } = req.body;

		if (!email || !password) return res.status(404).send({ status: false, msg: "Please provide a email and password !!" });

		const findUser = await Admin.findOne({ email });

		if (findUser) return res.status(400).send({ status: false, msg: "Admin already exits !!", data: null });

		let ImageUrl = "";
		if (req.file) {
			// console.log(req.file);
			ImageUrl = await imageUpload(req.file, req.file.originalname, "Super Admins Profile");
		}

		const admin = new Admin({
			name,
			email,
			password,
			phone,
			address,
			country,
			city,
			pinCode,
			state,
			profilePic: ImageUrl,
		});

		if (password) {
			admin.password = admin.generateHash(password);
		}

		const adminData = await admin.save();
		return res.status(200).send({ status: true, msg: "Admin created successfully !!", data: adminData });
	} catch (error) {
		console.log(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

adminController.getAllUsers = async (req, res) => {
	// #swagger.tags = ['Admin']
	// #swagger.summary = 'Get All Users'
	// #swagger.security = [{"apiKeyAuth": []}]

	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		// Use Promise.all to execute both queries concurrently
		const [users, totalUsers] = await Promise.all([
			User.find({}).select("-password -createdAt -updatedAt -__v").skip(skip).limit(limit),
			User.countDocuments(),
		]);

		if (users.length === 0) {
			return res.status(204).send({
				status: false,
				msg: "No users found, please add users ...",
			});
		}

		return res.status(200).send({
			status: true,
			page,
			limit,
			totalUsers,
			users,
			msg: "Users fetched successfully!",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).send({ status: false, msg: error.message });
	}
};

adminController.delete = async (req, res) => {
	// #swagger.tags = ['Admin']
	// #swagger.summary = 'Delete Admin'

	try {
		const { id } = req.params;

		const userRecord = await Admin.findOne({ _id: id });
		if (!userRecord)
			return res.status(404).send({
				status: false,
				msg: "Invalid User !!",
			});

		await Admin.deleteOne({ _id: id });

		return res.status(200).send({
			status: true,
			msg: "User deleted successfully !!",
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

module.exports = adminController;
