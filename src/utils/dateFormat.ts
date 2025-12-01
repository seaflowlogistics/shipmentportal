/**
 * Date formatting utilities for consistent DD-MM-YYYY display across the application
 * All dates are stored in ISO format internally, but displayed as DD-MM-YYYY
 */

/**
 * Format date to DD-MM-YYYY format
 * @param date - ISO date string or Date object
 * @returns Formatted date string in DD-MM-YYYY format
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  } catch {
    return '';
  }
};

/**
 * Format date with time to DD-MM-YYYY HH:mm format
 * @param date - ISO date string or Date object
 * @returns Formatted date string with time
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch {
    return '';
  }
};

/**
 * Format date in long format: DD-MMM-YYYY (e.g., 01-Dec-2024)
 * @param date - ISO date string or Date object
 * @returns Formatted date string
 */
export const formatDateLong = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  } catch {
    return '';
  }
};

/**
 * Parse DD-MM-YYYY format string back to ISO format
 * @param dateStr - Date string in DD-MM-YYYY format
 * @returns ISO format date string (YYYY-MM-DD)
 */
export const parseDateString = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';

    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];

    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

/**
 * Get relative time string (e.g., "2 days ago")
 * @param date - ISO date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

    return formatDate(date);
  } catch {
    return '';
  }
};

/**
 * Check if a date string is valid
 * @param dateStr - Date string to validate
 * @returns Boolean indicating if date is valid
 */
export const isValidDate = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;

  try {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
};

/**
 * Format date for API calls (ISO 8601 format)
 * @param date - ISO date string or Date object
 * @returns ISO format date string
 */
export const formatDateForAPI = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};
