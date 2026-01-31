const isProd = import.meta.env.MODE === "production";

export const API_BASE_URL = isProd
  ? import.meta.env.VITE_API_URL_PROD || import.meta.env.VITE_API_URL
  : import.meta.env.VITE_API_URL || "http://localhost:5000";
