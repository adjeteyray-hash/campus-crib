import {
  parseDeepLink,
  generateDeepLink,
  canAccessScreen,
  getDefaultScreen,
} from '../navigationHelpers';

describe('Navigation Helpers', () => {
  describe('parseDeepLink', () => {
    it('should parse hostel detail deep link', () => {
      const result = parseDeepLink('campuscrib://hostel/123?source=home');
      expect(result).toEqual({
        screen: 'HostelDetail',
        params: { hostelId: '123', source: 'home' }
      });
    });

    it('should parse search deep link', () => {
      const result = parseDeepLink('campuscrib://search?query=accra');
      expect(result).toEqual({
        screen: 'Search',
        params: { query: 'accra' }
      });
    });

    it('should return null for invalid URLs', () => {
      const result = parseDeepLink('invalid-url');
      expect(result).toBeNull();
    });
  });

  describe('generateDeepLink', () => {
    it('should generate hostel detail deep link', () => {
      const result = generateDeepLink('HostelDetail', { hostelId: '123', source: 'home' });
      expect(result).toBe('campuscrib://hostel/123?source=home');
    });

    it('should generate search deep link', () => {
      const result = generateDeepLink('Search', { query: 'accra' });
      expect(result).toBe('campuscrib://search?query=accra');
    });
  });

  describe('canAccessScreen', () => {
    it('should allow students to access student screens', () => {
      expect(canAccessScreen('student', 'Home')).toBe(true);
      expect(canAccessScreen('student', 'Search')).toBe(true);
      expect(canAccessScreen('student', 'History')).toBe(true);
      expect(canAccessScreen('student', 'Profile')).toBe(true);
      expect(canAccessScreen('student', 'HostelDetail')).toBe(true);
    });

    it('should not allow students to access landlord screens', () => {
      expect(canAccessScreen('student', 'MyHostels')).toBe(false);
      expect(canAccessScreen('student', 'AddHostel')).toBe(false);
      expect(canAccessScreen('student', 'Analytics')).toBe(false);
    });

    it('should allow landlords to access landlord screens', () => {
      expect(canAccessScreen('landlord', 'MyHostels')).toBe(true);
      expect(canAccessScreen('landlord', 'AddHostel')).toBe(true);
      expect(canAccessScreen('landlord', 'Analytics')).toBe(true);
      expect(canAccessScreen('landlord', 'Profile')).toBe(true);
      expect(canAccessScreen('landlord', 'HostelDetail')).toBe(true);
    });

    it('should not allow landlords to access student screens', () => {
      expect(canAccessScreen('landlord', 'Home')).toBe(false);
      expect(canAccessScreen('landlord', 'Search')).toBe(false);
      expect(canAccessScreen('landlord', 'History')).toBe(false);
    });
  });

  describe('getDefaultScreen', () => {
    it('should return Home for students', () => {
      expect(getDefaultScreen('student')).toBe('Home');
    });

    it('should return MyHostels for landlords', () => {
      expect(getDefaultScreen('landlord')).toBe('MyHostels');
    });
  });
});