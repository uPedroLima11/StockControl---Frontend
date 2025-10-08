"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaSun, FaMoon, FaVolumeUp, FaVolumeMute, FaChevronDown, FaChevronUp, FaPalette, FaBell, FaGlobe, FaUserCog, FaCog } from "react-icons/fa";
import i18n from "i18next";
import Image from "next/image";
import Cookies from "js-cookie";
import { FaShield } from "react-icons/fa6";

export default function Configuracoes() {
  const [modoDark, setModoDark] = useState(false);
  const [somNotificacao, setSomNotificacao] = useState(true);
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false);
  const { t } = useTranslation("settings");

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

  const atualizarCSS = (novoTema: boolean) => {
    const styleElement = document.querySelector('style[data-theme]');
    if (styleElement) {
      styleElement.textContent = gerarCSS(novoTema);
    }
  };

  const gerarCSS = (ativo: boolean) => `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .animate-slide-in {
      animation: slideIn 0.4s ease-out forwards;
    }
    
    .card-hover {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
      
    .card-hover:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    
    .glow-effect {
      position: relative;
      overflow: hidden;
    }
    
    .glow-effect::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      transition: left 0.5s;
    }
    
    .glow-effect:hover::before {
      left: 100%;
    }
    
    .gradient-border {
      position: relative;
      background: linear-gradient(45deg, ${ativo ? "#3B82F6, #0EA5E9, #1E293B" : "#1976D2, #0284C7, #E2E8F0"});
      padding: 1px;
      border-radius: 16px;
    }
    
    .gradient-border > div {
      background: ${ativo ? "#1E293B" : "#FFFFFF"};
      border-radius: 15px;
    }

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


useEffect(() => {
  const temaSalvo = localStorage.getItem("modoDark");
  const ativado = temaSalvo === "true";
  setModoDark(ativado);

  const token = Cookies.get("token");
  if (!token) {
    window.location.href = "/login";
  }

  const handleThemeChange = (e: CustomEvent) => {
    setModoDark(e.detail.modoDark);
  };
  window.addEventListener('themeChanged', handleThemeChange as EventListener);

  return () => {
    window.removeEventListener('themeChanged', handleThemeChange as EventListener);
  };
}, []);

  interface WindowWithAlternarTemaGlobal extends Window {
    alternarTemaGlobal?: () => void;
  }

  const alternarTema = () => {
    if (typeof window !== 'undefined' && (window as WindowWithAlternarTemaGlobal).alternarTemaGlobal) {
      (window as WindowWithAlternarTemaGlobal).alternarTemaGlobal!();
    }
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

  const bgGradient = modoDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200";
  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";

  return (
    <div className={`min-h-screen ${bgGradient} pb-8`}>
      <div className="px-4 sm:px-6 py-8 w-full max-w-6xl mx-auto">
        <section className={`relative py-8 rounded-3xl mb-8 overflow-hidden ${bgCard} backdrop-blur-sm border ${borderColor}`}>
          <div className="absolute inset-0">
            <div className={`absolute top-0 left-10 w-32 h-32 ${modoDark ? "bg-blue-500/20" : "bg-blue-200/50"} rounded-full blur-3xl animate-float`}></div>
            <div className={`absolute bottom-0 right-10 w-48 h-48 ${modoDark ? "bg-slate-700/20" : "bg-slate-300/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "2s" }}></div>
            <div className={`absolute top-1/2 left-1/2 w-24 h-24 ${modoDark ? "bg-cyan-500/20" : "bg-cyan-200/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "4s" }}></div>
          </div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-2xl ${modoDark ? "bg-blue-500/20" : "bg-blue-100"} border ${borderColor}`}>
                <FaCog className={`text-3xl ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
              </div>
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold ${textPrimary} mb-3`}>
              {t("settings")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">StockControl</span>
            </h1>
            <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>
              {t("preferences_desc")}
            </p>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="gradient-border animate-fade-in-up">
              <div className={`p-6 rounded-[15px] ${bgCard} backdrop-blur-sm card-hover`}>
                <h2 className={`text-xl font-bold mb-6 ${textPrimary}`}>{t("settings")}</h2>

                <div className="space-y-4">
                  {[
                    { label: t("faleconosco"), link: "/suporte", icon: FaBell },
                    { label: t("change_password"), link: "/esqueci", icon: FaShield },
                  ].map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 glow-effect cursor-pointer ${textPrimary}`}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${borderColor}`
                      }}
                    >
                      <item.icon className="text-lg" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="gradient-border animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <div className={`p-6 rounded-[15px] ${bgCard} backdrop-blur-sm card-hover`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${modoDark ? "bg-purple-500/20" : "bg-purple-100"}`}>
                      <FaPalette className={`text-xl ${modoDark ? "text-purple-400" : "text-purple-500"}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${textPrimary}`}>{t("appearance")}</h3>
                  </div>

                  <button
                    onClick={alternarTema}
                    className="flex cursor-pointer items-center justify-between w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 glow-effect"
                    style={{
                      background: modoDark ? "linear-gradient(135deg, #374151 0%, #4B5563 100%)" : "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
                      border: `1px solid ${borderColor}`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {modoDark ? <FaMoon className="text-yellow-400" size={20} /> : <FaSun className="text-orange-500" size={20} />}
                      <span className={`font-medium ${textPrimary}`}>
                        {modoDark ? t("dark_mode") : t("light_mode")}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${modoDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"}`}>
                      {modoDark ? t("active") : t("active")}
                    </div>
                  </button>
                </div>
              </div>
              <div className="gradient-border animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <div className={`p-6 rounded-[15px] ${bgCard} backdrop-blur-sm card-hover`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${modoDark ? "bg-green-500/20" : "bg-green-100"}`}>
                      <FaBell className={`text-xl ${modoDark ? "text-green-400" : "text-green-500"}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${textPrimary}`}>{t("notifications")}</h3>
                  </div>

                  <button
                    onClick={alternarSomNotificacao}
                    className="flex cursor-pointer items-center justify-between w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 glow-effect"
                    style={{
                      background: somNotificacao ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                      color: "#FFFFFF",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {somNotificacao ? <FaVolumeUp size={20} /> : <FaVolumeMute size={20} />}
                      <span className="font-medium">
                        {somNotificacao ? t("sound_on") : t("sound_off")}
                      </span>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
                      {somNotificacao ? t("active") : t("inactive")}
                    </div>
                  </button>
                </div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-sm card-hover border ${borderColor}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${modoDark ? "bg-blue-500/20" : "bg-blue-100"}`}>
                      <FaGlobe className={`text-xl ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${textPrimary}`}>{t("language")}</h3>
                  </div>

                  <button
                    onClick={toggleIdiomas}
                    className="flex cursor-pointer items-center justify-between w-full p-4 rounded-xl transition-all duration-300 hover:scale-105 glow-effect mb-4"
                    style={{
                      background: modoDark ? "linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)" : "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                      color: "#FFFFFF",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FaGlobe size={20} />
                      <span className="font-medium">{t("change_language")}</span>
                    </div>
                    {mostrarIdiomas ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                  </button>
                  {mostrarIdiomas && (
                    <div className="space-y-3 animate-fade-in-up">
                      <button
                        onClick={() => mudarIdioma("pt")}
                        className="flex items-center cursor-pointer gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-105  glow-effect w-full"
                        style={{
                          backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                          border: `1px solid ${borderColor}`
                        }}
                      >
                        <Image src="/brasil.png" alt="Português" width={30} height={24} quality={100} className="rounded" />
                        <span className={`font-medium ${textPrimary}`}>Português</span>
                      </button>
                      <button
                        onClick={() => mudarIdioma("en")}
                        className="flex cursor-pointer items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-105  glow-effect w-full"
                        style={{
                          backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                          border: `1px solid ${borderColor}`
                        }}
                      >
                        <Image src="/ingles.png" alt="English" width={30} height={24} quality={100} className="rounded" />
                        <span className={`font-medium ${textPrimary}`}>English</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-sm card-hover border ${borderColor}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${modoDark ? "bg-orange-500/20" : "bg-orange-100"}`}>
                      <FaUserCog className={`text-xl ${modoDark ? "text-orange-400" : "text-orange-500"}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${textPrimary}`}>{t("account")}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border ${borderColor}`}>
                      <p className={`text-sm font-medium ${textPrimary}`}>{t("security")}</p>
                      <p className={`text-xs ${textMuted} mt-1`}>{t("manage_security")}</p>
                    </div>

                    <a
                      href="/esqueci"
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-105 glow-effect cursor-pointer ${textPrimary}`}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${borderColor}`
                      }}
                    >
                      <span className="font-medium">{t("change_password")}</span>
                      <FaChevronDown className="transform -rotate-90" size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="gradient-border animate-fade-in-up mt-6" style={{ animationDelay: "500ms" }}>
              <div className={`p-6 rounded-[15px] ${bgCard} backdrop-blur-sm card-hover`}>
                <h3 className={`text-lg font-bold mb-4 ${textPrimary}`}>{t("system_info")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={textMuted}>{t("theme")}:</p>
                    <p className={textPrimary}>{modoDark ? t("dark_mode") : t("light_mode")}</p>
                  </div>
                  <div>
                    <p className={textMuted}>{t("notifications")}:</p>
                    <p className={textPrimary}>{somNotificacao ? t("enabled") : t("disabled")}</p>
                  </div>
                  <div>
                    <p className={textMuted}>{t("language")}:</p>
                    <p className={textPrimary}>{i18n.language === 'pt' ? 'Português' : 'English'}</p>
                  </div>
                  <div>
                    <p className={textMuted}>{t("version")}:</p>
                    <p className={textPrimary}>v1.0 (Beta)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}