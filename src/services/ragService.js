/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles AI queries using Django backend with ChromaDB
 */

import { api, API_ENDPOINTS } from '../config/api';
import API_CONFIG from '../config/api';

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

/**
 * Stream a RAG query via SSE. Calls onChunk for each token, onDone when complete,
 * onError on failure.
 */
export const performStreamingRAGQuery = async (
  queryText,
  topK = 20,
  competitorFilter = 'all',
  onChunk,
  onDone,
  onError,
) => {
  const token = localStorage.getItem('authToken');
  const baseURL = API_CONFIG.baseURL || '';
  const url = `${baseURL}${API_ENDPOINTS.rag.stream}`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        query: queryText,
        top_k: topK,
        competitor_filter: competitorFilter || 'all',
      }),
    });
  } catch (e) {
    onError('Failed to connect to AI service.');
    return;
  }

  if (!response.ok) {
    onError(`Server error (${response.status}). Please try again.`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line for next iteration

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === 'chunk') {
          onChunk(event.content);
        } else if (event.type === 'done') {
          onDone(event);
        } else if (event.type === 'error') {
          onError(event.message || 'AI service error.');
        }
      } catch {
        // skip malformed lines
      }
    }
  }
};

export default {
  performRAGQuery,
  performStreamingRAGQuery,
  performSemanticSearch,
  getRAGStats,
  getAvailableCompetitors,
  formatRAGResponse,
};
