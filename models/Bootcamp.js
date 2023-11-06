const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
			unique: true,
			trim: true,
			maxlength: [50, "Name can not be more than 50 characters"],
		},
		// a url friendly version of a name
		slug: String,
		description: {
			type: String,
			required: [true, "Please add a description"],
			maxlength: [500, "Description can not be more than 500 characters"],
		},
		website: {
			type: String,
			match: [
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
				"Please use a valid URL with HTTP or HTTPS",
			],
		},
		phone: {
			type: String,
			maxlength: [20, "Phone number can not be longer than 20 characters"],
		},
		email: {
			type: String,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please add a valid email",
			],
		},
		address: {
			type: String,
			required: [true, "Please add an address"],
		},
		location: {
			// GeoJSON Point
			type: {
				type: String,
				enum: ["Point"],
				// required: true,
			},
			coordinates: {
				type: [Number],
				// required: true,
				index: "2dsphere",
			},
			formattedAddress: String,
			street: String,
			city: String,
			state: String,
			zipcode: String,
			country: String,
		},
		careers: {
			// Array of strings
			type: [String],
			required: true,
			enum: [
				"Web Development",
				"Mobile Development",
				"UI/UX",
				"Data Science",
				"Business",
				"Other",
			],
		},
		averageRating: {
			type: Number,
			min: [1, "Rating must be at least 1"],
			max: [10, "Rating must can not be more than 10"],
		},
		// since there's only one param, just put it directly
		averageCost: Number,
		photo: {
			type: String,
			default: "no-photo.jpg",
		},
		housing: {
			type: Boolean,
			default: false,
		},
		jobAssistance: {
			type: Boolean,
			default: false,
		},
		jobGuarantee: {
			type: Boolean,
			default: false,
		},
		acceptGi: {
			type: Boolean,
			default: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
		},
	},
	// This is so you can create virtual documents, documents that are created but not persisted to the database
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Create bootcamp slug from the name
BootcampSchema.pre("save", function (next) {
	//I LOVE THIS
	this.slug = slugify(this.name, { lower: true });
	// console.log("Slugify ran", this.name);
	next();
});

//Geocode & create location field
BootcampSchema.pre("save", async function (next) {
	// (dot)geocode method is asynchronous
	const loc = await geocoder.geocode(this.address);
	this.location = {
		type: "Point",
		// longitude first, then latitude
		// location we get is an array. We want the first element of the array
		coordinates: [loc[0].longitude, loc[0].latitude],
		formattedAddress: loc[0].formattedAddress,
		street: loc[0].streetName,
		city: loc[0].city,
		state: loc[0].stateCode,
		zipcode: loc[0].zipcode,
		country: loc[0].country,
	};

	// Do not save address in db. Assigning it to undefined means it won't get added to the database.
	this.address = undefined;
	next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre(
	"deleteOne",
	{ document: true, query: true },
	async function (next) {
		await this.model("Course").deleteMany({ bootcamp: this._id });
		next();
	}
);
// pre("remove") doesn't work with the mongoose "findByIdAndDelete" method so it's best to use "findById" and then use the "remove" method on whatever is returned

// Reverse populate with virtuals
// takes the field that you want to create, and some options including a reference
BootcampSchema.virtual("courses", {
	ref: "Course",
	localField: "_id",
	// field in the foreign object (course model) that we are pertaining to
	foreignField: "bootcamp",
	// we want an array
	justOne: false,
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);

// mongoose middleware will be implemented later to calculate slug, avg rating, avg cost etc
