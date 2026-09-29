// const express = require("express");

// const router = express.Router();

// router.post("/", (req, res) => {
//     const { message } = req.body;

//     console.log("User:", message);

//     if (!message) {
//         return res.status(400).json({
//             error: "Message is required"
//         });
//     }

//     let answer = "Sorry, I don't know the answer.";

//     const question = message.toLowerCase();

//     if (question.includes("what is java")) {
//         answer = "Java is a high-level, object-oriented programming language used to build web, mobile, desktop, and enterprise applications.";
//     }

//     else if (question.includes("what is javascript")) {
//         answer = "JavaScript is a programming language mainly used to make web pages interactive and dynamic.";
//     }

//     else if (question.includes("what is python")) {
//         answer = "Python is a high-level, interpreted programming language known for its simple syntax and wide use in web development, AI, data science, and automation.";
//     }

//     else if (question.includes("what is oops")) {
//         answer = "OOP stands for Object-Oriented Programming. Its main concepts are Encapsulation, Inheritance, Polymorphism, and Abstraction.";
//     }

//     res.json({
//         success: true,
//         answer: answer
//     });
// });

// module.exports = router;


// const express = require("express");
// const fs = require("fs");
// const path = require("path");

// const router = express.Router();

// // Load training data
// const trainingPath = path.join(
//     __dirname,
//     "../data/training.json"
// );

// const trainingData = JSON.parse(
//     fs.readFileSync(trainingPath, "utf-8")
// );

// // Combine HR and Technical questions
// const questions = [
//     ...trainingData.hr,
//     ...trainingData.technical
// ];

// router.post("/", (req, res) => {

//     const { message } = req.body;

//     console.log("User:", message);

//     if (!message || !message.trim()) {
//         return res.status(400).json({
//             success: false,
//             error: "Message is required"
//         });
//     }

//     const question = message
//         .toLowerCase()
//         .trim();

//     let answer =
//         "Sorry, I don't know the answer to that question yet.";

//     // Search question
//     const found = questions.find(item =>
//         question.includes(item.question.toLowerCase()) ||
//         item.question.toLowerCase().includes(question)
//     );

//     if (found) {
//         answer = found.answer;
//     }

//     res.json({
//         success: true,
//         question: message,
//         answer: answer
//     });
// });

// module.exports = router;


const express = require("express");
const trainingData = require("../data/training.json");

const router = express.Router();

// Get all intents from training.json
const intents = trainingData.intents || [];

/**
 * Normalize user message
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[?!.,]/g, "");
}

/**
 * Find matching intent
 */
function findIntent(message) {
    const question = normalizeText(message);

    // First try exact match
    for (const intent of intents) {
        for (const pattern of intent.patterns || []) {
            if (question === normalizeText(pattern)) {
                return intent;
            }
        }
    }

    // Then try keyword/substring match
    for (const intent of intents) {
        for (const pattern of intent.patterns || []) {
            const normalizedPattern = normalizeText(pattern);

            if (
                normalizedPattern.length > 2 &&
                question.includes(normalizedPattern)
            ) {
                return intent;
            }
        }
    }

    return null;
}

/**
 * POST /api/chat
 */
router.post("/", (req, res) => {
    try {
        const { message } = req.body;

        // Validate message
        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "Message is required"
            });
        }

        console.log("User:", message);

        // Find matching intent
        const matchedIntent = findIntent(message);

        let answer;
        let tag = "fallback";

        if (matchedIntent) {
            tag = matchedIntent.tag;

            const responses = matchedIntent.responses || [];

            if (responses.length > 0) {
                // Random response
                const randomIndex = Math.floor(
                    Math.random() * responses.length
                );

                answer = responses[randomIndex];
            } else {
                answer = "I found your question, but I don't have an answer yet.";
            }
        } else {
            // Fallback response
            answer =
                "Sorry, I don't know the answer to that yet. You can ask me about Java, OOPs, DSA, DBMS, SQL, MongoDB, React, Node.js, projects, HR interview questions, or general interview preparation.";
        }

        // Send response
        return res.status(200).json({
            success: true,
            question: message,
            intent: tag,
            answer: answer
        });

    } catch (error) {
        console.error("Chat Route Error:", error);

        return res.status(500).json({
            success: false,
            error: "Something went wrong while processing your question."
        });
    }
});

module.exports = router;