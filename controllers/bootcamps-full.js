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
