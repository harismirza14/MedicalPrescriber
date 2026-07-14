import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Appointments from "./Appointments";
import client from "@/api/client";

const mockAppointments = [
  { id: 1, appointment_date: "2026-08-10", start_time: "10:00:00", end_time: "10:30:00", doctor_name: "Dr. Mohsin Khan", patient_name: "Muhammad Haris", status: "scheduled" },
  { id: 2, appointment_date: "2026-08-12", start_time: "14:00:00", end_time: "14:15:00", doctor_name: "Dr. Ali Nazam", patient_name: "Muhammad Haris", status: "cancelled" },
];

const originalGet = client.get;

/**
 * Appointments mounts PatientBookingDrawer for patients, which independently
 * calls useCareTeam (GET /patients/:id/care-team) — mocked here too so the
 * "Book Appointment" button doesn't hit the real backend if clicked in Storybook.
 */
function withMockedApi(role, response, { shouldFail = false } = {}) {
  return (Story) => {
    client.get = async (url) => {
      if (url.includes("/appointments")) {
        if (shouldFail) throw new Error("Network error");
        return { data: response };
      }
      if (url.includes("/care-team")) {
        return { data: { care_team_id: 1, members: [] } };
      }
      return originalGet(url);
    };
    const authState =
      role === "patient"
        ? { role: "patient", user: { name: "Muhammad Haris", roleSpecificId: "P1" } }
        : { role: "doctor", user: { name: "Dr. Mohsin Khan", roleSpecificId: "1" } };
    return (
      <Provider store={configureStore({ reducer: { auth: (s = authState) => s } })}>
        <MemoryRouter initialEntries={["/appointments"]}>
          <Story />
        </MemoryRouter>
      </Provider>
    );
  };
}

export default {
  title: "Pages/Appointments",
  component: Appointments,
};

export const PatientView = {
  args: { role: "patient", id: "P1" },
  decorators: [withMockedApi("patient", mockAppointments)],
};

export const DoctorView = {
  args: { role: "doctor", id: "1" },
  decorators: [withMockedApi("doctor", mockAppointments)],
};

export const Empty = {
  args: { role: "patient", id: "P1" },
  decorators: [withMockedApi("patient", [])],
};

export const Error = {
  args: { role: "patient", id: "P1" },
  decorators: [withMockedApi("patient", null, { shouldFail: true })],
};