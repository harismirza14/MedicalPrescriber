import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import UpdateMedicationDrawer from "./UpdateMedicationDrawer";

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
  title: "Prescriptions/UpdateMedicationDrawer",
  component: UpdateMedicationDrawer,
  decorators: [MockStoreDecorator({ medications: { loading: false } })],
};

const defaultMed = {
  id: "1",
  name: "Metformin",
  dosage: "500mg",
  form: "Tablet",
  instructions: "Take 1 tablet twice daily with meals",
  pharmacy: "CVS Pharmacy",
  pharmacyAddress: "123 Main St, Charlottesville, VA 22903",
  pharmacy_zip: "22903",
};

const defaultPatient = {
  name: "Jane Doe",
  address: "456 Elm St, Charlottesville, VA 22903",
};

export const DefaultOpen = {
  args: {
    isOpen: true,
    med: defaultMed,
    patient: defaultPatient,
  },
};

export const LoadingState = {
  args: {
    isOpen: true,
    med: defaultMed,
    patient: defaultPatient,
  },
  decorators: [MockStoreDecorator({ medications: { loading: true } })],
};

export const Closed = {
  args: {
    isOpen: false,
    med: defaultMed,
    patient: defaultPatient,
  },
};
