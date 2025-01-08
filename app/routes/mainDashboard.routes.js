const dashboard = require("../controllers/mainDashboard.controller");
const auth = require("../middlewares/authorization.middleware");

module.exports = (router) => {
	router.post("/main-dashboard/create", dashboard.createOrUpdate);
	router.get("/main-dashboard", dashboard.getUserDashboard); 
};
