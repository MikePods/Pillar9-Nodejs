const multer = require("multer");

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fieldSize: 50 * 1024 * 1024 },
});

module.exports = upload;

// multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, "upload");
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, Date.now().toString() + "_" + file.originalname);
// 	},
// });
