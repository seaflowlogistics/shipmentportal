import type { UserRole, User } from '../lib/types';
import { ROUTES } from './constants';

export const getRoleRedirectPath = (role: UserRole): string => {
    switch (role) {
        case 'admin':
            return ROUTES.ADMIN_DASHBOARD;
        case 'accounts':
            return ROUTES.ACCOUNTS_DASHBOARD;
        case 'clearance_manager':
            return ROUTES.CLEARANCE_DASHBOARD;
        default:
            return ROUTES.LOGIN;
    }
};

export const hasRole = (user: User | null, allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
};

export const isAdmin = (user: User | null): boolean => {
    return user?.role === 'admin';
};

export const isAccounts = (user: User | null): boolean => {
    return user?.role === 'accounts' || user?.role === 'admin';
};

export const isClearanceManager = (user: User | null): boolean => {
    return user?.role === 'clearance_manager' || user?.role === 'admin';
};

export const saveAuthData = (accessToken: string, refreshToken: string, user: User): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

export const getStoredUser = (): User | null => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

export const getStoredTokens = (): { accessToken: string | null; refreshToken: string | null } => {
    return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
    };
};
