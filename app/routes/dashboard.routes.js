const dashboard = require("../controllers/dashboard.controller");
const auth = require("../middlewares/authorization.middleware");

module.exports = (router) => {
	router.post("/dashboard/create", auth.grantAccess(), dashboard.create);
	router.post("/dashboard/create_for_user", auth.adminAccess(), dashboard.createForUser);
	router.get("/dashboard", auth.adminAccess(), dashboard.getAll); 
	router.get("/dashboard/user/:id", auth.allAccess(), dashboard.getUserDashboards); 
	router.get("/dashboard/:id", auth.grantAccess(), dashboard.getById); 
	router.put("/dashboard/update/:id", dashboard.update); 
	router.delete("/dashboard/delete/:id", auth.grantAccess(), dashboard.delete); 
};
