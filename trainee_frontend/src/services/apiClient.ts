import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

/**
 * API calls are opt-in while the frontend is running with its local mock data.
 * Set VITE_API_BASE_URL to a real backend origin to enable them.
 */
export const isApiConfigured = Boolean(apiBaseUrl);

export const apiClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 seconds timeout (first cold DB call can be slow)
});
