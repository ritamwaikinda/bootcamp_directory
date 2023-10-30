const express = require("express");
const { getCourses } = require("../controllers/courses");

const router = express.Router({ mergeParams: true }); //mergeParams allows the rerouting from bootcamps to come "into" courses

router.route("/").get(getCourses);

module.exports = router;
