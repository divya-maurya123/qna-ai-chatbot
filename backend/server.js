// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const path = require("path");

// // Load environment variables
// dotenv.config();


// // ==========================================
// // IMPORT MIDDLEWARE
// // ==========================================

// const {
//     notFound,
//     errorHandler,
// } = require("./middleware/errorMiddleware");


// // ==========================================
// // IMPORT ROUTES
// // ==========================================

// const authRoutes = require("./routes/authRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const documentRoutes = require("./routes/documentRoutes");
// const feedbackRoutes = require("./routes/feedbackRoutes");
// const userRoutes = require("./routes/userRoutes");


// // ==========================================
// // CREATE EXPRESS APP
// // ==========================================

// const app = express();


// // ==========================================
// // CONFIGURATION
// // ==========================================

// const PORT = process.env.PORT || 5000;

// const MONGO_URI =
//     process.env.MONGO_URI ||
//     "mongodb://127.0.0.1:27017/ai_qa_chatbot";


// // ==========================================
// // BODY PARSERS
// // ==========================================

// app.use(express.json());

// app.use(
//     express.urlencoded({
//         extended: true,
//     })
// );


// // ==========================================
// // STATIC UPLOADS
// // ==========================================

// app.use(
//     "/uploads",
//     express.static(
//         path.join(__dirname, "uploads")
//     )
// );


// // ==========================================
// // HEALTH CHECK
// // ==========================================

// app.get("/", (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "AI Q&A Chatbot API is running.",
//         version: "1.0.0",
//         environment:
//             process.env.NODE_ENV ||
//             "development",
//     });
// });


// // ==========================================
// // API HEALTH CHECK
// // ==========================================

// app.get("/api/health", (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Server is healthy.",
//         database:
//             mongoose.connection.readyState === 1
//                 ? "connected"
//                 : "disconnected",
//         timestamp: new Date().toISOString(),
//     });
// });


// // ==========================================
// // API ROUTES
// // ==========================================

// app.use(
//     "/api/auth",
//     authRoutes
// );

// app.use(
//     "/api/chat",
//     chatRoutes
// );

// app.use(
//     "/api/documents",
//     documentRoutes
// );

// app.use(
//     "/api/feedback",
//     feedbackRoutes
// );

// app.use(
//     "/api/users",
//     userRoutes
// );


// // ==========================================
// // 404 HANDLER
// // ==========================================

// app.use(notFound);


// // ==========================================
// // GLOBAL ERROR HANDLER
// // ==========================================

// app.use(errorHandler);


// // ==========================================
// // DATABASE CONNECTION
// // ==========================================

// const connectDatabase = async () => {
//     try {
//         await mongoose.connect(
//             MONGO_URI
//         );

//         console.log(
//             "MongoDB connected successfully."
//         );

//         console.log(
//             `Database: ${mongoose.connection.name}`
//         );
//     } catch (error) {
//         console.error(
//             "MongoDB connection failed:"
//         );

//         console.error(
//             error.message
//         );

//         process.exit(1);
//     }
// };


// // ==========================================
// // START SERVER
// // ==========================================

// const startServer = async () => {
//     try {
//         await connectDatabase();

//         app.listen(
//             PORT,
//             () => {
//                 console.log(
//                     `Server running on port ${PORT}`
//                 );

//                 console.log(
//                     `http://localhost:${PORT}`
//                 );
//             }
//         );
//     } catch (error) {
//         console.error(
//             "Server startup failed:",
//             error.message
//         );

//         process.exit(1);
//     }
// };


// // ==========================================
// // HANDLE UNEXPECTED ERRORS
// // ==========================================

// process.on(
//     "unhandledRejection",
//     (error) => {
//         console.error(
//             "Unhandled Promise Rejection:",
//             error
//         );
//     }
// );


// process.on(
//     "uncaughtException",
//     (error) => {
//         console.error(
//             "Uncaught Exception:",
//             error
//         );

//         process.exit(1);
//     }
// );


// // ==========================================
// // START APPLICATION
// // ==========================================

// startServer();


// app.use("/api/chat", chatRoutes);

const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test backend
app.get("/", (req, res) => {
    res.json({
        message: "QnA AI Chatbot Backend is running!"
    });
});

// Chat API
app.use("/api/chat", chatRoutes);

// Start server
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
    console.log("http://localhost:" + PORT);
});