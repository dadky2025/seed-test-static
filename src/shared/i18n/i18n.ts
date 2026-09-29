import i18n from 'i18next';
import ICU from 'i18next-icu';
import { initReactI18next } from 'react-i18next';
import base from './messages/es.json';
import en from './messages/en.json';

export const DEFAULT_LOCALE = 'es';
export const resources = {
  es: { translation: base },
  en: { translation: en },
} as const;

/** First supported language the browser asks for, else the default. */
export function detectLocale(languages: readonly string[] = navigator.languages): string {
  const supported = Object.keys(resources);
  return (
    languages.map((tag) => tag.split('-')[0]).find((lang) => lang && supported.includes(lang)) ??
    DEFAULT_LOCALE
  );
}

void i18n
  .use(ICU)
  .use(initReactI18next)
  .init({
    resources,
    lng: detectLocale(),
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false }, // React already escapes
  });

// The first HTML carries a static or server-rendered lang; keep <html lang> in step for screen readers and translation tools.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
