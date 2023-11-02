const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const User = require("../models/User.js");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	// Create user
	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	// Create token
	const token = user.getSignedJwtToken();

	res.status(200).json({
		success: true,
		token,
	});
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate email & password
	if (!email || !password) {
		return next(
			new ErrorResponse("Please provide and email and password", 400)
		);
	}

	// Check for user. the select is because you set select to false in model
	const user = await User.findOne({ email }).select("+password");
	if (!user) {
		// DOES NOT WORK
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	// Check if password matches
	const isMatch = await user.matchPassword(password);

	if (!isMatch) {
		// DOES NOT WORK
		return next(new ErrorResponse("Invalid credentials", 401));
	}

	// Create token
	const token = user.getSignedJwtToken();

	res.status(200).json({
		success: true,
		token,
	});
});
