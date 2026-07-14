import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PatientSelector from "./PatientSelector";
import client from "@/api/client";

const mockPatients = [
  { patient_id: "P1", name: "Muhammad Haris", dob: "2003-06-15", phone_number: "0300-1234567", gender: "Male", insurance: "Aetna" },
  { patient_id: "P2", name: "Ali Rehman", dob: "2003-01-10", phone_number: "0300-7654321", gender: "Male", insurance: "Blue Cross" },
];

const originalGet = client.get;

function withMockedApi(response, { shouldFail = false } = {}) {
  return (Story) => {
    client.get = async (url) => {
      if (url.includes("/patients")) {
        if (shouldFail) throw new Error("Network error");
        return { data: response };
      }
      return originalGet(url);
    };
    return (
      <Provider store={configureStore({ reducer: { auth: (s = { role: "doctor", user: { name: "Dr. Mohsin Khan", roleSpecificId: "1" } }) => s } })}>
        <MemoryRouter initialEntries={["/select-patient"]}>
          <Story />
        </MemoryRouter>
      </Provider>
    );
  };
}

export default {
  title: "Pages/PatientSelector",
  component: PatientSelector,
  args: { doctorId: "1" },
};

export const Default = {
  decorators: [withMockedApi({ data: mockPatients, total: 2, page: 1, totalPages: 1 })],
};

export const Empty = {
  decorators: [withMockedApi({ data: [], total: 0, page: 1, totalPages: 1 })],
};

export const Error = {
  decorators: [withMockedApi(null, { shouldFail: true })],
};