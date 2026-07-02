import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PatientSelector from "./PatientSelector";
import client from "@/api/client";

// ─── Mock Data ─────────────────────────────────────────────────────────
const mockPatients = [
  {
    patient_id: "1",
    name: "John Doe",
    dob: "1980-05-15",
    gender: "Male",
    phone_number: "555-0101",
    insurance: "BlueCross",
  },
  {
    patient_id: "2",
    name: "Jane Smith",
    dob: "1992-11-20",
    gender: "Female",
    phone_number: "555-0102",
    insurance: "Aetna",
  },
];

// ─── API Mock Helper ──────────────────────────────────────────────────
const mockApiCalls = (delay = 0, patients = mockPatients) => {
  const originalGet = client.get;
  client.get = (url) => {
    if (url.includes('/prescribers/')) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ data: patients }), delay);
      });
    }
    return originalGet(url);
  };
  return () => {
    client.get = originalGet;
  };
};

// ─── Storybook Setup ──────────────────────────────────────────────────
const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: (state = initialState.auth || { role: "doctor", user: { id: "doc123" } }) => state,
    },
    preloadedState: initialState,
  });
};

const withStore = (initialState) => (Story) => {
  const store = createMockStore(initialState);
  return (
    <Provider store={store}>
      <Story />
    </Provider>
  );
};

export default {
  title: "Pages/PatientSelector",
  component: PatientSelector,
  // ❌ No local MemoryRouter – global preview provides it
  decorators: [
    withStore({ auth: { role: "doctor", user: { id: "doc123" } } }),
  ],
};

export const Default = {
  args: {
    doctorId: "doc123",
  },
  loaders: [async () => mockApiCalls()],
};

export const Loading = {
  args: {
    doctorId: "doc123",
  },
  loaders: [async () => mockApiCalls(100000, [])], // long delay to show loading state
};

export const EmptyState = {
  args: {
    doctorId: "doc123",
  },
  loaders: [async () => mockApiCalls(0, [])],
};