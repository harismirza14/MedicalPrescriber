import React from "react";
import PharmacyPickerCard from "./PharmacyPickerCard";

export default {
  title: "Molecules/PharmacyPickerCard",
  component: PharmacyPickerCard,
};

const mockPharmacy = {
  id: "1",
  name: "CVS Pharmacy",
  address: "123 Main St",
  phone: "(555) 123-4567",
  hours: "Open 24 hours",
};

export const Default = {
  args: {
    pharmacy: mockPharmacy,
    isSelected: false,
  },
};

export const Selected = {
  args: {
    pharmacy: mockPharmacy,
    isSelected: true,
  },
};

export const Not24Hours = {
  args: {
    pharmacy: { ...mockPharmacy, hours: "9:00 AM - 9:00 PM" },
    isSelected: false,
  },
};
