import React from "react";

const Loading = () => {
    return (
        <div className="flex items-center gap-3 bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
            </div>

            <span className="text-sm text-gray-500">
                AI is thinking...
            </span>
        </div>
    );
};

export default Loading;