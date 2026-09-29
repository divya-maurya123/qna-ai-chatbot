const Document = require("../models/Document");
const fs = require("fs");
const path = require("path");


// ==========================================
// UPLOAD DOCUMENT
// ==========================================
const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a document"
            });
        }

        const document = await Document.create({
            user: req.user.id,
            filename: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size
        });

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            document
        });

    } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file && req.file.path) {
            try {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (fileError) {
                console.error("File cleanup error:", fileError);
            }
        }

        next(error);
    }
};


// ==========================================
// GET USER DOCUMENTS
// ==========================================
const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            count: documents.length,
            documents
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// GET SINGLE DOCUMENT
// ==========================================
const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        res.status(200).json({
            success: true,
            document
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// DELETE DOCUMENT
// ==========================================
const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Delete physical file
        if (document.filePath && fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        // Delete database record
        await Document.findByIdAndDelete(document._id);

        res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument
};