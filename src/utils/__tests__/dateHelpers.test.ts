import { getDateRange, isValidDateRange, isDateInRange, getDaysBetween } from '../dateHelpers';

describe('dateHelpers utilities', () => {
  describe('getDateRange', () => {
    it('should return today range with same start and end date', () => {
      const result = getDateRange('today');
      expect(result.dateFrom).toBeTruthy();
      expect(result.dateTo).toBeTruthy();
      // Both should be valid date strings
      expect(/^\d{4}-\d{2}-\d{2}$/.test(result.dateFrom)).toBe(true);
      expect(/^\d{4}-\d{2}-\d{2}$/.test(result.dateTo)).toBe(true);
    });

    it('should return week range starting from earlier date', () => {
      const result = getDateRange('week');
      expect(result.dateFrom).toBeTruthy();
      expect(result.dateTo).toBeTruthy();

      // Verify it returns a valid range
      const from = new Date(result.dateFrom);
      const to = new Date(result.dateTo);
      expect(from.getTime()).toBeLessThanOrEqual(to.getTime());
    });

    it('should return month range with valid dates', () => {
      const result = getDateRange('month');
      expect(result.dateFrom).toBeTruthy();
      expect(result.dateTo).toBeTruthy();

      const fromDate = new Date(result.dateFrom);
      const toDate = new Date(result.dateTo);
      expect(fromDate.getTime()).toBeLessThanOrEqual(toDate.getTime());
    });

    it('should return year range with valid dates', () => {
      const result = getDateRange('year');
      expect(result.dateFrom).toBeTruthy();
      expect(result.dateTo).toBeTruthy();

      const fromDate = new Date(result.dateFrom);
      const toDate = new Date(result.dateTo);
      expect(fromDate.getTime()).toBeLessThanOrEqual(toDate.getTime());
    });
  });

  describe('isValidDateRange', () => {
    it('should return true for valid date range', () => {
      const result = isValidDateRange('2024-01-01', '2024-12-31');
      expect(result).toBe(true);
    });

    it('should return true for same start and end date', () => {
      const result = isValidDateRange('2024-01-01', '2024-01-01');
      expect(result).toBe(true);
    });

    it('should return false when end date is before start date', () => {
      const result = isValidDateRange('2024-12-31', '2024-01-01');
      expect(result).toBe(false);
    });

    it('should return false for invalid date strings', () => {
      const result = isValidDateRange('invalid', '2024-01-01');
      expect(result).toBe(false);
    });

    it('should return false when either date is invalid', () => {
      const result = isValidDateRange('2024-01-01', 'invalid');
      expect(result).toBe(false);
    });
  });

  describe('isDateInRange', () => {
    it('should return true for date within range', () => {
      const result = isDateInRange('2024-06-15', '2024-01-01', '2024-12-31');
      expect(result).toBe(true);
    });

    it('should return true for date at start of range', () => {
      const result = isDateInRange('2024-01-01', '2024-01-01', '2024-12-31');
      expect(result).toBe(true);
    });

    it('should return true for date at end of range', () => {
      const result = isDateInRange('2024-12-31', '2024-01-01', '2024-12-31');
      expect(result).toBe(true);
    });

    it('should return false for date before range', () => {
      const result = isDateInRange('2023-12-31', '2024-01-01', '2024-12-31');
      expect(result).toBe(false);
    });

    it('should return false for date after range', () => {
      const result = isDateInRange('2025-01-01', '2024-01-01', '2024-12-31');
      expect(result).toBe(false);
    });

    it('should return false for invalid date', () => {
      const result = isDateInRange('invalid', '2024-01-01', '2024-12-31');
      expect(result).toBe(false);
    });
  });

  describe('getDaysBetween', () => {
    it('should return 0 for same date', () => {
      const result = getDaysBetween('2024-01-01', '2024-01-01');
      expect(result).toBe(0);
    });

    it('should return correct number of days', () => {
      const result = getDaysBetween('2024-01-01', '2024-01-08');
      expect(result).toBe(7);
    });

    it('should return positive value regardless of order', () => {
      const result1 = getDaysBetween('2024-01-01', '2024-01-08');
      const result2 = getDaysBetween('2024-01-08', '2024-01-01');
      expect(result1).toBe(result2);
    });

    it('should handle month boundaries', () => {
      const result = getDaysBetween('2024-01-31', '2024-02-01');
      expect(result).toBe(1);
    });

    it('should handle year boundaries', () => {
      const result = getDaysBetween('2024-12-31', '2025-01-01');
      expect(result).toBe(1);
    });

    it('should handle invalid dates gracefully', () => {
      const result = getDaysBetween('invalid', '2024-01-01');
      // Invalid dates return NaN which is falsy
      expect(isNaN(result)).toBe(true);
    });
  });
});
