import { validateEmail, validatePhone } from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('returns null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });

    it('returns error message for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
    });

    it('returns null for empty email', () => {
      expect(validateEmail('')).toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('returns null for valid Ghana phone number', () => {
      expect(validatePhone('+233201234567')).toBeNull();
      expect(validatePhone('0201234567')).toBeNull();
    });

    it('returns error message for invalid phone number', () => {
      expect(validatePhone('invalid-phone')).toBe('Please enter a valid Ghana phone number (e.g., +233201234567 or 0201234567)');
    });

    it('returns null for empty phone (optional)', () => {
      expect(validatePhone('')).toBeNull();
    });
  });
});