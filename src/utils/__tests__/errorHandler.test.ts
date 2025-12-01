import { getErrorMessage } from '../errorHandler';

describe('errorHandler utilities', () => {
  describe('getErrorMessage', () => {
    it('should return error message for string errors', () => {
      const result = getErrorMessage('AUTH_REQUIRED');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return the string itself if no mapping found', () => {
      const message = 'Custom error message';
      const result = getErrorMessage(message);
      expect(result).toBe(message);
    });

    it('should handle error response objects with 400 status', () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Missing fields' }
        }
      };
      const result = getErrorMessage(error);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle error response objects with 401 status', () => {
      const error = {
        response: {
          status: 401,
          data: {}
        }
      };
      const result = getErrorMessage(error);
      expect(result).toBeTruthy();
      expect(result).toContain('permission');
    });

    it('should handle error response objects with 403 status', () => {
      const error = {
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      };
      const result = getErrorMessage(error);
      expect(result).toBeTruthy();
    });

    it('should handle error response objects with 404 status', () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'Not found' }
        }
      };
      const result = getErrorMessage(error);
      expect(result).toBeTruthy();
    });

    it('should handle error response objects with 500 status', () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Server error' }
        }
      };
      const result = getErrorMessage(error);
      expect(result).toBeTruthy();
    });

    it('should handle generic errors with message property', () => {
      const error = {
        message: 'Network error'
      };
      const result = getErrorMessage(error);
      expect(result).toBeTruthy();
    });

    it('should return default error message for unknown error types', () => {
      const error = {};
      const result = getErrorMessage(error);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle null gracefully', () => {
      const result = getErrorMessage(null);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle undefined gracefully', () => {
      const result = getErrorMessage(undefined);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should prioritize error.response.data.error over message', () => {
      const error = {
        response: {
          status: 200,
          data: { error: 'Custom validation error' }
        },
        message: 'Generic message'
      };
      const result = getErrorMessage(error);
      expect(result).toBeTruthy();
    });
  });
});
