const express = require("express");
const app = express();
const helmet = require("helmet");
var cors = require("cors");
const morgan = require("morgan");
const router = express.Router();
require("dotenv").config();
const connectDB = require("./app/config/mongodb.config");
const server = require("http").createServer(app);
const path = require("path");
const fs = require("fs");
const { PORT } = require("./app/config/config");

connectDB();

const routes = [];

const corsOptions = {
	origin: "*",
};

const swaggerAutogen = require("swagger-autogen")({ openapi: "3.1.0" });
const swaggerUi = require("swagger-ui-express");

const doc = {
	openapi: "3.1.0",
	info: {
		version: "1.0.0",
		title: "Pilar9",
		description: "Pilar9 API Documentation",
	},
	servers: [
		{
			url: "https://pilar9-backend.vercel.app/api",
			description: "Live server",
		},
		{
			url: "http://localhost:8921/api",
			description: "Local server",
		},
	],
	tags: [
		{
			name: "Admin",
			description: "Admin APIs",
		},
		{
			name: "User",
			description: "User APIs",
		},
		{
			name: "Dashboard",
			description: "Dashboard APIs",
		},
		{
			name: "Widget",
			description: "Widget APIs",
		},
	],
	securityDefinitions: {
		apiKeyAuth: {
			type: "apiKey",
			name: "X-API-KEY",
			in: "header",
		},
	},
};

const outputFile = "./swagger.json";
const swaggerDocument = fs.existsSync(outputFile) ? require(outputFile) : "";

const routesPath = path.join(__dirname, "app/routes");
const routeFiles = fs.readdirSync(routesPath);

routeFiles.forEach((routeFile) => {
	if (routeFile !== "index.js" && routeFile.endsWith(".js")) {
		routes.push("app/routes/" + routeFile);
		const routeModule = require(path.join(routesPath, routeFile));
		routeModule(router);
	}
});

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"], // Default sources
				scriptSrc: ["'self'"], // Scripts
				connectSrc: ["'self'", "http://pilar9.nelify.app/"], // Allow Netlify
				connectSrc: ["'self'", "https://localhost:8521/"], // Allow localhost
			},
		},
	})
);

app.use(morgan("common"));
app.use("/api", router);

app.use("/swagger/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Swagger UI
// Swagger route
app.get("/swagger", async (req, res) => {
	await swaggerAutogen(outputFile, routes, doc);
	res.redirect("/swagger/docs");
});

app.get("/", (req, res) => res.send({ msg: "Backend Server is Running ... !" }));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
