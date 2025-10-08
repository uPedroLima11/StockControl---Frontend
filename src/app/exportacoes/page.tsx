"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaFileExcel, FaDownload, FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight, FaLock, FaHistory, FaFilter, FaBox, FaShoppingCart, FaUsers, FaTruck, FaUserCog, FaExchangeAlt, FaSearch, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

interface ExportHistory {
  id: string;
  descricao: string;
  createdAt: string;
  tipo: string;
  usuario?: {
    nome: string;
  };
}

const cores = {
  dark: {
    fundo: "#0f172a",
    texto: "#f8fafc",
    card: "#1e293b",
    borda: "#334155",
    primario: "#3b82f6",
    secundario: "#0ea5e9",
    placeholder: "#94a3b8",
    hover: "#334155",
    ativo: "#3b82f6",
    sucesso: "#10b981",
    erro: "#ef4444",
    alerta: "#f59e0b",
    gradiente: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  },
  light: {
    fundo: "#E0DCDC",
    texto: "#0f172a",
    card: "#ffffff",
    borda: "#e2e8f0",
    primario: "#1976D2",
    secundario: "#0284C7",
    placeholder: "#64748B",
    hover: "#f1f5f9",
    ativo: "#0284C7",
    sucesso: "#10b981",
    erro: "#EF4444",
    alerta: "#F59E0B",
    gradiente: "linear-gradient(135deg, #E0DCDC 0%, #E2E8F0 50%, #CBD5E1 100%)",
  },
};

