import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/context/Theme";
import Header from "./Header";

export default {
  title: "Layout/Header",
  component: Header,
};

function withRoute(pathname, search = "") {
  return (Story) => (
    <ThemeProvider>
      <MemoryRouter initialEntries={[{ pathname, search }]}>
        <Story />
      </MemoryRouter>
    </ThemeProvider>
  );
}

export const Default = {
  decorators: [withRoute("/select-patient")],
};

export const OnDetailPageWithBackArrow = {
  decorators: [withRoute("/patient-dashboard", "?patientId=P1&tab=profile")],
};