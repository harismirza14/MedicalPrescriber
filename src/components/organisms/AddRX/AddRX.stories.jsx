import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import AddRX from "./AddRX";
import client from "@/api/client";

const mockMedications = [
  { med_id: 1, name: "Amoxicillin" },
  { med_id: 2, name: "Lisinopril" },
  { med_id: 3, name: "Metformin" },
];

const createMockStore = () => {
  return configureStore({
    reducer: {
      medications: (state = { list: [], loading: false, error: null }) => state,
    },
    preloadedState: {
      medications: { list: [], loading: false, error: null },
    },
  });
};

const MockStoreDecorator = (Story) => {
  const store = createMockStore();
  return (
    <Provider store={store}>
      <Story />
    </Provider>
  );
};

export default {
  title: "Prescriptions/AddRX",
  component: AddRX,
  decorators: [MockStoreDecorator],
};

const mockMedicationsApi = (delay = 0) => {
  const originalGet = client.get;
  client.get = (url) => {
    if (url === '/medications') {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ data: mockMedications }), delay);
      });
    }
    return originalGet(url);
  };
  return () => {
    client.get = originalGet;
  };
};

export const DefaultOpen = {
  args: {
    isOpen: true,
    patientId: "123",
    prescriberId: "456",
  },
  loaders: [async () => mockMedicationsApi()],
};

export const LoadingState = {
  args: {
    isOpen: true,
    patientId: "123",
    prescriberId: "456",
  },
  loaders: [async () => mockMedicationsApi(2000)], 
};

export const EditMode = {
  args: {
    isOpen: true,
    patientId: "123",
    prescriberId: "456",
    initialData: {
      prescription_id: "789",
      drug: "Amoxicillin",
      dosage: "500mg",
      instructions: "Take 1 capsule every 8 hours",
      quantity: "30",
      startAtStep: 2,
    },
  },
  loaders: [async () => mockMedicationsApi()],
};

export const Closed = {
  args: {
    isOpen: false,
  },
};