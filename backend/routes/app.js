const express = require("express");
const dotenv = require("dotenv");

const {
    notFound,
    errorHandler,
} = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// ===============================
// BODY PARSER
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================
// ROUTES
// ===============================
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const documentRoutes = require("./routes/documentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const userRoutes = require("./routes/userRoutes");


app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);


// ===============================
// 404
// ===============================
app.use(notFound);


// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use(errorHandler);


module.exports = app;