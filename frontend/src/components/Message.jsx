import React, { useState } from "react";

const Message = ({
    message,
    onFeedback,
}) => {
    const [copied, setCopied] =
        useState(false);

    const isUser =
        message.role === "user";

    const isAssistant =
        message.role === "assistant";

    const copyMessage = async () => {
        try {
            await navigator.clipboard.writeText(
                message.content
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch (error) {
            console.error(
                "Copy failed:",
                error
            );
        }
    };

    return (
        <div
            className={`flex ${
                isUser
                    ? "justify-end"
                    : "justify-start"
            }`}
        >
            <div
                className={`flex gap-3 max-w-[90%] md:max-w-[75%] ${
                    isUser
                        ? "flex-row-reverse"
                        : "flex-row"
                }`}
            >
                {/* Avatar */}
                <div
                    className={`
                        flex-shrink-0
                        w-9 h-9
                        rounded-full
                        flex items-center justify-center
                        ${
                            isUser
                                ? "bg-blue-600"
                                : "bg-gray-200"
                        }
                    `}
                >
                    <span
                        className={
                            isUser
                                ? "text-white text-sm"
                                : "text-gray-700 text-sm"
                        }
                    >
                        {isUser
                            ? "U"
                            : "AI"}
                    </span>
                </div>

                {/* Message Content */}
                <div>
                    <div
                        className={`
                            px-4 py-3 rounded-2xl
                            ${
                                isUser
                                    ? "bg-blue-600 text-white rounded-tr-sm"
                                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                            }
                        `}
                    >
                        <p className="text-sm leading-6 whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    </div>

                    {/* Timestamp */}
                    {message.timestamp && (
                        <p
                            className={`text-xs text-gray-400 mt-1 ${
                                isUser
                                    ? "text-right"
                                    : "text-left"
                            }`}
                        >
                            {new Date(
                                message.timestamp
                            ).toLocaleTimeString(
                                [],
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                        </p>
                    )}

                    {/* Assistant Actions */}
                    {isAssistant && (
                        <div className="flex items-center gap-2 mt-2">
                            <button
                                onClick={copyMessage}
                                className="text-xs text-gray-500 hover:text-gray-800"
                            >
                                {copied
                                    ? "✓ Copied"
                                    : "Copy"}
                            </button>

                            <button
                                onClick={() =>
                                    onFeedback?.(
                                        message,
                                        "positive"
                                    )
                                }
                                className="text-xs text-gray-500 hover:text-green-600"
                                title="Helpful"
                            >
                                👍
                            </button>

                            <button
                                onClick={() =>
                                    onFeedback?.(
                                        message,
                                        "negative"
                                    )
                                }
                                className="text-xs text-gray-500 hover:text-red-600"
                                title="Not helpful"
                            >
                                👎
                            </button>
                        </div>
                    )}

                    {/* Sources */}
                    {isAssistant &&
                        message.sources?.length >
                            0 && (
                            <div className="mt-3">
                                <p className="text-xs font-semibold text-gray-600 mb-2">
                                    Sources
                                </p>

                                <div className="space-y-2">
                                    {message.sources.map(
                                        (
                                            source,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    source._id ||
                                                    index
                                                }
                                                className="bg-gray-50 border border-gray-200 rounded-lg p-2"
                                            >
                                                <p className="text-xs text-gray-600">
                                                    Source{" "}
                                                    {index +
                                                        1}
                                                </p>

                                                {source.text && (
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                                                        {
                                                            source.text
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default Message;