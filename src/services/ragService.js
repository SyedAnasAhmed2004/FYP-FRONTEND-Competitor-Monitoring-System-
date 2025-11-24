/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles AI queries using Django backend with ChromaDB
 */

import { api, API_ENDPOINTS } from '../config/api';

/**
 * Perform RAG query with retrieval and generation
 * @param {string} queryText - User's question
 * @param {number} topK - Number of chunks to retrieve (default: 5)
 * @param {string} competitorFilter - Filter by competitor name (default: 'Honda')
 * @returns {Promise<Object>} RAG response with answer and sources
 */
export const performRAGQuery = async (queryText, topK = 5, competitorFilter = 'Honda') => {
  try {
    const response = await api.post(API_ENDPOINTS.rag.query, {
      query: queryText,
      top_k: topK,
      competitor_filter: competitorFilter,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error || 'Failed to process RAG query',
    };
  } catch (error) {
    console.error('RAG Query Error:', error);
    return {
      success: false,
      error: error.message || 'Error performing RAG query',
    };
  }
};

/**
 * Perform semantic search only (no generation)
 * @param {string} queryText - Search query
 * @param {number} topK - Number of results (default: 10)
 * @param {string} competitorFilter - Filter by competitor name (default: 'Honda')
 * @returns {Promise<Object>} Search results
 */
export const performSemanticSearch = async (queryText, topK = 10, competitorFilter = 'Honda') => {
  try {
    const response = await api.post(API_ENDPOINTS.rag.search, {
      query: queryText,
      top_k: topK,
      competitor_filter: competitorFilter,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error || 'Failed to perform semantic search',
    };
  } catch (error) {
    console.error('Semantic Search Error:', error);
    return {
      success: false,
      error: error.message || 'Error performing semantic search',
    };
  }
};

/**
 * Get RAG system statistics
 * @returns {Promise<Object>} System stats (total chunks, queries, avg times, etc.)
 */
export const getRAGStats = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.rag.stats);

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error || 'Failed to fetch RAG statistics',
    };
  } catch (error) {
    console.error('RAG Stats Error:', error);
    return {
      success: false,
      error: error.message || 'Error fetching RAG statistics',
    };
  }
};

/**
 * Get available competitors for filtering
 * @returns {Promise<Object>} List of competitors with document counts
 */
export const getAvailableCompetitors = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.rag.competitors);

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error || 'Failed to fetch competitors',
    };
  } catch (error) {
    console.error('Get Competitors Error:', error);
    return {
      success: false,
      error: error.message || 'Error fetching competitors',
    };
  }
};

/**
 * Format RAG response for display in chat
 * @param {Object} ragResponse - RAG API response
 * @returns {Object} Formatted message object
 */
export const formatRAGResponse = (ragResponse) => {
  if (!ragResponse || !ragResponse.answer) {
    return {
      message: 'I apologize, but I was unable to generate a response. Please try again.',
      suggestions: ['Try rephrasing your question', 'Ask about specific competitors'],
    };
  }

  // Just return the answer from API without adding extra fields
  return {
    message: ragResponse.answer,
    suggestions: ragResponse.suggestions || [
      'Tell me more details',
      'Show recent trends',
      'Compare competitors',
    ],
  };
};

export default {
  performRAGQuery,
  performSemanticSearch,
  getRAGStats,
  getAvailableCompetitors,
  formatRAGResponse,
};
