import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Medications from "./Medications";
import client from "@/api/client";

const mockPatient = {
  patient_id: "pat123",
  name: "John Doe",
  dob: "1990-01-01",
  gender: "Male",
  phone_number: "555-1234",
  email: "john@example.com",
  insurance: "Aetna",
  address: "123 Main St",
};

const mockPdmp = {
  last_checked: "2025-06-29T10:00:00Z",
  summary: "No red flags.",
};

const mockPrescriptions = [
  {
    prescription_id: 1,
    med_name: "Lisinopril",
    dosage: "10 mg",
    form: "tablet",
    instructions: "Take once daily",
    status: "success",
    status_label: "Sent on 2025-06-01",
    pharmacy_name: "CVS Pharmacy",
    prescriber_name: "Dr. Smith",
    prescriber_role: "Prescriber",
    patient_note: "BP control",
  },
  {
    prescription_id: 2,
    med_name: "Metformin",
    dosage: "500 mg",
    form: "tablet",
    instructions: "Take twice daily with meals",
    status: "success",
    status_label: "Sent on 2025-06-15",
    pharmacy_name: "Walgreens",
    prescriber_name: "Dr. Jones",
    prescriber_role: "Prescriber",
    patient_note: null,
  },
];

const mockPharmacies = [
  { id: 1, name: "CVS Pharmacy", address: "123 Main St", zipcode: "22903", phone: "555-1234", hours: "8am-10pm" },
  { id: 2, name: "Walgreens", address: "456 Oak Ave", zipcode: "22903", phone: "555-5678", hours: "9am-9pm" },
];

const mockApiCalls = () => {
  const originalGet = client.get;
  client.get = (url) => {
    if (url.includes('/patients/pat123/prescriptions')) {
      return Promise.resolve({ data: mockPrescriptions });
    }
    if (url.includes('/patients/pat123/pdmp')) {
      return Promise.resolve({ data: mockPdmp });
    }
    if (url.includes('/patients/pat123')) {
      return Promise.resolve({ data: mockPatient });
    }
    if (url.includes('/pharmacies')) {
      return Promise.resolve({ data: mockPharmacies });
    }
    return originalGet(url);
  };
  const originalPost = client.post;
  client.post = originalPost; 
  return () => {
    client.get = originalGet;
    client.post = originalPost;
  };
};

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: (state = initialState.auth || { role: "doctor", user: { id: "doc1" } }) => state,
      medications: (state = initialState.medications || { list: [], loading: false, error: null }) => state,
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
  title: "Pages/Medications",
  component: Medications,
  decorators: [withStore({ auth: { role: "doctor", user: { id: "doc1" } } })],
};

export const DoctorView = {
  args:{
    role:"doctor",
    userId:"1",
    patientId:"pat123",
  },
  loaders:[async () => mockApiCalls()],
};

export const PatientView = {
  args: {
    role: "patient",
    userId: "pat123",
    patientId: "pat123",
  },
  decorators: [
    withStore({ auth: { role: "patient", user: { id: "pat123" } } }),
  ],
  loaders: [async () => mockApiCalls()],
};

export const LoadingState = {
  args: {
    role: "doctor",
    userId: "doc1",
    patientId: "pat123",
  },
  decorators: [
    withStore({
      auth: { role: "doctor", user: { id: "doc1" } },
      medications: { list: [], loading: true, error: null },
    }),
  ],
  loaders: [async () => mockApiCalls()],
};

export const ErrorState = {
  args: {
    role: "doctor",
    userId: "doc1",
    patientId: "pat123",
  },
  decorators: [
    withStore({
      auth: { role: "doctor", user: { id: "doc1" } },
      medications: { list: [], loading: false, error: "Failed to load prescriptions." },
    }),
  ],
  loaders: [async () => mockApiCalls()],
};