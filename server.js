const express = require("express");
const dotenv = require("dotenv");
// const logger = require("./middleware/logger");
const morgan = require("morgan");
//Route files
const bootcamps = require("./routes/bootcamps");

// Load env vars
dotenv.config({ path: "./config/config.env" });

const app = express();

//won't just be ran by itself, must be used by app :)
// app.use(logger);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}
//Mount routers
app.use("/api/v1/bootcamps", bootcamps);

/*
GET/POST/PUT/DELETE
api/v1/bootcamps
api/v1/courses
api/v1/reviews
api/v1/auth
api/v1/users
*/

const PORT = process.env.PORT || 5000;

app.listen(
	PORT,
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
