import React from "react";

const Navbar = ({ user, onLogout, onMenuClick }) => {
    return (
        <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
            {/* Left Side */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Open menu"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">
                            AI
                        </span>
                    </div>

                    <div>
                        <h1 className="font-semibold text-gray-800">
                            AI Q&A Assistant
                        </h1>

                        <p className="hidden sm:block text-xs text-gray-500">
                            Intelligent Document Assistant
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {user && (
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-800">
                                {user.name}
                            </p>

                            <p className="text-xs text-gray-500">
                                {user.email}
                            </p>
                        </div>

                        <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-gray-700">
                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </span>
                        </div>
                    </div>
                )}

                <button
                    onClick={onLogout}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;