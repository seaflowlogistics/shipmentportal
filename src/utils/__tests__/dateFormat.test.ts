import { formatDate, formatDateTime, isValidDate, parseDateString } from '../dateFormat';

describe('dateFormat utilities', () => {
  describe('formatDate', () => {
    it('should format date as DD-MM-YYYY', () => {
      const result = formatDate('2024-12-01');
      expect(result).toBe('01-12-2024');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-12-01');
      const result = formatDate(date);
      expect(result).toBe('01-12-2024');
    });

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatDate(undefined)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
    });

    it('should handle single digit days and months', () => {
      const result = formatDate('2024-01-05');
      expect(result).toBe('05-01-2024');
    });

    it('should handle end of month dates', () => {
      const result = formatDate('2024-12-31');
      expect(result).toBe('31-12-2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time as DD-MM-YYYY HH:MM:SS', () => {
      const result = formatDateTime('2024-12-01T15:30:45Z');
      expect(result).toMatch(/\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}/);
    });

    it('should return empty string for null', () => {
      expect(formatDateTime(null)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDateTime('invalid')).toBe('');
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid date strings', () => {
      expect(isValidDate('2024-12-01')).toBe(true);
    });

    it('should return true for valid Date objects', () => {
      expect(isValidDate(new Date())).toBe(true);
    });

    it('should return false for invalid date strings', () => {
      expect(isValidDate('invalid-date')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidDate(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    it('should return false for invalid Date objects', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
    });
  });

  describe('parseDateString', () => {
    it('should parse DD-MM-YYYY format', () => {
      const result = parseDateString('01-12-2024');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(11); // December (0-indexed)
      expect(result?.getDate()).toBe(1);
    });

    it('should return null for invalid format', () => {
      expect(parseDateString('01/12/2024')).toBeNull();
    });

    it('should return null for invalid date', () => {
      expect(parseDateString('32-13-2024')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseDateString('')).toBeNull();
    });
  });
});
