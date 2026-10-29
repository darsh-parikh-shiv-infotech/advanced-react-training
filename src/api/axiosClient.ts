import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "./apiError";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;

      const status = axiosError.response?.status;
      const backendMessage = axiosError.response?.data?.message ?? axiosError.response?.data?.error;

      // Request reached the server and received an HTTP error.
      if (status) {
        if (status === StatusCodes.UNAUTHORIZED) {
          // A 401 can indicate an expired or invalid session.
          // Avoid automatically logging out on the login endpoint.
          if (!axiosError.config?.url?.includes("/auth/login")) {
            localStorage.removeItem("accessToken");
          }

          throw new ApiError(
            backendMessage || "Session expired. Please log in again.",
            status,
            axiosError.code,
          );
        }

        if (status === StatusCodes.FORBIDDEN) {
          throw new ApiError(
            backendMessage || "You do not have permission to do this.",
            status,
            axiosError.code,
          );
        }

        if (status === StatusCodes.NOT_FOUND) {
          throw new ApiError(
            backendMessage || "The requested resource was not found.",
            status,
            axiosError.code,
          );
        }

        if (status >= StatusCodes.INTERNAL_SERVER_ERROR) {
          throw new ApiError("Server error. Please try again later.", status, axiosError.code);
        }

        throw new ApiError(backendMessage || "Request failed.", status, axiosError.code);
      }

      // The request was made but no response arrived.
      if (axiosError.code === "ECONNABORTED") {
        throw new ApiError("Request timed out. Try again.");
      }

      // DNS, offline, refused connection, etc.
      if (!axiosError.response) {
        throw new ApiError("Unable to connect to the server. Check your connection.");
      }
    }

    // Unexpected non-Axios error.
    throw error;
  },
);

export default axiosClient;
