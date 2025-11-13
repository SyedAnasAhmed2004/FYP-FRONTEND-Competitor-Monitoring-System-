import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state following Redux Toolkit best practices
const initialState = {
  messages: [], // Array of message objects
  quickQueries: [
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Get insights on market trends and opportunities',
      action: 'Market Intelligence',
      icon: 'TrendingUpOutlined'
    },
    {
      id: 'competitor-threats',
      title: 'Competitor Threats',
      description: 'Identify potential competitive threats',
      action: 'Threat Assessment',
      icon: 'WarningOutlined'
    },
    {
      id: 'strategic-positioning',
      title: 'Strategic Positioning',
      description: 'Analyze your market position',
      action: 'Strategic Analysis',
      icon: 'AimOutlined'
    },
    {
      id: 'recent-activities',
      title: 'Recent Activities',
      description: 'Latest competitor movements',
      action: 'Activity Monitoring',
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
};

// Async thunk for sending messages to AI
export const sendMessage = createAsyncThunk(
  'aiAssistant/sendMessage',
  async (message, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI response
      const response = {
        message: `I've analyzed your query about "${message}". Based on current strategic intelligence data, I can provide insights on market trends, competitor activities, strategic positioning, and actionable recommendations. How would you like me to proceed?`,
        timestamp: new Date().toISOString(),
        suggestions: [
          'Show detailed analysis',
          'Compare with competitors',
          'Generate report',
          'View recommendations'
        ]
      };
      
      return response;
    } catch (error) {
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
    
    // Handle suggestion click
    handleSuggestion: (state, action) => {
      state.messages.push({
        id: Date.now(),
        sender: 'user',
        message: action.payload,
        timestamp: new Date().toISOString(),
      });
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
      });
  },
});

// Actions
export const { 
  addUserMessage, 
  clearMessages, 
  clearError,
  handleSuggestion
} = aiAssistantSlice.actions;

// Selectors with memoization
export const selectMessages = (state) => state.aiAssistant.messages;
export const selectQuickQueries = (state) => state.aiAssistant.quickQueries;
export const selectSuggestions = (state) => state.aiAssistant.suggestions;
export const selectIsTyping = (state) => state.aiAssistant.isTyping;
export const selectLoading = (state) => state.aiAssistant.loading;
export const selectError = (state) => state.aiAssistant.error;

// Derived selector - get last message
export const selectLastMessage = (state) => {
  const messages = state.aiAssistant.messages;
  return messages.length > 0 ? messages[messages.length - 1] : null;
};

// Reducer
export default aiAssistantSlice.reducer;
