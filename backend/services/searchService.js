const Document = require("../models/Document");


/*
|--------------------------------------------------------------------------
| SEARCH SERVICE
|--------------------------------------------------------------------------
| Responsibilities:
|
| 1. Search user's documents
| 2. Score document chunks
| 3. Return relevant chunks
| 4. Build context for AI
|--------------------------------------------------------------------------
*/


/**
 * Normalize text
 */
const normalizeText = (text) => {
    return String(text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};


/**
 * Convert text to words
 */
const tokenize = (text) => {
    return normalizeText(text)
        .split(" ")
        .filter(
            (word) =>
                word.length > 2
        );
};


/**
 * Remove duplicate words
 */
const uniqueWords = (words) => {
    return [
        ...new Set(words),
    ];
};


/**
 * Calculate keyword score
 */
const calculateScore = (
    query,
    text
) => {
    const queryWords =
        uniqueWords(
            tokenize(query)
        );

    const textWords =
        tokenize(text);

    if (
        queryWords.length === 0 ||
        textWords.length === 0
    ) {
        return 0;
    }

    const textWordSet =
        new Set(textWords);

    let matchedWords = 0;

    for (
        const word of queryWords
    ) {
        if (
            textWordSet.has(word)
        ) {
            matchedWords++;
        }
    }

    // Basic keyword matching
    let score =
        matchedWords /
        queryWords.length;

    // Exact phrase bonus
    const normalizedQuery =
        normalizeText(query);

    const normalizedText =
        normalizeText(text);

    if (
        normalizedText.includes(
            normalizedQuery
        )
    ) {
        score += 0.3;
    }

    return Math.min(
        score,
        1
    );
};


/**
 * Search chunks from user's documents
 */
const searchDocuments = async ({
    userId,
    query,
    documentIds = [],
    limit = 5,
}) => {
    if (!userId) {
        throw new Error(
            "User ID is required."
        );
    }

    if (!query || !query.trim()) {
        return [];
    }

    // Build MongoDB filter
    const filter = {
        user: userId,
        status: "processed",
    };

    if (
        Array.isArray(documentIds) &&
        documentIds.length > 0
    ) {
        filter._id = {
            $in: documentIds,
        };
    }

    // Get documents
    const documents =
        await Document.find(
            filter
        ).select(
            "originalName fileName chunks"
        );

    const results = [];

    // Search every chunk
    for (
        const document of documents
    ) {
        for (
            const chunk of document.chunks
        ) {
            const score =
                calculateScore(
                    query,
                    chunk.text
                );

            if (score > 0) {
                results.push({
                    documentId:
                        document._id,

                    documentName:
                        document.originalName,

                    chunkIndex:
                        chunk.chunkIndex,

                    text:
                        chunk.text,

                    score,
                });
            }
        }
    }

    // Sort by relevance
    results.sort(
        (a, b) =>
            b.score - a.score
    );

    // Return top results
    return results.slice(
        0,
        Number(limit)
    );
};


/**
 * Build AI context from search results
 */
const buildSearchContext = (
    results
) => {
    if (
        !results ||
        results.length === 0
    ) {
        return "";
    }

    return results
        .map(
            (result, index) => `
[Source ${index + 1}]
Document: ${result.documentName}
Relevance Score: ${result.score.toFixed(3)}

${result.text}
`
        )
        .join("\n--------------------\n");
};


/**
 * Search and create context
 */
const searchWithContext = async ({
    userId,
    query,
    documentIds = [],
    limit = 5,
}) => {
    const results =
        await searchDocuments({
            userId,
            query,
            documentIds,
            limit,
        });

    const context =
        buildSearchContext(
            results
        );

    return {
        results,
        context,
    };
};


/**
 * Get sources in format expected by
 * Conversation.messages.sources
 */
const formatSources = (
    results
) => {
    return results.map(
        (result) => ({
            document:
                result.documentId,

            text:
                result.text,

            score:
                result.score,
        })
    );
};


module.exports = {
    normalizeText,
    tokenize,
    calculateScore,
    searchDocuments,
    buildSearchContext,
    searchWithContext,
    formatSources,
};