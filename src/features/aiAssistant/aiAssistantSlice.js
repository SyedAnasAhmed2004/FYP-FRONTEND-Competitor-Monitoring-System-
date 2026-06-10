import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { performRAGQuery, formatRAGResponse } from '../../services/ragService';

// Initial state following Redux Toolkit best practices
const initialState = {
  messages: [], // Array of message objects
  quickQueries: [
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Get insights on market trends and opportunities',
      actionTemplate: 'What are the latest market trends for {competitor}?',
      icon: 'TrendingUpOutlined'
    },
    {
      id: 'competitor-threats',
      title: 'Competitor Threats',
      description: 'Identify potential competitive threats',
      actionTemplate: 'What are the main threats from {competitor}?',
      icon: 'WarningOutlined'
    },
    {
      id: 'strategic-positioning',
      title: 'Strategic Positioning',
      description: 'Analyze your market position',
      actionTemplate: 'How is {competitor} positioned in the market?',
      icon: 'AimOutlined'
    },
    {
      id: 'recent-activities',
      title: 'Recent Activities',
      description: 'Latest competitor movements',
      actionTemplate: 'What are {competitor}\'s recent activities?',
      icon: 'ClockCircleOutlined'
    }
  ],
  suggestions: [
    'Market trends analysis',
    'Competitor threat assessment',
    'Strategic positioning review',
    'Recent competitor activities'
  ],
  isTyping: false,
  loading: false,
  error: null,
  currentCompetitor: 'Honda', // Default competitor
};

// Async thunk for sending messages to AI using RAG
export const sendMessage = createAsyncThunk(
  'aiAssistant/sendMessage',
  async (message, { getState, rejectWithValue }) => {
    try {
      const { currentCompetitor } = getState().aiAssistant;
      
      // Call RAG API with Honda as default competitor, top_k = 3
      const result = await performRAGQuery(message, 3, currentCompetitor);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get AI response');
      }

      // Format the RAG response for chat display
      const formattedResponse = formatRAGResponse(result.data);
      
      return {
        message: formattedResponse.message,
        timestamp: new Date().toISOString(),
        suggestions: formattedResponse.suggestions,
      };
    } catch (error) {
      console.error('Send Message Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    // Add user message immediately (optimistic update)
    addUserMessage: (state, action) => {
      state.messages.push({
        id: Date.now(),
        sender: 'user',
        message: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    
    // Clear all messages
    clearMessages: (state) => {
      state.messages = [];
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set current competitor filter
    setCurrentCompetitor: (state, action) => {
      state.currentCompetitor = action.payload;
    },
    
    // Handle suggestion click
    handleSuggestion: (state, action) => {
      state.messages.push({
        id: Date.now(),
        sender: 'user',
        message: action.payload,
        timestamp: new Date().toISOString(),
      });
    },

    // ── Streaming actions ──────────────────────────────────────────
    setIsTyping: (state, action) => { state.isTyping = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },

    // Push an empty AI message (streaming starts)
    startAIMessage: (state) => {
      state.isTyping = false;
      state.messages.push({
        id: Date.now() + 1,
        sender: 'ai',
        message: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      });
    },

    // Append a token to the last AI message
    appendToLastAIMessage: (state, action) => {
      const last = state.messages[state.messages.length - 1];
      if (last && last.sender === 'ai' && last.isStreaming) {
        last.message += action.payload;
      }
    },

    // Mark streaming done
    finalizeAIMessage: (state) => {
      const last = state.messages[state.messages.length - 1];
      if (last && last.sender === 'ai') last.isStreaming = false;
      state.loading = false;
      state.isTyping = false;
    },

    // Handle stream error
    setAIMessageError: (state, action) => {
      const last = state.messages[state.messages.length - 1];
      const errText = action.payload || 'Sorry, I was unable to get a response. Please try again.';
      if (last && last.sender === 'ai') {
        last.message = errText;
        last.isError = true;
        last.isStreaming = false;
      } else {
        state.messages.push({
          id: Date.now() + 1,
          sender: 'ai',
          message: errText,
          timestamp: new Date().toISOString(),
          isError: true,
        });
      }
      state.loading = false;
      state.isTyping = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message - pending
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true;
        state.loading = true;
        state.error = null;
      })
      // Send message - fulfilled
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false;
        state.loading = false;
        state.messages.push({
          id: Date.now() + 1,
          sender: 'ai',
          message: action.payload.message,
          timestamp: action.payload.timestamp,
          suggestions: action.payload.suggestions,
        });
      })
      // Send message - rejected
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.loading = false;
        state.error = action.payload || 'Failed to send message';
        state.messages.push({
          id: Date.now() + 1,
          sender: 'ai',
          message: 'Sorry, I was unable to get a response. The AI service may be unavailable or has no data indexed yet. Please try again later.',
          timestamp: new Date().toISOString(),
          isError: true,
        });
      });
  },
});

// Actions
export const {
  addUserMessage,
  clearMessages,
  clearError,
  setCurrentCompetitor,
  handleSuggestion,
  setIsTyping,
  setLoading,
  startAIMessage,
  appendToLastAIMessage,
  finalizeAIMessage,
  setAIMessageError,
} = aiAssistantSlice.actions;

// Selectors with memoization
export const selectMessages = (state) => state.aiAssistant.messages;
export const selectQuickQueries = (state) => state.aiAssistant.quickQueries;
export const selectSuggestions = (state) => state.aiAssistant.suggestions;
export const selectIsTyping = (state) => state.aiAssistant.isTyping;
export const selectLoading = (state) => state.aiAssistant.loading;
export const selectError = (state) => state.aiAssistant.error;
export const selectCurrentCompetitor = (state) => state.aiAssistant.currentCompetitor;

// Derived selector - get last message
export const selectLastMessage = (state) => {
  const messages = state.aiAssistant.messages;
  return messages.length > 0 ? messages[messages.length - 1] : null;
};

// Reducer
export default aiAssistantSlice.reducer;
