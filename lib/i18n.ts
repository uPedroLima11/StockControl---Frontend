import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import settingsEn from '../public/locales/en/settings.json';
import sidebarEn from '../public/locales/en/sidebar.json';
import settingsPt from '../public/locales/pt/settings.json';
import sidebarPt from '../public/locales/pt/sidebar.json';
import dashboardPt from '../public/locales/pt/dashboard.json';
import dashboardEn from '../public/locales/en/dashboard.json';
import produtosPt from '../public/locales/pt/produtos.json';
import produtosEn from '../public/locales/en/produtos.json';
import usuariosPt from '../public/locales/pt/usuarios.json';
import usuariosEn from '../public/locales/en/usuarios.json';
import contaPt from '../public/locales/pt/conta.json';
import contaEn from '../public/locales/en/conta.json';
import empresaPt from '../public/locales/pt/empresa.json';
import empresaEn from '../public/locales/en/empresa.json';


if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'pt',
      supportedLngs: ['pt', 'en'],
      ns: ['settings', 'sidebar', 'dashboard', 'produtos', 'usuarios','conta','empresa'],
      defaultNS: 'settings',
      resources: {
        en: {
          settings: settingsEn,
          sidebar: sidebarEn,
          dashboard: dashboardEn,
          produtos: produtosEn,
          usuarios: usuariosEn,
          conta: contaEn,
          empresa: empresaEn,
        },
        pt: {
          settings: settingsPt,
          sidebar: sidebarPt,
          dashboard: dashboardPt,
          produtos: produtosPt,
          usuarios: usuariosPt,
          conta: contaPt,
          empresa: empresaPt,
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
