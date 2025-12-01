/**
 * Centralized error message handling for user-friendly error displays
 */

export const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid username or password. Please try again.',
  ACCOUNT_INACTIVE: 'Your account has been deactivated. Please contact your administrator.',
  ACCOUNT_LOCKED: 'Your account has been locked due to multiple failed login attempts. Please try again later.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',

  // Shipment errors
  SHIPMENT_NOT_FOUND: 'Shipment not found. It may have been deleted or you may not have permission to view it.',
  INVALID_STATUS_TRANSITION: 'This action cannot be performed on a shipment with the current status.',
  SHIPMENT_ALREADY_APPROVED: 'This shipment has already been approved.',
  SHIPMENT_ALREADY_REJECTED: 'This shipment has already been rejected.',
  SHIPMENT_ALREADY_DELIVERED: 'This shipment has already been delivered.',

  // Document errors
  DOCUMENT_NOT_FOUND: 'Document not found or has been deleted.',
  INVALID_FILE_TYPE: 'Invalid file type. Allowed types: PDF, JPEG',
  FILE_TOO_LARGE: 'File size exceeds the 10MB limit.',
  REQUIRED_DOCUMENTS_MISSING: 'Please upload all required documents.',

  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  WEAK_PASSWORD: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  PICKUP_DATE_INVALID: 'Pickup date must be before expected delivery date.',
  DIMENSION_INVALID: 'Dimensions must be positive numbers.',
  WEIGHT_INVALID: 'Weight must be a positive number.',
  VALUE_INVALID: 'Value must be a positive number.',

  // User management errors
  USERNAME_TAKEN: 'Username is already taken. Please choose a different username.',
  EMAIL_TAKEN: 'Email is already registered. Please use a different email address.',
  USER_NOT_FOUND: 'User not found.',
  CANNOT_DELETE_YOURSELF: 'You cannot delete your own account.',
  CANNOT_DEACTIVATE_YOURSELF: 'You cannot deactivate your own account.',

  // Generic errors
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  BAD_REQUEST: 'Invalid request. Please check your input and try again.',
  CONFLICT: 'This action conflicts with existing data.',
  RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',

  // Export errors
  EXPORT_FAILED: 'Failed to generate export. Please try again.',
  EXPORT_TOO_LARGE: 'Export file is too large. Please apply filters to reduce the amount of data.',

  // File operation errors
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  DOWNLOAD_FAILED: 'Failed to download file. Please try again.',
  DELETE_FAILED: 'Failed to delete file. Please try again.',
};

/**
 * Map error codes/messages to user-friendly messages
 * @param error - Error code, response object, or error message
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  // If error is a string, check if it's a known error code
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }

  // Handle axios/fetch error responses
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Server sent a specific error message
    if (data?.error) {
      return ERROR_MESSAGES[data.error] || data.error;
    }

    if (data?.message) {
      return data.message;
    }

    // Handle by status code
    switch (status) {
      case 400:
        return ERROR_MESSAGES.BAD_REQUEST;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.PERMISSION_DENIED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 409:
        return ERROR_MESSAGES.CONFLICT;
      case 429:
        return ERROR_MESSAGES.RATE_LIMITED;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.SERVER_ERROR;
    }
  }

  // Handle network errors
  if (error.message === 'Network Error' || !navigator.onLine) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Handle timeout
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }

  // Default to generic error
  return ERROR_MESSAGES.SERVER_ERROR;
};

/**
 * Get success message for common operations
 * @param action - Action type
 * @returns Success message
 */
export const getSuccessMessage = (action: string): string => {
  const messages: Record<string, string> = {
    create_shipment: 'Shipment created successfully!',
    update_shipment: 'Shipment updated successfully!',
    delete_shipment: 'Shipment deleted successfully!',
    approve_shipment: 'Shipment approved successfully!',
    reject_shipment: 'Shipment rejected successfully!',
    request_changes: 'Change request sent successfully!',

    upload_document: 'Document uploaded successfully!',
    delete_document: 'Document deleted successfully!',
    download_document: 'Document downloaded successfully!',

    create_user: 'User created successfully!',
    update_user: 'User updated successfully!',
    delete_user: 'User deleted successfully!',
    reset_password: 'Password reset successfully!',
    change_password: 'Password changed successfully!',

    export_shipments: 'Shipments exported successfully!',
    export_audit_logs: 'Audit logs exported successfully!',

    logout: 'Logged out successfully!',
  };

  return messages[action] || 'Operation completed successfully!';
};

/**
 * Validate form data and return field-specific errors
 * @param formData - Form data to validate
 * @returns Object with field names as keys and error messages as values
 */
export const validateFormData = (
  formData: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const error = rules[field](value);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};
