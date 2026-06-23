import React from "react";
import PharmacyCard from "./PharmacyCard";

export default {
  title: "Pharmacy/PharmacyCard",
  component: PharmacyCard,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

const defaultPharmacy = {
  name: "Walgreens Pharmacy",
  address: "123 Main St, Charlottesville, VA 22903",
  phone: "(555) 123-4567",
  hours: "8:00 AM - 9:00 PM",
  controlledSubstances: true,
};

export const Default = {
  args: {
    pharmacy: defaultPharmacy,
  },
};

export const NoControlledSubstances = {
  args: {
    pharmacy: {
      ...defaultPharmacy,
      controlledSubstances: false,
    },
  },
};

export const EmptyState = {
  args: {
    pharmacy: null,
  },
};
