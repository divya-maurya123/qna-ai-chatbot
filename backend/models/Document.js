const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        originalName: {
            type: String,
            required: [true, "Original file name is required"],
            trim: true,
        },

        fileName: {
            type: String,
            required: [true, "File name is required"],
        },

        filePath: {
            type: String,
            required: [true, "File path is required"],
        },

        fileType: {
            type: String,
            required: true,
            enum: [
                "pdf",
                "doc",
                "docx",
                "txt",
                "png",
                "jpg",
                "jpeg",
            ],
        },

        mimeType: {
            type: String,
            default: null,
        },

        fileSize: {
            type: Number,
            default: 0,
        },

        extractedText: {
            type: String,
            default: "",
        },

        summary: {
            type: String,
            default: "",
        },

        chunks: [
            {
                text: {
                    type: String,
                    required: true,
                },

                chunkIndex: {
                    type: Number,
                    required: true,
                },

                embedding: {
                    type: [Number],
                    default: [],
                },
            },
        ],

        status: {
            type: String,
            enum: [
                "uploaded",
                "processing",
                "processed",
                "failed",
            ],
            default: "uploaded",
        },

        processingError: {
            type: String,
            default: null,
        },

        uploadedAt: {
            type: Date,
            default: Date.now,
        },

        processedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);


// Indexes
documentSchema.index({ user: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ user: 1, createdAt: -1 });


module.exports = mongoose.model("Document", documentSchema);