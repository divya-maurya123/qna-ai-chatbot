const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - user must be logged in
const protect = async (req, res, next) => {
    try {
        let token;

        // Check Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login first.",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists.",
            });
        }

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token has expired. Please login again.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed.",
        });
    }
};


// Admin authorization
const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated.",
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin only.",
        });
    }

    next();
};


module.exports = {
    protect,
    admin,
};