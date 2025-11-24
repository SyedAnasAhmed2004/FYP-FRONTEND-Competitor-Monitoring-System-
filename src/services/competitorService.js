/**
 * Competitor Service
 * Handles competitor CRUD operations and scraping tasks
 */

import { api, API_ENDPOINTS } from '../config/api';

/**
 * Fetch all competitors
 * @returns {Promise<Object>} List of competitors
 */
export const fetchCompetitors = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.competitors.list);
    return response;
  } catch (error) {
    console.error('Fetch Competitors Error:', error);
    return {
      success: false,
      error: error.message || 'Error fetching competitors',
    };
  }
};

/**
 * Get single competitor by ID
 * @param {number} id - Competitor ID
 * @returns {Promise<Object>} Competitor details
 */
export const getCompetitor = async (id) => {
  try {
    const response = await api.get(API_ENDPOINTS.competitors.detail(id));
    return response;
  } catch (error) {
    console.error('Get Competitor Error:', error);
    return {
      success: false,
      error: error.message || 'Error fetching competitor',
    };
  }
};

/**
 * Create new competitor
 * @param {Object} competitorData - Competitor information
 * @returns {Promise<Object>} Created competitor
 */
export const createCompetitor = async (competitorData) => {
  try {
    const response = await api.post(API_ENDPOINTS.competitors.create, competitorData);
    return response;
  } catch (error) {
    console.error('Create Competitor Error:', error);
    return {
      success: false,
      error: error.message || 'Error creating competitor',
    };
  }
};

/**
 * Update competitor (partial update with PATCH)
 * @param {number} id - Competitor ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated competitor
 */
export const updateCompetitor = async (id, updates) => {
  try {
    const response = await api.patch(API_ENDPOINTS.competitors.partialUpdate(id), updates);
    return response;
  } catch (error) {
    console.error('Update Competitor Error:', error);
    return {
      success: false,
      error: error.message || 'Error updating competitor',
    };
  }
};

/**
 * Replace competitor completely (full update with PUT)
 * @param {number} id - Competitor ID
 * @param {Object} competitorData - Complete competitor data
 * @returns {Promise<Object>} Updated competitor
 */
export const replaceCompetitor = async (id, competitorData) => {
  try {
    const response = await api.put(API_ENDPOINTS.competitors.update(id), competitorData);
    return response;
  } catch (error) {
    console.error('Replace Competitor Error:', error);
    return {
      success: false,
      error: error.message || 'Error replacing competitor',
    };
  }
};

/**
 * Delete competitor (soft delete)
 * @param {number} id - Competitor ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteCompetitor = async (id) => {
  try {
    const response = await api.delete(API_ENDPOINTS.competitors.delete(id));
    return response;
  } catch (error) {
    console.error('Delete Competitor Error:', error);
    return {
      success: false,
      error: error.message || 'Error deleting competitor',
    };
  }
};

/**
 * Extract links from competitor website (async task)
 * @param {number} id - Competitor ID
 * @returns {Promise<Object>} Task information
 */
export const extractLinks = async (id) => {
  try {
    const response = await api.post(API_ENDPOINTS.competitors.extractLinks(id));
    return response;
  } catch (error) {
    console.error('Extract Links Error:', error);
    return {
      success: false,
      error: error.message || 'Error starting link extraction',
    };
  }
};

/**
 * Scrape HTML from competitor links (async task)
 * @param {number} id - Competitor ID
 * @param {boolean} useFilteredLinks - Use filtered links instead of all extracted links
 * @returns {Promise<Object>} Task information
 */
export const scrapeHtml = async (id, useFilteredLinks = false) => {
  try {
    const response = await api.post(
      API_ENDPOINTS.competitors.scrapeHtml(id),
      { use_filtered_links: useFilteredLinks }
    );
    return response;
  } catch (error) {
    console.error('Scrape HTML Error:', error);
    return {
      success: false,
      error: error.message || 'Error starting HTML scraping',
    };
  }
};

/**
 * Extract metadata for RAG system (async task)
 * @param {number} id - Competitor ID
 * @returns {Promise<Object>} Task information
 */
export const extractMetadata = async (id) => {
  try {
    const response = await api.post(API_ENDPOINTS.competitors.extractMetadata(id));
    return response;
  } catch (error) {
    console.error('Extract Metadata Error:', error);
    return {
      success: false,
      error: error.message || 'Error starting metadata extraction',
    };
  }
};

