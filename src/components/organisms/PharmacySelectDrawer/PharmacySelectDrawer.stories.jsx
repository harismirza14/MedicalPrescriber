import React from "react";
import PharmacySelectDrawer from "./PharmacySelectDrawer";

export default {
  title: "Pharmacy/PharmacySelectDrawer",
  component: PharmacySelectDrawer,
};

export const DefaultOpen = {
  args: {
    isOpen: true,
    zipCode: "22903",
    currentPharmacy: null,
  },
};

export const WithPreselected = {
  args: {
    isOpen: true,
    zipCode: "22903",
    currentPharmacy: {
      id: "1",
      name: "CVS Pharmacy",
      address: "123 Main St",
    },
  },
};

export const Closed = {
  args: {
    isOpen: false,
    zipCode: "22903",
  },
};
