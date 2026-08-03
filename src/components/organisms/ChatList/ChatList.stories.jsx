import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ChatList from "./ChatList";
import chatClient from "@/api/client";
import { fetchConversations } from "@/store/chatSlice";

// --- Mock Data ---
const mockConversations = [
  {
    id: 1,
    type: "group",
    updatedAt: "2026-08-03T10:30:00Z",
    patient: {
      User: { name: "Maria Khan", profile_picture: null },
    },
    memberships: [
      { userId: 1, user: { name: "Maria Khan", role: "patient", profile_picture: null } },
      { userId: 2, user: { name: "Dr. Ali", role: "doctor", profile_picture: null } },
    ],
    unreadCount: 2,
  },
  {
    id: 2,
    type: "direct",
    updatedAt: "2026-08-03T09:00:00Z",
    memberships: [
      { userId: 1, user: { name: "Dr. Smith", role: "doctor", profile_picture: null } },
      { userId: 3, user: { name: "Dr. Jones", role: "doctor", profile_picture: null } },
    ],
    unreadCount: 0,
  },
  {
    id: 3,
    type: "direct",
    updatedAt: "2026-08-02T21:00:00Z",
    memberships: [
      { userId: 1, user: { name: "Patient X", role: "patient", profile_picture: null } },
      { userId: 4, user: { name: "Dr. Lee", role: "doctor", profile_picture: null } },
    ],
    unreadCount: 5,
  },
];

// --- Helper to create a mock store ---
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      chat: (state = initialState.chat || { conversations: [], messagesByConversation: {}, activeConversationId: null }) => state,
      auth: (state = initialState.auth || { role: "admin", user: { id: "admin1" } }) => state,
    },
    preloadedState: initialState,
  });
};

// --- Mock API calls ---
const mockApiCalls = (conversations = mockConversations) => {
  const originalGet = chatClient.get;
  chatClient.get = (url) => {
    if (url === "/chat/conversations") {
      return Promise.resolve({ data: conversations });
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
  title: "Organisms/ChatList",
  component: ChatList,
  decorators: [
    withStore({
      auth: { role: "admin", user: { id: "admin1" } },
      chat: { conversations: mockConversations, messagesByConversation: {}, activeConversationId: null },
    }),
  ],
  argTypes: {
    onSelect: { action: "selected" },
    activeId: { control: "number" },
  },
};

// --- Stories ---
export const Default = {
  args: {
    onSelect: (conv) => console.log("Selected conversation:", conv),
    activeId: 1,
  },
  loaders: [async () => mockApiCalls(mockConversations)],
};

export const EmptyState = {
  args: {
    onSelect: (conv) => console.log("Selected conversation:", conv),
    activeId: null,
  },
  decorators: [
    withStore({
      auth: { role: "admin", user: { id: "admin1" } },
      chat: { conversations: [], messagesByConversation: {}, activeConversationId: null },
    }),
  ],
  loaders: [async () => mockApiCalls([])],
};

export const AdminView = {
  args: {
    onSelect: (conv) => console.log("Selected conversation:", conv),
    activeId: 1,
  },
  decorators: [
    withStore({
      auth: { role: "admin", user: { id: "admin1" } },
      chat: { conversations: mockConversations, messagesByConversation: {}, activeConversationId: null },
    }),
  ],
  loaders: [async () => mockApiCalls(mockConversations)],
};

export const DoctorView = {
  args: {
    onSelect: (conv) => console.log("Selected conversation:", conv),
    activeId: 1,
  },
  decorators: [
    withStore({
      auth: { role: "doctor", user: { id: "doc1" } },
      chat: { conversations: mockConversations, messagesByConversation: {}, activeConversationId: null },
    }),
  ],
  loaders: [async () => mockApiCalls(mockConversations)],
};

export const PatientView = {
  args: {
    onSelect: (conv) => console.log("Selected conversation:", conv),
    activeId: null,
  },
  decorators: [
    withStore({
      auth: { role: "patient", user: { id: "patient1" } },
      chat: { conversations: mockConversations, messagesByConversation: {}, activeConversationId: null },
    }),
  ],
  loaders: [async () => mockApiCalls(mockConversations)],
};

export const WithUnreadBadges = {
  args: {
    onSelect: (conv) => console.log("Selected conversation:", conv),
    activeId: null,
  },
  decorators: [
    withStore({
      auth: { role: "admin", user: { id: "admin1" } },
      chat: {
        conversations: [
          { ...mockConversations[0], unreadCount: 10 },
          { ...mockConversations[1], unreadCount: 0 },
          { ...mockConversations[2], unreadCount: 99 },
        ],
        messagesByConversation: {},
        activeConversationId: null,
      },
    }),
  ],
  loaders: [async () => mockApiCalls(mockConversations)],
};