const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "please add a course title"],
	},
	description: {
		type: String,
		required: [true, "please add a description"],
	},
	weeks: {
		type: String,
		required: [true, "please add number of weeks"],
	},
	tuition: {
		type: Number,
		required: [true, "please add a number"],
	},
	minimumSkill: {
		type: String,
		required: [true, "please add a minimum skill"],
		enum: ["beginner", "intermediate", "advanced"],
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: "Bootcamp",
		required: true,
	},
});

// statics are static methods called on the models. Can be called in the controller right on the model eg Course.static()
// methods are methods called on the instance/query. So they can be called after creating an instance eg const newCourse = Course.findById(); newCourse.method()

// Static method to get average of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
	// creating an aggregated object. aggregate method returns a promise
	const obj = await this.aggregate(
		/*pipeline */ [
			{
				$match: { bootcamp: bootcampId },
			},
			{
				$group: {
					_id: "$bootcamp",
					averageCost: { $avg: "$tuition" },
				},
			},
		]
	);

	try {
		await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
		});
	} catch (error) {
		console.error(error);
	}
};

// Call getAverageCost after save
CourseSchema.post("save", function () {
	this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre("deleteOne", function () {
	this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
