const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
	{
		name: { type: String, required: true },
		userName: { type: String, unique: true },
		email: { type: String, unique: true, required: true },
		profilePic: {
			type: String,
			default:
				"https://firebasestorage.googleapis.com/v0/b/file-upload-demo-213de.appspot.com/o/defaultAvatar.jpg?alt=media&token=56f59056-fc87-47cb-9f42-98f8406f892a",
		},
		phone: { type: String },
		address: { type: String },
		country: { type: String },
		city: { type: String },
		pinCode: { type: String },
		state: { type: String },
		password: { type: String },
		isActive: { type: Boolean, default: true },
		isDeleted: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

userSchema.index({ email: 1 });

userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.generateJWT = function () {
	return jwt.sign(
		{
			id: this._id,
			exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
		},
		"(m2H:)1=G:4`?|w"
	);
};

userSchema.methods.toAuthJSON = function () {
	return {
		_id: this._id,
		token: this.generateJWT(),
	};
};

userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
