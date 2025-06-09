import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: `${process.env.API_URL}/api/v1`,
  timeout: 0,
});

// Add a request interceptor to set the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("ivy-auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API error response:", error.response);
    } else if (error.request) {
      console.error("API no response:", error.request);
    } else {
      console.error("API request error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
