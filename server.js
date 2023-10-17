const express = require("express");
const dotenv = require("dotenv");
// const logger = require("./middleware/logger");
const morgan = require("morgan");
const colors = require("colors");
//middleware has to be called into server//app.use()
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

//Route files
const bootcamps = require("./routes/bootcamps");

const app = express();

// Body parser
app.use(express.json());

//won't just be ran by itself, must be used by app :)
// app.use(logger);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}
//Mount routers
app.use("/api/v1/bootcamps", bootcamps);
//if you want to use this in the bootcamps controller, you have to call it after above-sentence because middleware is executed in a linear order
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
);

// Handle unhandled promise rejections

process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.red);
	// close server and exit process
	server.close(() => process.exit(1));
});

/*
GET/POST/PUT/DELETE
api/v1/bootcamps
api/v1/courses
api/v1/reviews
api/v1/auth
api/v1/users
*/
