import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login } from "../api/authApi";
import { clearPatientCache } from "../hooks/usePatient";

const TOKEN_EXPIRY_HOURS = 3;
const EXPIRY_MS = TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;

const loadInitialState = () => {
  const stored = localStorage.getItem("auth");
  if (stored) {
    try {
      const { user, role, roleSpecificId, isAuthenticated, expiresAt } = JSON.parse(stored);
      if (expiresAt && Date.now() > expiresAt) {
        localStorage.removeItem("auth");
        return { user: null, role: null, roleSpecificId: null, isAuthenticated: false, loading: false, error: null };
      }
      return { user, role, roleSpecificId, isAuthenticated, loading: false, error: null };
    } catch {
      return { user: null, role: null, roleSpecificId: null, isAuthenticated: false, loading: false, error: null };
    }
  }
  return { user: null, role: null, roleSpecificId: null, isAuthenticated: false, loading: false, error: null };
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
      state.roleSpecificId = null; 
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("auth");
      clearPatientCache();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      const stored = localStorage.getItem("auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.user = state.user;
          if (action.payload.roleSpecificId !== undefined) {
            state.roleSpecificId = action.payload.roleSpecificId;
            parsed.roleSpecificId = state.roleSpecificId;
          }
          localStorage.setItem("auth", JSON.stringify(parsed));
        } catch {}
      }
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
        state.roleSpecificId = action.payload.roleSpecificId || null; 
        state.token = action.payload.token;
        state.isAuthenticated = true;

        const expiresAt = Date.now() + EXPIRY_MS;
        localStorage.setItem("auth", JSON.stringify({
          user: state.user,
          role: state.role,
          roleSpecificId: state.roleSpecificId,
          token: state.token,
          isAuthenticated: true,
          expiresAt,
        }));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;