const express = require("express");
const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
} = require("../controllers/bootcamps");

// Include other resource routers
const courseRouter = require("./courses");

const router = express.Router();

// Re-route into other resource routers. It will "mount it forward/into" the courseRouter instead of dealing with it here
router.use("/:bootcampId/courses", courseRouter);

router.route("/").get(getBootcamps).post(createBootcamp);

router
	.route("/:id")
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

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
