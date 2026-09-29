import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const Login = ({ onLogin }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Email and password are required.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed."
                );
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            if (onLogin) {
                onLogin(data.user);
            }

            navigate("/dashboard");

        } catch (err) {
            setError(
                err.message ||
                    "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                            AI
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mt-4">
                        Welcome Back
                    </h1>

                    <p className="text-gray-500 text-sm mt-1">
                        Sign in to your AI Q&A Assistant
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:bg-gray-400"
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>
                </form>

                {/* Register */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;