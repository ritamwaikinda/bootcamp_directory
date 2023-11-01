const express = require("express");
const {
	getCourses,
	getCourse,
	addCourse,
	updateCourse,
	deleteCourse,
} = require("../controllers/courses");

const Course = require("../models/Course.js");
const advancedResults = require("../middleware/advancedResults.js");

const router = express.Router({ mergeParams: true }); //mergeParams allows the rerouting from bootcamps to come "into" courses

router
	.route("/")
	.get(
		advancedResults(Course, {
			path: "bootcamp",
			select: "name description",
		}),
		getCourses
	)
	.post(addCourse);
router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
