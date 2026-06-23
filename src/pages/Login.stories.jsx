import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LoginPage from "./Login";

const MockStoreDecorator = (initialState) => (Story) => {
  const store = configureStore({
    reducer: {
      auth: (state = initialState.auth || { loading: false, error: null }) => state,
    },
    preloadedState: initialState,
  });
  return (
    <Provider store={store}>
      <Story />
    </Provider>
  );
};

export default {
  title: "Pages/Login",
  component: LoginPage,
  decorators: [MockStoreDecorator({ auth: { loading: false, error: null } })],
};

export const Default = {
  args: {},
};

export const Loading = {
  decorators: [MockStoreDecorator({ auth: { loading: true, error: null } })],
};

export const WithError = {
  decorators: [
    MockStoreDecorator({ auth: { loading: false, error: "Invalid email or password." } }),
  ],
};
