import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import AddRX from "./AddRX";

const MockStoreDecorator = (initialState) => (Story) => {
  const store = configureStore({
    reducer: {
      medications: (state = initialState.medications || { loading: false, error: null }) => state,
    },
    preloadedState: initialState,
  });
  return (
    <Provider store={store}>
      <Story />
    </Provider>
  );
};

export default {
  title: "Prescriptions/AddRX",
  component: AddRX,
  decorators: [MockStoreDecorator({ medications: { loading: false, error: null } })],
};

export const DefaultOpen = {
  args: {
    isOpen: true,
    patientId: "123",
    prescriberId: "456",
  },
};

export const LoadingState = {
  args: {
    isOpen: true,
    patientId: "123",
    prescriberId: "456",
  },
  decorators: [MockStoreDecorator({ medications: { loading: true, error: null } })],
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
};

export const Closed = {
  args: {
    isOpen: false,
  },
};
