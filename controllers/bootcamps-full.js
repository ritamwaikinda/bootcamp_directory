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

///////////////////////////////////////////////////////////////////////////////////////////
/*
Second round/more sophisticated controllers before it was separated out to middleware
*/
///////////////////////////////////////////////////////////////////////////////////////////

const path = require("path");
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

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}

	if (!req.files) {
		// THIS ISN'T WORKING
		return next(new ErrorResponse(`Please upload a file`, 400));
	}

	// console.log(req.files);

	const file = req.files.file;

	// Make sure the image is a photo
	if (!file.mimetype.startsWith("image")) {
		// THIS ISN'T WORKING
		return next(new ErrorResponse(`Please upload an image file`, 400));
	}

	// Check file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
				400
			)
		);
	}

	// Create custom filename
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(err);
			return next(new ErrorResponse(`Problem withfile upload`, 500));
		}

		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

		res.status(200).json({
			success: true,
			data: file.name,
		});
	});
});
