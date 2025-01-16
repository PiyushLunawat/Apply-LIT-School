// apiAxiosInstance.ts
import axios from 'axios';

const apiAxiosInstance = axios.create({
  baseURL: 'https://your-api-base-url.com',
  // ...other configurations
});

// Apply interceptors specific to your API
apiAxiosInstance.interceptors.request.use(
  (config) => {
    // Add your API-specific interceptors
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiAxiosInstance;
