const express = require("express");
const { getReviews, getReview } = require("../controllers/reviews");

const Review = require("../models/Review.js");

const router = express.Router({ mergeParams: true }); //mergeParams allows the rerouting from bootcamps to come "into" courses

const advancedResults = require("../middleware/advancedResults.js");
const { protect, authorize } = require("../middleware/auth");

router.route("/").get(
	advancedResults(Review, {
		path: "bootcamp",
		select: "name description",
	}),
	getReviews
);

router.route("/:id").get(getReview);

module.exports = router;
