import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import MedicationCard from "./MedicationCard";

// Mock Store Decorator
const MockStoreDecorator = (initialState) => (Story) => {
  const store = configureStore({
    reducer: {
      auth: (state = initialState.auth || { role: "doctor" }) => state,
      medications: (state = initialState.medications || { loading: false }) => state,
    },
    preloadedState: initialState,
  });
  return (
    <Provider store={store}>
      <div className="max-w-md p-4 bg-gray-50">
        <Story />
      </div>
    </Provider>
  );
};

export default {
  title: "Prescriptions/MedicationCard",
  component: MedicationCard,
  decorators: [MockStoreDecorator({ auth: { role: "doctor" }, medications: { loading: false } })],
};

const defaultPatient = { name: "John Doe", address: "123 Main St" };
const baseMed = {
  id: "1",
  name: "Lisinopril",
  dosage: "10mg",
  form: "Tablet",
  instructions: "Take 1 tablet daily",
  type: "Maintenance",
  patientNote: "Take with food",
};

export const ActiveStatus = {
  args: {
    med: {
      ...baseMed,
      status: "success",
      statusLabel: "10:00 AM today",
      pharmacy: "CVS Pharmacy",
    },
    patient: defaultPatient,
  },
};

export const DiscontinuedStatus = {
  args: {
    med: {
      ...baseMed,
      status: "discontinued",
      discontinueReason: "Patient reported side effects",
      discontinuedOn: "2023-10-25",
    },
    patient: defaultPatient,
  },
};

export const ExternalStatus = {
  args: {
    med: {
      ...baseMed,
      status: "external",
      external_prescriber: "Dr. Smith",
    },
    patient: defaultPatient,
  },
};

export const PatientView = {
  args: {
    med: {
      ...baseMed,
      status: "success",
      statusLabel: "10:00 AM today",
      pharmacy: "CVS Pharmacy",
      prescriber_name: "Dr. Adams",
      prescriberRole: "Primary Care",
    },
    patient: defaultPatient,
  },
  decorators: [MockStoreDecorator({ auth: { role: "patient" }, medications: { loading: false } })],
};
