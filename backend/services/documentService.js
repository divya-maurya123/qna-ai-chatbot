const fs = require("fs");
const path = require("path");

const Document = require("../models/Document");


/*
|--------------------------------------------------------------------------
| DOCUMENT SERVICE
|--------------------------------------------------------------------------
| Responsibilities:
|
| 1. Read uploaded files
| 2. Extract text
| 3. Clean text
| 4. Split text into chunks
| 5. Store chunks in MongoDB
| 6. Process documents
|--------------------------------------------------------------------------
*/


/**
 * Read TXT file
 */
const extractTextFromTxt = async (filePath) => {
    return fs.promises.readFile(
        filePath,
        "utf8"
    );
};


/**
 * Extract text from PDF
 *
 * pdf-parse is loaded dynamically so the application
 * can still start when PDF processing is not used.
 */
const extractTextFromPdf = async (filePath) => {
    try {
        const pdfParse =
            require("pdf-parse");

        const buffer =
            await fs.promises.readFile(filePath);

        const data = await pdfParse(buffer);

        return data.text || "";
    } catch (error) {
        throw new Error(
            `PDF text extraction failed: ${error.message}`
        );
    }
};


/**
 * Extract document text
 */
const extractText = async (
    filePath,
    fileType
) => {
    const extension =
        fileType.toLowerCase();

    switch (extension) {
        case "txt":
            return extractTextFromTxt(
                filePath
            );

        case "pdf":
            return extractTextFromPdf(
                filePath
            );

        case "doc":
        case "docx":
            throw new Error(
                "DOC/DOCX extraction requires mammoth or another document parser."
            );

        default:
            throw new Error(
                `Unsupported file type: ${extension}`
            );
    }
};


/**
 * Clean extracted text
 */
const cleanText = (text) => {
    if (!text) {
        return "";
    }

    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};


/**
 * Split text into chunks
 */
const createChunks = (
    text,
    chunkSize = 1000,
    overlap = 150
) => {
    if (!text) {
        return [];
    }

    const chunks = [];

    let start = 0;
    let index = 0;

    while (start < text.length) {
        let end =
            start + chunkSize;

        let chunk =
            text.substring(
                start,
                end
            );

        // Try to end at a sentence
        if (
            end < text.length
        ) {
            const lastPeriod =
                chunk.lastIndexOf(".");

            const lastNewLine =
                chunk.lastIndexOf("\n");

            const bestBreak =
                Math.max(
                    lastPeriod,
                    lastNewLine
                );

            if (
                bestBreak > chunkSize * 0.6
            ) {
                chunk =
                    chunk.substring(
                        0,
                        bestBreak + 1
                    );

                end =
                    start +
                    bestBreak +
                    1;
            }
        }

        chunk = chunk.trim();

        if (chunk) {
            chunks.push({
                text: chunk,
                chunkIndex: index,
            });

            index++;
        }

        const nextStart =
            end - overlap;

        start =
            nextStart > start
                ? nextStart
                : end;
    }

    return chunks;
};


/**
 * Process uploaded document
 */
const processDocument = async (
    documentId
) => {
    const document =
        await Document.findById(
            documentId
        );

    if (!document) {
        throw new Error(
            "Document not found."
        );
    }

    try {
        document.status =
            "processing";

        document.processingError =
            null;

        await document.save();

        // Check file
        if (
            !document.filePath ||
            !fs.existsSync(
                document.filePath
            )
        ) {
            throw new Error(
                "Document file does not exist."
            );
        }

        // Extract text
        const extractedText =
            await extractText(
                document.filePath,
                document.fileType
            );

        // Clean text
        const cleanedText =
            cleanText(
                extractedText
            );

        if (!cleanedText) {
            throw new Error(
                "No readable text found in document."
            );
        }

        // Create chunks
        const chunks =
            createChunks(
                cleanedText,
                Number(
                    process.env.CHUNK_SIZE ||
                    1000
                ),
                Number(
                    process.env.CHUNK_OVERLAP ||
                    150
                )
            );

        // Store document
        document.extractedText =
            cleanedText;

        document.chunks =
            chunks;

        document.status =
            "processed";

        document.processedAt =
            new Date();

        document.processingError =
            null;

        await document.save();

        return document;
    } catch (error) {
        document.status =
            "failed";

        document.processingError =
            error.message;

        await document.save();

        throw error;
    }
};


/**
 * Get document by ID
 */
const getDocumentById = async (
    documentId,
    userId
) => {
    const document =
        await Document.findOne({
            _id: documentId,
            user: userId,
        });

    if (!document) {
        throw new Error(
            "Document not found."
        );
    }

    return document;
};


/**
 * Delete physical document
 */
const deleteDocumentFile = async (
    document
) => {
    if (
        document.filePath &&
        fs.existsSync(
            document.filePath
        )
    ) {
        await fs.promises.unlink(
            document.filePath
        );
    }

    return true;
};


/**
 * Delete document completely
 */
const deleteDocument = async (
    documentId,
    userId
) => {
    const document =
        await getDocumentById(
            documentId,
            userId
        );

    await deleteDocumentFile(
        document
    );

    await document.deleteOne();

    return true;
};


module.exports = {
    extractText,
    cleanText,
    createChunks,
    processDocument,
    getDocumentById,
    deleteDocumentFile,
    deleteDocument,
};