import React, {
    useRef,
    useState,
} from "react";

const ChatInput = ({
    onSend,
    disabled = false,
    onFileUpload,
}) => {
    const [message, setMessage] =
        useState("");

    const textareaRef =
        useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedMessage =
            message.trim();

        if (
            !trimmedMessage ||
            disabled
        ) {
            return;
        }

        onSend(trimmedMessage);

        setMessage("");

        if (textareaRef.current) {
            textareaRef.current.style.height =
                "auto";
        }
    };

    const handleKeyDown = (e) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleChange = (e) => {
        setMessage(e.target.value);

        // Auto resize
        e.target.style.height =
            "auto";

        e.target.style.height =
            `${Math.min(
                e.target.scrollHeight,
                150
            )}px`;
    };

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <form
                onSubmit={handleSubmit}
                className="max-w-4xl mx-auto"
            >
                <div className="flex items-end gap-2 bg-gray-50 border border-gray-300 rounded-2xl p-2 focus-within:border-blue-500">
                    {/* File Upload Button */}
                    <button
                        type="button"
                        onClick={
                            onFileUpload
                        }
                        disabled={disabled}
                        className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl disabled:opacity-50"
                        title="Upload document"
                    >
                        📎
                    </button>

                    {/* Input */}
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={
                            handleChange
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                        disabled={
                            disabled
                        }
                        rows={1}
                        placeholder="Ask me anything..."
                        className="flex-1 resize-none bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 py-2.5 max-h-[150px]"
                    />

                    {/* Send */}
                    <button
                        type="submit"
                        disabled={
                            disabled ||
                            !message.trim()
                        }
                        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        title="Send message"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h14M12 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>

                <p className="text-center text-xs text-gray-400 mt-2">
                    Enter to send • Shift + Enter for new line
                </p>
            </form>
        </div>
    );
};

export default ChatInput;