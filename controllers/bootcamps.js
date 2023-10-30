const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const geocoder = require("../utils/geocoder.js");
const Bootcamp = require("../models/Bootcamp.js");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	// Copy req.query
	const reqQuery = { ...req.query };

	// Fields to exclude
	const removeFields = ["select", "sort", "page", "limit"];

	// Loop over removeFields and delete them from reqQuery;
	removeFields.forEach((param) => delete reqQuery[param]);
	console.log(reqQuery);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);
	// JSON.stringify takes a JSON and turns it into a string

	//Create operators ($gt, $gte, etc) for filtering
	queryStr = queryStr.replace(
		//$gt, $gte, $lt, $lte and $in are "comparison operators" in MongoDB
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Finding resource (eg bootcamp)
	let query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");
	// JSON.parse takes a string and turns it into a JSON

	// Select Fields
	if (req.query.select) {
		// console.log(req.query.select);
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}

	// Sort (by multiple fields if necessary) + ascending, -descending
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 1;
	1;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await Bootcamp.countDocuments();

	query = query.skip(startIndex).limit(limit);

	//
	// Executing query
	const bootcamps = await query;

	// Pagination result
	const pagination = {};

	// if no prev/next then don't show option
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		pagination,
		data: bootcamps,
	});
});

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
	// const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

	// pre("remove") middleware doesn't work with the mongoose "findByIdAndDelete" method so it's best to use "findById" and then use the "remove" method on whatever is returned

	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}

	// this will trigger the remove courses middleware
	bootcamp.deleteOne();

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
