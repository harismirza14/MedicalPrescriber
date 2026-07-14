import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PatientBookingDrawer from "./PatientBookingDrawer";
import client from "@/api/client";

const mockCareTeam = {
  care_team_id: 1,
  members: [
    { prescriber_id: 1, name: "Dr. Mohsin Khan", specialty: "Cardiology" },
    { prescriber_id: 2, name: "Dr. Ali Nazam", specialty: "Neurology" },
  ],
};

const mockFreeSlots = [
  { start_time: "09:00:00", end_time: "12:00:00" },
  { start_time: "14:00:00", end_time: "16:00:00" },
];

const originalGet = client.get;
const originalPost = client.post;

function withMockedApi({ freeSlots = mockFreeSlots, careTeamEmpty = false } = {}) {
  return (Story) => {
    client.get = async (url) => {
      if (url.includes("/care-team")) {
        return { data: careTeamEmpty ? { care_team_id: 1, members: [] } : mockCareTeam };
      }
      if (url.includes("/available-slots")) {
        return { data: freeSlots };
      }
      return originalGet(url);
    };
    client.post = async (url) => {
      if (url.includes("/appointments")) {
        return { data: { id: 99, status: "scheduled" } };
      }
      return originalPost(url);
    };
    return (
      <Provider store={configureStore({ reducer: { auth: (s = { role: "patient", user: { roleSpecificId: "P1" } }) => s } })}>
        <MemoryRouter initialEntries={["/appointments"]}>
          <Story />
        </MemoryRouter>
      </Provider>
    );
  };
}

export default {
  title: "Organisms/PatientBookingDrawer",
  component: PatientBookingDrawer,
  args: { isOpen: true, patientId: "P1", onClose: () => {}, onAppointmentCreated: () => {} },
};

export const Step1_SelectDoctor = {
  decorators: [withMockedApi()],
};

export const Step1_EmptyCareTeam = {
  decorators: [withMockedApi({ careTeamEmpty: true })],
};

export const Step2_NoAvailability = {
  decorators: [withMockedApi({ freeSlots: [] })],
};