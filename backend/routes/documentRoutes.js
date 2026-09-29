const express = require("express");
const fs = require("fs");

const Document = require("../models/Document");

const {
    protect,
} = require("../middleware/authMiddleware");

const {
    uploadSingle,
    handleUploadError,
} = require("../middleware/uploadMiddleware");

const router = express.Router();


// ===============================
// UPLOAD DOCUMENT
// POST /api/documents/upload
// ===============================
router.post(
    "/upload",
    protect,
    uploadSingle,
    handleUploadError,
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload a file.",
                });
            }

            const extension = req.file.originalname
                .split(".")
                .pop()
                .toLowerCase();

            const document = await Document.create({
                user: req.user._id,

                originalName: req.file.originalname,

                fileName: req.file.filename,

                filePath: req.file.path,

                fileType: extension,

                mimeType: req.file.mimetype,

                fileSize: req.file.size,

                status: "uploaded",
            });

            res.status(201).json({
                success: true,
                message: "Document uploaded successfully.",
                document,
            });

        } catch (error) {
            // Delete uploaded file if database operation fails
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            next(error);
        }
    }
);


// ===============================
// GET USER DOCUMENTS
// GET /api/documents
// ===============================
router.get("/", protect, async (req, res, next) => {
    try {
        const documents = await Document.find({
            user: req.user._id,
        })
            .select("-extractedText -chunks")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            documents,
        });

    } catch (error) {
        next(error);
    }
});


// ===============================
// GET SINGLE DOCUMENT
// GET /api/documents/:id
// ===============================
router.get("/:id", protect, async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            user: req.user._id,
        }).select("-chunks");

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found.",
            });
        }

        res.status(200).json({
            success: true,
            document,
        });

    } catch (error) {
        next(error);
    }
});


// ===============================
// DELETE DOCUMENT
// DELETE /api/documents/:id
// ===============================
router.delete("/:id", protect, async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found.",
            });
        }

        // Delete physical file
        if (
            document.filePath &&
            fs.existsSync(document.filePath)
        ) {
            fs.unlinkSync(document.filePath);
        }

        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: "Document deleted successfully.",
        });

    } catch (error) {
        next(error);
    }
});


module.exports = router;