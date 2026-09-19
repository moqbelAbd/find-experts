import axios from 'axios';
import toast from 'react-hot-toast';

const axiosClient = axios.create({
    baseURL: 'https://localhost:7252/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Extract both response and config from the error object
        const { response, config } = error;

        // 423 Locked: Banned user
        if (response && response.status === 423) {
            localStorage.removeItem('token');
            toast.error(response.data.message || "Your account has been suspended.");
            setTimeout(() => {
                window.location.href = '/login';
            }, 2500);
        }
        // 401 Unauthorized: Guest trying to access protected resource
        else if (response && response.status === 401) {
            localStorage.removeItem('token');

            // Only force a redirect if the request was NOT for the login endpoint
            if (config && !config.url.includes('/login')) {
                const currentPath = window.location.pathname + window.location.search;
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;