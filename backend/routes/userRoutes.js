const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Document = require("../models/Document");
const Feedback = require("../models/Feedback");

const {
    protect,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// GET MY PROFILE
// GET /api/users/profile
// ===============================
router.get("/profile", protect, async (req, res, next) => {
    try {
        const user = await User.findById(
            req.user._id
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        next(error);
    }
});


// ===============================
// UPDATE PROFILE
// PUT /api/users/profile
// ===============================
router.put("/profile", protect, async (req, res, next) => {
    try {
        const {
            name,
            profileImage,
        } = req.body;

        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (name) {
            user.name = name.trim();
        }

        if (profileImage !== undefined) {
            user.profileImage = profileImage;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });

    } catch (error) {
        next(error);
    }
});


// ===============================
// CHANGE PASSWORD
// PUT /api/users/password
// ===============================
router.put("/password", protect, async (req, res, next) => {
    try {
        const {
            currentPassword,
            newPassword,
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required.",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must contain at least 6 characters.",
            });
        }

        const user = await User.findById(
            req.user._id
        ).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        user.password = await bcrypt.hash(
            newPassword,
            12
        );

        await user.save();

        res.status(200).json({
            success: true,
            message:
                "Password changed successfully.",
        });

    } catch (error) {
        next(error);
    }
});


// ===============================
// GET USER STATISTICS
// GET /api/users/stats
// ===============================
router.get("/stats", protect, async (req, res, next) => {
    try {
        const [
            conversations,
            documents,
            feedback,
        ] = await Promise.all([
            Conversation.countDocuments({
                user: req.user._id,
            }),

            Document.countDocuments({
                user: req.user._id,
            }),

            Feedback.countDocuments({
                user: req.user._id,
            }),
        ]);

        res.status(200).json({
            success: true,
            stats: {
                conversations,
                documents,
                feedback,
            },
        });

    } catch (error) {
        next(error);
    }
});


// ===============================
// DELETE ACCOUNT
// DELETE /api/users/account
// ===============================
router.delete(
    "/account",
    protect,
    async (req, res, next) => {
        try {
            const userId = req.user._id;

            // Delete user
            await User.findByIdAndDelete(userId);

            // Delete conversations
            await Conversation.deleteMany({
                user: userId,
            });

            // Delete documents
            await Document.deleteMany({
                user: userId,
            });

            // Delete feedback
            await Feedback.deleteMany({
                user: userId,
            });

            res.status(200).json({
                success: true,
                message:
                    "Account and associated data deleted successfully.",
            });

        } catch (error) {
            next(error);
        }
    }
);


module.exports = router;