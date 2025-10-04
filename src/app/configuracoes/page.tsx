"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSun, FaMoon, FaVolumeUp, FaVolumeMute, FaChevronDown, FaChevronUp } from "react-icons/fa";
import i18n from "i18next";
import Image from "next/image";
import Cookies from "js-cookie";

export default function Configuracoes() {
  const [modoDark, setModoDark] = useState(false);
  const [somNotificacao, setSomNotificacao] = useState(true);
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const { t } = useTranslation("settings");

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }
    
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
    aplicarTema(ativo);

    const somSalvo = localStorage.getItem("somNotificacao");
    setSomNotificacao(somSalvo === null || somSalvo === "true");

    const style = document.createElement("style");
    style.textContent = `
    html::-webkit-scrollbar {
      width: 10px;
    }
    
    html::-webkit-scrollbar-track {
      background: ${ativo ? "#132F4C" : "#F8FAFC"};
    }
    
    html::-webkit-scrollbar-thumb {
      background: ${ativo ? "#132F4C" : "#90CAF9"}; 
      border-radius: 5px;
      border: 2px solid ${ativo ? "#132F4C" : "#F8FAFC"};
    }
    
    html::-webkit-scrollbar-thumb:hover {
      background: ${ativo ? "#132F4C" : "#64B5F6"}; 
    }
    
    html {
      scrollbar-width: thin;
      scrollbar-color: ${ativo ? "#132F4C" : "#90CAF9"} ${ativo ? "#0A1830" : "#F8FAFC"};
    }
    
    @media (max-width: 768px) {
      html::-webkit-scrollbar {
        width: 6px;
      }
      
      html::-webkit-scrollbar-thumb {
        border: 1px solid ${ativo ? "#132F4C" : "#F8FAFC"};
        border-radius: 3px;
      }
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
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

  const alternarTema = () => {
    const novoTema = !modoDark;
    setModoDark(novoTema);
    localStorage.setItem("modoDark", String(novoTema));
    aplicarTema(novoTema);
    window.location.reload();
  };

  const alternarSomNotificacao = () => {
    const novoSom = !somNotificacao;
    setSomNotificacao(novoSom);
    localStorage.setItem("somNotificacao", String(novoSom));
  };

  const mudarIdioma = (lng: string) => {
    i18n.changeLanguage(lng);
    setMostrarIdiomas(false);
  };

  const toggleIdiomas = () => {
    setMostrarIdiomas(!mostrarIdiomas);
  };

  const temaAtual = {
    fundo: modoDark ? "#0A1929" : "#cccccc",
    texto: modoDark ? "#FFFFFF" : "#0F172A",
    card: modoDark ? "#132F4C" : "#ecececec",
    borda: modoDark ? "#1E4976" : "#cccccc",
    primario: modoDark ? "#FFFFFF" : "#000000",
    secundario: modoDark ? "#00B4D8" : "#0284C7",
  };

  return (
    <div className="flex flex-col-reverse md:flex-row px-4 py-10 min-h-screen" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
      <aside
        className="w-full md:w-64 rounded-xl shadow-md p-6 h-fit mt-8 md:mt-0"
        style={{
          backgroundColor: temaAtual.card,
          border: `1px solid ${temaAtual.borda}`,
        }}
      >
        <h2 className="text-lg font-bold mb-6">{t("settings")}</h2>

        <ul className="space-y-4 text-sm font-medium">
          {[
            { label: t("faleconosco"), link: "/suporte" },
            { label: t("change_password"), link: "/esqueci" },
          ].map((item, i) => (
            <li key={i}>
              <a href={item.link} className="cursor-pointer hover:underline" style={{ color: temaAtual.primario }}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-4">
          <button
            onClick={alternarTema}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border w-full justify-center transition-all hover:scale-105 duration-200 text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.primario,
              borderColor: temaAtual.borda,
            }}
          >
            {modoDark ? <FaMoon size={16} /> : <FaSun size={16} />}
            {modoDark ? t("dark_mode") : t("light_mode")}
          </button>

          <button
            onClick={alternarSomNotificacao}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border w-full justify-center transition-all  hover:scale-105 duration-200 text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.primario,
              borderColor: temaAtual.borda,
            }}
          >
            {somNotificacao ? <FaVolumeUp size={16} /> : <FaVolumeMute size={16} />}
            {somNotificacao ? t("sound_on") : t("sound_off")}
          </button>

          <button
            onClick={toggleIdiomas}
            className="flex items-center justify-between px-4 py-2 rounded-lg border w-full transition-all duration-200 hover:scale-105 text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.primario,
              borderColor: temaAtual.borda,
            }}
          >
            <span>{t("change_language")}</span>
            {mostrarIdiomas ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </button>

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mostrarIdiomas ? "max-h-40" : "max-h-0"}`}>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => mudarIdioma("pt")}
                className="flex  items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: temaAtual.primario + "20",
                  color: temaAtual.primario,
                }}
              >
                <Image src="/brasil.png" alt="Português" width={25} height={20} quality={100} />
                <span>Português</span>
              </button>
              <button
                onClick={() => mudarIdioma("en")}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: temaAtual.primario + "20",
                  color: temaAtual.primario,
                }}
              >
                <Image src="/ingles.png" alt="English" width={25} height={20} quality={100} />
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 mb-8 md:mb-0 md:ml-8">
        <h1 className="text-2xl font-bold mb-4">{t("preferences")}</h1>

        <p style={{ color: temaAtual.primario }}>{t("preferences_desc")}</p>
      </main>
    </div>
  );
}
