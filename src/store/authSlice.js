import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login } from "../api/authApi";

const loadInitialState = () => {
  const stored = localStorage.getItem("auth");
  if (stored) {
    try {
      const { user, role, isAuthenticated } = JSON.parse(stored);
      return { user, role, isAuthenticated, loading: false, error: null };
    } catch {
      return { user: null, role: null, isAuthenticated: false, loading: false, error: null };
    }
  }
  return { user: null, role: null, isAuthenticated: false, loading: false, error: null };
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ userId, password }, { rejectWithValue }) => {
    try {
      const data = await login(userId, password);
      return data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || "Failed to log in"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("auth");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        localStorage.setItem("auth", JSON.stringify({
          user: state.user,
          role: state.role,
          isAuthenticated: true,
        }));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;