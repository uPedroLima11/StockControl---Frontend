import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowUp, FaArrowDown, FaUser, FaBox, FaAngleLeft, FaAngleRight, FaFilter, FaCalendar, FaSearch } from "react-icons/fa";

interface MovimentacaoEstoque {
  id: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  motivo: string;
  observacao?: string;
  createdAt: string;
  usuario: { nome: string };
  venda?: { cliente?: { nome: string } };
}

interface HistoricoEstoqueProps {
  produtoId: number;
  modoDark: boolean;
  mostrarFiltros?: boolean;
}

type FiltroTipo = "TODOS" | "ENTRADA" | "SAIDA";

export default function HistoricoEstoque({ produtoId, modoDark, mostrarFiltros = true }: HistoricoEstoqueProps) {
  const { t: tEstoque } = useTranslation("estoque");
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("TODOS");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [busca, setBusca] = useState("");
  const itensPorPagina = 10;

  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  const traduzirObservacao = (observacao: string) => {
    const padroesTraducao: Record<string, { pt: string; en: string }> = {
      'Entrada por pedido': {
        pt: 'Entrada por pedido',
        en: 'Order entry'
      },
      'Cancelamento do pedido': {
        pt: 'Cancelamento do pedido',
        en: 'Order cancellation'
      },
      'Venda realizada': {
        pt: 'Venda realizada',
        en: 'Sale completed'
      },
      'Ajuste de estoque': {
        pt: 'Ajuste de estoque',
        en: 'Stock adjustment'
      }
    };

    const lang = (typeof window !== "undefined" && window.localStorage.getItem("i18nextLng")) || "pt";
    let observacaoTraduzida = observacao;

    Object.entries(padroesTraducao).forEach(([pt, traducoes]) => {
      if (observacao.includes(pt)) {
        observacaoTraduzida = observacao.replace(
          pt,
          traducoes[lang as "pt" | "en"] || pt
        );
      }
    });

    return observacaoTraduzida;
  };

  useEffect(() => {
    const carregarMovimentacoes = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;

      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/movimentacoes-estoque/produto/${produtoId}`,
          {
            headers: {
              "user-id": usuarioValor,
            }
          }
        );

        if (response.ok) {
          const dados: MovimentacaoEstoque[] = await response.json();

          const ordenado = dados.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setMovimentacoes(ordenado);
        } else {
          console.error("Erro ao carregar movimentações:", response.status);
          setMovimentacoes([]);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        setMovimentacoes([]);
      } finally {
        setCarregando(false);
      }
    };

    carregarMovimentacoes();
  }, [produtoId]);

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    if (filtroTipo !== "TODOS" && mov.tipo !== filtroTipo) {
      return false;
    }

    if (dataInicio || dataFim) {
      const dataMov = new Date(mov.createdAt);
      const inicio = dataInicio ? new Date(dataInicio) : null;
      const fim = dataFim ? new Date(dataFim + "T23:59:59") : null;

      if (inicio && dataMov < inicio) return false;
      if (fim && dataMov > fim) return false;
    }

    if (busca) {
      const termo = busca.toLowerCase();
      return (
        mov.motivo.toLowerCase().includes(termo) ||
        mov.usuario.nome.toLowerCase().includes(termo) ||
        (mov.observacao && mov.observacao.toLowerCase().includes(termo))
      );
    }

    return true;
  });

  const estatisticas = {
    totalEntradas: movimentacoesFiltradas.filter(m => m.tipo === "ENTRADA").reduce((acc, m) => acc + m.quantidade, 0),
    totalSaidas: movimentacoesFiltradas.filter(m => m.tipo === "SAIDA").reduce((acc, m) => acc + m.quantidade, 0),
    totalMovimentacoes: movimentacoesFiltradas.length,
    saldo: movimentacoesFiltradas.reduce((acc, m) =>
      m.tipo === "ENTRADA" ? acc + m.quantidade : acc - m.quantidade, 0
    )
  };

  if (carregando) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className={`p-4 rounded-xl border ${borderColor} ${bgCard} animate-pulse`}>
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <div className={`h-4 rounded ${modoDark ? "bg-slate-700" : "bg-slate-200"} w-1/3`}></div>
                <div className={`h-3 rounded ${modoDark ? "bg-slate-700" : "bg-slate-200"} w-1/2`}></div>
              </div>
              <div className={`h-3 rounded ${modoDark ? "bg-slate-700" : "bg-slate-200"} w-16`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalPaginas = Math.max(1, Math.ceil(movimentacoesFiltradas.length / itensPorPagina));
  const indexInicial = (paginaAtual - 1) * itensPorPagina;
  const paginaItens = movimentacoesFiltradas.slice(indexInicial, indexInicial + itensPorPagina);

  const getEventoIcone = (tipo: "ENTRADA" | "SAIDA") => {
    return tipo === "ENTRADA" ?
      <FaArrowUp className="text-green-500" /> :
      <FaArrowDown className="text-red-500" />;
  };

  const getEventoCor = (tipo: "ENTRADA" | "SAIDA") => {
    return tipo === "ENTRADA" ? "text-green-600" : "text-red-600";
  };

  const traduzirMotivo = (motivo: string) => {
    const motivosTraducao: Record<string, string> = {
      'VENDA': tEstoque("motivos.venda"),
      'PEDIDO': tEstoque("motivos.pedido"),
      'AJUSTE': tEstoque("motivos.ajuste"),
      'DEVOLUCAO': tEstoque("motivos.devolucao"),
      'PERDA': tEstoque("motivos.perda"),
      'OUTRO': tEstoque("motivos.outro"),
      'COMPRA': tEstoque("motivos.compra"),
      'PEDIDO_CONCLUIDO': tEstoque("motivos.pedido_concluido"),
      'PEDIDO_CANCELADO': tEstoque("motivos.pedido_cancelado")
    };

    return motivosTraducao[motivo] || motivo;
  };

  const limparFiltros = () => {
    setFiltroTipo("TODOS");
    setDataInicio("");
    setDataFim("");
    setBusca("");
    setPaginaAtual(1);
  };

  return (
    <div className="space-y-4">
       {mostrarFiltros && (
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h3 className={`font-semibold ${textPrimary} text-lg`}>
          {tEstoque("historicoTitulo")} ({movimentacoesFiltradas.length})
        </h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className={`px-3 py-1 rounded-full ${modoDark ? "bg-green-500/20" : "bg-green-100"} border ${modoDark ? "border-green-500/30" : "border-green-200"}`}>
            <span className="text-green-600 font-semibold">+{estatisticas.totalEntradas}</span>
            <span className={textMuted}> {tEstoque("estatisticas.entradas")}</span>
          </div>
          <div className={`px-3 py-1 rounded-full ${modoDark ? "bg-red-500/20" : "bg-red-100"} border ${modoDark ? "border-red-500/30" : "border-red-200"}`}>
            <span className="text-red-600 font-semibold">-{estatisticas.totalSaidas}</span>
            <span className={textMuted}> {tEstoque("estatisticas.saidas")}</span>
          </div>
          <div className={`px-3 py-1 rounded-full ${modoDark ? "bg-blue-500/20" : "bg-blue-100"} border ${modoDark ? "border-blue-500/30" : "border-blue-200"}`}>
            <span className={`font-semibold ${estatisticas.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
              {estatisticas.saldo >= 0 ? "+" : ""}{estatisticas.saldo}
            </span>
            <span className={textMuted}> {tEstoque("estatisticas.saldo")}</span>
          </div>
        </div>
      </div>
       )}
       {mostrarFiltros && (
        <div className={`p-4 rounded-xl border ${borderColor} ${bgCard} backdrop-blur-sm`}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                <FaFilter className="inline mr-1" size={12} />
                {tEstoque("filtros.tipo")}
              </label>
              <div className="flex gap-1">
                {(["TODOS", "ENTRADA", "SAIDA"] as FiltroTipo[]).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => {
                      setFiltroTipo(tipo);
                      setPaginaAtual(1);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs transition-all duration-300 ${filtroTipo === tipo
                        ? tipo === "ENTRADA"
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                          : tipo === "SAIDA"
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                            : "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                        : `${bgCard} ${bgHover} ${textPrimary} border ${borderColor}`
                      }`}
                  >
                    {tEstoque(`filtros.${tipo.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                <FaCalendar className="inline mr-1" size={12} />
                {tEstoque("filtros.periodo")}
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => {
                    setDataInicio(e.target.value);
                    setPaginaAtual(1);
                  }}
                  className={`flex-1 p-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm`}
                />
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => {
                    setDataFim(e.target.value);
                    setPaginaAtual(1);
                  }}
                  className={`flex-1 p-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm`}
                />
              </div>
            </div>

            <div className="flex-1">
              <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                <FaSearch className="inline mr-1" size={12} />
                {tEstoque("buscar")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={tEstoque("buscarPlaceholder")}
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setPaginaAtual(1);
                  }}
                  className={`w-full p-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm pr-8`}
                />
                {busca && (
                  <button
                    onClick={() => setBusca("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
          {(filtroTipo !== "TODOS" || dataInicio || dataFim || busca) && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={limparFiltros}
                className={`px-3 py-1 text-xs rounded-lg border ${borderColor} ${bgHover} ${textPrimary} transition-all duration-300 hover:scale-105 cursor-pointer`}
              >
                {tEstoque("limparFiltros")}
              </button>
            </div>
          )}
        </div>
      )}
      <div className="space-y-3">
        {paginaItens.map((movimentacao) => (
          <div
            key={movimentacao.id}
            className={`group p-4 rounded-xl border ${borderColor} ${bgCard} transition-all duration-300 backdrop-blur-sm hover:scale-105 cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${modoDark ? "bg-slate-700/50" : "bg-slate-100"} mt-1`}>
                {getEventoIcone(movimentacao.tipo)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-semibold text-sm ${getEventoCor(movimentacao.tipo)}`}>
                    {movimentacao.tipo === "ENTRADA" ? "+" : "-"}{movimentacao.quantidade} {tEstoque("unidades")}
                  </span>
                  <span className={`text-xs ${textMuted} whitespace-nowrap ml-2`}>
                    {new Date(movimentacao.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                <div className={`text-xs mb-1 ${textMuted}`}>
                  <strong>{tEstoque("motivo")}:</strong>{" "}
                  {traduzirMotivo(movimentacao.motivo)}
                </div>

                <div className={`text-xs ${textMuted} flex items-center gap-1`}>
                  <FaUser className="text-xs" />
                  <strong>{tEstoque("por")}:</strong> {movimentacao.usuario?.nome || tEstoque("usuario_nao_informado")}
                </div>

                {movimentacao.observacao && (
                  <div className={`text-xs italic mt-2 ${textMuted} p-2 rounded-lg ${modoDark ? "bg-slate-700/30" : "bg-slate-100"}`}>
                    {traduzirObservacao(movimentacao.observacao)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {movimentacoesFiltradas.length === 0 && (
          <div className={`text-center py-8 ${textMuted} rounded-xl border ${borderColor} ${bgCard}`}>
            <FaBox className="text-4xl mx-auto mb-3 opacity-50" />
            <p>{tEstoque("nenhumaMovimentacao")}</p>
            <p className="text-xs mt-2">{tEstoque("nenhumaMovimentacaoDescricao")}</p>
            {(filtroTipo !== "TODOS" || dataInicio || dataFim || busca) && (
              <button
                onClick={limparFiltros}
                className={`mt-3 px-4 py-2 text-sm rounded-lg border ${borderColor} ${bgHover} ${textPrimary} transition-all duration-300 hover:scale-105 cursor-pointer`}
              >
                {tEstoque("limparFiltros")}
              </button>
            )}
          </div>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPaginaAtual(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === 1
              ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed`
              : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105 cursor-pointer`
              }`}
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
                  onClick={() => setPaginaAtual(pagina)}
                  className={`px-3 py-1 rounded-xl transition-all duration-300 text-sm cursor-pointer ${pagina === paginaAtual
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-105"
                    : `${bgCard} ${bgHover} ${textPrimary} border ${borderColor} hover:scale-105`
                    }`}
                >
                  {pagina}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPaginaAtual(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className={`p-2 rounded-xl transition-all duration-300 ${paginaAtual === totalPaginas
              ? `${modoDark ? "bg-slate-800/30" : "bg-slate-100"} ${textMuted} cursor-not-allowed`
              : `${modoDark ? "bg-blue-500/10 hover:bg-blue-500/20" : "bg-blue-50 hover:bg-blue-100"} ${textPrimary} border ${borderColor} hover:scale-105 cursor-pointer`
              }`}
          >
            <FaAngleRight className="text-sm" />
          </button>
        </div>
      )}
    </div>
  );
}