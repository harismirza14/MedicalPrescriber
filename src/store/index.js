import { configureStore } from '@reduxjs/toolkit';
import medicationsReducer from './MedicationSlice';
import authReducer from './AuthSlice';
import chatReducer from './chatSlice';
export const store = configureStore({
  reducer: {
    medications: medicationsReducer,
    auth: authReducer,
    chat: chatReducer,
  },
});