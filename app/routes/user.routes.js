const user = require("../controllers/user.controller");
const auth = require("../middlewares/authorization.middleware");
const upload = require("../middlewares/multer.middleware");

module.exports = (router, io) => {
	router.post("/user/login", user.login);
	router.post("/user/create", upload.single("profilePic"), user.create);
	router.put("/user/update", upload.single("profilePic"), auth.grantAccess(), user.update);
	router.delete("/user/delete/:id", user.delete);
};
