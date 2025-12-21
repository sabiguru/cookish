import { describe, it, expect } from '@jest/globals';
import {
  isValidLocale,
  getLocaleFromPath,
  stripLocaleFromPath,
  addLocaleToPath,
  getDictionary,
  t,
  tInterpolate,
  defaultLocale,
  locales,
} from '@/lib/i18n';

describe('i18n Utilities', () => {
  describe('isValidLocale', () => {
    it('should validate correct locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('fr')).toBe(true);
      expect(isValidLocale('yo')).toBe(true);
    });

    it('should reject invalid locales', () => {
      expect(isValidLocale('es')).toBe(false);
      expect(isValidLocale('de')).toBe(false);
      expect(isValidLocale('')).toBe(false);
    });
  });

  describe('getLocaleFromPath', () => {
    it('should extract locale from path', () => {
      expect(getLocaleFromPath('/fr/chefs')).toBe('fr');
      expect(getLocaleFromPath('/yo/about')).toBe('yo');
    });

    it('should return default locale for paths without locale', () => {
      expect(getLocaleFromPath('/chefs')).toBe(defaultLocale);
      expect(getLocaleFromPath('/')).toBe(defaultLocale);
    });

    it('should return default locale for invalid locales', () => {
      expect(getLocaleFromPath('/es/chefs')).toBe(defaultLocale);
    });
  });

  describe('stripLocaleFromPath', () => {
    it('should strip locale from path', () => {
      expect(stripLocaleFromPath('/fr/chefs')).toBe('/chefs');
      expect(stripLocaleFromPath('/yo/about')).toBe('/about');
    });

    it('should not modify path without locale', () => {
      expect(stripLocaleFromPath('/chefs')).toBe('/chefs');
      expect(stripLocaleFromPath('/')).toBe('/');
    });

    it('should handle root locale path', () => {
      expect(stripLocaleFromPath('/fr')).toBe('/');
    });
  });

  describe('addLocaleToPath', () => {
    it('should add locale to path', () => {
      expect(addLocaleToPath('/chefs', 'fr')).toBe('/fr/chefs');
      expect(addLocaleToPath('/about', 'yo')).toBe('/yo/about');
    });

    it('should not add default locale', () => {
      expect(addLocaleToPath('/chefs', 'en')).toBe('/chefs');
    });

    it('should handle root path', () => {
      expect(addLocaleToPath('/', 'fr')).toBe('/fr/');
    });
  });

  describe('getDictionary', () => {
    it('should return dictionary for valid locale', () => {
      const enDict = getDictionary('en');
      const frDict = getDictionary('fr');
      const yoDict = getDictionary('yo');

      expect(enDict).toBeDefined();
      expect(frDict).toBeDefined();
      expect(yoDict).toBeDefined();
    });

    it('should return default dictionary for invalid locale', () => {
      // @ts-expect-error - Testing runtime behavior
      const dict = getDictionary('invalid');
      const defaultDict = getDictionary('en');

      expect(dict).toEqual(defaultDict);
    });
  });

  describe('t (translation)', () => {
    const dict = getDictionary('en');

    it('should translate simple keys', () => {
      expect(t(dict, 'common.siteName')).toBe('CookFort');
      expect(t(dict, 'common.welcome')).toBe('Welcome');
    });

    it('should handle nested keys', () => {
      expect(t(dict, 'nav.home')).toBe('Home');
      expect(t(dict, 'chef.bookNow')).toBe('Book Now');
    });

    it('should return key for missing translations', () => {
      expect(t(dict, 'nonexistent.key')).toBe('nonexistent.key');
    });

    it('should work with different locales', () => {
      const frDict = getDictionary('fr');
      const yoDict = getDictionary('yo');

      expect(t(frDict, 'common.welcome')).toBe('Bienvenue');
      expect(t(yoDict, 'common.welcome')).toBe('Káàbọ̀');
    });
  });

  describe('tInterpolate (translation with interpolation)', () => {
    // For this test, we'll assume a hypothetical greeting key
    // In actual implementation, you'd need to add this to the dictionaries
    it('should interpolate parameters', () => {
      // Mock dictionary with interpolation
      const mockDict = {
        greeting: 'Hello, {{name}}!',
        info: 'You have {{count}} messages',
      } as any;

      expect(tInterpolate(mockDict, 'greeting', { name: 'Alice' })).toBe(
        'Hello, Alice!'
      );
      expect(tInterpolate(mockDict, 'info', { count: '5' })).toBe(
        'You have 5 messages'
      );
    });

    it('should work without parameters', () => {
      const dict = getDictionary('en');
      expect(tInterpolate(dict, 'common.welcome')).toBe('Welcome');
    });

    it('should handle multiple interpolations', () => {
      const mockDict = {
        message: '{{user}} sent {{count}} {{type}}',
      } as any;

      expect(
        tInterpolate(mockDict, 'message', {
          user: 'Alice',
          count: '3',
          type: 'photos',
        })
      ).toBe('Alice sent 3 photos');
    });
  });

  describe('locale constants', () => {
    it('should have correct default locale', () => {
      expect(defaultLocale).toBe('en');
    });

    it('should have all supported locales', () => {
      expect(locales).toContain('en');
      expect(locales).toContain('fr');
      expect(locales).toContain('yo');
      expect(locales.length).toBe(3);
    });
  });
});
