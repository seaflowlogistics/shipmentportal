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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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

        // If error is 401 and we haven't retried yet, and it's not a login request
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
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

    changePassword: async (data: ChangePasswordData | { newPassword: string }): Promise<{ message: string }> => {
        const response = await api.post('/auth/change-password', data);
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
        const response = await api.post('/auth/forgot-password', data);
        return response.data;
    },

    resetPassword: async (data: ResetPasswordData | { token: string; newPassword: string }): Promise<{ message: string }> => {
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

// Shipments API
export const shipmentsApi = {
    list: async (params?: {
        status?: string;
        mode?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<any> => {
        const response = await api.get('/shipments', { params });
        return response.data;
    },

    get: async (id: string): Promise<any> => {
        const response = await api.get(`/shipments/${id}`);
        return response.data;
    },

    create: async (data: any): Promise<any> => {
        const response = await api.post('/shipments', data);
        return response.data;
    },

    update: async (id: string, data: any): Promise<any> => {
        const response = await api.put(`/shipments/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/shipments/${id}`);
        return response.data;
    },

    getStatistics: async (): Promise<any> => {
        const response = await api.get('/shipments/stats/dashboard');
        return response.data;
    },

    approve: async (id: string): Promise<any> => {
        const response = await api.post(`/shipments/${id}/approve`);
        return response.data;
    },

    reject: async (id: string, data: { reason: string }): Promise<any> => {
        const response = await api.post(`/shipments/${id}/reject`, data);
        return response.data;
    },

    requestChanges: async (id: string, data: { message?: string }): Promise<any> => {
        const response = await api.post(`/shipments/${id}/request-changes`, data);
        return response.data;
    },
};

// Documents API
export const documentsApi = {
    upload: async (shipmentId: string, file: File, documentType: string): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', documentType);

        const response = await api.post(`/documents/${shipmentId}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    get: async (shipmentId: string): Promise<any> => {
        const response = await api.get(`/documents/${shipmentId}`);
        return response.data;
    },

    delete: async (documentId: string): Promise<{ message: string }> => {
        const response = await api.delete(`/documents/${documentId}`);
        return response.data;
    },

    download: async (documentId: string): Promise<any> => {
        const response = await api.get(`/documents/${documentId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },
};

// Audit Logs API
export const auditLogsApi = {
    list: async (params?: {
        action?: string;
        entity_type?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<any> => {
        const response = await api.get('/audit-logs', { params });
        return response.data;
    },
};

export default api;
