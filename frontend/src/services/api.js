/**
 * Centralized API Service for LangGraph AI Data Analyst
 * Communicates ONLY with the existing FastAPI backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Standard fetch helper with JSON serialization and robust error extraction.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    let data;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      // FastAPI returns errors under "detail"
      const errorMessage =
        (data && data.detail) ||
        (data && data.message) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If it's a network error (e.g. failed to fetch)
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error(
        'Unable to connect to the backend server. Please verify the service is running.'
      );
      networkError.status = 0;
      throw networkError;
    }
    throw err;
  }
}

export const api = {
  /**
   * Check backend server health status
   * GET /
   */
  async checkHealth() {
    return request('/');
  },

  /**
   * Connect MySQL database
   * POST /connect-database
   * @param {Object} params
   * @param {string} params.host
   * @param {number} params.port
   * @param {string} params.username
   * @param {string} params.password
   * @param {string} params.database
   */
  async connectDatabase({ host, port = 3306, username, password, database }) {
    return request('/connect-database', {
      method: 'POST',
      body: JSON.stringify({
        host: host.trim(),
        port: Number(port) || 3306,
        username: username.trim(),
        password,
        database: database.trim(),
      }),
    });
  },

  /**
   * Send question to LangGraph analysis engine
   * POST /chat
   * @param {Object} params
   * @param {string} params.question
   * @param {string|null} [params.conversation_id]
   */
  async sendChat({ question, conversation_id = null }) {
    const payload = { question: question.trim() };
    if (conversation_id) {
      payload.conversation_id = conversation_id;
    }

    return request('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch all saved conversations from MongoDB
   * GET /conversations
   */
  async getConversations() {
    return request('/conversations');
  },

  /**
   * Fetch a single conversation details by ID
   * GET /conversations/{conversation_id}
   * @param {string} conversationId
   */
  async getConversation(conversationId) {
    return request(`/conversations/${encodeURIComponent(conversationId)}`);
  },
};

export default api;
