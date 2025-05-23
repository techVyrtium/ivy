import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.N8N_URL,
  timeout: 60 * 1000, // 60 seconds / 1 min
});

// Get token (you could improve this to be dynamic)
const getToken = () => process.env.API_TOKEN || "";

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
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
    });

    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    });
  }
);

export default axiosInstance;
