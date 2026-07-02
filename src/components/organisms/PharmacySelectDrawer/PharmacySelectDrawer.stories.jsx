import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PharmacySelectDrawer from "./PharmacySelectDrawer";
import client from "@/api/client";

// Mock Redux store with auth state
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: { role: 'doctor' }, isAuthenticated: true }) => state,
  },
  preloadedState: {
    auth: { user: { role: 'doctor' }, isAuthenticated: true },
  },
});

// Mock pharmacy data
const mockPharmacies = [
  { id: 1, name: 'CVS Pharmacy', address: '123 Main St', zipcode: '22903', phone: '555-1234', hours: '8am-10pm' },
  { id: 2, name: 'Walgreens', address: '456 Oak Ave', zipcode: '22903', phone: '555-5678', hours: '9am-9pm' },
];

// Intercept API calls to /pharmacies
const mockPharmaciesApi = () => {
  const originalGet = client.get;
  client.get = (url) => {
    if (url.includes('/pharmacies')) {
      return Promise.resolve({ data: mockPharmacies });
    }
    return originalGet(url);
  };
  return () => {
    client.get = originalGet;
  };
};

export default {
  title: 'Pharmacy/PharmacySelectDrawer',
  component: PharmacySelectDrawer,
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
};

export const DefaultOpen = {
  args: {
    isOpen: true,
    zipCode: '22903',
    currentPharmacy: null,
  },
  loaders: [async () => mockPharmaciesApi()],
};

export const WithPreselected = {
  args: {
    isOpen: true,
    zipCode: '22903',
    currentPharmacy: {
      id: 1,
      name: 'CVS Pharmacy',
      address: '123 Main St',
      zipcode: '22903',
    },
  },
  loaders: [async () => mockPharmaciesApi()],
};

export const Closed = {
  args: {
    isOpen: false,
    zipCode: '22903',
  },
};