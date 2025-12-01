import type { UserRole } from '../lib/types';

export const ROUTES = {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password/:token',
    CHANGE_PASSWORD: '/change-password',

    // Admin routes
    ADMIN_DASHBOARD: '/admin/dashboard',
    USER_MANAGEMENT: '/admin/users',

    // Accounts routes
    ACCOUNTS_DASHBOARD: '/accounts/dashboard',
    PENDING_APPROVALS: '/accounts/pending-approvals',

    // Clearance Manager routes
    CLEARANCE_DASHBOARD: '/clearance/dashboard',
    CREATE_SHIPMENT: '/clearance/create-shipment',
    MY_SHIPMENTS: '/clearance/my-shipments',
} as const;

export const ROLE_NAMES: Record<UserRole, string> = {
    admin: 'Administrator',
    accounts: 'Accounts Manager',
    clearance_agent: 'Clearance Agent',
};

export const ROLE_COLORS: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800',
    accounts: 'bg-blue-100 text-blue-800',
    clearance_agent: 'bg-green-100 text-green-800',
};
