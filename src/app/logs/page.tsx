"use client";

import { LogsI } from "@/utils/types/logs";
import { useEffect, useState, useRef } from "react";
import { FaSearch, FaChevronDown, FaAngleLeft, FaAngleRight, FaFilter, FaTimes, FaUser, FaInfoCircle, FaCalendarAlt, FaSync, FaExclamationTriangle, FaPlus, FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { usuarioTemPermissao } from "@/utils/permissoes";
import Cookies from "js-cookie";

type TipoLog = "CRIACAO" | "ATUALIZACAO" | "EXCLUSAO" | "BAIXA" | "EMAIL_ENVIADO";

interface LogsResponse {
  logs: LogsI[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const cores = {
  dark: {
    fundo: "#0A1929",
    texto: "#FFFFFF",
    card: "#132F4C",
    borda: "#1E4976",
    primario: "#1976D2",
    secundario: "#00B4D8",
    placeholder: "#9CA3AF",
    hover: "#1E4976",
    ativo: "#1976D2",
    sucesso: "#10B981",
    erro: "#EF4444",
    alerta: "#F59E0B",
    gradiente: "linear-gradient(135deg, #0A1929 0%, #132F4C 50%, #1E4976 100%)"
  },
  light: {
    fundo: "#E0DCDC",
    texto: "#0F172A",
    card: "#FFFFFF",
    borda: "#E2E8F0",
    primario: "#1976D2",
    secundario: "#0284C7",
    placeholder: "#64748B",
    hover: "#F1F5F9",
    ativo: "#0284C7",
    sucesso: "#10B981",
    erro: "#EF4444",
    alerta: "#F59E0B",
    gradiente: "linear-gradient(135deg, #E0DCDC 0%, #E2E8F0 50%, #CBD5E1 100%)"
  },
};

type TipoFiltro = "todos" | "CRIACAO" | "ATUALIZACAO" | "EXCLUSAO" | "BAIXA" | "EMAIL_ENVIADO";

export default function Logs() {
  const { t } = useTranslation("logs");
  const [modoDark, setModoDark] = useState(false);
  const [logs, setLogs] = useState<LogsI[]>([]);
  const [busca, setBusca] = useState("");
  const [nomesUsuarios, setNomesUsuarios] = useState<Record<string, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [temPermissao, setTemPermissao] = useState<boolean | null>(null);
  const [menuFiltrosAberto, setMenuFiltrosAberto] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<TipoFiltro>("todos");
  const [carregandoFiltro, setCarregandoFiltro] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [dadosIniciaisCarregados, setDadosIniciaisCarregados] = useState(false);

  const logsPorPagina = 12;
  const menuFiltrosRef = useRef<HTMLDivElement>(null);

  const temaAtual = modoDark ? cores.dark : cores.light;

  const carregarLogsComFiltro = async (pagina: number, empresaId: string, tipo?: string, busca?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/logs?page=1&limit=50&empresaId=${empresaId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar logs");
      }

      const data: LogsResponse = await response.json();
      let logsFiltrados = data.logs;


      if (tipo && tipo !== "todos") {
        logsFiltrados = logsFiltrados.filter(log => log.tipo === tipo);
      }

      if (busca && busca.trim() !== "") {
        logsFiltrados = logsFiltrados.filter(log =>
          log.descricao.toLowerCase().includes(busca.toLowerCase())
        );
      }

      setTotalLogs(logsFiltrados.length);

      const totalPagesFiltrado = Math.ceil(logsFiltrados.length / logsPorPagina);
      setTotalPaginas(totalPagesFiltrado);

      const inicio = (pagina - 1) * logsPorPagina;
      const fim = inicio + logsPorPagina;
      const logsPagina = logsFiltrados.slice(inicio, fim);

      setLogs(logsPagina);

      setStats({
        total: logsFiltrados.length,
        criacao: logsFiltrados.filter(log => log.tipo === "CRIACAO").length,
        atualizacao: logsFiltrados.filter(log => log.tipo === "ATUALIZACAO").length,
        exclusao: logsFiltrados.filter(log => log.tipo === "EXCLUSAO").length,
      });

      return logsFiltrados;
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      setLogs([]);
      setTotalLogs(0);
      return [];
    }
  };


  const carregarEstatisticasDetalhadas = async (empresaId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/logs?page=1&limit=15&empresaId=${empresaId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get("token")}`,
        },
      });

      if (response.ok) {
        const data: LogsResponse = await response.json();

        const contagemTipos = {
          criacao: data.logs.filter(log => log.tipo === "CRIACAO").length,
          atualizacao: data.logs.filter(log => log.tipo === "ATUALIZACAO").length,
          exclusao: data.logs.filter(log => log.tipo === "EXCLUSAO").length,
          baixa: data.logs.filter(log => log.tipo === "BAIXA").length,
          email_enviado: data.logs.filter(log => log.tipo === "EMAIL_ENVIADO").length,
        };

        setStats(prevStats => ({
          ...prevStats,
          total: data.logs.length,
          criacao: contagemTipos.criacao,
          atualizacao: contagemTipos.atualizacao,
          exclusao: contagemTipos.exclusao,
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas detalhadas:", error);
    }
  };

  const [stats, setStats] = useState({
    total: 0,
    criacao: 0,
    atualizacao: 0,
    exclusao: 0,
  });


  const carregarNomesUsuarios = async (logsData: LogsI[]) => {
    const usuariosUnicos = new Set<string>(logsData.filter((log: LogsI) => log.usuarioId).map((log: LogsI) => log.usuarioId as string));

    const usuariosMap: Record<string, string> = {};

    await Promise.all(
      Array.from(usuariosUnicos).map(async (usuarioId: string) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Cookies.get("token")}`,
            },
          });
          const usuario = await response.json();
          if (usuario && usuario.nome) {
            usuariosMap[usuarioId] = usuario.nome;
          }
        } catch (error) {
          console.error(`Erro ao buscar usuário ${usuarioId}:`, error);
          usuariosMap[usuarioId] = t("logs.usuario_nao_encontrado");
        }
      })
    );

    setNomesUsuarios(usuariosMap);
  };

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }

    const initialize = async () => {
      setCarregando(true);
      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);

      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (!usuarioSalvo) {
          setTemPermissao(false);
          setCarregando(false);
          setDadosIniciaisCarregados(true);
          return;
        }

        const usuarioValor = usuarioSalvo.replace(/"/g, "");

        const permissao = await usuarioTemPermissao(usuarioValor, "logs_visualizar");
        setTemPermissao(permissao);

        if (!permissao) {
          setCarregando(false);
          setDadosIniciaisCarregados(true);
          return;
        }

        const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        const usuarioData = await responseUsuario.json();

        if (!usuarioData || !usuarioData.empresaId) {
          setLogs([]);
          setCarregando(false);
          setDadosIniciaisCarregados(true);
          return;
        }

        setEmpresaId(usuarioData.empresaId);
        const logsData = await carregarLogsComFiltro(1, usuarioData.empresaId);
        await carregarNomesUsuarios(logsData);

        await carregarEstatisticasDetalhadas(usuarioData.empresaId);

        setDadosIniciaisCarregados(true);
      } catch (error) {
        console.error("Erro ao carregar logs:", error);
        setLogs([]);
        setTemPermissao(false);
        setDadosIniciaisCarregados(true);
      } finally {
        setCarregando(false);
      }
    };
    initialize();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuFiltrosRef.current && !menuFiltrosRef.current.contains(event.target as Node)) {
        setMenuFiltrosAberto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

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
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .gradient-border {
        position: relative;
        background: linear-gradient(45deg, ${modoDark ? "#1976D2, #00B4D8, #132F4C" : "#1976D2, #0284C7, #E2E8F0"});
        padding: 1px;
        border-radius: 16px;
      }
      
      .gradient-border > div {
        background: ${modoDark ? "#132F4C" : "#FFFFFF"};
        border-radius: 15px;
      }
      
      .scroll-custom {
        max-height: 200px;
        overflow-y-auto;
      }
      
      .scroll-custom::-webkit-scrollbar {
        width: 6px;
      }
      
      .scroll-custom::-webkit-scrollbar-track {
        background: ${modoDark ? "#132F4C" : "#F1F5F9"};
        border-radius: 3px;
      }
      
      .scroll-custom::-webkit-scrollbar-thumb {
        background: ${modoDark ? "#1976D2" : "#94A3B8"};
        border-radius: 3px;
      }
      
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.head.removeChild(style);
    };
  }, [t, modoDark]);

  const traduzirTipoLog = (tipo: string): string => {
    const tiposValidos: TipoLog[] = ["CRIACAO", "ATUALIZACAO", "EXCLUSAO", "BAIXA", "EMAIL_ENVIADO"];
    if (tiposValidos.includes(tipo as TipoLog)) {
      return t(`logs.tipos_logs.${tipo as TipoLog}`);
    }
    return tipo;
  };

  const getTipoLogColor = (tipo: string) => {
    switch (tipo) {
      case "CRIACAO":
        return modoDark ? "from-green-500 to-emerald-500" : "from-green-400 to-emerald-400";
      case "ATUALIZACAO":
        return modoDark ? "from-blue-500 to-cyan-500" : "from-blue-400 to-cyan-400";
      case "EXCLUSAO":
        return modoDark ? "from-red-500 to-pink-500" : "from-red-400 to-pink-400";
      case "BAIXA":
        return modoDark ? "from-yellow-500 to-orange-500" : "from-yellow-400 to-orange-400";
      case "EMAIL_ENVIADO":
        return modoDark ? "from-purple-500 to-indigo-500" : "from-purple-400 to-indigo-400";
      default:
        return modoDark ? "from-gray-500 to-slate-500" : "from-gray-400 to-slate-400";
    }
  };

  const getTipoLogBgColor = (tipo: string) => {
    switch (tipo) {
      case "CRIACAO":
        return modoDark ? "bg-green-500/10" : "bg-green-50";
      case "ATUALIZACAO":
        return modoDark ? "bg-blue-500/10" : "bg-blue-50";
      case "EXCLUSAO":
        return modoDark ? "bg-red-500/10" : "bg-red-50";
      case "BAIXA":
        return modoDark ? "bg-yellow-500/10" : "bg-yellow-50";
      case "EMAIL_ENVIADO":
        return modoDark ? "bg-purple-500/10" : "bg-purple-50";
      default:
        return modoDark ? "bg-gray-500/10" : "bg-gray-50";
    }
  };

  const formatarDescricao = (descricao: string) => {
    try {
      const parsed = JSON.parse(descricao);

      if (parsed.entityType === "vendas" && parsed.action === "produto_vendido") {
        return (
          t("logs.descricoes.produto_vendido", {
            nome: parsed.produtoNome,
            quantidade: parsed.quantidade,
          }) + (parsed.clienteNome ? ` | ${t("logs.cliente")}: ${parsed.clienteNome}` : ` | ${t("logs.cliente")}: ${t("logs.cliente_nao_informado")}`)
        );
      }
      if (parsed.entityType === "pedidos") {
        switch (parsed.action) {
          case "pedido_criado":
            return t("logs.descricoes.pedido_criado", {
              pedidoNumero: parsed.pedidoNumero,
              fornecedorNome: parsed.fornecedorNome,
              quantidadeItens: parsed.quantidadeItens,
            });
          case "status_atualizado":
            return t("logs.descricoes.status_atualizado", {
              pedidoNumero: parsed.pedidoNumero,
              statusAnterior: traduzirStatusPedido(parsed.statusAnterior),
              statusNovo: traduzirStatusPedido(parsed.statusNovo),
              fornecedorNome: parsed.fornecedorNome,
            });
          case "itens_atualizados":
            return t("logs.descricoes.itens_atualizados", {
              pedidoNumero: parsed.pedidoNumero,
              quantidadeItensAtualizados: parsed.quantidadeItensAtualizados,
              fornecedorNome: parsed.fornecedorNome,
            });
          case "pedido_concluido_estoque":
            return t("logs.descricoes.pedido_concluido_estoque", {
              pedidoNumero: parsed.pedidoNumero,
              fornecedorNome: parsed.fornecedorNome,
              statusFinal: traduzirStatusPedido(parsed.statusFinal),
            });
          case "email_enviado_fornecedor":
            return t("logs.descricoes.email_enviado_fornecedor", {
              pedidoNumero: parsed.pedidoNumero,
              fornecedorNome: parsed.fornecedorNome,
              fornecedorEmail: parsed.fornecedorEmail,
            });
          default:
            return descricao;
        }
      }

      if (parsed.entityType) {
        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {t("logs.exportacao_de")}: {t(`logs.entidades.${parsed.entityType}`) || parsed.entityType}
            </span>
            <span>
              {t("logs.periodo")}: {parsed.periodo === "Todos os dados" ? t("logs.periodo_todos") : parsed.periodo}
            </span>
          </div>
        );
      }
    } catch {
      if (descricao.includes("Produto Vendido:") || descricao.includes("Product Sold:")) {
        const produtoMatch = descricao.match(/Produto Vendido: (.+?) \|/) || descricao.match(/Product Sold: (.+?) \|/);
        const quantidadeMatch = descricao.match(/\|\s*Quantidade: (\d+)/) || descricao.match(/\|\s*Quantity: (\d+)/);
        const clienteMatch = descricao.match(/\|\s*Cliente: (.+?)$/) || descricao.match(/\|\s*Client: (.+?)$/);

        return (
          t("logs.descricoes.produto_vendido", {
            nome: produtoMatch?.[1] || "",
            quantidade: quantidadeMatch?.[1] || "0",
          }) + (clienteMatch?.[1] ? ` | ${t("logs.cliente")}: ${clienteMatch[1]}` : ` | ${t("logs.cliente")}: ${t("logs.cliente_nao_informado")}`)
        );
      }

      if (descricao.includes("Exportação de")) {
        const parts = descricao.split(" | ");
        const entityMatch = parts[0].match(/Exportação de (\w+)/);
        const periodMatch = parts[1]?.match(/Período: (.+)/);

        const entityType = entityMatch ? entityMatch[1] : "";
        let periodo = periodMatch ? periodMatch[1] : t("logs.periodo_todos");

        if (periodo === "Todos os dados") {
          periodo = t("logs.periodo_todos");
        }

        return (
          <div className="flex flex-col">
            <span className="font-semibold">
              {t("logs.exportacao_de")}: {t(`logs.entidades.${entityType}`) || entityType}
            </span>
            <span>
              {t("logs.periodo")}: {periodo}
            </span>
          </div>
        );
      }

      if (descricao.includes("Vendas excluídas automaticamente") || descricao.includes("Sales automatically deleted")) {
        const match = descricao.match(/para o produto: (.+?) \((\d+) vendas\)/) || descricao.match(/for product: (.+?) \((\d+) sales\)/);
        return t("logs.descricoes.vendas_excluidas_automaticamente", {
          nome: match?.[1] || "",
          quantidade: match?.[2] || "0",
        });
      }

      if (descricao.includes("Movimentações de estoque excluídas automaticamente") || descricao.includes("Stock movements automatically deleted")) {
        const match = descricao.match(/para o produto: (.+?) \((\d+) movimentações\)/) || descricao.match(/for product: (.+?) \((\d+) movements\)/);
        return t("logs.descricoes.movimentacoes_excluidas_automaticamente", {
          nome: match?.[1] || "",
          quantidade: match?.[2] || "0",
        });
      }

      if (descricao.includes("Produto Excluído") || descricao.includes("Product Deleted")) {
        const nomeProduto = descricao.split(":")[1]?.trim() || "";
        return t("logs.descricoes.produto_excluido", { nome: nomeProduto });
      }

      if (descricao.includes("Produto Atualizado") || descricao.includes("Product Updated")) {
        const nomeProduto = descricao.split(":")[1]?.trim() || "";
        return t("logs.descricoes.produto_atualizado", { nome: nomeProduto });
      }

      if (descricao.includes("Produto criado") || descricao.includes("Product Created")) {
        const nomeProduto = descricao.split(":")[1]?.trim() || "";
        return t("logs.descricoes.produto_criado", { nome: nomeProduto });
      }

      if (descricao.includes("Produto Exportado") || descricao.includes("Product Exported")) {
        const match = descricao.match(/Produto Exportado: (.+?) \(Período: (.+?)\)/) || descricao.match(/Product Exported: (.+?) \(Period: (.+?)\)/);
        return t("logs.descricoes.produto_exportado", {
          nome: match?.[1] || "",
          periodo: match?.[2] || "",
        });
      }
    }

    return descricao;
  };

  function formatarData(dataString: string | Date) {
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const traduzirStatusPedido = (status: string): string => {
    const statusMap: Record<string, string> = {
      PENDENTE: t("logs.status_pedido.PENDENTE"),
      PROCESSANDO: t("logs.status_pedido.PROCESSANDO"),
      CONCLUIDO: t("logs.status_pedido.CONCLUIDO"),
      CANCELADO: t("logs.status_pedido.CANCELADO"),
    };
    return statusMap[status] || status;
  };

  const mudarPagina = async (novaPagina: number) => {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;

    setCarregando(true);
    setPaginaAtual(novaPagina);

    try {
      if (empresaId) {
        const tipoParaFiltro = filtroTipo === "todos" ? undefined : filtroTipo;
        const buscaParaFiltro = busca.trim() === "" ? undefined : busca;
        if (tipoParaFiltro || buscaParaFiltro) {
          const logsData = await carregarLogsComFiltro(novaPagina, empresaId, tipoParaFiltro, buscaParaFiltro);
          await carregarNomesUsuarios(logsData);
        } else {
          const logsData = await carregarLogsComFiltro(novaPagina, empresaId, tipoParaFiltro, buscaParaFiltro);
          await carregarNomesUsuarios(logsData);
        }
      }
    } catch (error) {
      console.error("Erro ao mudar página:", error);
    } finally {
      setCarregando(false);
    }
  };

  const aplicarFiltroTipo = async (tipo: TipoFiltro) => {
    if (!dadosIniciaisCarregados) {
      return;
    }

    setCarregandoFiltro(true);
    setFiltroTipo(tipo);
    setPaginaAtual(1);
    setMenuFiltrosAberto(false);

    try {
      if (empresaId) {
        const tipoParaFiltro = tipo === "todos" ? undefined : tipo;
        const buscaParaFiltro = busca.trim() === "" ? undefined : busca;

        const logsData = await carregarLogsComFiltro(1, empresaId, tipoParaFiltro, buscaParaFiltro);
        await carregarNomesUsuarios(logsData);
      }
    } catch (error) {
      console.error("Erro ao aplicar filtro:", error);
    } finally {
      setCarregandoFiltro(false);
    }
  };

  const aplicarBusca = async () => {
    if (!dadosIniciaisCarregados) {
      return;
    }

    setCarregandoFiltro(true);
    setPaginaAtual(1);

    try {
      if (empresaId) {
        const tipoParaFiltro = filtroTipo === "todos" ? undefined : filtroTipo;
        const buscaParaFiltro = busca.trim() === "" ? undefined : busca;

        const logsData = await carregarLogsComFiltro(1, empresaId, tipoParaFiltro, buscaParaFiltro);
        await carregarNomesUsuarios(logsData);
      }
    } catch (error) {
      console.error("Erro ao aplicar busca:", error);
    } finally {
      setCarregandoFiltro(false);
    }
  };

  const limparFiltros = async () => {
    setCarregandoFiltro(true);
    setFiltroTipo("todos");
    setBusca("");
    setPaginaAtual(1);

    try {
      if (empresaId) {
        const logsData = await carregarLogsComFiltro(1, empresaId);
        await carregarNomesUsuarios(logsData);
      }
    } catch (error) {
      console.error("Erro ao limpar filtros:", error);
    } finally {
      setCarregandoFiltro(false);
    }
  };

  const bgGradient = modoDark
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200";

  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";
  const bgSelected = modoDark ? "bg-blue-500/20" : "bg-blue-100";


  if (!temPermissao) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center px-4`}>
        <div className="text-center">
          <div className={`w-24 h-24 mx-auto mb-6 ${modoDark ? "bg-red-500/20" : "bg-red-100"} rounded-full flex items-center justify-center`}>
            <FaExclamationTriangle className={`text-3xl ${modoDark ? "text-red-400" : "text-red-500"}`} />
          </div>
          <h1 className={`text-2xl font-bold ${textPrimary} mb-4`}>{t("acessoRestrito")}</h1>
          <p className={textSecondary}>{t("acessoRestritoMensagem")}</p>
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
                  {t("logs.titulo")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{t("logs.registros")}</span>
                </h1>
                <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>{t("logs.subtitulo")}</p>
              </div>
            </section>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: t("logs.total"),
                  value: totalLogs,
                  icon: FaInfoCircle,
                  color: "from-blue-500 to-cyan-500",
                  bgColor: modoDark ? "bg-blue-500/10" : "bg-blue-50",
                },
                {
                  label: t("logs.tipos_logs.CRIACAO"),
                  value: stats.criacao,
                  icon: FaPlus,
                  color: "from-green-500 to-emerald-500",
                  bgColor: modoDark ? "bg-green-500/10" : "bg-green-50",
                },
                {
                  label: t("logs.tipos_logs.ATUALIZACAO"),
                  value: stats.atualizacao,
                  icon: FaSync,
                  color: "from-yellow-500 to-orange-500",
                  bgColor: modoDark ? "bg-yellow-500/10" : "bg-yellow-50",
                },
                {
                  label: t("logs.tipos_logs.EXCLUSAO"),
                  value: stats.exclusao,
                  icon: FaTrash,
                  color: "from-red-500 to-pink-500",
                  bgColor: modoDark ? "bg-red-500/10" : "bg-red-50",
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

            <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                <div className="relative flex-1 max-w-md">
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                  <div className={`relative flex items-center ${bgCard} rounded-xl px-4 py-3 border ${borderColor} backdrop-blur-sm`}>
                    <FaSearch className={`${modoDark ? "text-blue-400" : "text-blue-500"} mr-3 text-sm`} />
                    <input
                      type="text"
                      placeholder={dadosIniciaisCarregados ? t("logs.placeholder_busca") : "Carregando..."}
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && dadosIniciaisCarregados) {
                          aplicarBusca();
                        }
                      }}
                      disabled={!dadosIniciaisCarregados}
                      className={`bg-transparent border-none outline-none ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} w-full text-sm ${!dadosIniciaisCarregados ? 'opacity-50' : ''}`}
                    />
                    <button
                      onClick={aplicarBusca}
                      className={`ml-2 p-1 rounded-lg ${modoDark ? "bg-blue-500/20 hover:bg-blue-500/30" : "bg-blue-100 hover:bg-blue-200"} transition-all duration-300`}
                    >
                      <FaSearch className={`text-sm ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {!dadosIniciaisCarregados && (
                    <div className={`px-3 py-2 ${modoDark ? "bg-yellow-500/20" : "bg-yellow-50"} border ${modoDark ? "border-yellow-500/30" : "border-yellow-200"} rounded-xl ${modoDark ? "text-yellow-400" : "text-yellow-600"} text-sm`}>
                      {t("logs.carregando")}
                    </div>
                  )}

                  <div className="relative" ref={menuFiltrosRef}>
                    <button
                      onClick={() => {
                        if (!dadosIniciaisCarregados) return;
                        setMenuFiltrosAberto(!menuFiltrosAberto);
                      }}
                      disabled={!dadosIniciaisCarregados}
                      className={`flex items-center gap-3 ${bgCard} ${bgHover} border cursor-pointer ${borderColor} rounded-xl px-4 py-3 transition-all duration-300 backdrop-blur-sm min-w-[140px] justify-center ${!dadosIniciaisCarregados ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FaFilter className={modoDark ? "text-blue-400" : "text-blue-500"} />
                      <span className={`${textPrimary} text-sm`}>
                        {filtroTipo === "todos" ? t("logs.todos_tipos") : t(`logs.tipos_logs.${filtroTipo}`)}
                      </span>
                      <FaChevronDown className={`${modoDark ? "text-blue-400" : "text-blue-500"} transition-transform duration-300 text-xs ${menuFiltrosAberto ? "rotate-180" : ""}`} />
                    </button>

                    {menuFiltrosAberto && (
                      <div className={`absolute top-full left-0 mt-2 w-64 ${modoDark ? "bg-slate-800/95" : "bg-white/95"} border ${borderColor} rounded-xl shadow-2xl ${modoDark ? "shadow-blue-500/20" : "shadow-blue-200"} z-50 overflow-hidden backdrop-blur-sm`}>
                        <div className="p-3">
                          <div className={`text-sm font-semibold ${textPrimary} mb-2`}>{t("logs.tipos_logs.titulo")}</div>
                          <div className="space-y-1">
                            {["todos", "CRIACAO", "ATUALIZACAO", "EXCLUSAO", "BAIXA", "EMAIL_ENVIADO"].map((tipo) => (
                              <button
                                key={tipo}
                                onClick={() => aplicarFiltroTipo(tipo as TipoFiltro)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm ${filtroTipo === tipo ? `${bgSelected} text-blue-600 font-medium` : `${bgHover} ${textPrimary}`}`}
                              >
                                {tipo === "todos" ? t("logs.todos_tipos") : t(`logs.tipos_logs.${tipo}`)}
                              </button>
                            ))}
                          </div>
                          {(filtroTipo !== "todos" || busca) && (
                            <button onClick={limparFiltros} className={`w-full mt-2 px-3 py-2 ${modoDark ? "bg-red-500/10 hover:bg-red-500/20" : "bg-red-50 hover:bg-red-100"} border ${modoDark ? "border-red-500/30" : "border-red-200"} rounded-lg ${modoDark ? "text-red-400" : "text-red-500"} transition-all duration-300 text-xs font-medium`}>
                              {t("logs.limpar_filtros")}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {(filtroTipo !== "todos" || busca) && (
                    <button onClick={limparFiltros} className={`px-4 cursor-pointer py-3 ${modoDark ? "bg-red-500/10 hover:bg-red-500/20" : "bg-red-50 hover:bg-red-100"} border ${modoDark ? "border-red-500/30" : "border-red-200"} rounded-xl ${modoDark ? "text-red-400" : "text-red-500"} transition-all duration-300 flex items-center gap-2 text-sm`}>
                      <FaTimes className="text-xs" />
                      {t("logs.limpar")}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-slate-500">
                  {totalLogs} {t("logs.registros")}
                </div>

                {totalPaginas > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-6">
                    <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1} className={`p-2 cursor-pointer rounded-xl transition-all duration-300 ${paginaAtual === 1 ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed` : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105`}`}>
                      <FaAngleLeft className="text-sm" />
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPaginas)].map((_, index) => {
                        const pagina = index + 1;
                        const mostrarPagina = pagina === 1 || pagina === totalPaginas || (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1);

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
                          <button key={pagina} onClick={() => mudarPagina(pagina)} className={`px-3 cursor-pointer py-1 rounded-xl transition-all duration-300 text-sm ${pagina === paginaAtual ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-105" : `${bgCard} ${bgHover} ${textPrimary} border ${borderColor} hover:scale-105`}`}>
                            {pagina}
                          </button>
                        );
                      })}
                    </div>

                    <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} className={`p-2  cursor-pointer rounded-xl transition-all duration-300 ${paginaAtual === totalPaginas ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed` : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105`}`}>
                      <FaAngleRight className="text-sm" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {(carregando || carregandoFiltro) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className={`${bgCard} rounded-xl p-4 animate-pulse border ${borderColor}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded-full`}></div>
                      <div className="flex-1">
                        <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-3 mb-2`}></div>
                        <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-2 w-2/3`}></div>
                      </div>
                    </div>
                    <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-3 mb-2`}></div>
                    <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-2 mb-1`}></div>
                    <div className={`${modoDark ? "bg-slate-700" : "bg-slate-200"} rounded h-2 w-3/4`}></div>
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-24 h-24 mx-auto mb-4 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
                  <FaInfoCircle className={`text-2xl ${textMuted}`} />
                </div>
                <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{t("logs.nenhum_log_encontrado")}</h3>
                <p className={`${textMuted} mb-4 text-sm`}>{t("logs.nenhum_log_mensagem")}</p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <div className={`${bgCard} border ${borderColor} rounded-xl overflow-hidden backdrop-blur-sm`}>
                    <div className="grid grid-cols-12 gap-4 p-4 border-b" style={{ borderColor: temaAtual.borda }}>
                      <div className="col-span-3 font-semibold text-sm" style={{ color: temaAtual.texto }}>{t("logs.usuario")}</div>
                      <div className="col-span-2 font-semibold text-sm text-center" style={{ color: temaAtual.texto }}>{t("logs.tipo")}</div>
                      <div className="col-span-5 font-semibold text-sm" style={{ color: temaAtual.texto }}>{t("logs.descricao")}</div>
                      <div className="col-span-2 font-semibold text-sm text-center" style={{ color: temaAtual.texto }}>{t("logs.datacriacao")}</div>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto">
                      {logs.map((log, index) => (
                        <div
                          key={log.id}
                          className={`grid grid-cols-12 gap-4 p-4 border-b transition-all duration-300 group ${modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                            }`}
                          style={{ borderColor: temaAtual.borda, animationDelay: `${index * 50}ms` }}
                        >
                          <div className="col-span-3 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTipoLogBgColor(log.tipo)}`}>
                              <FaUser className={`text-sm ${modoDark ? "text-gray-300" : "text-gray-600"}`} />
                            </div>
                            <div>
                              <div className="font-medium text-sm" style={{ color: temaAtual.texto }}>
                                {log.usuarioId ? nomesUsuarios[log.usuarioId] || t("logs.carregando") : t("logs.usuario_nao_informado")}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center justify-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTipoLogColor(log.tipo)} text-white`}>
                              {traduzirTipoLog(log.tipo)}
                            </span>
                          </div>
                          <div className="col-span-5 flex items-center">
                            <div className="flex items-center gap-3">
                              <FaInfoCircle className="text-blue-400 text-sm flex-shrink-0" />
                              <span className="line-clamp-2">{formatarDescricao(log.descricao)}</span>
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center justify-center text-sm" style={{ color: temaAtual.placeholder }}>
                            {formatarData(log.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:hidden space-y-3">
                  {logs.map((log, index) => (
                    <div
                      key={log.id}
                      className={`group ${modoDark
                        ? "bg-gradient-to-br from-blue-500/5 to-cyan-500/5"
                        : "bg-gradient-to-br from-blue-100/30 to-cyan-100/30"
                        } rounded-xl border ${modoDark
                          ? "border-blue-500/20 hover:border-blue-500/40"
                          : "border-blue-200 hover:border-blue-300"
                        } p-4 transition-all duration-500 card-hover backdrop-blur-sm`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTipoLogBgColor(log.tipo)}`}>
                          <FaUser className={`text-base ${modoDark ? "text-gray-300" : "text-gray-600"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1" style={{ color: temaAtual.texto }}>
                            {log.usuarioId ? nomesUsuarios[log.usuarioId] || t("logs.carregando") : t("logs.usuario_nao_informado")}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTipoLogColor(log.tipo)} text-white`}>
                            {traduzirTipoLog(log.tipo)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex items-center gap-2 text-sm mb-2" style={{ color: temaAtual.placeholder }}>
                          <FaCalendarAlt className="text-xs" />
                          {formatarData(log.createdAt)}
                        </div>
                        <div className="text-sm" style={{ color: temaAtual.texto }}>
                          <div className="flex items-center gap-2">
                            <FaInfoCircle className="text-blue-400 text-sm flex-shrink-0" />
                            <span className="line-clamp-2">{formatarDescricao(log.descricao)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}