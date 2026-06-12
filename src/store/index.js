import { configureStore } from '@reduxjs/toolkit';
import medicationsReducer from './MedicationSlice';
import authReducer from './AuthSlice';
export const store = configureStore({
  reducer: {
    medications: medicationsReducer,
    auth: authReducer,
  },
});