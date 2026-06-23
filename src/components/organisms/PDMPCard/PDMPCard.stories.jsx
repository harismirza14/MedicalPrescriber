import React from "react";
import PDMPCard from "./PDMPCard";

export default {
  title: "Pharmacy/PDMPCard",
  component: PDMPCard,
  decorators: [
    (Story) => (
      <div className="max-w-sm border bg-gray-50 p-4">
        <Story />
      </div>
    ),
  ],
};

export const WithData = {
  args: {
    pdmp: {
      summary: "No controlled substances found in the last 6 months. Patient is cleared.",
      lastChecked: new Date().toISOString(),
    },
  },
};

export const WarningData = {
  args: {
    pdmp: {
      summary: "Patient has 2 active opioid prescriptions from different providers.",
      lastChecked: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  },
};

export const EmptyState = {
  args: {
    pdmp: null,
  },
};
