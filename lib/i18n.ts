import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import settingsEn from '../public/locales/en/settings.json';
import sidebarEn from '../public/locales/en/sidebar.json';
import settingsPt from '../public/locales/pt/settings.json';
import sidebarPt from '../public/locales/pt/sidebar.json';

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'pt',
      supportedLngs: ['pt', 'en'],
      ns: ['settings', 'sidebar'],
      defaultNS: 'settings',
      resources: {
        en: {
          settings: settingsEn,
          sidebar: sidebarEn,
        },
        pt: {
          settings: settingsPt,
          sidebar: sidebarPt,
        },
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
