import { message } from 'antd';

/**
 * Centralized notification utility for the entire application
 * Use this for all success, error, warning, and info messages
 */

// Configure default message settings
message.config({
  top: 80,
  duration: 3,
  maxCount: 3,
});

const notify = {
  /**
   * Show success message
   * @param {string} content - Message to display
   * @param {number} duration - Duration in seconds (default: 3)
   */
  success: (content, duration = 3) => {
    message.success(content, duration);
  },

  /**
   * Show error message
   * @param {string} content - Message to display
   * @param {number} duration - Duration in seconds (default: 4)
   */
  error: (content, duration = 4) => {
    message.error(content, duration);
  },

  /**
   * Show warning message
   * @param {string} content - Message to display
   * @param {number} duration - Duration in seconds (default: 3)
   */
  warning: (content, duration = 3) => {
    message.warning(content, duration);
  },

  /**
   * Show info message
   * @param {string} content - Message to display
   * @param {number} duration - Duration in seconds (default: 3)
   */
  info: (content, duration = 3) => {
    message.info(content, duration);
  },

  /**
   * Show loading message
   * @param {string} content - Message to display
   * @returns {function} - Function to close the loading message
   */
  loading: (content = 'Loading...') => {
    return message.loading(content, 0); // 0 means it won't auto close
  },

  /**
   * Destroy all messages
   */
  destroy: () => {
    message.destroy();
  },
};

export default notify;
