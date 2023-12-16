const express = require("express");
const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
} = require("../controllers/users");

const User = require("../models/User.js");

const router = express.Router({ mergeParams: true }); //mergeParams allows the rerouting from bootcamps to come "into" courses

const advancedResults = require("../middleware/advancedResults.js");
const { protect, authorize } = require("../middleware/auth");

// Instead of specifying this on each route,we can place this here. Anything below this will use this middleware:
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
