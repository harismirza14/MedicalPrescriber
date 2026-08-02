import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatClient } from "../api/client";

const getCurrentUserId = () => {
  try {
    const authData = JSON.parse(localStorage.getItem("auth") || "{}");
    return (
      authData?.user?.user_id ||
      authData?.user?.id ||
      authData?.user_id ||
      authData?.id ||
      null
    );
  } catch {
    return null;
  }
};

export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async () => {
    const res = await chatClient.get("/chat/conversations");
    return res.data;
  },
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId) => {
    const res = await chatClient.get(
      `/chat/conversations/${conversationId}/messages`,
    );
    return { conversationId, messages: res.data.reverse() };
  },
);

export const createDirectConversation = createAsyncThunk(
  "chat/createDirectConversation",
  async (userId) => {
    const res = await chatClient.post("/chat/conversations/direct", { userId });
    return res.data;
  },
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messagesByConversation: {},
    loading: false,
    activeConversationId: null,
  },
  reducers: {
    messageReceived: (state, action) => {
      const msg = action.payload;
      const convoId = msg.conversationId;

      // Add message to conversation's message list
      const list = state.messagesByConversation[convoId] || [];
      if (!list.some((existing) => existing.id === msg.id)) {
        state.messagesByConversation[convoId] = [...list, msg];
      }

      const convo = state.conversations.find((c) => c.id === convoId);
      if (convo) {
        const timestamp = msg.createdAt || new Date().toISOString();
        convo.updatedAt = timestamp;
        const currentUserId = getCurrentUserId();
        if (
          convo.id !== state.activeConversationId &&
          msg.senderId !== currentUserId
        ) {
          convo.unreadCount = (convo.unreadCount || 0) + 1;
        }
      }
    },

    conversationRead: (state, action) => {
      const convo = state.conversations.find((c) => c.id === action.payload);
      if (convo) convo.unreadCount = 0;
    },

    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },

    messageDelivered: (state, action) => {
      const messageId = action.payload;
      for (const [convoId, messages] of Object.entries(
        state.messagesByConversation,
      )) {
        const msg = messages.find((m) => m.id === messageId);
        if (msg) {
          msg.deliveredAt = msg.deliveredAt || new Date().toISOString();
          break;
        }
      }
    },

    messagesMarkedAsRead: (state, action) => {
      const {
        conversationId,
        messageIds,
        readBy,
        readAt: payloadReadAt,
      } = action.payload || {};
      const readAt = payloadReadAt || new Date().toISOString();

      const updateMsg = (msg) => {
        if (msg && msg.senderId !== readBy) {
          msg.readAt = msg.readAt || readAt;
          msg.isRead = true;
        }
      };

      if (conversationId && state.messagesByConversation[conversationId]) {
        const messages = state.messagesByConversation[conversationId];
        if (Array.isArray(messageIds) && messageIds.length > 0) {
          messageIds.forEach((id) => {
            const msg = messages.find((m) => m.id === id);
            updateMsg(msg);
          });
        } else {
          messages.forEach(updateMsg);
        }
      } else {
        Object.values(state.messagesByConversation).forEach((messages) => {
          messages.forEach((msg) => {
            if (
              Array.isArray(messageIds) && messageIds.length > 0
                ? messageIds.includes(msg.id)
                : true
            ) {
              updateMsg(msg);
            }
          });
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesByConversation[action.payload.conversationId] =
          action.payload.messages;
      })
      .addCase(createDirectConversation.fulfilled, (state, action) => {
        const newConvo = action.payload;
        const existingIndex = state.conversations.findIndex(
          (c) => c.id === newConvo.id,
        );

        if (existingIndex !== -1) {
          state.conversations[existingIndex] = newConvo;
        } else {
          state.conversations = [newConvo, ...state.conversations];
        }
        state.activeConversationId = newConvo.id;
        if (!state.messagesByConversation[newConvo.id]) {
          state.messagesByConversation[newConvo.id] = [];
        }
      });
  },
});

export const {
  messageReceived,
  conversationRead,
  setActiveConversation,
  messageDelivered,
  messagesMarkedAsRead,
} = chatSlice.actions;

export default chatSlice.reducer;