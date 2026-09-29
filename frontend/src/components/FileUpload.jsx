import React, {
    useRef,
    useState,
} from "react";

const FileUpload = ({
    onUpload,
    onClose,
}) => {
    const fileInputRef =
        useRef(null);

    const [file, setFile] =
        useState(null);

    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState("");

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/png",
        "image/jpeg",
    ];

    const maxSize =
        10 * 1024 * 1024;


    const validateFile = (
        selectedFile
    ) => {
        if (
            !allowedTypes.includes(
                selectedFile.type
            )
        ) {
            return "Unsupported file type. Please upload PDF, DOC, DOCX, TXT, PNG or JPG.";
        }

        if (
            selectedFile.size >
            maxSize
        ) {
            return "File size cannot exceed 10 MB.";
        }

        return "";
    };


    const handleFileChange = (
        e
    ) => {
        const selectedFile =
            e.target.files?.[0];

        setError("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const validationError =
            validateFile(
                selectedFile
            );

        if (validationError) {
            setError(
                validationError
            );
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };


    const handleUpload = async () => {
        if (!file) {
            setError(
                "Please select a file."
            );
            return;
        }

        try {
            setUploading(true);
            setError("");

            await onUpload(file);

            setFile(null);

            if (
                fileInputRef.current
            ) {
                fileInputRef.current.value =
                    "";
            }

            onClose?.();
        } catch (err) {
            setError(
                err.message ||
                    "Upload failed."
            );
        } finally {
            setUploading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Upload Document
                    </h2>

                    <button
                        onClick={onClose}
                        disabled={
                            uploading
                        }
                        className="text-gray-400 hover:text-gray-700 text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    {/* Drop Area */}
                    <button
                        type="button"
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
                        className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-8 text-center transition"
                    >
                        <div className="text-4xl mb-3">
                            📄
                        </div>

                        <p className="font-medium text-gray-700">
                            Click to select a document
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                            PDF, DOC, DOCX, TXT, PNG, JPG
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            Maximum size: 10 MB
                        </p>
                    </button>

                    <input
                        ref={
                            fileInputRef
                        }
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        onChange={
                            handleFileChange
                        }
                        className="hidden"
                    />

                    {/* Selected File */}
                    {file && (
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">
                                        {file.name}
                                    </p>

                                    <p className="text-xs text-gray-400 mt-1">
                                        {(
                                            file.size /
                                            1024 /
                                            1024
                                        ).toFixed(
                                            2
                                        )}{" "}
                                        MB
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setFile(
                                            null
                                        )
                                    }
                                    className="text-red-500 hover:text-red-700 ml-3"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 mt-5">
                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            disabled={
                                uploading
                            }
                            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleUpload
                            }
                            disabled={
                                !file ||
                                uploading
                            }
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {uploading
                                ? "Uploading..."
                                : "Upload"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;