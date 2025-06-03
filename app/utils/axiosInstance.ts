// apiAxiosInstance.ts
import axios from 'axios';
import { getEnvValue } from "~/atoms/envAtoms";

const baseUrl = getEnvValue("REMIX_PUBLIC_API_BASE_URL");

const apiAxiosInstance = axios.create({
    baseURL: baseUrl,
    // ...other configurations
});

// Function to get cookies (similar to what the fetch interceptor would use)
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

// Apply interceptors specific to your API
apiAxiosInstance.interceptors.request.use(
    (config) => {
        // Add your API-specific interceptors
        const accessToken = getCookie('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
apiAxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If unauthorized error and we have a refresh token, we can let the fetch interceptor handle it
        // The fetch interceptor will update the cookies which this instance will then use
        if (error.response && error.response.status === 401) {
            // Force a reload if we're unauthorized to trigger the fetch interceptor
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default apiAxiosInstance;
