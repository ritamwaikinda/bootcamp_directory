const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const sendEmail = require("../utils/sendEmail.js");
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

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/me
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		data: {},
	});
});

// @desc    Update user details
// @route   PUT /api/v1/auth/meupdatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
	//this prevents the user from sending in other fields with the req body and having them be updated in the user schema (eg password and role etc)
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};
	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	// We want the password which is usually false by default
	const user = await User.findById(req.user.id).select("+password");

	// Check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse("Password is incorrect", 401));
	}

	user.password = req.body.newPassword;

	await user.save();

	sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		next(new ErrorResponse("There's no user with that email", 404));
	}

	// Get reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// console.log(resetToken);

	//Create reset URL

	const resetUrl = `${req.protocol}://${req.get(
		"host"
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: "Password reset token",
			message,
		});

		res.status(200).json({
			success: true,
			data: "Email sent",
		});
	} catch (err) {
		// we want to reset the user token and expire we don't wantto leave that hanging around.
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorResponse("Email could not be sent", 500));
	}

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	// Get hashed token
	const resetPasswordToken = crypto
		.createHash("sha256")
		.update(req.params.resettoken)
		.digest("hex");

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse("Invalid Token", 400));
	}

	// Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

	sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie, send response.
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
