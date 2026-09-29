// 404 - Route Not Found
const notFound = (req, res, next) => {
    const error = new Error(`Route not found - ${req.originalUrl}`);

    res.status(404);

    next(error);
};


// Global Error Handler
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.stack);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    let message = err.message || "Internal Server Error";

    // Mongoose CastError
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format.";
    }

    // Mongoose ValidationError
    if (err.name === "ValidationError") {
        statusCode = 400;

        const errors = Object.values(err.errors).map(
            (error) => error.message
        );

        return res.status(statusCode).json({
            success: false,
            message: "Validation error.",
            errors,
        });
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 400;

        const field = Object.keys(err.keyValue)[0];

        message = `${field} already exists.`;
    }

    // JWT error
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authentication token.";
    }

    // JWT expired
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Authentication token has expired.";
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};


module.exports = {
    notFound,
    errorHandler,
};