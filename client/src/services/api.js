import axios from "axios";

// Locally, requests go to /api and Vite proxies them to the server (see vite.config.js).
// When deployed (client and server on different domains), set VITE_API_URL in the client's
// deployment environment to your server's full URL, e.g. https://your-server.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studysphere_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
