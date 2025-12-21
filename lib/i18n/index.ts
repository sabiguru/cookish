import en from './dictionaries/en.json';
import fr from './dictionaries/fr.json';
import yo from './dictionaries/yo.json';

export type Locale = 'en' | 'fr' | 'yo';

export const defaultLocale: Locale = 'en';

export const locales: Locale[] = ['en', 'fr', 'yo'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  yo: 'Yorùbá',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  yo: '🇳🇬',
};

const dictionaries = {
  en,
  fr,
  yo,
};

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (isValidLocale(firstSegment)) {
    return firstSegment;
  }

  return defaultLocale;
}

export function stripLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (locale === defaultLocale) {
    return pathname;
  }

  return pathname.replace(`/${locale}`, '') || '/';
}

export function addLocaleToPath(pathname: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return pathname;
  }

  const cleanPath = stripLocaleFromPath(pathname);
  return `/${locale}${cleanPath}`;
}

/**
 * Get translated string from dictionary
 * Supports nested keys using dot notation (e.g., "common.welcome")
 */
export function t(dict: Dictionary, key: string): string {
  const keys = key.split('.');
  let value: any = dict;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * Get translated string with interpolation
 * Example: t(dict, "greeting", { name: "John" }) with "greeting": "Hello, {{name}}!"
 */
export function tInterpolate(
  dict: Dictionary,
  key: string,
  params?: Record<string, string | number>
): string {
  let text = t(dict, key);

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(
        new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'),
        String(paramValue)
      );
    });
  }

  return text;
}
