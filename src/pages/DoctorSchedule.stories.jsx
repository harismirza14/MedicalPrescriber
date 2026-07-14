import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import DoctorSchedule from "./DoctorSchedule";
import client from "@/api/client";

const mockSlots = [
  { id: 1, day_of_week: "monday", start_time: "09:00:00", end_time: "12:00:00" },
  { id: 2, day_of_week: "monday", start_time: "14:00:00", end_time: "17:00:00" },
  { id: 3, day_of_week: "wednesday", start_time: "10:00:00", end_time: "16:00:00" },
];

const mockAppointments = [
  { id: 1, appointment_date: "2026-08-10", start_time: "09:00:00", end_time: "09:30:00", patient_name: "Muhammad Haris", status: "scheduled" },
];

const originalGet = client.get;

function withMockedApi({ slots = mockSlots, appointments = mockAppointments } = {}) {
  return (Story) => {
    client.get = async (url) => {
      if (url.includes("/availability")) {
        return { data: slots };
      }
      if (url.includes("/appointments")) {
        return { data: appointments };
      }
      return originalGet(url);
    };
    return (
      <Provider store={configureStore({ reducer: { auth: (s = { role: "doctor", user: { name: "Dr. Mohsin Khan", roleSpecificId: "1" } }) => s } })}>
        <Story />
      </Provider>
    );
  };
}

export default {
  title: "Pages/DoctorSchedule",
  component: DoctorSchedule,
  args: { prescriberId: "1" },
};

export const WithSlotsAndAppointments = {
  decorators: [withMockedApi()],
};

export const NoSlots = {
  decorators: [withMockedApi({ slots: [] })],
};

export const NoAppointments = {
  decorators: [withMockedApi({ appointments: [] })],
};