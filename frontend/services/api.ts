import axios, { AxiosInstance, AxiosError } from "axios";
import { config } from "@/config/environment";

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = typeof window !== "undefined" 
        ? localStorage.getItem("authToken") 
        : null;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();
