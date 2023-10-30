const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const Course = require("../models/Course.js");

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	let query;
	if (req.params.bootcampId) {
		query = Course.find({ bootcamp: req.params.bootcampId });
	} else {
		//populate will fill the results with info about the bootcamp model too. You can pass "bootcamp" or an object to select only certain fields from bootcamps
		// query = Course.find().populate("bootcamp");
		query = Course.find().populate({
			path: "bootcamp",
			select: "name description",
		});
	}

	const courses = await query;

	res.status(200).json({
		success: true,
		count: courses.length,
		data: courses,
	});
});
