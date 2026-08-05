import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ContactModal from "./ContactModal";
import {chatClient} from "@/api/client";

// --- Mock Data ---
const mockContactsAdmin = [
  { user_id: 1, name: "Maria Khan", role: "patient", profile_picture: null },
  { user_id: 2, name: "Dr. Ali", role: "doctor", profile_picture: null },
  { user_id: 3, name: "Dr. Jones", role: "doctor", profile_picture: null },
  { user_id: 4, name: "John Doe", role: "patient", profile_picture: null },
  { user_id: 5, name: "Dr. Smith", role: "doctor", profile_picture: null },
];

const mockContactsDoctor = [
  { user_id: 2, name: "Dr. Ali", role: "doctor", profile_picture: null },
  { user_id: 3, name: "Dr. Jones", role: "doctor", profile_picture: null },
  { user_id: 5, name: "Dr. Smith", role: "doctor", profile_picture: null },
];

// --- Helper to create a mock store ---
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: (state = initialState.auth || { role: "admin", user: { id: "admin1" } }) => state,
    },
    preloadedState: initialState,
  });
};

// --- Mock API for contacts ---
const mockApiCalls = (data, pagination = { total: data.length, page: 1, limit: 5, totalPages: Math.ceil(data.length / 5) }) => {
  const originalGet = chatClient.get;
  chatClient.get = (url) => {
    if (url === "/chat/contacts") {
      // Return paginated response
      return Promise.resolve({
        data: {
          data,
          pagination,
        },
      });
    }
    return originalGet(url);
  };
  return () => {
    chatClient.get = originalGet;
  };
};

// --- Decorator ---
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
  title: "Organisms/ContactModal",
  component: ContactModal,
  decorators: [
    withStore({ auth: { role: "admin", user: { id: "admin1" } } }),
  ],
  argTypes: {
    onClose: { action: "closed" },
    onConversationCreated: { action: "conversation created" },
  },
};

// --- Stories ---
export const AdminView = {
  args: {
    onClose: () => console.log("Modal closed"),
    onConversationCreated: (conv) => console.log("Conversation created:", conv),
  },
  loaders: [async () => mockApiCalls(mockContactsAdmin)],
};

export const DoctorView = {
  args: {
    onClose: () => console.log("Modal closed"),
    onConversationCreated: (conv) => console.log("Conversation created:", conv),
  },
  decorators: [
    withStore({ auth: { role: "doctor", user: { id: "doc1" } } }),
  ],
  loaders: [async () => mockApiCalls(mockContactsDoctor)],
};

export const WithSearch = {
  args: {
    onClose: () => console.log("Modal closed"),
    onConversationCreated: (conv) => console.log("Conversation created:", conv),
  },
  // We'll simulate search by modifying the response; in Storybook you can control the search param using args, but we'll just show a static version.
  loaders: [
    async () => {
      // Return filtered contacts for "John"
      return mockApiCalls(mockContactsAdmin.filter(c => c.name.includes("John")));
    },
  ],
};

export const WithPagination = {
  args: {
    onClose: () => console.log("Modal closed"),
    onConversationCreated: (conv) => console.log("Conversation created:", conv),
  },
  loaders: [
    async () => {
      return mockApiCalls(
        mockContactsAdmin,
        { total: 20, page: 1, limit: 5, totalPages: 4 }
      );
    },
  ],
};

export const Loading = {
  args: {
    onClose: () => console.log("Modal closed"),
    onConversationCreated: (conv) => console.log("Conversation created:", conv),
  },
  // To show loading, we need to delay the API response; we can mock a slow promise.
  loaders: [
    async () => {
      const originalGet = chatClient.get;
      chatClient.get = (url) => {
        if (url === "/chat/contacts") {
          return new Promise((resolve) => {
            setTimeout(() => resolve({ data: { data: [], pagination: { total: 0, page: 1, limit: 5, totalPages: 1 } } }), 2000);
          });
        }
        return originalGet(url);
      };
      return () => { chatClient.get = originalGet; };
    },
  ],
};

export const EmptyResults = {
  args: {
    onClose: () => console.log("Modal closed"),
    onConversationCreated: (conv) => console.log("Conversation created:", conv),
  },
  loaders: [async () => mockApiCalls([])],
};