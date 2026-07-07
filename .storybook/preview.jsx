import '../src/index.css';
import { setProjectAnnotations } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../src/store/authSlice';
import medicationsReducer from '../src/store/MedicationSlice';

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    medications: medicationsReducer,
  },
  preloadedState: {
    auth: {
      user: { name: 'Dr. Test', roleSpecificId: '1' },
      role: 'doctor',
      isAuthenticated: true,
    },
    medications: {
      list: [],
      loading: false,
      error: null,
    },
  },
});

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
};

export default preview;