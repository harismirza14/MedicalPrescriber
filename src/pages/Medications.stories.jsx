import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Medications from "./Medications";

const MockStoreDecorator = (initialState) => (Story) => {
  const store = configureStore({
    reducer: {
      auth: (state = initialState.auth || { role: "doctor", user: { id: "doc1" } }) => state,
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
  title: "Pages/Medications",
  component: Medications,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    MockStoreDecorator({
      auth: { role: "doctor", user: { id: "doc1" } },
      medications: { loading: false, error: null },
    }),
  ],
  parameters: {
    // Mocks for usePatient and usePrescriptions via global mock parameters like MSW
  },
};

export const DoctorView = {
  args: {
    role: "doctor",
    userId: "doc1",
    patientId: "pat123",
  },
};

export const PatientView = {
  args: {
    role: "patient",
    userId: "pat123",
    patientId: "pat123",
  },
  decorators: [
    MockStoreDecorator({
      auth: { role: "patient", user: { id: "pat123" } },
      medications: { loading: false, error: null },
    }),
  ],
};

export const LoadingState = {
  args: {
    role: "doctor",
    userId: "doc1",
    patientId: "pat123",
  },
};

export const ErrorState = {
  args: {
    role: "doctor",
    userId: "doc1",
    patientId: "pat123",
  },
  decorators: [
    MockStoreDecorator({
      auth: { role: "doctor", user: { id: "doc1" } },
      medications: { loading: false, error: "Failed to load prescriptions." },
    }),
  ],
};
