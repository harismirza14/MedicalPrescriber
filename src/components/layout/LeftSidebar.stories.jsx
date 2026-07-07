import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";

function withStoreAndRouter(authState, initialEntries) {
  return (Story) => {
    const store = configureStore({
      reducer: { auth: (state = authState) => state },
    });
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <Story />
        </MemoryRouter>
      </Provider>
    );
  };
}

export default {
  title: "Layout/LeftSidebar",
  component: LeftSidebar,
};

export const Default = {
  decorators: [
    withStoreAndRouter(
      { role: "doctor", user: { name: "Dr. Mohsin Khan", roleSpecificId: "1" } },
      ["/select-patient"]
    ),
  ],
};

export const PatientNavigation = {
  decorators: [
    withStoreAndRouter(
      { role: "patient", user: { name: "Muhammad Haris", roleSpecificId: "P1" } },
      ["/medications"]
    ),
  ],
};

export const AdminNavigation = {
  decorators: [
    withStoreAndRouter(
      { role: "admin", user: { name: "Admin User" } },
      ["/admin"]
    ),
  ],
};