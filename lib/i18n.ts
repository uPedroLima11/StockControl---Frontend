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
import criarempresaPt from '../public/locales/pt/criarempresa.json';
import criarempresaEn from '../public/locales/en/criarempresa.json';
import vendasPt from '../public/locales/pt/vendas.json';
import vendasEn from '../public/locales/en/vendas.json';
import ativacaoEn from '../public/locales/en/ativacao.json';
import ativacaoPt from '../public/locales/pt/ativacao.json';
import fornecedoresPt from '../public/locales/pt/fornecedores.json';
import fornecedoresEn from '../public/locales/en/fornecedores.json';
import suporteEn from '../public/locales/en/suporte.json';
import suportePt from '../public/locales/pt/suporte.json';
import logsPt from '../public/locales/pt/logs.json';
import logsEn from '../public/locales/en/logs.json';
import esqueciEn from '../public/locales/en/esqueci.json';
import esqueciPt from '../public/locales/pt/esqueci.json';
import alteracaoPt from '../public/locales/pt/alteracao.json';
import alteracaoEn from '../public/locales/en/alteracao.json';
import clientesPt from '../public/locales/pt/clientes.json';
import clientesEn from '../public/locales/en/clientes.json';

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'pt',
      supportedLngs: ['pt', 'en'],
      ns: ['settings', 'sidebar', 'dashboard', 'produtos', 'usuarios','conta','empresa','criarempresa','vendas','ativacao','fornecedores', 'suporte', 'logs', 'esqueci' , 'alteracao' , 'clientes'],
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
          criarempresa: criarempresaEn,
          vendas: vendasEn,
          ativacao: ativacaoEn,
          fornecedores: fornecedoresEn,
          suporte: suporteEn,
          logs: logsEn,
          esqueci: esqueciEn,
          alteracao: alteracaoEn,
          clientes: clientesEn,
        },
        pt: {
          settings: settingsPt,
          sidebar: sidebarPt,
          dashboard: dashboardPt,
          produtos: produtosPt,
          usuarios: usuariosPt,
          conta: contaPt,
          empresa: empresaPt,
          criarempresa: criarempresaPt,
          vendas: vendasPt,
          ativacao: ativacaoPt,
          fornecedores: fornecedoresPt,
          suporte: suportePt,
          logs: logsPt,
          esqueci: esqueciPt,
          alteracao: alteracaoPt,
          clientes: clientesPt,
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
