"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSun, FaMoon, FaVolumeUp, FaVolumeMute, FaChevronDown, FaChevronUp } from "react-icons/fa";
import i18n from "i18next";
import Image from "next/image";

export default function Configuracoes() {
  const [modoDark, setModoDark] = useState(false);
  const [somNotificacao, setSomNotificacao] = useState(true);
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const { t } = useTranslation("settings");

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
    aplicarTema(ativo);

    const somSalvo = localStorage.getItem("somNotificacao");
    setSomNotificacao(somSalvo === null || somSalvo === "true");
  }, []);

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement;
    if (ativado) {
      root.classList.add("dark");
      root.style.setProperty("--cor-fundo", "#20252B");
      root.style.setProperty("--cor-texto", "#FFFFFF");
      document.body.style.backgroundColor = "#20252B";
      document.body.style.color = "#FFFFFF";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#FFFFFF");
      root.style.setProperty("--cor-texto", "#000000");
      document.body.style.backgroundColor = "#FFFFFF";
      document.body.style.color = "#000000";
    }
  };

  const alternarTema = () => {
    const novoTema = !modoDark;
    setModoDark(novoTema);
    localStorage.setItem("modoDark", String(novoTema));
    aplicarTema(novoTema);
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

  return (
    <div className="flex min-h-screen px-4 py-10 bg-[var(--cor-fundo)]">
      <aside
        className="w-64 rounded-xl shadow-md p-6 h-fit"
        style={{
          backgroundColor: modoDark ? "#1F2937" : "#ecececec",
          border: `1px solid ${modoDark ? "#374151" : "#E5E7EB"}`,
        }}
      >
        <h2
          className="text-lg font-bold mb-6"
          style={{ color: modoDark ? "#FFFFFF" : "#111827" }}
        >
          {t("settings")}
        </h2>

        <ul className="space-y-4 text-sm font-medium">
          {[t("permissions"), t("integrations"), t("change_password")].map((item, i) => (
            <li
              key={i}
              className="cursor-pointer hover:underline"
              style={{ color: modoDark ? "#E5E7EB" : "#374151" }}
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-4">
          <button
            onClick={alternarTema}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border w-full justify-center transition duration-200 text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: modoDark ? "#2C2C2C" : "#F3F4F6",
              color: modoDark ? "#FBBF24" : "#374151",
              borderColor: modoDark ? "#4B5563" : "#D1D5DB",
            }}
          >
            {modoDark ? <FaMoon size={16} /> : <FaSun size={16} />}
            {modoDark ? t("dark_mode") : t("light_mode")}
          </button>

          <button
            onClick={alternarSomNotificacao}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border w-full justify-center transition duration-200 text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: modoDark ? "#2C2C2C" : "#F3F4F6",
              color: modoDark ? "#FFFFFF" : "#374151",
              borderColor: modoDark ? "#4B5563" : "#D1D5DB",
            }}
          >
            {somNotificacao ? <FaVolumeUp size={16} /> : <FaVolumeMute size={16} />}
            {somNotificacao ? t("sound_on") : t("sound_off")}
          </button>

          <button
            onClick={toggleIdiomas}
            className="flex items-center justify-between px-4 py-2 rounded-lg border w-full transition duration-200 text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: modoDark ? "#2C2C2C" : "#F3F4F6",
              color: modoDark ? "#FFFFFF" : "#374151",
              borderColor: modoDark ? "#4B5563" : "#D1D5DB",
            }}
          >
            <span>{t("change_language")}</span>
            {mostrarIdiomas ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              mostrarIdiomas ? "max-h-40" : "max-h-0"
            }`}
          >
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => mudarIdioma("pt")}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition cursor-pointer"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#e3f6f5",
                  color: modoDark ? "#e3f6f5" : "#111827",
                }}
              >
                <Image src="/brasil.png" alt="Português" width={25} height={20} quality={100} />
                <span>Português</span>
              </button>
              <button
                onClick={() => mudarIdioma("en")}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition cursor-pointer"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#e3f6f5",
                  color: modoDark ? "#e3f6f5" : "#111827",
                }}
              >
                <Image src="/ingles.png" alt="English" width={25} height={20} quality={100} />
                <span>English</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-8">
        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: modoDark ? "#e3f6f5" : "#000000" }}
        >
          {t("preferences")}
        </h1>

        <p style={{ color: modoDark ? "#e3f6f5" : "#4B5563" }}>
          {t("preferences_desc")}
        </p>
      </main>
    </div>
  );
}