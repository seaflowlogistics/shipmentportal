import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
    LoginCredentials,
    LoginResponse,
    User,
    ChangePasswordData,
    ForgotPasswordData,
    ResetPasswordData,
    CreateUserData,
    UpdateUserData,
} from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // Try to refresh the token
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Update tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Retry original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    logout: async (refreshToken: string): Promise<void> => {
        await api.post('/auth/logout', { refreshToken });
    },

    getCurrentUser: async (): Promise<{ user: User }> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
        const response = await api.post('/auth/change-password', data);
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
        const response = await api.post('/auth/forgot-password', data);
        return response.data;
    },

    resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },
};

// Users API (Admin only)
export const usersApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        role?: string;
        search?: string;
    }): Promise<any> => {
        const response = await api.get('/users', { params });
        return response.data;
    },

    create: async (data: CreateUserData): Promise<any> => {
        const response = await api.post('/users', data);
        return response.data;
    },

    update: async (id: string, data: UpdateUserData): Promise<any> => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    resetPassword: async (id: string): Promise<any> => {
        const response = await api.post(`/users/${id}/reset-password`);
        return response.data;
    },
};

export default api;
