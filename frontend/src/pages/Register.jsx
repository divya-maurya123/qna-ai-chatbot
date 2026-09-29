import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const Register = ({ onLogin }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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

        const {
            name,
            email,
            password,
            confirmPassword,
        } = formData;

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            setError(
                "All fields are required."
            );
            return;
        }

        if (name.trim().length < 2) {
            setError(
                "Name must contain at least 2 characters."
            );
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (
            password !==
            confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Registration failed."
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                            AI
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mt-4">
                        Create Account
                    </h1>

                    <p className="text-gray-500 text-sm mt-1">
                        Join the AI Q&A Assistant
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
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

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
                            placeholder="Minimum 6 characters"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={
                                formData.confirmPassword
                            }
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:bg-gray-400"
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>
                </form>

                {/* Login */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;