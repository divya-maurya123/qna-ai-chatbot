const express = require("express");

const Feedback = require("../models/Feedback");
const Conversation = require("../models/Conversation");

const {
    protect,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// SUBMIT FEEDBACK
// POST /api/feedback
// ===============================
router.post("/", protect, async (req, res, next) => {
    try {
        const {
            conversation,
            messageId,
            rating,
            comment,
            category,
        } = req.body;

        // Validation
        if (!conversation || !messageId || !rating) {
            return res.status(400).json({
                success: false,
                message:
                    "Conversation, messageId and rating are required.",
            });
        }

        if (!["positive", "negative"].includes(rating)) {
            return res.status(400).json({
                success: false,
                message:
                    "Rating must be positive or negative.",
            });
        }

        // Verify conversation belongs to user
        const existingConversation =
            await Conversation.findOne({
                _id: conversation,
                user: req.user._id,
            });

        if (!existingConversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found.",
            });
        }

        // Verify message exists
        const messageExists =
            existingConversation.messages.id(messageId);

        if (!messageExists) {
            return res.status(404).json({
                success: false,
                message: "Message not found.",
            });
        }

        // Check duplicate feedback
        const existingFeedback = await Feedback.findOne({
            user: req.user._id,
            messageId,
        });

        if (existingFeedback) {
            // Update existing feedback
            existingFeedback.rating = rating;
            existingFeedback.comment = comment || "";
            existingFeedback.category =
                category || "other";

            await existingFeedback.save();

            return res.status(200).json({
                success: true,
                message: "Feedback updated successfully.",
                feedback: existingFeedback,
            });
        }

        // Create feedback
        const feedback = await Feedback.create({
            user: req.user._id,
            conversation,
            messageId,
            rating,
            comment: comment || "",
            category: category || "other",
        });

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully.",
            feedback,
        });

    } catch (error) {
        next(error);
    }
});


// ===============================
// GET MY FEEDBACK
// GET /api/feedback
// ===============================
router.get("/", protect, async (req, res, next) => {
    try {
        const feedback = await Feedback.find({
            user: req.user._id,
        })
            .populate(
                "conversation",
                "title"
            )
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: feedback.length,
            feedback,
        });

    } catch (error) {
        next(error);
    }
});


// ===============================
// GET SINGLE FEEDBACK
// GET /api/feedback/:id
// ===============================
router.get("/:id", protect, async (req, res, next) => {
    try {
        const feedback = await Feedback.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).populate(
            "conversation",
            "title"
        );

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found.",
            });
        }

        res.status(200).json({
            success: true,
            feedback,
        });

    } catch (error) {
        next(error);
    }
});


// ===============================
// DELETE FEEDBACK
// DELETE /api/feedback/:id
// ===============================
router.delete("/:id", protect, async (req, res, next) => {
    try {
        const feedback = await Feedback.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Feedback deleted successfully.",
        });

    } catch (error) {
        next(error);
    }
});


module.exports = router;