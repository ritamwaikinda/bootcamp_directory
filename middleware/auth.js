const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse.js");
const User = require("../models/User.js");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		// Set token from Bearer token in header
		token = req.headers.authorization.split(" ")[1];
		// Set token from cookie
	}
	// else if (req.cookies.token) {
	// 	// we've got the token in the cookies. So even if a req is sent with no bearer in the header, it will look in the cookies instead and auth ✅. This is totally optional - you can use cookies or the header. But if you use cookies, you need to log out to clear the cookies
	// 	token = req.cookies.token;
	// }

	// Make sure token exists
	if (!token) {
		return next(new ErrorResponse("Not authorized to access this route", 401));
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log(decoded);

		req.user = await User.findById(decoded.id);

		next();
	} catch (error) {
		return next(new ErrorResponse("Not authorized to access this route", 401));
	}
});

// Grant access to specific roles
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`User role ${req.user.role} is not authorized to access this route`,
					403
				)
			);
		}
		next();
	};
};
