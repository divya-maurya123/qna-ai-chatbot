const Conversation = require("../models/Conversation");
const { generateAnswer } = require("../services/aiService");


// ==========================================
// SEND CHAT MESSAGE
// ==========================================
const sendMessage = async (req, res, next) => {
    try {
        const { question, conversationId } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        let conversation;

        // Existing conversation
        if (conversationId) {
            conversation = await Conversation.findOne({
                _id: conversationId,
                user: req.user.id
            });

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: "Conversation not found"
                });
            }
        }

        // Create new conversation
        if (!conversation) {
            conversation = await Conversation.create({
                user: req.user.id,
                title: question.substring(0, 50),
                messages: []
            });
        }

        // AI response
        const result = await generateAnswer(question);

        const answer =
            typeof result === "string"
                ? result
                : result.answer;

        // Save user message
        conversation.messages.push({
            role: "user",
            content: question
        });

        // Save AI message
        conversation.messages.push({
            role: "assistant",
            content: answer
        });

        conversation.updatedAt = new Date();

        await conversation.save();

        res.status(200).json({
            success: true,
            conversationId: conversation._id,
            question,
            answer
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// GET ALL CHAT HISTORY
// ==========================================
const getChatHistory = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            user: req.user.id
        })
            .select("title messages createdAt updatedAt")
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: conversations.length,
            conversations
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// GET SINGLE CONVERSATION
// ==========================================
const getConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        res.status(200).json({
            success: true,
            conversation
        });

    } catch (error) {
        next(error);
    }
};


// ==========================================
// DELETE CONVERSATION
// ==========================================
const deleteConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Conversation deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    sendMessage,
    getChatHistory,
    getConversation,
    deleteConversation
};