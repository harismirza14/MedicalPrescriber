import { configureStore } from '@reduxjs/toolkit';
import medicationsReducer from './MedicationSlice';

export const store = configureStore({
  reducer: {
    medications: medicationsReducer,
  },
});