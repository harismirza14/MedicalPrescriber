import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RightSidebar from "./RightSidebar";
import client from "@/api/client";

// ─── Mock API responses ──────────────────────────────────────────────
const originalGet = client.get;
client.get = async (url) => {
  if (url.includes("/patients/")) {
    return {
      data: {
        name: "Muhammad Haris",
        dob: "2003-06-15",
        phone_number: "0300-1234567",
        insurance: "Aetna",
        patient_id: "P1",
      },
    };
  }
  if (url.includes("/prescribers/")) {
    return {
      data: {
        name: "Dr. Mohsin Khan",
        specialty: "Cardiology",
        email: "mohsin@example.com",
        pmdc_number: "PMDC-001",
      },
    };
  }
  return originalGet(url);
};

// ─── Decorator with Store + Router ──────────────────────────────────
function withStoreAndRouter(authState, initialEntries, routePath) {
  return (Story) => {
    const store = configureStore({
      reducer: { auth: (state = authState) => state },
    });
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path={routePath} element={<Story />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };
}

export default {
  title: "Layout/RightSidebar",
  component: RightSidebar,
};

export const DoctorViewingPatient = {
  decorators: [
    withStoreAndRouter(
      { role: "doctor", user: { name: "Dr. Mohsin Khan", roleSpecificId: "1" } },
      ["/patient-dashboard?patientId=P1"],
      "/patient-dashboard"
    ),
  ],
};

export const AdminViewingDoctor = {
  decorators: [
    withStoreAndRouter(
      { role: "admin", user: { name: "Admin User" } },
      ["/admin/doctor/1"],
      "/admin/doctor/:prescriberId"
    ),
  ],
};