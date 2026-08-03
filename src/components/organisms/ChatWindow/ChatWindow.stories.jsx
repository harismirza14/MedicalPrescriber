import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ChatWindow from "./ChatWindow";
import chatClient from "@/api/client";

// --- Mock Data ---
const mockMessages = [
  {
    id: 101,
    conversationId: 1,
    senderId: 2,
    body: "Hello! How are you?",
    createdAt: "2026-08-03T10:00:00Z",
    deliveredAt: "2026-08-03T10:00:05Z",
    readAt: "2026-08-03T10:01:00Z",
    sender: { user_id: 2, name: "Dr. Ali", role: "doctor", profile_picture: null },
  },
  {
    id: 102,
    conversationId: 1,
    senderId: 1,
    body: "I'm fine, thanks!",
    createdAt: "2026-08-03T10:02:00Z",
    deliveredAt: "2026-08-03T10:02:10Z",
    readAt: null,
    sender: { user_id: 1, name: "Maria Khan", role: "patient", profile_picture: null },
  },
  {
    id: 103,
    conversationId: 1,
    senderId: 2,
    body: "Great! Do you have any questions?",
    createdAt: "2026-08-03T10:05:00Z",
    deliveredAt: null,
    readAt: null,
    sender: { user_id: 2, name: "Dr. Ali", role: "doctor", profile_picture: null },
  },
];

const mockSystemMessages = [
  {
    id: 201,
    conversationId: 2,
    senderId: null,
    body: "Dr. Ali Yousuf was added to the care team.",
    createdAt: "2026-08-03T09:30:00Z",
    isSystem: true,
  },
  {
    id: 202,
    conversationId: 2,
    senderId: null,
    body: "A member was removed from the care team.",
    createdAt: "2026-08-03T09:35:00Z",
    isSystem: true,
  },
];

const mockDirectConversation = {
  id: 1,
  type: "direct",
  memberships: [
    { userId: 1, user: { name: "Maria Khan", role: "patient", profile_picture: null } },
    { userId: 2, user: { name: "Dr. Ali", role: "doctor", profile_picture: null } },
  ],
  patient: null,
};

const mockGroupConversation = {
  id: 2,
  type: "group",
  memberships: [
    { userId: 1, user: { name: "Maria Khan", role: "patient", profile_picture: null } },
    { userId: 2, user: { name: "Dr. Ali", role: "doctor", profile_picture: null } },
    { userId: 3, user: { name: "Dr. Jones", role: "doctor", profile_picture: null } },
  ],
  patient: { User: { name: "Maria Khan", profile_picture: null } },
};

// --- Helper to create a mock store ---
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      chat: (state = initialState.chat || { conversations: [], messagesByConversation: {}, activeConversationId: null }) => state,
    },
    preloadedState: initialState,
  });
};

// --- Mock API for online status ---
const mockApiCalls = (statusResponse = { online: true }) => {
  const originalGet = chatClient.get;
  chatClient.get = (url) => {
    if (url.includes("/chat/users/") && url.includes("/status")) {
      return Promise.resolve({ data: statusResponse });
    }
    return originalGet(url);
  };
  return () => {
    chatClient.get = originalGet;
  };
};

// --- Decorator: Redux Provider ---
const withStore = (initialState) => (Story) => {
  const store = createMockStore(initialState);
  return (
    <Provider store={store}>
      <Story />
    </Provider>
  );
};

// --- Default export ---
export default {
  title: "Organisms/ChatWindow",
  component: ChatWindow,
  decorators: [
    withStore({
      chat: {
        conversations: [mockDirectConversation],
        messagesByConversation: { 1: mockMessages },
        activeConversationId: 1,
      },
    }),
  ],
  argTypes: {
    conversation: { control: "object" },
  },
};

// --- Stories ---
export const Empty = {
  args: {
    conversation: null,
  },
};

export const DirectChat = {
  args: {
    conversation: mockDirectConversation,
  },
  loaders: [async () => mockApiCalls({ online: true })],
};

export const DirectChatOffline = {
  args: {
    conversation: mockDirectConversation,
  },
  loaders: [async () => mockApiCalls({ online: false })],
};

export const GroupChat = {
  args: {
    conversation: mockGroupConversation,
  },
  decorators: [
    withStore({
      chat: {
        conversations: [mockGroupConversation],
        messagesByConversation: { 2: mockMessages },
        activeConversationId: 2,
      },
    }),
  ],
};

export const WithSystemMessages = {
  args: {
    conversation: mockGroupConversation,
  },
  decorators: [
    withStore({
      chat: {
        conversations: [mockGroupConversation],
        messagesByConversation: { 2: [...mockMessages, ...mockSystemMessages] },
        activeConversationId: 2,
      },
    }),
  ],
};

export const WithAdminBadge = {
  args: {
    conversation: mockDirectConversation,
  },
  decorators: [
    withStore({
      chat: {
        conversations: [mockDirectConversation],
        messagesByConversation: {
          1: [
            {
              ...mockMessages[0],
              sender: { ...mockMessages[0].sender, role: "admin" },
            },
            ...mockMessages.slice(1),
          ],
        },
        activeConversationId: 1,
      },
    }),
  ],
};

export const WithDoctorBadge = {
  args: {
    conversation: mockDirectConversation,
  },
  // Doctor badge is already shown for doctor role (Dr. Ali is doctor)
};