const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); //core module
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a name"],
	},
	email: {
		type: String,
		required: [true, "Please add an email"],
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please add a valid email",
		],
	},
	role: {
		type: String,
		enum: ["user", "publisher"],
		default: "user",
	},
	password: {
		type: String,
		required: [true, "Please add a password"],
		minlength: 6,
		// api calls to user documents will exclude this field
		select: false,
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Sign jwt and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
	// Generate token. Create a buffer (randombytes) and we want to format it as a string
	const resetToken = crypto.randomBytes(20).toString("hex");

	console.log(resetToken);
	// Hash token and set to resetPasswordToken field. This is all in the node core crypto documentation.
	this.resetPasswordToken = crypto
		.createHash("sha256") //we are storing the hashed version in the db
		.update(resetToken) // what we want to hash
		.digest("hex"); // we want to digest it as a string so pass in hex

	// Set expire after 10 minutes
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	//return original reset token, not the hashed version
	return resetToken;
};
module.exports = mongoose.model("User", UserSchema);
