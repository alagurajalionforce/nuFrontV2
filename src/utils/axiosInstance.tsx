import axios, {
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';
import { baseUrl } from '../constants/baseURL';
import urls from '../constants/requestURL';
import toast from 'react-hot-toast';
import { logoutUser } from '../store/userSlice';
import { store } from '../store';

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        _retry?: boolean;
    }
}

// Get access token from localStorage
const getAccessToken = (): string | null => {
    const loginData = localStorage.getItem('loginDetails');
    if (!loginData) return null;
    try {
        const parsed = JSON.parse(loginData);
        return parsed.token || null;
    } catch (e) {
        console.error('Error parsing loginDetails', e);
        return null;
    }
};

// Get refresh token from localStorage
const getRefreshToken = (): string | null => {
    const loginData = localStorage.getItem('loginDetails');
    if (!loginData) return null;
    try {
        const parsed = JSON.parse(loginData);
        return parsed.refreshToken || null;
    } catch (e) {
        console.error('Error parsing loginDetails', e);
        return null;
    }
};

// Handle logout - This function should perform the logout, clear storage, and redirect.
const handleLogout = async (): Promise<void> => {
    // Optional: Call logout API
    try {
        const token = getAccessToken();
        if (token) {
            await axios.get(`${baseUrl}${urls['logout']?.path}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
    } catch (error) {
        console.error('Logout API call failed:', error);
    }

    // Clear local storage and state
    localStorage.clear();
    store.dispatch(logoutUser()); // Assuming you dispatch a Redux action
    toast.error('Session expired. Please log in again.');
    window.location.replace('/login');
};

// Refresh token API call
const REFRESH_TOKEN = async (refreshToken: any): Promise<string> => {
    try {
        const response = await axios({
            url: `${baseUrl}${urls['refreshToken'].path}`,
            method: urls['refreshToken'].method,
            data: { refreshToken },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.data?.accessToken) {
            throw new Error('Invalid token response');
        }

        // Update stored tokens
        localStorage.setItem(
            'accessToken',
            response.data?.accessToken,
        );
        localStorage.setItem(
            'refreshToken',
            response.data?.refreshToken,
        );

        return response.data.accessToken;
    } catch (error) {
        console.error('Refresh token failed:', error);
        await handleLogout(); // Logout if refresh fails
        throw error;
    }
};

const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

let isRefreshing = false;
let failedRequestsQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null): void => {
    failedRequestsQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedRequestsQueue = [];
};

// axiosInstance.interceptors.request.use(
//     (config: InternalAxiosRequestConfig) => {
//         const token = getAccessToken();
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

axiosInstance.interceptors.request.use(async (config) => {
    const currentToken = localStorage.getItem('accessToken');

    config.headers.Authorization = `Bearer ${currentToken}`;

    return config;
});

// axiosInstance.interceptors.response.use(
//     (response: AxiosResponse) => response,
//     async (error: AxiosError) => {
//         const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;

//             if (isRefreshing) {
//                 return new Promise((resolve, reject) => {
//                     failedRequestsQueue.push({
//                         resolve: (token: string) => {
//                             originalRequest.headers.Authorization = `Bearer ${token}`;
//                             resolve(axiosInstance(originalRequest));
//                         },
//                         reject: (err: Error) => {
//                             reject(err);
//                         },
//                     });
//                 });
//             }

//             isRefreshing = true;
//             const refreshToken = getRefreshToken();

//             if (!refreshToken) {
//                 await handleLogout();
//                 return Promise.reject(error);
//             }

//             try {
//                 const newToken = localStorage.getItem('refreshToken');
//                // const newToken = await REFERSH_TOKEN(refreshToken);
//                 const newAccessToken = await REFRESH_TOKEN(newToken);
//                 originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//                 processQueue(null, newAccessToken);
//                 return axiosInstance(originalRequest);
//             } catch (refreshError) {
//                 await handleLogout();
//                 processQueue(refreshError as Error);
//                 return Promise.reject(refreshError);
//             } finally {
//                 isRefreshing = false;
//             }
//         }

//         //Use toast to notify the user of any other errors
//         if (error.response?.status && error.response.status !== 401) {
//             // Use a type guard to safely check for the message property
//             const errorData = error.response.data;

//             // Check if errorData is an object and has a message property
//             if (
//                 typeof errorData === 'object' &&
//                 errorData !== null &&
//                 'message' in errorData
//             ) {
//                 toast.error('Something went wrong');
//             } else {
//                 // Fallback for cases where message is not present or data is not an object
//                 toast.error('An unexpected error occurred');
//             }
//         }

//         return Promise.reject(error);
//     }
// );

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Retry the request if it returns a 401 response
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

          //  try {
                // Refresh the token using your refresh token logic
                const refreshToken = localStorage.getItem('refreshToken');
                const newToken = await REFRESH_TOKEN(refreshToken);

                // Update the Authorization header with the new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                console.log(refreshToken, newToken, "TOKEN");
                // Retry the original request
                return axiosInstance(originalRequest);
            // } catch (refreshError) {
            //     // Handle refresh token error
            //     console.log(refreshError, "ERROR");
            //    // await localStorage.clear();
            //   //  window.location.replace("/login");
            // }
        }

        // Handle other types of errors
      //  return Promise.reject(error);
    },
);


export default axiosInstance;