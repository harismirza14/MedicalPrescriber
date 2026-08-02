import axios from "axios";


const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  withCredentials: true,
});


export const chatClient = axios.create({
  baseURL: import.meta.env.VITE_CHAT_API_BASE || 'http://localhost:3001/api',
  withCredentials: true,
});


const attachAuthToken = (config) => {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch {}
  return config;
};

client.interceptors.request.use(attachAuthToken);
chatClient.interceptors.request.use(attachAuthToken); 

const handleResponseError = (error) => {
  if (error.response) {
    const { status, config } = error.response;
    const isLoginRequest = config?.url?.includes("/login");
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("auth");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      console.error("[API] 403 Forbidden");
    } else if (status >= 500) {
      console.error(`[API] Server error ${status}:`, error.response.data);
    }
  } else {
    console.error("[API] Network / unknown error:", error.message);
  }
  return Promise.reject(error);
};

client.interceptors.response.use((r) => r, handleResponseError);
chatClient.interceptors.response.use((r) => r, handleResponseError);

export default client;