export default function Exportacoes() {
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
  const [modoDark, setModoDark] = useState(false);
  const [activeTab, setActiveTab] = useState<"exportar" | "historico">("exportar");
  const [loading, setLoading] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [temPermissaoExportar, setTemPermissaoExportar] = useState<boolean | null>(null);
  const [buscaHistorico, setBuscaHistorico] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [menuFiltrosAberto, setMenuFiltrosAberto] = useState(false);

  const router = useRouter();
  const { t, i18n } = useTranslation("exportacoes");

  const menuFiltrosRef = useRef<HTMLDivElement>(null);

  const itensPorPagina = 8;

  const temaAtual = modoDark ? cores.dark : cores.light;

  const usuarioTemPermissao = async (userId: string, permissaoChave: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${userId}/tem-permissao/${permissaoChave}`);
      if (response.ok) {
        const data = await response.json();
        return data.temPermissao;
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    }
  };

  useEffect(() => {
  const temaSalvo = localStorage.getItem("modoDark");
  const ativado = temaSalvo === "true";
  setModoDark(ativado);

  const handleThemeChange = (e: CustomEvent) => {
    setModoDark(e.detail.modoDark);
  };

  window.addEventListener('themeChanged', handleThemeChange as EventListener);
  
  return () => {
    window.removeEventListener('themeChanged', handleThemeChange as EventListener);
  };
}, []);

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }

    const initialize = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;

      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const temPermissao = await usuarioTemPermissao(usuarioValor, "exportar_dados");
      setTemPermissaoExportar(temPermissao);

      if (!temPermissao) return;

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);

      if (responseUsuario.ok) {
        const usuario = await responseUsuario.json();
        setEmpresaId(usuario.empresaId);

        if (usuario.empresaId) {
          const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
          setEmpresaAtivada(ativada);
        }
      }
    };

    initialize();
  }, []);

  useEffect(() => {
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
        background: linear-gradient(45deg, ${modoDark ? "#3B82F6, #0EA5E9, #1E293B" : "#1976D2, #0284C7, #E2E8F0"});
        padding: 1px;
        border-radius: 16px;
      }
      
      .gradient-border > div {
        background: ${modoDark ? "#1E293B" : "#FFFFFF"};
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
        background: ${modoDark ? "#1E293B" : "#F1F5F9"};
        border-radius: 3px;
      }
      
      .scroll-custom::-webkit-scrollbar-thumb {
        background: ${modoDark ? "#3B82F6" : "#94A3B8"};
        border-radius: 3px;
      }
      
      .scroll-custom::-webkit-scrollbar-thumb:hover {
        background: ${modoDark ? "#2563EB" : "#64748B"};
      }
    `;
    document.head.appendChild(style);

    function handleClickOutside(event: MouseEvent) {
      if (menuFiltrosRef.current && !menuFiltrosRef.current.contains(event.target as Node)) {
        setMenuFiltrosAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.head.removeChild(style);
    };
  }, [modoDark]);

  useEffect(() => {
    if (activeTab === "historico" && empresaId) {
      fetchExportHistory();
    }
  }, [activeTab, empresaId]);

  const verificarAtivacaoEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (!response.ok) return false;

      const empresaData = await response.json();
      return empresaData.ChaveAtivacao !== null && empresaData.ChaveAtivacao !== undefined;
    } catch (error) {
      console.error("Erro ao verificar ativação:", error);
      return false;
    }
  };

  const mostrarAlertaNaoAtivada = () => {
    Swal.fire({
      title: t("alerta.titulo"),
      text: t("alerta.mensagem"),
      icon: "warning",
      confirmButtonText: t("alerta.botao"),
      confirmButtonColor: "#3085d6",
      background: modoDark ? temaAtual.card : "#FFFFFF",
      color: modoDark ? temaAtual.texto : temaAtual.texto,
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/ativacao");
      }
    });
  };

  const mostrarAlertaSemPermissao = () => {
    Swal.fire({
      title: t("semPermissao.titulo") || "Permissão Negada",
      text: t("semPermissao.mensagem") || "Você não tem permissão para exportar dados.",
      icon: "warning",
      confirmButtonText: t("semPermissao.botao") || "OK",
      confirmButtonColor: "#3085d6",
      background: modoDark ? temaAtual.card : "#FFFFFF",
      color: modoDark ? temaAtual.texto : temaAtual.texto,
    });
  };

  const handleAcaoProtegida = (acao: () => void) => {
    if (temPermissaoExportar === false) {
      mostrarAlertaSemPermissao();
      return;
    }

    if (!empresaAtivada) {
      mostrarAlertaNaoAtivada();
      return;
    }
    acao();
  };

  const handleExport = async (entityType: string) => {
    handleAcaoProtegida(async () => {
      if (!empresaId || temPermissaoExportar === false) return;

      setLoading(true);
      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        const usuarioValor = usuarioSalvo ? usuarioSalvo.replace(/"/g, "") : "";

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/export/${entityType}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": usuarioValor,
            Authorization: `Bearer ${Cookies.get("token")}`,

          },
          body: JSON.stringify({
            startDate: dateRange.start || undefined,
            endDate: dateRange.end || undefined,
            empresaId,
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${entityType}_${new Date().toISOString().split("T")[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          Swal.fire({
            position: "center",
            icon: "success",
            title: t("exportacaoSucesso"),
            showConfirmButton: false,
            timer: 1500,
            background: modoDark ? temaAtual.card : "#FFFFFF",
            color: modoDark ? temaAtual.texto : temaAtual.texto,
          });

          if (activeTab === "historico") {
            fetchExportHistory();
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.mensagem || t("erroExportacao"));
        }
      } catch (error) {
        console.error("Erro ao exportar:", error);
        Swal.fire({
          title: t("erroTitulo"),
          text: error instanceof Error ? error.message : t("erroGenerico"),
          icon: "error",
          background: modoDark ? temaAtual.card : "#FFFFFF",
          color: modoDark ? temaAtual.texto : temaAtual.texto,
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const fetchExportHistory = async () => {
    if (!empresaId || temPermissaoExportar === false) return;

    setCarregandoHistorico(true);
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      const usuarioValor = usuarioSalvo ? usuarioSalvo.replace(/"/g, "") : "";

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/export/history/${empresaId}`, {
        headers: {
          "user-id": usuarioValor,
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      if (response.ok) {
        const history = await response.json();
        setExportHistory(history);
        setPaginaAtual(1);
      } else {
        console.error("Erro na resposta:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Detalhes do erro:", errorText);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const parseExportDescription = (descricao: string) => {
    if (!descricao || typeof descricao !== "string") {
      return {
        entity: t("desconhecido"),
        user: t("desconhecido"),
        period: t("periodoNaoEspecificado"),
      };
    }
    const parts = descricao.split(" | ");

    if (parts.length >= 2) {
      const entityMatch = parts[0].match(/Exportação de (\w+)/);
      const userMatch = parts[1].match(/Usuário: (.+)/);
      const periodMatch = parts[2] ? parts[2].match(/Período: (.+)/) : null;

      return {
        entity: entityMatch ? entityMatch[1] : t("desconhecido"),
        user: userMatch ? userMatch[1] : t("desconhecido"),
        period: periodMatch ? periodMatch[1] : t("periodoNaoEspecificado"),
      };
    }

    try {
      const parsed = JSON.parse(descricao);
      return {
        entity: parsed.entityType || t("desconhecido"),
        user: t("desconhecido"),
        period: parsed.periodo === "Todos os dados" ? t("periodoNaoEspecificado") : parsed.periodo,
      };
    } catch {
      const entityMatch = descricao.match(/Exportação de (\w+)/);
      return {
        entity: entityMatch ? entityMatch[1] : t("desconhecido"),
        user: t("desconhecido"),
        period: t("periodoNaoEspecificado"),
      };
    }
  };

  const entityIcons = {
    produtos: FaBox,
    vendas: FaShoppingCart,
    clientes: FaUsers,
    fornecedores: FaTruck,
    usuarios: FaUserCog,
    movimentacoes: FaExchangeAlt,
  };

  const entityNames = {
    produtos: t("entidades.produtos"),
    vendas: t("entidades.vendas"),
    clientes: t("entidades.clientes"),
    fornecedores: t("entidades.fornecedores"),
    usuarios: t("entidades.usuarios"),
    movimentacoes: t("entidades.movimentacoes"),
  };

  const entityColors = {
    produtos: "from-blue-500 to-cyan-500",
    vendas: "from-green-500 to-emerald-500",
    clientes: "from-purple-500 to-pink-500",
    fornecedores: "from-orange-500 to-red-500",
    usuarios: "from-indigo-500 to-purple-500",
    movimentacoes: "from-teal-500 to-cyan-500",
  };

  const historicoFiltrado = exportHistory.filter((item) => {
    const { entity, user } = parseExportDescription(item.descricao);
    const buscaMatch =
      entityNames[entity as keyof typeof entityNames]?.toLowerCase().includes(buscaHistorico.toLowerCase()) ||
      user.toLowerCase().includes(buscaHistorico.toLowerCase()) ||
      new Date(item.createdAt).toLocaleDateString().includes(buscaHistorico);

    const tipoMatch = filtroTipo === "todos" || entity === filtroTipo;

    return buscaMatch && tipoMatch;
  });

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const itensAtuais = historicoFiltrado.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.ceil(historicoFiltrado.length / itensPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setExpandedItems(new Set());
  };

  const bgGradient = modoDark
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200";

  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const bgInput = modoDark ? "bg-slate-700/50" : "bg-gray-100";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";
  const bgSelected = modoDark ? "bg-blue-500/20" : "bg-blue-100";

  if (temPermissaoExportar === false) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center px-4`}>
        <div className="text-center">
          <div className={`w-24 h-24 mx-auto mb-6 ${modoDark ? "bg-red-500/20" : "bg-red-100"} rounded-full flex items-center justify-center`}>
            <FaLock className={`text-3xl ${modoDark ? "text-red-400" : "text-red-500"}`} />
          </div>
          <h1 className={`text-2xl font-bold ${textPrimary} mb-4`}>{t("acessoNegado.titulo") || "Acesso Negado"}</h1>
          <p className={textSecondary}>{t("acessoNegado.mensagem") || "Você não tem permissão para acessar esta funcionalidade."}</p>
        </div>
      </div>
    );
  }

  if (temPermissaoExportar === null) {
    return (
      <div className={`min-h-screen ${bgGradient} flex justify-center items-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={textPrimary}>{t("carregando") || "Carregando..."}</p>
        </div>
      </div>
    );
  }

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
                  {t("titulo")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{t("exportacoes")}</span>
                </h1>
                <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>{t("subtitulo")}</p>
              </div>
            </section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: t("stats.totalExportacoes"),
                  value: exportHistory.length,
                  icon: FaFileExcel,
                  color: "from-blue-500 to-cyan-500",
                  bgColor: modoDark ? "bg-blue-500/10" : "bg-blue-50",
                },
                {
                  label: t("stats.ultimaSemana"),
                  value: exportHistory.filter(item => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return new Date(item.createdAt) > oneWeekAgo;
                  }).length,
                  icon: FaHistory,
                  color: "from-green-500 to-emerald-500",
                  bgColor: modoDark ? "bg-green-500/10" : "bg-green-50",
                },
                {
                  label: t("stats.produtos"),
                  value: exportHistory.filter(item => {
                    const { entity } = parseExportDescription(item.descricao);
                    return entity === "produtos";
                  }).length,
                  icon: FaBox,
                  color: "from-purple-500 to-pink-500",
                  bgColor: modoDark ? "bg-purple-500/10" : "bg-purple-50",
                },
                {
                  label: t("stats.vendas"),
                  value: exportHistory.filter(item => {
                    const { entity } = parseExportDescription(item.descricao);
                    return entity === "vendas";
                  }).length,
                  icon: FaShoppingCart,
                  color: "from-orange-500 to-red-500",
                  bgColor: modoDark ? "bg-orange-500/10" : "bg-orange-50",
                },
              ].map((stat, index) => (
                <div key={index} className="gradient-border animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`p-4 rounded-[15px] ${bgCard} backdrop-blur-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>{stat.value}</div>
                        <div className={textMuted}>{stat.label}</div>
                      </div>
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`text-xl bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {empresaId && !empresaAtivada && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${modoDark ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30" : "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"}`}>
                <div className={`p-2 ${modoDark ? "bg-orange-500/20" : "bg-orange-100"} rounded-xl`}>
                  <FaLock className={`text-xl ${modoDark ? "text-orange-400" : "text-orange-500"}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${textPrimary} text-sm`}>{t("empresaNaoAtivada.titulo")}</p>
                  <p className={textMuted}>{t("empresaNaoAtivada.mensagem")}</p>
                </div>
              </div>
            )}
            <div className={`rounded-2xl ${bgCard} border ${borderColor} backdrop-blur-sm overflow-hidden`}>
              <div className="p-6 border-b  border-blue-500/20">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("exportar")}
                      className={`py-3 cursor-pointer px-6 rounded-xl transition-all duration-300 text-sm font-medium ${activeTab === "exportar"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                        : `${textPrimary} ${bgHover} border ${borderColor}`}`}
                    >
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        <FaDownload className="text-sm" />
                        {t("abas.exportar")}
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("historico")}
                      className={`py-3 cursor-pointer px-6 rounded-xl transition-all duration-300 text-sm font-medium ${activeTab === "historico"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                        : `${textPrimary} ${bgHover} border ${borderColor}`}`}
                    >
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        <FaHistory className="text-sm" />
                        {t("abas.historico")}
                      </div>
                    </button>
                  </div>

                  {activeTab === "historico" && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <div className="relative flex-1 lg:flex-none lg:w-64">
                        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                        <div className={`relative flex items-center ${bgInput} rounded-xl px-3 py-2 border ${borderColor} backdrop-blur-sm`}>
                          <FaSearch className={`${modoDark ? "text-blue-400" : "text-blue-500"} mr-2 text-sm`} />
                          <input
                            type="text"
                            placeholder={t("historico.buscarPlaceholder")}
                            value={buscaHistorico}
                            onChange={(e) => {
                              setBuscaHistorico(e.target.value);
                              setPaginaAtual(1);
                            }}
                            className={`bg-transparent border-none outline-none ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} w-full text-sm`}
                          />
                        </div>
                      </div>
                      <div className="relative" ref={menuFiltrosRef}>
                        <button
                          onClick={() => setMenuFiltrosAberto(!menuFiltrosAberto)}
                          className={`flex cursor-pointer items-center gap-2 ${bgInput} ${bgHover} border cursor-pointer ${borderColor} rounded-xl px-3 py-2 transition-all duration-300 backdrop-blur-sm min-w-[140px]`}
                        >
                          <FaFilter className={modoDark ? "text-blue-400" : "text-blue-500"} />
                          <span className={`${textPrimary} flex-1 text-left text-sm`}>
                            {filtroTipo === "todos" ? t("historico.filtros.todos") : entityNames[filtroTipo as keyof typeof entityNames]}
                          </span>
                          <FaChevronDown className={`${modoDark ? "text-blue-400" : "text-blue-500"} transition-transform duration-300 text-xs ${menuFiltrosAberto ? "rotate-180" : ""}`} />
                        </button>

                        {menuFiltrosAberto && (
                          <div className={`absolute top-full right-0 mt-2 w-48 ${modoDark ? "bg-slate-800/95" : "bg-white/95"} border ${borderColor} rounded-xl shadow-2xl ${modoDark ? "shadow-blue-500/20" : "shadow-blue-200"} z-50 overflow-hidden backdrop-blur-sm`}>
                            <div className="p-2 max-h-48 overflow-y-auto scroll-custom">
                              <div
                                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${bgHover} text-sm ${filtroTipo === "todos" ? `${bgSelected} font-medium` : ""}`}
                                onClick={() => {
                                  setFiltroTipo("todos");
                                  setMenuFiltrosAberto(false);
                                  setPaginaAtual(1);
                                }}
                              >
                                <span className={textPrimary}>{t("historico.filtros.todos")}</span>
                              </div>
                              {Object.entries(entityNames).map(([key, name]) => (
                                <div
                                  key={key}
                                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${bgHover} text-sm ${filtroTipo === key ? `${bgSelected} font-medium` : ""}`}
                                  onClick={() => {
                                    setFiltroTipo(key);
                                    setMenuFiltrosAberto(false);
                                    setPaginaAtual(1);
                                  }}
                                >
                                  <span className={textPrimary}>{name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                {activeTab === "exportar" && (
                  <div className="space-y-6">
                    <div className={`p-6 rounded-2xl ${modoDark ? "bg-slate-800/30" : "bg-white/30"} border ${borderColor} backdrop-blur-sm w-full max-w-md`}>
                      <h2 className={`text-lg font-semibold mb-4 ${textPrimary} flex items-center gap-2`}>
                        <FaFilter className={modoDark ? "text-blue-400" : "text-blue-500"} />
                        {t("filtros.titulo")}
                      </h2>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm mb-2 ${textPrimary}`}>
                            {t("filtros.dataInicial")}
                          </label>
                          <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                            <input
                              type="date"
                              value={dateRange.start}
                              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                              className={`w-full cursor-pointer relative ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm mb-2 ${textPrimary}`}>
                            {t("filtros.dataFinal")}
                          </label>
                          <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                            <input
                              type="date"
                              value={dateRange.end}
                              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                              className={`w-full cursor-pointer relative ${bgInput} border ${borderColor} rounded-xl px-3 py-2 ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(entityNames).map(([key, name], index) => {
                        const IconComponent = entityIcons[key as keyof typeof entityIcons];
                        const colorClass = entityColors[key as keyof typeof entityColors];

                        return (
                          <div
                            key={key}
                            className={`group ${modoDark
                              ? "bg-gradient-to-br from-blue-500/5 to-cyan-500/5"
                              : "bg-gradient-to-br from-blue-100/30 to-cyan-100/30"
                              } rounded-2xl border ${modoDark
                                ? "border-blue-500/20 hover:border-blue-500/40"
                                : "border-blue-200 hover:border-blue-300"
                              } p-4 transition-all duration-500 card-hover backdrop-blur-sm glow-effect`}
                            style={{
                              animationDelay: `${index * 100}ms`,
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className={`p-2 rounded-xl ${modoDark ? "bg-slate-700/50" : "bg-white/50"}`}>
                                <IconComponent className={`text-xl bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`} />
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-bold ${modoDark ? "bg-slate-700/50" : "bg-white/50"} ${textMuted} flex items-center gap-1`}>
                                <FaFileExcel className="text-xs" />
                                .XLSX
                              </div>
                            </div>

                            <h3 className={`font-bold ${textPrimary} mb-2 text-base`}>{name}</h3>
                            <p className={`${textMuted} text-xs mb-4 line-clamp-2`}>
                              {t(`descricoes.${key}`)}
                            </p>

                            <button
                              onClick={() => handleExport(key)}
                              disabled={loading || !empresaAtivada}
                              className="w-full px-3 cursor-pointer py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: modoDark ? "linear-gradient(135deg, #3B82F6, #0EA5E9)" : "linear-gradient(135deg, #1976D2, #0284C7)",
                                color: "#FFFFFF",
                              }}
                            >
                              {loading ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <FaDownload size={10} />
                                </>
                              )}
                              {loading ? t("exportando") : t("botaoExportar")}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "historico" && (
                  <div>
                    {carregandoHistorico ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className={textMuted}>{t("historico.carregando")}</p>
                      </div>
                    ) : historicoFiltrado.length === 0 ? (
                      <div className="text-center py-12">
                        <div className={`w-24 h-24 mx-auto mb-4 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
                          <FaFileExcel className={`text-2xl ${textMuted}`} />
                        </div>
                        <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{t("historico.nenhumaExportacao")}</h3>
                        <p className={textMuted}>{buscaHistorico || filtroTipo !== "todos" ? t("historico.nenhumResultado") : t("historico.comeceExportando")}</p>
                        {(buscaHistorico || filtroTipo !== "todos") && (
                          <button
                            onClick={() => {
                              setBuscaHistorico("");
                              setFiltroTipo("todos");
                            }}
                            className="mt-4 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2 text-sm font-medium mx-auto hover:scale-105"
                            style={{
                              background: modoDark ? "linear-gradient(135deg, #3B82F6, #0EA5E9)" : "linear-gradient(135deg, #1976D2, #0284C7)",
                              color: "#FFFFFF",
                            }}
                          >
                            <FaTimes className="text-xs" />
                            {t("historico.limparFiltros")}
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {totalPaginas > 1 && (
                          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
                            <span className={`text-sm ${textMuted}`}>
                              {t("historico.mostrando", {
                                inicio: indexPrimeiroItem + 1,
                                fim: Math.min(indexUltimoItem, historicoFiltrado.length),
                                total: historicoFiltrado.length,
                              })}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => mudarPagina(paginaAtual - 1)}
                                disabled={paginaAtual === 1}
                                className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === 1
                                  ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed`
                                  : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105`}`}
                              >
                                <FaAngleLeft className="text-sm" />
                              </button>

                              <span className={`font-medium ${textPrimary} text-sm mx-2`}>
                                {paginaAtual}/{totalPaginas}
                              </span>

                              <button
                                onClick={() => mudarPagina(paginaAtual + 1)}
                                disabled={paginaAtual === totalPaginas}
                                className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === totalPaginas
                                  ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed`
                                  : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105`}`}
                              >
                                <FaAngleRight className="text-sm" />
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="space-y-4">
                          {itensAtuais.map((item) => {
                            const { entity, user, period } = parseExportDescription(item.descricao);
                            const isExpanded = expandedItems.has(item.id);
                            const IconComponent = entityIcons[entity as keyof typeof entityIcons] || FaFileExcel;
                            const colorClass = entityColors[entity as keyof typeof entityColors] || "from-blue-500 to-cyan-500";

                            return (
                              <div
                                key={item.id}
                                className={`group rounded-xl border p-4 transition-all duration-300 backdrop-blur-sm ${isExpanded ? 'scale-[1.02]' : ''}`}
                                style={{
                                  borderColor: temaAtual.borda,
                                  backgroundColor: isExpanded ? temaAtual.hover : temaAtual.card,
                                }}
                              >
                                <div
                                  className="flex justify-between items-start cursor-pointer"
                                  onClick={() => toggleExpand(item.id)}
                                >
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className={`p-2 rounded-lg ${modoDark ? "bg-slate-700/50" : "bg-white/50"} mt-1`}>
                                      <IconComponent className={`text-lg bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <p className={`font-semibold ${textPrimary} text-sm`}>
                                          {entityNames[entity as keyof typeof entityNames] || entity}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${modoDark ? "bg-slate-700/50" : "bg-white/50"} ${textMuted}`}>
                                          {period}
                                        </span>
                                      </div>
                                      <p className={`text-xs ${textMuted} mb-1`}>
                                        {t("historico.exportadoPor")}: {user}
                                      </p>
                                      <p className={`text-xs ${textMuted}`}>
                                        {new Date(item.createdAt).toLocaleString(i18n.language === "en" ? "en-US" : "pt-BR")}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(item.id);
                                      }}
                                      className={`p-1 rounded-lg transition-all duration-300 ${bgHover}`}
                                      style={{ color: temaAtual.texto }}
                                    >
                                      {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                                    </button>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="mt-4 pt-4 border-t" style={{ borderColor: temaAtual.borda }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="font-semibold mb-1" style={{ color: temaAtual.texto }}>
                                          {t("historico.detalhes.tipoDados")}:
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <IconComponent className={`bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`} />
                                          <p style={{ color: temaAtual.placeholder }}>
                                            {entityNames[entity as keyof typeof entityNames] || entity}
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="font-semibold mb-1" style={{ color: temaAtual.texto }}>
                                          {t("historico.detalhes.exportadoPor")}:
                                        </p>
                                        <p style={{ color: temaAtual.placeholder }}>{user}</p>
                                      </div>
                                      <div>
                                        <p className="font-semibold mb-1" style={{ color: temaAtual.texto }}>
                                          {t("historico.detalhes.periodo")}:
                                        </p>
                                        <p style={{ color: temaAtual.placeholder }}>{period}</p>
                                      </div>
                                      <div>
                                        <p className="font-semibold mb-1" style={{ color: temaAtual.texto }}>
                                          {t("historico.detalhes.dataExportacao")}:
                                        </p>
                                        <p style={{ color: temaAtual.placeholder }}>
                                          {new Date(item.createdAt).toLocaleString(i18n.language === "en" ? "en-US" : "pt-BR")}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {totalPaginas > 1 && (
                          <div className="flex justify-center items-center gap-3 mt-8">
                            <button
                              onClick={() => mudarPagina(paginaAtual - 1)}
                              disabled={paginaAtual === 1}
                              className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === 1
                                ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed`
                                : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105`}`}
                            >
                              <FaAngleLeft className="text-sm" />
                            </button>

                            <div className="flex gap-1">
                              {[...Array(totalPaginas)].map((_, index) => {
                                const pagina = index + 1;
                                const mostrarPagina =
                                  pagina === 1 ||
                                  pagina === totalPaginas ||
                                  (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1);

                                if (!mostrarPagina) {
                                  if (pagina === paginaAtual - 2 || pagina === paginaAtual + 2) {
                                    return (
                                      <span key={pagina} className={`px-2 py-1 ${textMuted} text-sm`}>
                                        ...
                                      </span>
                                    );
                                  }
                                  return null;
                                }

                                return (
                                  <button
                                    key={pagina}
                                    onClick={() => mudarPagina(pagina)}
                                    className={`px-3 py-1 rounded-xl transition-all duration-300 text-sm ${pagina === paginaAtual
                                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-105"
                                      : `${bgCard} ${bgHover} ${textPrimary} border ${borderColor} hover:scale-105`}`}
                                  >
                                    {pagina}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              onClick={() => mudarPagina(paginaAtual + 1)}
                              disabled={paginaAtual === totalPaginas}
                              className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === totalPaginas
                                ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed`
                                : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105`}`}
                            >
                              <FaAngleRight className="text-sm" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}