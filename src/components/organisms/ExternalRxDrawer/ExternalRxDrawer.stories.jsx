import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ExternalRxDrawer from "./ExternalRxDrawer";

const MockStoreDecorator = (initialState) => (Story) => {
  const store = configureStore({
    reducer: {
      medications: (state = initialState.medications || { loading: false }) => state,
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
  title: "Prescriptions/ExternalRxDrawer",
  component: ExternalRxDrawer,
  decorators: [MockStoreDecorator({ medications: { loading: false } })],
};

export const NewExternalRx = {
  args: {
    isOpen: true,
    patientId: "123",
    prescriberId: "456",
  },
};

export const EditExternalRx = {
  args: {
    isOpen: true,
    patientId: "123",
    prescriberId: "456",
    initialData: {
      id: "789",
      drug: "Atorvastatin",
      instructions: "40mg once daily",
      external_prescriber: "Dr. Cardiologist",
      patientNote: "Started post-MI",
    },
  },
};

export const LoadingState = {
  args: {
    isOpen: true,
  },
  decorators: [MockStoreDecorator({ medications: { loading: true } })],
};

export const Closed = {
  args: {
    isOpen: false,
  },
};
