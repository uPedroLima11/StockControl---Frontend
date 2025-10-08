"use client";

import { useEffect } from "react";

export function ThemeManager() {
  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    aplicarTema(ativado);
    aplicarCSSScrollbar(ativado); 

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "modoDark") {
        const novoTema = e.newValue === "true";
        aplicarTema(novoTema);
        aplicarCSSScrollbar(novoTema); 
      }
    };

    const handleThemeChange = (e: CustomEvent) => {
      const novoTema = e.detail.modoDark;
      aplicarTema(novoTema);
      aplicarCSSScrollbar(novoTema); 
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChanged', handleThemeChange as EventListener);

    const alternarTemaGlobal = () => {
      const temaAtual = localStorage.getItem("modoDark") === "true";
      const novoTema = !temaAtual;
      
      localStorage.setItem("modoDark", String(novoTema));
      aplicarTema(novoTema);
      aplicarCSSScrollbar(novoTema);
      
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { modoDark: novoTema } 
      }));
    };

    (window as any).alternarTemaGlobal = alternarTemaGlobal;

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
      delete (window as any).alternarTemaGlobal;
      
      const styleTag = document.getElementById('scrollbar-global-style');
      if (styleTag) {
        styleTag.remove();
      }
    };
  }, []);

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement;
    if (ativado) {
      root.classList.add("dark");
      root.style.setProperty("--cor-fundo", "#0A1929");
      root.style.setProperty("--cor-texto", "#FFFFFF");
      document.body.style.backgroundColor = "#0A1929";
      document.body.style.color = "#FFFFFF";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#cccccc");
      root.style.setProperty("--cor-texto", "#0F172A");
      document.body.style.backgroundColor = "#cccccc";
      document.body.style.color = "#0F172A";
    }
  };

  const aplicarCSSScrollbar = (modoDark: boolean) => {
    const styleTagExistente = document.getElementById('scrollbar-global-style');
    if (styleTagExistente) {
      styleTagExistente.remove();
    }

    const style = document.createElement('style');
    style.id = 'scrollbar-global-style';
    style.innerHTML = `
      html::-webkit-scrollbar {
        width: 10px;
      }
      html::-webkit-scrollbar-track {
        background: ${modoDark ? "#132F4C" : "#F8FAFC"};
      }
      html::-webkit-scrollbar-thumb {
        background: ${modoDark ? "#132F4C" : "#90CAF9"}; 
        border-radius: 5px;
        border: 2px solid ${modoDark ? "#132F4C" : "#F8FAFC"};
      }
      html::-webkit-scrollbar-thumb:hover {
        background: ${modoDark ? "#132F4C" : "#64B5F6"}; 
      }
      html {
        scrollbar-width: thin;
        scrollbar-color: ${modoDark ? "#132F4C" : "#90CAF9"} ${modoDark ? "#0A1830" : "#F8FAFC"};
      }
      @media (max-width: 768px) {
        html::-webkit-scrollbar {
          width: 6px;
        }
        html::-webkit-scrollbar-thumb {
          border: 1px solid ${modoDark ? "#132F4C" : "#F8FAFC"};
          border-radius: 3px;
        }
      }
    `;
    document.head.appendChild(style);
  };

  return null;
}