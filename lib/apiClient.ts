import axios from "axios";

// This variable acts as your in-memory storage for the access token
let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // Crucial: forces browser to send the HttpOnly cookie
});

// Attach the Access Token to every outgoing request
apiClient.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// Handle 401 Unauthorized errors automatically
apiClient.interceptors.response.use(
  (response) => response, // If successful, just return the response
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 and we haven't already retried this request...
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to hit the refresh endpoint
        const { data } = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        
        // Save the new access token
        setAccessToken(data.accessToken);

        // Update the failed request with the new token and retry it
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // If the refresh fails (e.g., refresh token is expired/revoked), log the user out
        setAccessToken(null);
        window.location.href = "/login"; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;