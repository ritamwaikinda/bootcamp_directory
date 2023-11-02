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
	// const token = user.getSignedJwtToken();

	// res.status(200).json({
	// 	success: true,
	// 	token,
	// });
	sendTokenResponse(user, 200, res);
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
	// const token = user.getSignedJwtToken();

	// res.status(200).json({
	// 	success: true,
	// 	token,
	// });
	sendTokenResponse(user, 200, res);
});

// @desc    GEt current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

// Get token from model, create cookie, send response
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.getSignedJwtToken();

	//Create cookie
	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		//only accessible from client-side script
		httpOnly: true,
	};

	// puts a flag to make the cookie secure when in production
	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	// cookie taken in 3 things - key, value, and options
	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		token,
	});
};