/**
 * Run full scraping pipeline (async task)
 * @param {number} id - Competitor ID
 * @param {boolean} useFilteredLinks - Use filtered links for HTML scraping
 * @returns {Promise<Object>} Task information
 */
export const runFullPipeline = async (id, useFilteredLinks = false) => {
  try {
    const response = await api.post(
      API_ENDPOINTS.competitors.runFullPipeline(id),
      { use_filtered_links: useFilteredLinks }
    );
    return response;
  } catch (error) {
    console.error('Run Full Pipeline Error:', error);
    return {
      success: false,
      error: error.message || 'Error starting full pipeline',
    };
  }
};

/**
 * Store extracted links
 * @param {number} competitorId - Competitor ID
 * @param {Array<string>} links - Array of URLs
 * @returns {Promise<Object>} Storage result
 */
export const storeExtractedLinks = async (competitorId, links) => {
  try {
    const response = await api.post(API_ENDPOINTS.dataStorage.extractedLinks, {
      competitor: competitorId,
      links,
    });
    return response;
  } catch (error) {
    console.error('Store Extracted Links Error:', error);
    return {
      success: false,
      error: error.message || 'Error storing extracted links',
    };
  }
};

/**
 * Store filtered links
 * @param {number} competitorId - Competitor ID
 * @param {Array<string>} links - Array of filtered URLs
 * @returns {Promise<Object>} Storage result
 */
export const storeFilteredLinks = async (competitorId, links) => {
  try {
    const response = await api.post(API_ENDPOINTS.dataStorage.filteredLinks, {
      competitor: competitorId,
      links,
    });
    return response;
  } catch (error) {
    console.error('Store Filtered Links Error:', error);
    return {
      success: false,
      error: error.message || 'Error storing filtered links',
    };
  }
};

/**
 * Store HTML content
 * @param {number} competitorId - Competitor ID
 * @param {string} url - Page URL
 * @param {string} htmlContent - HTML content
 * @returns {Promise<Object>} Storage result
 */
export const storeHtmlContent = async (competitorId, url, htmlContent) => {
  try {
    const response = await api.post(API_ENDPOINTS.dataStorage.htmlContent, {
      competitor: competitorId,
      url,
      html_content: htmlContent,
    });
    return response;
  } catch (error) {
    console.error('Store HTML Content Error:', error);
    return {
      success: false,
      error: error.message || 'Error storing HTML content',
    };
  }
};

/**
 * Store metadata for RAG
 * @param {number} competitorId - Competitor ID
 * @param {string} url - Page URL
 * @param {Object} metadata - Metadata object
 * @returns {Promise<Object>} Storage result
 */
export const storeMetadata = async (competitorId, url, metadata) => {
  try {
    const response = await api.post(API_ENDPOINTS.dataStorage.metadata, {
      competitor: competitorId,
      url,
      metadata,
    });
    return response;
  } catch (error) {
    console.error('Store Metadata Error:', error);
    return {
      success: false,
      error: error.message || 'Error storing metadata',
    };
  }
};

/**
 * Get HTML content for a competitor
 * @param {number} competitorId - Competitor ID
 * @returns {Promise<Object>} HTML content list
 */
export const getHtmlContent = async (competitorId) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.dataStorage.htmlContent}?competitor=${competitorId}`
    );
    return response;
  } catch (error) {
    console.error('Get HTML Content Error:', error);
    return {
      success: false,
      error: error.message || 'Error fetching HTML content',
    };
  }
};

/**
 * Get metadata for a competitor
 * @param {number} competitorId - Competitor ID
 * @returns {Promise<Object>} Metadata list
 */
export const getMetadata = async (competitorId) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.dataStorage.metadata}?competitor=${competitorId}`
    );
    return response;
  } catch (error) {
    console.error('Get Metadata Error:', error);
    return {
      success: false,
      error: error.message || 'Error fetching metadata',
    };
  }
};

export default {
  fetchCompetitors,
  getCompetitor,
  createCompetitor,
  updateCompetitor,
  replaceCompetitor,
  deleteCompetitor,
  extractLinks,
  scrapeHtml,
  extractMetadata,
  runFullPipeline,
  storeExtractedLinks,
  storeFilteredLinks,
  storeHtmlContent,
  storeMetadata,
  getHtmlContent,
  getMetadata,
};
