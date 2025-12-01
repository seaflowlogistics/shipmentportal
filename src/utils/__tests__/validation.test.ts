// Validation utility tests for form fields and business logic

/**
 * Test cases for shipment form validation as per project.md requirements:
 * - Required fields validation
 * - Format validation (dates as DD-MM-YYYY, numeric fields)
 * - Date comparison (pickup <= delivery)
 * - File upload validation (PDF/JPEG only, 10MB limit)
 */

describe('Shipment Form Validation', () => {
  describe('Required Fields Validation', () => {
    // Per project.md: Mandatory fields are Exporter, Customer, Weight, Value, Pickup Date

    it('should require exporter_name', () => {
      const shipment = { exporter_name: '' };
      const errors = validateRequiredFields(shipment);
      expect(errors).toContain('exporter_name');
    });

    it('should require receiver_name (customer)', () => {
      const shipment = { receiver_name: '' };
      const errors = validateRequiredFields(shipment);
      expect(errors).toContain('receiver_name');
    });

    it('should require weight', () => {
      const shipment = { weight: null };
      const errors = validateRequiredFields(shipment);
      expect(errors).toContain('weight');
    });

    it('should require value', () => {
      const shipment = { value: null };
      const errors = validateRequiredFields(shipment);
      expect(errors).toContain('value');
    });

    it('should require pickup_date', () => {
      const shipment = { pickup_date: null };
      const errors = validateRequiredFields(shipment);
      expect(errors).toContain('pickup_date');
    });

    it('should require expected_delivery_date', () => {
      const shipment = { expected_delivery_date: null };
      const errors = validateRequiredFields(shipment);
      expect(errors).toContain('expected_delivery_date');
    });

    it('should pass with all required fields', () => {
      const shipment = {
        exporter_name: 'Company A',
        receiver_name: 'Company B',
        weight: 100,
        value: 5000,
        pickup_date: '2024-01-01',
        expected_delivery_date: '2024-01-10'
      };
      const errors = validateRequiredFields(shipment);
      expect(errors.length).toBe(0);
    });
  });

  describe('Numeric Field Validation', () => {
    // Per project.md: Weight must be numeric, Value must be numeric

    it('should validate weight is numeric', () => {
      expect(isNumeric(100)).toBe(true);
      expect(isNumeric(100.5)).toBe(true);
      expect(isNumeric('100')).toBe(true);
    });

    it('should reject non-numeric weight', () => {
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric(null)).toBe(false);
      expect(isNumeric(undefined)).toBe(false);
    });

    it('should validate weight is positive', () => {
      expect(isPositiveNumber(100)).toBe(true);
      expect(isPositiveNumber(0.01)).toBe(true);
    });

    it('should reject zero or negative weight', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-100)).toBe(false);
    });

    it('should validate value is numeric', () => {
      expect(isNumeric(5000)).toBe(true);
      expect(isNumeric(5000.99)).toBe(true);
      expect(isNumeric('5000')).toBe(true);
    });

    it('should validate value is positive', () => {
      expect(isPositiveNumber(5000)).toBe(true);
      expect(isPositiveNumber(0.01)).toBe(true);
    });

    it('should reject zero or negative value', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-5000)).toBe(false);
    });
  });

  describe('Date Validation', () => {
    // Per project.md: Date fields must follow DD-MM-YYYY format
    // Per project.md: Pickup Date ≤ Expected Delivery Date

    it('should validate DD-MM-YYYY date format', () => {
      expect(isValidDateFormat('01-01-2024')).toBe(true);
      expect(isValidDateFormat('31-12-2024')).toBe(true);
      expect(isValidDateFormat('01/01/2024')).toBe(false);
      expect(isValidDateFormat('2024-01-01')).toBe(false);
    });

    it('should validate pickup date is before delivery date', () => {
      const result = isPickupBeforeDelivery('01-01-2024', '10-01-2024');
      expect(result).toBe(true);
    });

    it('should allow pickup date equal to delivery date', () => {
      const result = isPickupBeforeDelivery('01-01-2024', '01-01-2024');
      expect(result).toBe(true);
    });

    it('should reject delivery date before pickup date', () => {
      const result = isPickupBeforeDelivery('10-01-2024', '01-01-2024');
      expect(result).toBe(false);
    });

    it('should handle invalid date strings', () => {
      const result = isPickupBeforeDelivery('invalid', '2024-01-10');
      expect(result).toBe(false);
    });
  });

  describe('File Upload Validation', () => {
    // Per project.md: Only PDF, JPEG allowed; file size limit = 10 MB

    it('should accept PDF files', () => {
      const file = createMockFile('document.pdf', 1024 * 1024, 'application/pdf');
      expect(isValidFileType(file)).toBe(true);
    });

    it('should accept JPEG files', () => {
      const file = createMockFile('image.jpg', 1024 * 1024, 'image/jpeg');
      expect(isValidFileType(file)).toBe(true);
    });

    it('should accept JPG files', () => {
      const file = createMockFile('image.jpg', 1024 * 1024, 'image/jpeg');
      expect(isValidFileType(file)).toBe(true);
    });

    it('should reject PNG files', () => {
      const file = createMockFile('image.png', 1024 * 1024, 'image/png');
      expect(isValidFileType(file)).toBe(false);
    });

    it('should reject Word documents', () => {
      const file = createMockFile('document.docx', 1024 * 1024, 'application/msword');
      expect(isValidFileType(file)).toBe(false);
    });

    it('should validate file size is within 10 MB limit', () => {
      const file = createMockFile('document.pdf', 5 * 1024 * 1024, 'application/pdf');
      expect(isValidFileSize(file)).toBe(true);
    });

    it('should reject files larger than 10 MB', () => {
      const file = createMockFile('document.pdf', 11 * 1024 * 1024, 'application/pdf');
      expect(isValidFileSize(file)).toBe(false);
    });

    it('should accept files exactly 10 MB', () => {
      const file = createMockFile('document.pdf', 10 * 1024 * 1024, 'application/pdf');
      expect(isValidFileSize(file)).toBe(true);
    });

    it('should validate complete file upload', () => {
      const file = createMockFile('document.pdf', 5 * 1024 * 1024, 'application/pdf');
      const result = validateFileUpload(file);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject invalid file type and size', () => {
      const file = createMockFile('document.docx', 11 * 1024 * 1024, 'application/msword');
      const result = validateFileUpload(file);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Mode of Transport Validation', () => {
    // Per project.md: Mode dropdown: Air / Sea / Road

    it('should accept Air mode', () => {
      expect(isValidMode('air')).toBe(true);
    });

    it('should accept Sea mode', () => {
      expect(isValidMode('sea')).toBe(true);
    });

    it('should accept Road mode', () => {
      expect(isValidMode('road')).toBe(true);
    });

    it('should reject invalid modes', () => {
      expect(isValidMode('rail')).toBe(false);
      expect(isValidMode('ship')).toBe(false);
      expect(isValidMode('')).toBe(false);
    });
  });

  describe('Complete Shipment Validation', () => {
    // Integration test: validate entire shipment object

    it('should pass validation with all valid data', () => {
      const shipment = {
        exporter_name: 'ABC Exports',
        exporter_address: '123 Main St',
        receiver_name: 'XYZ Imports',
        receiver_address: '456 Side St',
        item_description: 'Electronic Components',
        weight: 100,
        weight_unit: 'kg',
        value: 50000,
        currency: 'USD',
        pickup_date: '01-01-2024',
        expected_delivery_date: '10-01-2024',
        mode_of_transport: 'air'
      };
      const result = validateShipment(shipment);
      expect(result.valid).toBe(true);
    });

    it('should reject shipment with missing required field', () => {
      const shipment = {
        exporter_name: '', // Missing
        receiver_name: 'XYZ Imports',
        weight: 100,
        value: 50000,
        pickup_date: '01-01-2024',
        expected_delivery_date: '10-01-2024'
      };
      const result = validateShipment(shipment);
      expect(result.valid).toBe(false);
    });

    it('should reject shipment with invalid date format', () => {
      const shipment = {
        exporter_name: 'ABC Exports',
        receiver_name: 'XYZ Imports',
        weight: 100,
        value: 50000,
        pickup_date: '2024-01-01', // Wrong format
        expected_delivery_date: '10-01-2024'
      };
      const result = validateShipment(shipment);
      expect(result.valid).toBe(false);
    });

    it('should reject shipment with delivery before pickup', () => {
      const shipment = {
        exporter_name: 'ABC Exports',
        receiver_name: 'XYZ Imports',
        weight: 100,
        value: 50000,
        pickup_date: '10-01-2024',
        expected_delivery_date: '01-01-2024' // Before pickup
      };
      const result = validateShipment(shipment);
      expect(result.valid).toBe(false);
    });

    it('should reject shipment with zero weight', () => {
      const shipment = {
        exporter_name: 'ABC Exports',
        receiver_name: 'XYZ Imports',
        weight: 0, // Invalid
        value: 50000,
        pickup_date: '01-01-2024',
        expected_delivery_date: '10-01-2024'
      };
      const result = validateShipment(shipment);
      expect(result.valid).toBe(false);
    });

    it('should reject shipment with negative value', () => {
      const shipment = {
        exporter_name: 'ABC Exports',
        receiver_name: 'XYZ Imports',
        weight: 100,
        value: -50000, // Invalid
        pickup_date: '01-01-2024',
        expected_delivery_date: '10-01-2024'
      };
      const result = validateShipment(shipment);
      expect(result.valid).toBe(false);
    });
  });
});

