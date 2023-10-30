const ErrorResponse = require("../utils/errorResponse.js");
const Bootcamp = require("../models/Bootcamp.js");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
	try {
		const bootcamps = await Bootcamp.find();

		res
			.status(200)
			.json({ success: true, count: bootcamps.length, data: bootcamps });
	} catch (error) {
		next(error);
		// res.status(400).json({ success: false });
	}

	// res
	// 	.status(200)
	// 	.json({ success: true, msg: "Show all bootcamps", hello: req.hello });
};

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

exports.getBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findById(req.params.id);
		// if the id is correctly formatted but wrong
		if (!bootcamp) {
			return next(
				new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
			);
		}
		res.status(200).json({ success: true, data: bootcamp });
	} catch (error) {
		next(error);

		// if the id is badly formatted
		// res.status(400).json({ success: false });
	}

	// res
	// 	.status(201)
	// 	.json({ success: true, msg: `Show bootcamp ${req.params.id}` });
};

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/
// @access  Private

exports.createBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.create(req.body);

		res.status(201).json({
			success: true,
			data: bootcamp,
		});
	} catch (error) {
		next(error);
		//res.status(400).json({ success: false });
	}
	// console.log(req.body);
	// res.status(201).json({ success: true, msg: "Create new bootcamp" });
};

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private

exports.updateBootcamp = async (req, res, next) => {
	try {
		// Takes 2+ arguments
		const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			// Mongoose validator
			runValidators: true,
		});

		if (!bootcamp) {
			return next(
				new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
			);
			// return res.status(400).json({ success: false });
		}
		//when testing with postman, if you have more than one bool field, it wants them wrapped in strings
		res.status(200).json({
			success: true,
			data: bootcamp,
		});
	} catch (error) {
		next(error);
		//res.status(400).json({ success: false });
	}
	// res
	// 	.status(201)
	// 	.json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Public

exports.deleteBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

		if (!bootcamp) {
			return next(
				new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
			);
			// return res.status(400).json({ success: false });
		}
		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (error) {
		next(error);
		//res.status(400).json({ success: false });
	}

	// res
	// 	.status(201)
	// 	.json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};

// ______________________________
// ROUND TWO
// ______________________________

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

	//$gt, $gte, $lt, $lte and $in are "comparison operators" in MongoDB
	let queryStr = JSON.stringify(req.query);
	// JSON.stringify takes a JSON and turns it into a string
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	console.log(req.query, queryStr);
	let query = Bootcamp.find(JSON.parse(queryStr));
	// JSON.parse takes a string and turns it into a JSON

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
