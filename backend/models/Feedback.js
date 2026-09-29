const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        rating: {
            type: String,
            enum: ["positive", "negative"],
            required: true,
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        category: {
            type: String,
            enum: [
                "helpful",
                "accurate",
                "clear",
                "irrelevant",
                "incorrect",
                "incomplete",
                "other",
            ],
            default: "other",
        },

        metadata: {
            model: {
                type: String,
                default: null,
            },

            responseTime: {
                type: Number,
                default: null,
            },
        },
    },
    {
        timestamps: true,
    }
);


// Prevent duplicate feedback for the same message by the same user
feedbackSchema.index(
    {
        user: 1,
        messageId: 1,
    },
    {
        unique: true,
    }
);


feedbackSchema.index({
    conversation: 1,
});

feedbackSchema.index({
    rating: 1,
});


module.exports = mongoose.model("Feedback", feedbackSchema);