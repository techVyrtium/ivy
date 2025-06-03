import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.N8N_URL,
  timeout: 15 * 60 * 1000, // 15 minutes
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Use token from config if provided
    const token = config.dynamicToken || "";

    if (token) {
      // Fix: Use 'Authorization' header instead of 'authToken'
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";

    // Clean up the custom property to avoid sending it in the request
    delete config.dynamicToken;

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios error:", {
      status: error.response?.status,
      message: error.response?.data || error.message,
      url: error.config?.url,
    });

    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    });
  }
);

export default axiosInstance;
