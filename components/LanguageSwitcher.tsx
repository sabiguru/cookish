'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Locale,
  locales,
  localeNames,
  localeFlags,
  getLocaleFromPath,
  addLocaleToPath,
  stripLocaleFromPath,
} from '@/lib/i18n';
import { ChevronDown, Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = getLocaleFromPath(pathname);

  const handleLocaleChange = (newLocale: Locale) => {
    const cleanPath = stripLocaleFromPath(pathname);
    const newPath = addLocaleToPath(cleanPath, newLocale);
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {localeFlags[currentLocale]} {localeNames[currentLocale]}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
            <div className="py-1">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => handleLocaleChange(locale)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    locale === currentLocale
                      ? 'bg-gray-100 font-semibold'
                      : ''
                  }`}
                >
                  <span className="mr-2">{localeFlags[locale]}</span>
                  {localeNames[locale]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
