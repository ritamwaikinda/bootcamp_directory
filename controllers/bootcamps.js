const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const geocoder = require("../utils/geocoder.js");
const Bootcamp = require("../models/Bootcamp.js");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	// console.log(req.query); e.g. {{URL}}/api/v1/bootcamps?location.state=MA&housing=true
	// Bootcamp.find can take in an object eg Bootcamp.find({"location.state": "MA", housing: true})
	// req.query is also an object. So this works too Bootcamp.find(req.query);

	// Copy req.query
	const reqQuery = { ...req.query };

	// Fields to exclude
	const removeFields = ["select"];

	// Loop over removeFields and delete them from reqQuery;
	removeFields.forEach((param) => delete reqQuery[param]);
	console.log(reqQuery);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);
	// JSON.stringify takes a JSON and turns it into a string

	//Create operators
	queryStr = queryStr.replace(
		//$gt, $gte, $lt, $lte and $in are "comparison operators" in MongoDB
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Finding resource
	let query = Bootcamp.find(JSON.parse(queryStr));
	// JSON.parse takes a string and turns it into a JSON

	// Executing query
	const bootcamps = await query;
	res
		.status(200)
		.json({ success: true, count: bootcamps.length, data: bootcamps });
});

// SIMPLE GET BOOTCAMPS METHOD
// exports.getBootcamps = asyncHandler(async (req, res, next) => {
// 	const bootcamps = await Bootcamp.find();
// 	res
// 		.status(200)
// 		.json({ success: true, count: bootcamps.length, data: bootcamps });
// });

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	// if the id is correctly formatted but wrong
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	//when testing with postman, if you have more than one bool field, it wants them wrapped in strings
	res.status(200).json({
		success: true,
		data: bootcamp,
	});
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		data: {},
	});
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Get latitude & longitude from geocoder
	const loc = await geocoder.geocode(zipcode);
	const latitude = loc[0].latitude;
	const longitude = loc[0].longitude;

	// Calculate radiu using radians (a unit of measurement for measuring spheres)
	// Divide distance by radius of earth
	// Radius of earth is 3,963 miles (6,378 kilometres)
	const radius = distance / 3963;

	const bootcamps = await Bootcamp.find({
		location: {
			//bruh... https://www.mongodb.com/docs/manual/reference/operator/query/centerSphere/
			//BRUH... https://www.mongodb.com/docs/manual/core/indexes/index-types/geospatial/2d/calculate-distances/#std-label-calculate-distance-spherical-geometry
			$geoWithin: { $centerSphere: [[longitude, latitude], radius] },
		},
	});

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});
