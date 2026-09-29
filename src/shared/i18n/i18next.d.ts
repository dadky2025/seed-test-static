import 'i18next';
import type base from './messages/es.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof base };
  }
}
