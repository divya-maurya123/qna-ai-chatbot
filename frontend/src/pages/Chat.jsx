import React, {
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import FileUpload from "../components/FileUpload";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


const Chat = () => {
    const navigate = useNavigate();

    const [user, setUser] =
        useState(null);

    const [
        conversations,
        setConversations,
    ] = useState([]);

    const [
        activeConversation,
        setActiveConversation,
    ] = useState(null);

    const [messages, setMessages] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [
        pageLoading,
        setPageLoading,
    ] = useState(true);

    const [
        sidebarOpen,
        setSidebarOpen,
    ] = useState(false);

    const [
        showUpload,
        setShowUpload,
    ] = useState(false);


    // ==========================================
    // AUTH
    // ==========================================

    useEffect(() => {
        const token =
            localStorage.getItem(
                "token"
            );

        const storedUser =
            localStorage.getItem(
                "user"
            );

        if (!token) {
            navigate("/login");
            return;
        }

        if (storedUser) {
            try {
                setUser(
                    JSON.parse(
                        storedUser
                    )
                );
            } catch (error) {
                console.error(
                    error
                );
            }
        }

        loadConversations();
    }, []);


    // ==========================================
    // API HELPER
    // ==========================================

    const apiRequest = async (
        endpoint,
        options = {}
    ) => {
        const token =
            localStorage.getItem(
                "token"
            );

        const response =
            await fetch(
                `${API_URL}${endpoint}`,
                {
                    ...options,
                    headers: {
                        ...(options.body instanceof FormData
                            ? {}
                            : {
                                  "Content-Type":
                                      "application/json",
                              }),
                        Authorization: `Bearer ${token}`,
                        ...options.headers,
                    },
                }
            );

        if (
            response.status ===
            401
        ) {
            localStorage.clear();
            navigate("/login");
            throw new Error(
                "Session expired."
            );
        }

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                    "Request failed."
            );
        }

        return data;
    };


    // ==========================================
    // LOAD CONVERSATIONS
    // ==========================================

    const loadConversations =
        async () => {
            try {
                setPageLoading(
                    true
                );

                const data =
                    await apiRequest(
                        "/chat"
                    );

                setConversations(
                    data.conversations ||
                        []
                );

                // Select first conversation
                if (
                    data.conversations
                        ?.length > 0
                ) {
                    await selectConversation(
                        data
                            .conversations[0]
                            ._id
                    );
                }
            } catch (error) {
                console.error(
                    "Load conversations:",
                    error
                );
            } finally {
                setPageLoading(
                    false
                );
            }
        };


    // ==========================================
    // SELECT CONVERSATION
    // ==========================================

    const selectConversation =
        async (
            conversationId
        ) => {
            try {
                setLoading(
                    true
                );

                const data =
                    await apiRequest(
                        `/chat/${conversationId}`
                    );

                setActiveConversation(
                    conversationId
                );

                setMessages(
                    data.conversation
                        ?.messages ||
                        []
                );

                setSidebarOpen(
                    false
                );
            } catch (error) {
                console.error(
                    "Conversation error:",
                    error
                );
            } finally {
                setLoading(
                    false
                );
            }
        };


    // ==========================================
    // NEW CHAT
    // ==========================================

    const createNewChat =
        async () => {
            try {
                const data =
                    await apiRequest(
                        "/chat",
                        {
                            method: "POST",
                            body: JSON.stringify(
                                {
                                    title:
                                        "New Conversation",
                                }
                            ),
                        }
                    );

                const newConversation =
                    data.conversation;

                setConversations(
                    (previous) => [
                        newConversation,
                        ...previous,
                    ]
                );

                setActiveConversation(
                    newConversation._id
                );

                setMessages([]);

                setSidebarOpen(
                    false
                );
            } catch (error) {
                console.error(
                    "Create chat:",
                    error
                );
            }
        };


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const sendMessage = async (
        text
    ) => {
        let conversationId =
            activeConversation;

        try {
            setLoading(
                true
            );

            // Create conversation if none exists
            if (!conversationId) {
                const newChat =
                    await apiRequest(
                        "/chat",
                        {
                            method: "POST",
                            body: JSON.stringify(
                                {
                                    title:
                                        text.substring(
                                            0,
                                            50
                                        ),
                                }
                            ),
                        }
                    );

                conversationId =
                    newChat
                        .conversation
                        ._id;

                setActiveConversation(
                    conversationId
                );

                setConversations(
                    (previous) => [
                        newChat.conversation,
                        ...previous,
                    ]
                );
            }

            // Optimistic user message
            const temporaryMessage = {
                _id:
                    `temp-${Date.now()}`,
                role: "user",
                content: text,
                timestamp:
                    new Date().toISOString(),
            };

            setMessages(
                (previous) => [
                    ...previous,
                    temporaryMessage,
                ]
            );

            const data =
                await apiRequest(
                    `/chat/${conversationId}/message`,
                    {
                        method: "POST",
                        body: JSON.stringify(
                            {
                                message:
                                    text,
                            }
                        ),
                    }
                );

            // Add real messages
            setMessages(
                (previous) => {
                    const withoutTemporary =
                        previous.filter(
                            (msg) =>
                                !msg._id?.startsWith(
                                    "temp-"
                                )
                        );

                    return [
                        ...withoutTemporary,
                        data.userMessage,
                        data.assistantMessage,
                    ];
                }
            );

            // Refresh conversation list
            const conversationsData =
                await apiRequest(
                    "/chat"
                );

            setConversations(
                conversationsData.conversations ||
                    []
            );

        } catch (error) {
            console.error(
                "Send message:",
                error
            );

            setMessages(
                (previous) => [
                    ...previous,
                    {
                        role: "assistant",
                        content:
                            error.message ||
                            "Unable to process your message.",
                        timestamp:
                            new Date().toISOString(),
                    },
                ]
            );
        } finally {
            setLoading(
                false
            );
        }
    };


    // ==========================================
    // DELETE CONVERSATION
    // ==========================================

    const deleteConversation =
        async (
            conversationId
        ) => {
            const confirmed =
                window.confirm(
                    "Delete this conversation?"
                );

            if (!confirmed) {
                return;
            }

            try {
                await apiRequest(
                    `/chat/${conversationId}`,
                    {
                        method: "DELETE",
                    }
                );

                const remaining =
                    conversations.filter(
                        (conversation) =>
                            conversation._id !==
                            conversationId
                    );

                setConversations(
                    remaining
                );

                if (
                    activeConversation ===
                    conversationId
                ) {
                    if (
                        remaining.length >
                        0
                    ) {
                        await selectConversation(
                            remaining[0]
                                ._id
                        );
                    } else {
                        setActiveConversation(
                            null
                        );

                        setMessages(
                            []
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "Delete conversation:",
                    error
                );
            }
        };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        navigate("/login");
    };


    // ==========================================
    // UPLOAD DOCUMENT
    // ==========================================

    const uploadDocument =
        async (file) => {
            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            const data =
                await apiRequest(
                    "/documents/upload",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

            alert(
                data.message ||
                    "Document uploaded successfully."
            );
        };


    // ==========================================
    // FEEDBACK
    // ==========================================

    const submitFeedback =
        async (
            message,
            rating
        ) => {
            if (
                !activeConversation ||
                !message?._id
            ) {
                return;
            }

            try {
                await apiRequest(
                    "/feedback",
                    {
                        method: "POST",
                        body: JSON.stringify(
                            {
                                conversation:
                                    activeConversation,

                                messageId:
                                    message._id,

                                rating,

                                category:
                                    rating ===
                                    "positive"
                                        ? "helpful"
                                        : "other",
                            }
                        ),
                    }
                );
            } catch (error) {
                console.error(
                    "Feedback error:",
                    error
                );
            }
        };


    // ==========================================
    // LOADING
    // ==========================================

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                    <p className="text-gray-500 mt-4">
                        Loading chat...
                    </p>
                </div>
            </div>
        );
    }


    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">

            <Navbar
                user={user}
                onLogout={logout}
                onMenuClick={() =>
                    setSidebarOpen(
                        true
                    )
                }
            />

            <div className="flex flex-1 min-h-0">

                <Sidebar
                    conversations={
                        conversations
                    }
                    activeConversation={
                        activeConversation
                    }
                    onSelectConversation={
                        selectConversation
                    }
                    onNewChat={
                        createNewChat
                    }
                    onDeleteConversation={
                        deleteConversation
                    }
                    isOpen={
                        sidebarOpen
                    }
                    onClose={() =>
                        setSidebarOpen(
                            false
                        )
                    }
                />

                <main className="flex-1 flex flex-col min-w-0">

                    <ChatWindow
                        messages={
                            messages
                        }
                        loading={
                            loading
                        }
                        onFeedback={
                            submitFeedback
                        }
                    />

                    <ChatInput
                        onSend={
                            sendMessage
                        }
                        disabled={
                            loading
                        }
                        onFileUpload={() =>
                            setShowUpload(
                                true
                            )
                        }
                    />
                </main>
            </div>

            {showUpload && (
                <FileUpload
                    onUpload={
                        uploadDocument
                    }
                    onClose={() =>
                        setShowUpload(
                            false
                        )
                    }
                />
            )}
        </div>
    );
};

export default Chat;