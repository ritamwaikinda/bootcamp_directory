const express = require("express");

const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
	bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp.js");
const advancedResults = require("../middleware/advancedResults");

// Include other resource routers
const courseRouter = require("./courses");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers. It will "mount it forward/into" the courseRouter instead of dealing with it here
router.use("/:bootcampId/courses", courseRouter);
router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);
//put authorize after protect, because "req.user" gets set in "protect" and we want to be able to use that
router
	.route("/:id/photo")
	.put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

router
	.route("/")
	.get(advancedResults(Bootcamp, "courses"), getBootcamps)
	.post(protect, authorize("publisher", "admin"), createBootcamp);

router
	.route("/:id")
	.get(getBootcamp)
	.put(protect, authorize("publisher", "admin"), updateBootcamp)
	.delete(protect, authorize("publisher", "admin"), deleteBootcamp);

module.exports = router;

/*
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.status(200).json({ success: true, msg: "Show all bootcamps" });
});

router.get("/:id", (req, res) => {
	res
		.status(201)
		.json({ success: true, msg: `Show bootcamp ${req.params.id}` });
});

router.post("/", (req, res) => {
	res.status(201).json({ success: true, msg: "Create new bootcamp" });
});

router.put("/:id", (req, res) => {
	res
		.status(201)
		.json({ success: true, msg: `Update bootcamp ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
	res
		.status(201)
		.json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
});

module.exports = router;
*/
