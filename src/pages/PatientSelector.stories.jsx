import React from "react";
import { MemoryRouter } from "react-router-dom";
import PatientSelector from "./PatientSelector";

// Mocks for hooks can be defined in Storybook parameters, using plugins like msw-storybook-addon,
// or by mocking the module during the test setup. Since standard ES module mocking isn't available
// out-of-the-box in the preview, we add parameters to document the expected mock state.

export default {
  title: "Pages/PatientSelector",
  component: PatientSelector,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    mockData: [
      {
        url: "/api/patients?doctorId=doc123",
        method: "GET",
        status: 200,
        response: [
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
        ],
      },
    ],
  },
};

export const Default = {
  args: {
    doctorId: "doc123",
  },
};

export const Loading = {
  args: {
    doctorId: "doc123",
  },
  parameters: {
    mockData: [
      {
        url: "/api/patients?doctorId=doc123",
        method: "GET",
        status: 200,
        delay: 100000,
        response: [],
      },
    ],
  },
};

export const EmptyState = {
  args: {
    doctorId: "doc123",
  },
  parameters: {
    mockData: [
      {
        url: "/api/patients?doctorId=doc123",
        method: "GET",
        status: 200,
        response: [],
      },
    ],
  },
};
