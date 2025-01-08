require("dotenv").config();

module.exports = {
	MONGO_URL: process.env.MONGO_URL,
	PORT: process.env.PORT,
	JWT_SECRET: process.env.JWT_SECRET,
	SenderEmail: process.env.SenderEmail,
	SenderEmailPassword: process.env.SenderEmailPassword,
	DefaultEmail1: process.env.DefaultEmail1,
	FIREBASE_apiKey: process.env.FIREBASE_apiKey,
	FIREBASE_authDomain: process.env.FIREBASE_authDomain,
	FIREBASE_projectId: process.env.FIREBASE_projectId,
	FIREBASE_storageBucket: process.env.FIREBASE_storageBucket,
	FIREBASE_messagingSenderId: process.env.FIREBASE_messagingSenderId,
	FIREBASE_appId: process.env.FIREBASE_appId,
	FIREBASE_measurementId: process.env.FIREBASE_measurementId,
};
