const nodemailer = require("nodemailer");
const { SenderEmailPassword, SenderEmail } = require("../config/config");

const sendEmail = (email, subject, content) => {
	const senderEmail = SenderEmail;
	const emailPassword = SenderEmailPassword;

	try {
		return new Promise((resolve, reject) => {
			const transporter = nodemailer.createTransport({
				port: 587,
				host: "smtp.gmail.com",
				auth: {
					user: senderEmail,
					pass: emailPassword,
				},
			});

			const mailDataUser = {
				from: senderEmail,
				to: email,
				subject: subject,
				html: content,
			};

			transporter.sendMail(mailDataUser, (error, info) => {
				if (error) {
					console.error("Error sending email:", error);
					transporter.close();
					reject(error);
				} else {
					console.log("Email sent to User:", info.envelope);
					transporter.close();
					resolve(true);
				}
			});
		});
	} catch (error) {
		console.log(error);
		return false;
	}
};

module.exports = sendEmail;
