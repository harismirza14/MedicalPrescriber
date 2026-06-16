import axios from "axios";
import { store } from "../store";

const client = axios.create({
  baseURL: "http://localhost:3000/api",
});

// ── Request interceptor ─────────────────────────────────────────────
// Attach x-user-role and x-user-id headers from the Redux store
// (falls back to localStorage if the store values are unavailable).
client.interceptors.request.use((config) => {
  let role = null;
  let userId = null;

  try {
    const state = store.getState();
    const auth = state.auth;

    if (auth?.role) {
      role = auth.role;
    }

    if (auth?.user) {
      userId =
        auth.role === "patient"
          ? auth.user.patient_id
          : auth.user.prescriber_id;
    }
  } catch {
    // Store may not be available yet – fall through to localStorage.
  }

  // Fallback: read from localStorage
  if (!role || !userId) {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!role && parsed.role) {
          role = parsed.role;
        }
        if (!userId && parsed.user) {
          userId =
            parsed.role === "patient"
              ? parsed.user.patient_id
              : parsed.user.prescriber_id;
        }
      }
    } catch {
      // localStorage parse failed – skip.
    }
  }

  if (role) {
    config.headers["x-user-role"] = role;
  }
  if (userId) {
    config.headers["x-user-id"] = userId;
  }

  return config;
});

// ── Response interceptor ─────────────────────────────────────────────
// Handle global errors (e.g., 401 → redirect to login). For now, just log.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.error("[API] 401 Unauthorized – redirect to login (TODO)");
      } else if (status === 403) {
        console.error("[API] 403 Forbidden");
      } else if (status >= 500) {
        console.error(`[API] Server error ${status}:`, error.response.data);
      }
    } else {
      console.error("[API] Network / unknown error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default client;
