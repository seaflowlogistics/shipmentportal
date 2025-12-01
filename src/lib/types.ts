export type UserRole = 'admin' | 'accounts' | 'clearance_agent';

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

export interface Shipment {
    id: string;
    shipment_id: string;
    exporter_name: string;
    exporter_address: string;
    exporter_contact?: string;
    exporter_email?: string;
    vendor_name: string;
    vendor_address: string;
    vendor_contact?: string;
    vendor_email?: string;
    receiver_name: string;
    receiver_address: string;
    receiver_contact?: string;
    receiver_email?: string;
    item_description: string;
    weight: number;
    weight_unit: string;
    dimensions_length?: number;
    dimensions_width?: number;
    dimensions_height?: number;
    dimensions_unit: string;
    value: number;
    currency: string;
    pickup_date: string;
    expected_delivery_date: string;
    mode_of_transport: 'air' | 'sea' | 'road';
    status: 'new' | 'created' | 'approved' | 'rejected' | 'changes_requested' | 'in_transit' | 'delivered' | 'cancelled';
    rejection_reason?: string;
    created_by?: string;
    last_updated_by?: string;
    created_at: string;
    updated_at: string;
    // New fields
    invoice_no?: string;
    invoice_item_count?: number;
    customs_r_form?: string;
    bl_awb_no?: string;
    container_no?: string;
    container_type?: string;
    cbm?: number;
    gross_weight?: number;
    package_count?: string;
    cleared_date?: string;
    expense_macl?: number;
    expense_mpl?: number;
    expense_mcs?: number;
    expense_transportation?: number;
    expense_liner?: number;
}
