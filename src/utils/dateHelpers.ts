/**
 * Date range calculation utilities for filtering dashboards and shipment lists
 */

type DateRange = {
  dateFrom: string;
  dateTo: string;
};

/**
 * Get date range for predefined periods
 * @param period - Period type: today, week, month, year
 * @returns Object with dateFrom and dateTo in ISO format
 */
export const getDateRange = (period: 'today' | 'week' | 'month' | 'year'): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let dateFrom = new Date(today);
  let dateTo = new Date(today);
  dateTo.setHours(23, 59, 59, 999);

  switch (period) {
    case 'today':
      // Today from 00:00 to 23:59
      dateFrom = new Date(today);
      dateFrom.setHours(0, 0, 0, 0);
      break;

    case 'week':
      // This week (Monday to Sunday)
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday
      dateFrom = new Date(today.setDate(diff));
      dateFrom.setHours(0, 0, 0, 0);
      break;

    case 'month':
      // This month (1st to end of month)
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFrom.setHours(0, 0, 0, 0);
      dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateTo.setHours(23, 59, 59, 999);
      break;

    case 'year':
      // This year (Jan 1 to Dec 31)
      dateFrom = new Date(now.getFullYear(), 0, 1);
      dateFrom.setHours(0, 0, 0, 0);
      dateTo = new Date(now.getFullYear(), 11, 31);
      dateTo.setHours(23, 59, 59, 999);
      break;
  }

  return {
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo: dateTo.toISOString().split('T')[0],
  };
};

/**
 * Validate a date range
 * @param dateFrom - Start date (ISO format)
 * @param dateTo - End date (ISO format)
 * @returns Boolean indicating if the range is valid
 */
export const isValidDateRange = (dateFrom: string, dateTo: string): boolean => {
  try {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return false;
    }

    return from <= to;
  } catch {
    return false;
  }
};

/**
 * Format date for API calls (ISO 8601 format)
 * @param date - Date to format
 * @returns ISO format date string (YYYY-MM-DD)
 */
export const formatDateForAPI = (date: Date | string): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Check if a date falls within a range
 * @param date - Date to check
 * @param dateFrom - Start of range (ISO format)
 * @param dateTo - End of range (ISO format)
 * @returns Boolean indicating if date is in range
 */
export const isDateInRange = (date: string, dateFrom: string, dateTo: string): boolean => {
  try {
    const d = new Date(date).getTime();
    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime();

    return d >= from && d <= to;
  } catch {
    return false;
  }
};

/**
 * Get number of days between two dates
 * @param dateFrom - Start date (ISO format)
 * @param dateTo - End date (ISO format)
 * @returns Number of days
 */
export const getDaysBetween = (dateFrom: string, dateTo: string): number => {
  try {
    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime();
    const diff = Math.abs(to - from);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

/**
 * Get period label for display
 * @param period - Period type
 * @param dateFrom - Optional start date
 * @param dateTo - Optional end date
 * @returns Human-readable period label
 */
export const getPeriodLabel = (
  period: 'today' | 'week' | 'month' | 'year' | 'custom',
  dateFrom?: string,
  dateTo?: string
): string => {
  switch (period) {
    case 'today':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'year':
      return 'This Year';
    case 'custom':
      if (dateFrom && dateTo) {
        return `${dateFrom} to ${dateTo}`;
      }
      return 'Custom Range';
    default:
      return 'All Time';
  }
};
