import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Sidebar from "./Sidebar";

const MockStoreDecorator = (initialState) => (Story) => {
  const store = configureStore({
    reducer: {
      auth: (state = initialState.auth || { role: "doctor", user: {} }) => state,
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
  title: "Layout/Sidebar",
  component: Sidebar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ height: "100vh", position: "relative" }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export const DoctorRole = {
  decorators: [
    MockStoreDecorator({
      auth: {
        role: "doctor",
        user: { name: "Dr. Adams", roleSpecificId: "DOC-123", role: "Attending" },
      },
    }),
  ],
};

export const PatientRole = {
  decorators: [
    MockStoreDecorator({
      auth: {
        role: "patient",
        user: {
          name: "John Doe",
          roleSpecificId: "PAT-456",
          dob: "1980-01-01",
          next_appointment: "2024-05-10T10:00:00Z",
          visit_frequency: "Every 6 months",
          insurance: "BlueCross",
        },
      },
    }),
  ],
};

export const PatientNoData = {
  decorators: [
    MockStoreDecorator({
      auth: {
        role: "patient",
        user: {
          name: "Jane Doe",
          roleSpecificId: "PAT-789",
        },
      },
    }),
  ],
};
