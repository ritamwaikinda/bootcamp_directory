const advancedResults = (model, populate) => async (req, res, next) => {
	// Copy req.query
	const reqQuery = { ...req.query };

	// Fields to exclude
	const removeFields = ["select", "sort", "page", "limit"];

	// Loop over removeFields and delete them from reqQuery;
	removeFields.forEach((param) => delete reqQuery[param]);
	console.log(reqQuery);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);
	// JSON.stringify takes a JSON and turns it into a string

	//Create operators ($gt, $gte, etc) for filtering
	queryStr = queryStr.replace(
		//$gt, $gte, $lt, $lte and $in are "comparison operators" in MongoDB
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Finding resource (eg bootcamp)
	let query = model.find(JSON.parse(queryStr));
	// JSON.parse takes a string and turns it into a JSON

	// Select Fields
	if (req.query.select) {
		// console.log(req.query.select);
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}

	// Sort (by multiple fields if necessary) + ascending, -descending
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	1;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	if (populate) {
		query = query.populate(populate);
	}
	// Executing query
	const results = await query;

	// Pagination result
	const pagination = {};

	// if no prev/next then don't show option
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results,
	};

	next();
};

module.exports = advancedResults;
