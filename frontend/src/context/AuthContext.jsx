import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  // Restore user after refreshing page
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      const newToken = data.token;

      const newUser =
        data.user || data.data?.user;

      localStorage.setItem("token", newToken);

      if (newUser) {
        localStorage.setItem(
          "user",
          JSON.stringify(newUser)
        );
      }

      setToken(newToken);
      setUser(newUser);

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed",
      };
    }
  };

  // Register
  const register = async (
    name,
    email,
    password
  ) => {
    try {
      const response = await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
        }
      );

      const data = response.data;

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );

        setToken(data.token);
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        setUser(data.user);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed",
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;