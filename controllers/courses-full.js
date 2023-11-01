const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const Course = require("../models/Course.js");
const Bootcamp = require("../models/Bootcamp.js");

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

// @desc    Get single courses
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate({
		path: "bootcamp",
		select: "name description",
	});

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404
		);
	}

	res.status(200).json({
		success: true,
		data: course,
	});
});

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
			404
		);
	}

	const course = await Course.create(req.body);

	res.status(200).json({
		success: true,
		data: course,
	});
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404
		);
	}

	course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: course,
	});
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404
		);
	}

	await course.deleteOne();

	res.status(200).json({
		success: true,
		data: {},
	});
});
