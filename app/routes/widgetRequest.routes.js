const WidgetRequest = require("../controllers/widgetRequest.controller");
const auth = require("../middlewares/authorization.middleware");

module.exports = (router, io) => {
	router.post("/requestWidget", auth.grantAccess(), WidgetRequest.create);
	router.get("/requestWidgets", auth.grantAccess(), WidgetRequest.usersRequests);
	router.get("/requestWidgets/getAll", auth.adminAccess(), WidgetRequest.list);
};
