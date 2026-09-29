const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload directory
const uploadDirectory = path.join(__dirname, "../uploads");

// Create uploads folder if it does not exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}


// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    },
});


// Allowed file types
const allowedFileTypes = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
];


// File filter
const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedFileTypes.includes(extension)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Allowed: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG."
            ),
            false
        );
    }
};


// Multer configuration
const upload = multer({
    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
});


// Single document upload
const uploadSingle = upload.single("file");


// Multiple document upload
const uploadMultiple = upload.array("files", 5);


// Error-handling wrapper
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size cannot exceed 10 MB.",
            });
        }

        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Maximum 5 files are allowed.",
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    next();
};


module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    handleUploadError,
};