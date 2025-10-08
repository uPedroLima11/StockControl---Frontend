"use client";

import { useEffect, useState } from "react";
import { useUsuarioStore } from "@/context/usuario";
import { UsuarioI } from "@/utils/types/usuario";
import { EmpresaI } from "@/utils/types/empresa";
import { cores } from "@/utils/cores";
import { useTranslation } from "react-i18next";
import { FaTrash, FaLock, FaUser, FaBuilding, FaMapMarkerAlt, FaGlobeAmericas, FaCity, FaMapPin, FaPhone, FaEnvelope, FaKey, FaExclamationTriangle, FaEdit } from "react-icons/fa";
import Link from "next/link";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { FaShield } from "react-icons/fa6";

export default function MinhaConta() {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaI | null>(null);
  const [modoDark, setModoDark] = useState(false);
  const { usuario, logar } = useUsuarioStore();
  const [, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeEditado, setNomeEditado] = useState("");
  const { t } = useTranslation("conta");

  const temaAtual = modoDark ? cores.dark : cores.light;

  const translateRole = (role: string) => {
    return t(`roles.${role}`, { defaultValue: role });
  };

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }

    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);

    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
      }
    }

    const buscarDados = async (idUsuario: string) => {
      try {
        setCarregando(true);

        const [responseUser, responseEmpresa] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`),
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${idUsuario}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
              "Content-Type": "application/json",
            },
          })
        ]);

        if (responseUser.status === 200) {
          const dados = await responseUser.json();
          setUsuarioLogado(dados);
          setNomeEditado(dados.nome || "");
        }

        if (responseEmpresa.status === 200) {
          const dados = await responseEmpresa.json();
          setEmpresa(dados);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    };

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      buscarDados(usuarioValor);
    }

    const style = document.createElement("style");
    style.textContent = `
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
      
      .scroll-custom {
        max-height: 200px;
        overflow-y: auto;
      }
      
      .scroll-custom::-webkit-scrollbar {
        width: 6px;
      }
      
      .scroll-custom::-webkit-scrollbar-track {
        background: ${ativo ? "#1E293B" : "#F1F5F9"};
        border-radius: 3px;
      }
      
      .scroll-custom::-webkit-scrollbar-thumb {
        background: ${ativo ? "#3B82F6" : "#94A3B8"};
        border-radius: 3px;
      }
      
      .scroll-custom::-webkit-scrollbar-thumb:hover {
        background: ${ativo ? "#2563EB" : "#64748B"};
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
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const abrirModal = () => {
    setNomeEditado(usuarioLogado?.nome || "");
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!usuario) return;

    try {
      const atualizarDados = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeEditado,
          email: usuarioLogado?.email, 
        }),
      });

      if (atualizarDados.status === 200) {
        Swal.fire({
          title: t("modal.sucesso.titulo"),
          icon: "success",
          confirmButtonColor: temaAtual.primario,
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
        });

        if (usuarioLogado) {
          setUsuarioLogado({
            ...usuarioLogado,
            nome: nomeEditado
          });
        }

        setModalAberto(false);
      } else {
        Swal.fire({
          icon: "error",
          title: t("modal.erro.titulo"),
          text: t("modal.erro.emailExistente"),
          confirmButtonText: t("modal.botaoOk"),
          confirmButtonColor: temaAtual.primario,
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      Swal.fire({
        icon: "error",
        title: t("modal.erro.titulo"),
        text: t("modal.erro.emailExistente"),
        confirmButtonText: t("modal.botaoOk"),
        confirmButtonColor: temaAtual.primario,
        background: modoDark ? temaAtual.card : "#FFFFFF",
        color: modoDark ? temaAtual.texto : temaAtual.texto,
      });
    }
  };

  const handleExcluir = async () => {
    if (!usuario) return;

    await Swal.fire({
      title: t("modal.excluir.titulo"),
      text: t("modal.excluir.texto"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("modal.excluir.confirmar"),
      cancelButtonText: t("modal.excluir.cancelar"),
      confirmButtonColor: temaAtual.primario,
      cancelButtonColor: "#6B7280",
      background: modoDark ? temaAtual.card : "#FFFFFF",
      color: modoDark ? temaAtual.texto : temaAtual.texto,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const excluirDados = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuario.id}`, {
          method: "DELETE",
        });
        if (excluirDados.status === 204) {
          Swal.fire({
            title: t("modal.excluir.sucesso"),
            icon: "success",
            confirmButtonColor: temaAtual.primario,
            background: modoDark ? temaAtual.card : "#FFFFFF",
            color: modoDark ? temaAtual.texto : temaAtual.texto,
          });
          localStorage.removeItem("client_key");
          window.location.href = "/";
        } else {
          Swal.fire({
            icon: "error",
            title: t("modal.erro.titulo"),
            text: t("modal.erro.excluirConta"),
            confirmButtonText: t("modal.botaoOk"),
            confirmButtonColor: temaAtual.primario,
            background: modoDark ? temaAtual.card : "#FFFFFF",
            color: modoDark ? temaAtual.texto : temaAtual.texto,
          });
        }
      }
    });
  };

  const bgGradient = modoDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200";
  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  const infoCards = [
    {
      icon: FaUser,
      label: t("nome"),
      value: usuarioLogado?.nome || t("adicionar"),
      color: "from-blue-500 to-cyan-500",
      bgColor: modoDark ? "bg-blue-500/10" : "bg-blue-50",
      editavel: true,
    },
    {
      icon: FaBuilding,
      label: t("empresa.nome"),
      value: empresa?.nome || t("adicionar"),
      color: "from-green-500 to-emerald-500",
      bgColor: modoDark ? "bg-green-500/10" : "bg-green-50",
    },
    {
      icon: FaShield,
      label: t("empresa.cargo"),
      value: translateRole(usuarioLogado?.tipo || t("adicionar")),
      color: "from-purple-500 to-pink-500",
      bgColor: modoDark ? "bg-purple-500/10" : "bg-purple-50",
    },
    {
      icon: FaMapMarkerAlt,
      label: t("empresa.endereco"),
      value: empresa?.endereco || t("adicionar"),
      color: "from-orange-500 to-red-500",
      bgColor: modoDark ? "bg-orange-500/10" : "bg-orange-50",
    }
  ];

  const detailCards = [
    {
      icon: FaGlobeAmericas,
      label: t("empresa.pais"),
      value: empresa?.pais || t("adicionar"),
    },
    {
      icon: FaMapMarkerAlt,
      label: t("empresa.estado"),
      value: empresa?.estado || t("adicionar"),
    },
    {
      icon: FaCity,
      label: t("empresa.cidade"),
      value: empresa?.cidade || t("adicionar"),
    },
    {
      icon: FaMapPin,
      label: t("empresa.cep"),
      value: empresa?.cep ? `${empresa.cep.slice(0, 5)}-${empresa.cep.slice(5)}` : t("adicionar"),
    },
    {
      icon: FaPhone,
      label: t("empresa.telefone"),
      value: empresa?.telefone ? `(${empresa.telefone.slice(0, 2)}) ${empresa.telefone.slice(2)}` : t("adicionar"),
    },
    {
      icon: FaEnvelope,
      label: t("empresa.email"),
      value: empresa?.email || t("adicionar"),
    }
  ];

  return (
    <div className={`min-h-screen ${bgGradient}`}>
      <div className="flex">
        <div className="flex-1 min-w-0">
          <div className="px-4 sm:px-6 py-8 w-full max-w-7xl mx-auto">
            <section className={`relative py-8 rounded-3xl mb-6 overflow-hidden ${modoDark ? "bg-slate-800/30" : "bg-white/30"} backdrop-blur-sm border ${borderColor}`}>
              <div className="absolute inset-0">
                <div className={`absolute top-0 left-10 w-32 h-32 ${modoDark ? "bg-blue-500/20" : "bg-blue-200/50"} rounded-full blur-3xl animate-float`}></div>
                <div className={`absolute bottom-0 right-10 w-48 h-48 ${modoDark ? "bg-slate-700/20" : "bg-slate-300/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "2s" }}></div>
                <div className={`absolute top-1/2 left-1/2 w-24 h-24 ${modoDark ? "bg-cyan-500/20" : "bg-cyan-200/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "4s" }}></div>
              </div>

              <div className="relative z-10 text-center">
                <h1 className={`text-3xl md:text-4xl font-bold ${textPrimary} mb-3`}>
                  {t("titulo")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{t("minhaConta")}</span>
                </h1>
                <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>{t("gerencieSuasInformacoes")}</p>
              </div>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {infoCards.map((card, index) => (
                <div key={index} className="gradient-border animate-fade-in-up group relative" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`p-4 rounded-[15px] ${bgCard} backdrop-blur-sm h-full`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${card.bgColor}`}>
                        <card.icon className={`text-xl bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} />
                      </div>
                      {card.editavel && (
                        <button
                          onClick={abrirModal}
                          className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${modoDark
                              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:scale-110"
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110"
                            } shadow-lg`}
                          title={t("editarNome")}
                        >
                          <FaEdit className="text-sm" />
                        </button>
                      )}
                    </div>
                    <div className={`text-xs font-medium ${textMuted} mb-1`}>{card.label}</div>
                    <div className={`text-sm font-semibold ${textPrimary} line-clamp-2`}>{card.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-sm overflow-hidden card-hover`}>
                  <div className="p-4 border-b" style={{ borderColor: temaAtual.borda }}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: temaAtual.texto }}>
                      <FaLock className={modoDark ? "text-blue-400" : "text-blue-500"} />
                      {t("email")}
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${textMuted} mb-1`}>{t("emailAtual")}</p>
                        <p className={`font-medium ${textPrimary}`}>{usuarioLogado?.email || "..."}</p>
                      </div>
                      <div className={`p-2 ${modoDark ? "bg-blue-500/20" : "bg-blue-100"} rounded-xl`}>
                        <FaLock className={`text-sm ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-sm overflow-hidden card-hover`}>
                  <div className="p-4 border-b" style={{ borderColor: temaAtual.borda }}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: temaAtual.texto }}>
                      <FaKey className={modoDark ? "text-green-400" : "text-green-500"} />
                      {t("senha")}
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${textMuted} mb-2`}>{t("gerencieSuaSenha")}</p>
                        <Link
                          href="/esqueci"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 font-medium text-sm"
                          style={{
                            backgroundColor: temaAtual.primario,
                            color: "#FFFFFF",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.9";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                        >
                          <FaKey size={12} />
                          {t("trocarSenha")}
                        </Link>
                      </div>
                      <div className={`p-2 ${modoDark ? "bg-green-500/20" : "bg-green-100"} rounded-xl`}>
                        <FaKey className={`text-sm ${modoDark ? "text-green-400" : "text-green-500"}`} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-sm overflow-hidden card-hover`}>
                  <div className="p-4 border-b" style={{ borderColor: temaAtual.borda }}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: temaAtual.texto }}>
                      <FaBuilding className={modoDark ? "text-purple-400" : "text-purple-500"} />
                      {t("informacoesEmpresa")}
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detailCards.map((detail, index) => (
                        <div key={index} className={`p-3 rounded-xl border ${borderColor} ${bgHover} transition-all duration-300`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${modoDark ? "bg-slate-700/50" : "bg-slate-100"}`}>
                              <detail.icon className={`text-sm ${textMuted}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium ${textMuted} mb-1`}>{detail.label}</p>
                              <p className={`text-sm font-semibold ${textPrimary} truncate`}>{detail.value}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className={`rounded-2xl border ${modoDark ? "border-red-500/30" : "border-red-200"} ${modoDark ? "bg-red-500/5" : "bg-red-50/50"} backdrop-blur-sm overflow-hidden card-hover`}>
                  <div className="p-4 border-b" style={{ borderColor: modoDark ? "#DC2626/30" : "#FECACA" }}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: modoDark ? "#FCA5A5" : "#DC2626" }}>
                      <FaExclamationTriangle className="text-red-500" />
                      {t("zonaPerigo")}
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 mx-auto mb-3 ${modoDark ? "bg-red-500/20" : "bg-red-100"} rounded-full flex items-center justify-center`}>
                        <FaTrash className={`text-xl ${modoDark ? "text-red-400" : "text-red-500"}`} />
                      </div>
                      <h3 className={`font-bold ${textPrimary} mb-2`}>{t("excluirConta")}</h3>
                      <p className={`text-sm ${textMuted} mb-4`}>{t("excluirContaDescricao")}</p>
                    </div>

                    <button
                      onClick={handleExcluir}
                      className="w-full py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #EF4444, #DC2626)",
                        color: "#FFFFFF",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      <FaTrash size={14} />
                      {t("excluirConta")}
                    </button>
                  </div>
                </div>
                <div className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-sm overflow-hidden card-hover`}>
                  <div className="p-4 border-b" style={{ borderColor: temaAtual.borda }}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: temaAtual.texto }}>
                      <FaUser className={modoDark ? "text-cyan-400" : "text-cyan-500"} />
                      {t("informacoesConta")}
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${textMuted}`}>{t("contaCriadaEm")}</span>
                        <span className={`text-sm font-medium ${textPrimary}`}>
                          {usuarioLogado?.createdAt ? new Date(usuarioLogado.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${textMuted}`}>{t("ultimaAtualizacao")}</span>
                        <span className={`text-sm font-medium ${textPrimary}`}>
                          {usuarioLogado?.updatedAt ? new Date(usuarioLogado.updatedAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${textMuted}`}>{t("statusConta")}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${modoDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"}`}>
                          {t("ativo")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-2xl shadow-2xl w-full max-w-md border backdrop-blur-sm"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`,
            }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: temaAtual.texto }}>
              <FaEdit className={modoDark ? "text-blue-400" : "text-blue-500"} />
              {t("modal.editarTitulo")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("modal.nome")}
                </label>
                <input
                  type="text"
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`,
                  }}
                  placeholder={t("modal.nome")}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-yellow-800 text-sm flex items-center gap-2">
                  <FaLock className="text-yellow-600" />
                  {t("emailNaoEditavel")}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalAberto(false)}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = temaAtual.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = temaAtual.card;
                }}
              >
                {t("modal.cancelar")}
              </button>
              <button
                onClick={handleSalvar}
                disabled={!nomeEditado.trim()}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: temaAtual.primario,
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  if (nomeEditado.trim()) {
                    e.currentTarget.style.opacity = "0.9";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {t("modal.salvar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}