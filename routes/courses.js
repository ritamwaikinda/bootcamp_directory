const express = require("express");
const {
	getCourses,
	getCourse,
	addCourse,
	updateCourse,
	deleteCourse,
} = require("../controllers/courses");

const Course = require("../models/Course.js");

const router = express.Router({ mergeParams: true }); //mergeParams allows the rerouting from bootcamps to come "into" courses

const advancedResults = require("../middleware/advancedResults.js");
const { protect, authorize } = require("../middleware/auth");

router
	.route("/")
	.get(
		advancedResults(Course, {
			path: "bootcamp",
			select: "name description",
		}),
		getCourses
	)
	.post(protect, authorize("publisher", "admin"), addCourse);
router
	.route("/:id")
	.get(getCourse)
	.put(protect, authorize("publisher", "admin"), updateCourse)
	.delete(protect, authorize("publisher", "admin"), deleteCourse);

module.exports = router;
