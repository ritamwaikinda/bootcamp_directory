const path = require("path");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const geocoder = require("../utils/geocoder.js");
const Bootcamp = require("../models/Bootcamp.js");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
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
