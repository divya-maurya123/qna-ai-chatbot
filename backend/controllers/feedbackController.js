const Feedback = require("../models/Feedback");


// ==========================================
// CREATE FEEDBACK
// ==========================================
const createFeedback = async (req, res, next) => {
    try {
        const {
            conversationId,
            messageId,
            rating,
            comment
        } = req.body;

        if (!conversationId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID and rating are required"
            });
        }

        if (!["up", "down"].includes(rating)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be 'up' or 'down'"
            });
        }

        // Check whether feedback already exists
        const existingFeedback = await Feedback.findOne({
            user: req.user.id,
            conversation: conversationId,
            message: messageId
        });

        if (existingFeedback) {
            existingFeedback.rating = rating;
            existingFeedback.comment = comment || "";

            await existingFeedback.save();

            return res.status(200).json({
                success: true,
                message: "Feedback updated successfully",
                feedback: existingFeedback
            });
        }

        const feedback = await Feedback.create({
            user: req.user.id,
            conversation: conversationId,
            message: messageId,
            rating,
            comment: comment || ""
        });

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// GET USER FEEDBACK
// ==========================================
const getMyFeedback = async (req, res, next) => {
    try {
        const feedback = await Feedback.find({
            user: req.user.id
        })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: feedback.length,
            feedback
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// DELETE FEEDBACK
// ==========================================
const deleteFeedback = async (req, res, next) => {
    try {
        const feedback = await Feedback.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Feedback deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createFeedback,
    getMyFeedback,
    deleteFeedback
};