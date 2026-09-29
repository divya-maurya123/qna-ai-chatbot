import React from "react";

const Sidebar = ({
    conversations = [],
    activeConversation,
    onSelectConversation,
    onNewChat,
    onDeleteConversation,
    isOpen,
    onClose,
}) => {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed md:static
                    top-0 left-0
                    z-40
                    h-full md:h-[calc(100vh-4rem)]
                    w-72
                    bg-gray-50
                    border-r border-gray-200
                    flex flex-col
                    transition-transform duration-300
                    ${isOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0"
                    }
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">
                        Conversations
                    </h2>

                    <button
                        onClick={onClose}
                        className="md:hidden p-1 rounded hover:bg-gray-200"
                    >
                        ✕
                    </button>
                </div>

                {/* New Chat */}
                <div className="p-4">
                    <button
                        onClick={onNewChat}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition"
                    >
                        + New Chat
                    </button>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto px-3 pb-4">
                    {conversations.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 py-10">
                            No conversations yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conversation) => {
                                const isActive =
                                    activeConversation ===
                                    conversation._id;

                                return (
                                    <div
                                        key={conversation._id}
                                        className={`
                                            group flex items-center gap-2
                                            rounded-lg
                                            transition
                                            ${
                                                isActive
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "hover:bg-gray-200 text-gray-700"
                                            }
                                        `}
                                    >
                                        <button
                                            onClick={() =>
                                                onSelectConversation(
                                                    conversation._id
                                                )
                                            }
                                            className="flex-1 text-left px-3 py-3 min-w-0"
                                        >
                                            <p className="text-sm font-medium truncate">
                                                {conversation.title ||
                                                    "New Conversation"}
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                {conversation.lastMessageAt
                                                    ? new Date(
                                                          conversation.lastMessageAt
                                                      ).toLocaleDateString()
                                                    : ""}
                                            </p>
                                        </button>

                                        <button
                                            onClick={() =>
                                                onDeleteConversation(
                                                    conversation._id
                                                )
                                            }
                                            className="mr-2 p-1.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                                            title="Delete conversation"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;