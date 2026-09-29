const Conversation = require("../models/Conversation");
const Document = require("../models/Document");

/*
|--------------------------------------------------------------------------
| AI SERVICE
|--------------------------------------------------------------------------
| This service handles AI response generation.
|
| Currently it supports:
| 1. OpenAI-compatible API
| 2. Conversation context
| 3. Document context
| 4. Fallback response when AI API is not configured
|--------------------------------------------------------------------------
*/


/**
 * Get recent conversation messages
 */
const getConversationHistory = async (conversationId, limit = 10) => {
    try {
        const conversation = await Conversation.findById(
            conversationId
        ).select("messages");

        if (!conversation) {
            return [];
        }

        return conversation.messages
            .slice(-limit)
            .map((message) => ({
                role: message.role,
                content: message.content,
            }));
    } catch (error) {
        console.error(
            "Conversation History Error:",
            error.message
        );

        return [];
    }
};


/**
 * Build system prompt
 */
const buildSystemPrompt = (documentContext = "") => {
    let prompt = `
You are a helpful AI assistant.

Rules:
1. Give clear and accurate answers.
2. Do not invent facts.
3. If you do not know something, say so.
4. Use the provided document context when answering document-related questions.
5. Keep answers easy to understand.
6. Use bullet points when they improve readability.
`;

    if (documentContext) {
        prompt += `

DOCUMENT CONTEXT:
-----------------
${documentContext}
-----------------

Answer the user's question using the document context whenever relevant.
If the answer cannot be found in the provided context, clearly say that the information is not available in the provided documents.
`;
    }

    return prompt;
};


/**
 * Call OpenAI-compatible API
 */
const callAIAPI = async (messages) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return null;
    }

    try {
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },

                body: JSON.stringify({
                    model:
                        process.env.OPENAI_MODEL ||
                        "gpt-4o-mini",

                    messages,

                    temperature: 0.2,

                    max_tokens: 1000,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `AI API Error: ${response.status} ${errorText}`
            );
        }

        const data = await response.json();

        return (
            data?.choices?.[0]?.message?.content ||
            null
        );
    } catch (error) {
        console.error(
            "AI API Error:",
            error.message
        );

        throw error;
    }
};


/**
 * Generate AI response
 */
const generateAIResponse = async ({
    message,
    conversationId = null,
    documentContext = "",
}) => {
    if (!message || !message.trim()) {
        throw new Error("Message is required.");
    }

    // Get previous conversation
    let history = [];

    if (conversationId) {
        history = await getConversationHistory(
            conversationId,
            10
        );
    }

    // System prompt
    const systemPrompt =
        buildSystemPrompt(documentContext);

    const messages = [
        {
            role: "system",
            content: systemPrompt,
        },
        ...history,
        {
            role: "user",
            content: message.trim(),
        },
    ];

    // Call AI API
    const aiResponse = await callAIAPI(messages);

    // If API is not configured
    if (!aiResponse) {
        return {
            answer:
                "AI service is not configured yet. Please add OPENAI_API_KEY to your environment variables.",
            model: "fallback",
            sources: [],
        };
    }

    return {
        answer: aiResponse,
        model:
            process.env.OPENAI_MODEL ||
            "gpt-4o-mini",
        sources: [],
    };
};


/**
 * Generate response using document context
 */
const generateDocumentAnswer = async ({
    message,
    conversationId,
    documentContext,
    sources = [],
}) => {
    const result = await generateAIResponse({
        message,
        conversationId,
        documentContext,
    });

    return {
        ...result,
        sources,
    };
};


module.exports = {
    generateAIResponse,
    generateDocumentAnswer,
    getConversationHistory,
    buildSystemPrompt,
};