const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant", "system"],
            required: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        timestamp: {
            type: Date,
            default: Date.now,
        },

        sources: [
            {
                document: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Document",
                },

                text: {
                    type: String,
                },

                score: {
                    type: Number,
                    default: null,
                },
            },
        ],
    },
    {
        _id: true,
    }
);


const conversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            trim: true,
            maxlength: 200,
            default: "New Conversation",
        },

        messages: {
            type: [messageSchema],
            default: [],
        },

        model: {
            type: String,
            default: "default",
        },

        isArchived: {
            type: Boolean,
            default: false,
        },

        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);


// Update lastMessageAt whenever a conversation is saved
conversationSchema.pre("save", function (next) {
    if (this.messages && this.messages.length > 0) {
        this.lastMessageAt =
            this.messages[this.messages.length - 1].timestamp;
    }

    next();
});


module.exports = mongoose.model(
    "Conversation",
    conversationSchema
);