import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3000/api",
});

client.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch {
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        localStorage.removeItem("auth");
        window.location.href = "/login";
      } else if (status === 403) {
        console.error("[API] 403 Forbidden");
      } else if (status >= 500) {
        console.error(`[API] Server error ${status}:`, error.response.data);
      }
    } else {
      console.error("[API] Network / unknown error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default client;