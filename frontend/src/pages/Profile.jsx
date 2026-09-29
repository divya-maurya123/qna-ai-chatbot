import React, {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const Dashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] =
        useState(null);

    const [stats, setStats] =
        useState({
            conversations: 0,
            documents: 0,
            feedback: 0,
        });

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const storedUser =
            localStorage.getItem(
                "user"
            );

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

        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {
                navigate("/login");
                return;
            }

            const response =
                await fetch(
                    `${API_URL}/users/stats`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            if (
                response.status ===
                401
            ) {
                localStorage.clear();
                navigate("/login");
                return;
            }

            const data =
                await response.json();

            if (response.ok) {
                setStats(
                    data.stats
                );
            }

        } catch (error) {
            console.error(
                "Stats error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2"
                    >
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">
                                AI
                            </span>
                        </div>

                        <span className="font-semibold text-gray-800">
                            AI Q&A Assistant
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-gray-800">
                                    {user.name}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {user.email}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={
                                logout
                            }
                            className="text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome back
                        {user?.name
                            ? `, ${user.name}`
                            : ""}
                        !
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage your AI conversations and documents.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <p className="text-sm text-gray-500">
                            Conversations
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {loading
                                ? "..."
                                : stats.conversations}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <p className="text-sm text-gray-500">
                            Documents
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {loading
                                ? "..."
                                : stats.documents}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <p className="text-sm text-gray-500">
                            Feedback
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            {loading
                                ? "..."
                                : stats.feedback}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <Link
                        to="/chat"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-7 transition"
                    >
                        <div className="text-3xl mb-4">
                            💬
                        </div>

                        <h2 className="text-xl font-bold">
                            Start a Conversation
                        </h2>

                        <p className="text-blue-100 mt-2 text-sm">
                            Ask questions and get AI-powered answers.
                        </p>

                        <div className="mt-5 font-medium">
                            Start Chat →
                        </div>
                    </Link>

                    <Link
                        to="/chat"
                        className="bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-7 transition"
                    >
                        <div className="text-3xl mb-4">
                            📄
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            Ask About Documents
                        </h2>

                        <p className="text-gray-500 mt-2 text-sm">
                            Upload documents and ask questions about their content.
                        </p>

                        <div className="mt-5 text-blue-600 font-medium">
                            Upload Document →
                        </div>
                    </Link>
                </div>

                {/* Features */}
                <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-5">
                        What you can do
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <div>
                            <div className="text-2xl mb-2">
                                🤖
                            </div>

                            <h3 className="font-semibold">
                                AI Answers
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                Get intelligent answers to your questions.
                            </p>
                        </div>

                        <div>
                            <div className="text-2xl mb-2">
                                📚
                            </div>

                            <h3 className="font-semibold">
                                Document Q&A
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                Search and ask questions about uploaded files.
                            </p>
                        </div>

                        <div>
                            <div className="text-2xl mb-2">
                                💾
                            </div>

                            <h3 className="font-semibold">
                                Chat History
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                Keep track of your previous conversations.
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;