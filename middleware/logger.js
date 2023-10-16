// @desc    (Creating your own custom middleware) Logs request to console
const logger = (req, res, next) => {
	//req.hello = "Hello World"; //since we createed this, we now have access to this within our routes :)
	// Middleware has access to the req,res cycle. Can help validate tokens when incoming.
	console.log(
		`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
	);
	// with every piece of middleware ran, you need to call this and use this so it knows to move on to the next piece of midleware in the cycle.
	next();
};

module.exports = logger;
