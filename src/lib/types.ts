export type UserRole = 'admin' | 'accounts' | 'clearance_manager';

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    fullName?: string;
    isActive: boolean;
    mustChangePassword: boolean;
    lastLogin?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}

export interface CreateUserData {
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    fullName?: string;
}

export interface UpdateUserData {
    email?: string;
    role?: UserRole;
    fullName?: string;
    isActive?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ApiError {
    error: string;
    message?: string;
    details?: string[];
}
