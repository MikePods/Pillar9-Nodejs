const admin = require("../controllers/admin.controller");
const authorization = require("../middlewares/authorization.middleware");
const upload = require("../middlewares/multer.middleware");

module.exports = (router, io) => {
	router.post("/admin/login", admin.login);

	router.post("/admin/create", upload.single("profilePic"), admin.create);
	router.delete("/admin/delete/:id", admin.delete);
	router.get("/admin/allUsers", authorization.adminAccess(), admin.getAllUsers);
};
