const User = require("../models/user.model");
const { imageUpload } = require("../utils/imageUpload");

const userController = {};

userController.login = async (req, res) => {
	// #swagger.tags = ['User']
	// #swagger.summary = 'User Login'
	try {
		const { email, password } = req.body;

		if (!email || !password) return res.status(404).send({ status: false, msg: "Please provide a email or password !!" });
		const userRecord = await User.findOne({ email });

		if (!userRecord) return res.status(400).send({ status: false, msg: "No user found !!", data: null });

		if (!userRecord.validPassword(password)) {
			return res.status(400).send({
				status: 0,
				message: "Please enter the correct password",
				error: "Invalid password",
			});
		}
		const token = userRecord.generateJWT();

		return res.status(200).send({ status: true, msg: "Login successfully !!", data: { user: userRecord, token } });
	} catch (error) {
		console.log(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

userController.create = async (req, res) => {
	// #swagger.tags = ['User']
	// #swagger.summary = 'User Create'
	try {
		const { name, email, password, phone, userName, address, country, city, pinCode, state } = req.body;

		if (!email || !password) return res.status(404).send({ status: false, msg: "Please provide a email and password !!" });
		const findUser = await User.findOne({ email });

		if (findUser) return res.status(200).send({ status: false, msg: "User already exits !!", data: null });

		let ImageUrl = "";
		if (req.file) {
			// console.log(req.file);
			ImageUrl = await imageUpload(req.file, req.file.originalname, "Users Profile");
		}

		const user = new User({
			name,
			email,
			password,
			phone,
			userName,
			address,
			country,
			city,
			pinCode,
			state,
			profilePic: ImageUrl,
		});

		if (password) {
			user.password = user.generateHash(password);
		}

		const userData = await user.save();

		return res.status(200).send({ status: true, msg: "User created successfully !!", data: userData });
	} catch (error) {
		console.log(error);
		res.status(500).send({ status: false, msg: error.message });
	}
};

userController.update = async (req, res) => {
	// #swagger.tags = ['User']
	// #swagger.summary = 'User Update'
	// #swagger.security = [{"apiKeyAuth": []}]
	try {
		const id = req.authID;
		const { email, password, ...updateData } = req.body;

		// Find the user to be updated
		const userRecord = await User.findById(id);
		if (!userRecord) {
			return res.status(404).send({
				status: false,
				msg: "User not found !!",
			});
		}

		// Prevent updating email and password
		if (email || password) {
			return res.status(400).send({
				status: false,
				msg: "Email and password cannot be updated through this endpoint.",
			});
		}

		// Update other user details
		Object.keys(updateData).forEach((key) => {
			userRecord[key] = updateData[key];
		});

		let ImageUrl = "";
		if (req.file) {
			// console.log(req.file);
			ImageUrl = await imageUpload(req.file, req.file.originalname, "Users Profile");
			userRecord.profilePic = ImageUrl;
		}

		// Save updated user data
		const updatedUser = await userRecord.save();

		return res.status(200).send({
			status: true,
			msg: "User updated successfully !!",
			data: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).send({
			status: false,
			msg: "Error updating user",
			error: error.message,
		});
	}
};

userController.delete = async (req, res) => {
	// #swagger.tags = ['User']
	// #swagger.summary = 'User Delete'
	try {
		const { id } = req.params;

		const userRecord = await User.findOne({ _id: id });
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

module.exports = userController;