// ============ Helper Functions for Tests ============

function validateRequiredFields(obj: any): string[] {
  const required = ['exporter_name', 'receiver_name', 'weight', 'value', 'pickup_date', 'expected_delivery_date'];
  return required.filter(field => !obj[field]);
}

function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function isPositiveNumber(value: any): boolean {
  return isNumeric(value) && parseFloat(value) > 0;
}

function isValidDateFormat(date: string): boolean {
  return /^\d{2}-\d{2}-\d{4}$/.test(date);
}

function isPickupBeforeDelivery(pickup: string, delivery: string): boolean {
  if (!isValidDateFormat(pickup) || !isValidDateFormat(delivery)) return false;
  const pickupDate = new Date(pickup.split('-').reverse().join('-'));
  const deliveryDate = new Date(delivery.split('-').reverse().join('-'));
  return pickupDate <= deliveryDate;
}

function isValidFileType(file: File): boolean {
  const validTypes = ['application/pdf', 'image/jpeg'];
  const validExtensions = ['.pdf', '.jpg', '.jpeg'];
  return validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

function isValidFileSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024; // 10 MB
  return file.size <= maxSize;
}

function validateFileUpload(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isValidFileType(file)) errors.push('File type must be PDF or JPEG');
  if (!isValidFileSize(file)) errors.push('File size must not exceed 10 MB');
  return { valid: errors.length === 0, errors };
}

function isValidMode(mode: string): boolean {
  return ['air', 'sea', 'road'].includes(mode?.toLowerCase());
}

function validateShipment(shipment: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  const missingFields = validateRequiredFields(shipment);
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Numeric validation
  if (!isPositiveNumber(shipment.weight)) {
    errors.push('Weight must be a positive number');
  }
  if (!isPositiveNumber(shipment.value)) {
    errors.push('Value must be a positive number');
  }

  // Date validation
  if (!isPickupBeforeDelivery(shipment.pickup_date, shipment.expected_delivery_date)) {
    errors.push('Pickup date must be before or equal to expected delivery date');
  }

  // Mode validation
  if (shipment.mode_of_transport && !isValidMode(shipment.mode_of_transport)) {
    errors.push('Invalid mode of transport');
  }

  return { valid: errors.length === 0, errors };
}

function createMockFile(name: string, size: number, type: string): File {
  return new File([new ArrayBuffer(size)], name, { type });
}
