"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaHistory, FaBox, FaCheck, FaTimes, FaFilter, FaCalendar, FaChartLine, FaArrowUp, FaArrowDown, FaExchangeAlt } from "react-icons/fa";
import HistoricoEstoque from "@/components/HistoricoEstoque";
import Cookies from "js-cookie";
import { cores } from "@/utils/cores";
import { useTranslation } from "react-i18next";

interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  quantidadeMin: number;
  foto?: string;
}

type CampoOrdenacao = "nome" | "quantidade" | "status" | "none";
type DirecaoOrdenacao = "asc" | "desc";

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [modoDark, setModoDark] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "BAIXO">("TODOS");
  const [permissoesUsuario, setPermissoesUsuario] = useState<Record<string, boolean>>({});
  const [carregando, setCarregando] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [campoOrdenacao] = useState<CampoOrdenacao>("none");
  const [direcaoOrdenacao] = useState<DirecaoOrdenacao>("desc");
  const { t } = useTranslation("estoque");

  const temaAtual = modoDark ? cores.dark : cores.light;

  const usuarioTemPermissao = async (permissaoChave: string): Promise<boolean> => {
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return false;

      const usuarioId = usuarioSalvo.replace(/"/g, "");
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/tem-permissao/${permissaoChave}`, {
        headers: {
          "user-id": usuarioId,
        },
      });

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

  const podeVisualizar = tipoUsuario === "PROPRIETARIO" || permissoesUsuario.inventario_visualizar;

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }

    const carregarPermissoes = async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;

      const usuarioId = usuarioSalvo.replace(/"/g, "");

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuarioId}/permissoes`, {
          headers: {
            "user-id": usuarioId,
          },
        });

        if (response.ok) {
          const dados: { permissoes: { chave: string; concedida: boolean }[]; permissoesPersonalizadas: boolean } = await response.json();

          const permissoesUsuarioObj: Record<string, boolean> = {};
          dados.permissoes.forEach((permissao) => {
            permissoesUsuarioObj[permissao.chave] = permissao.concedida;
          });

          setPermissoesUsuario(permissoesUsuarioObj);
        } else {
          const permissoesParaVerificar = ["inventario_visualizar"];

          const permissoes: Record<string, boolean> = {};

          for (const permissao of permissoesParaVerificar) {
            const temPermissao = await usuarioTemPermissao(permissao);
            permissoes[permissao] = temPermissao;
          }

          setPermissoesUsuario(permissoes);
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      }
    };

    const carregarTemaEProdutos = async () => {
      const temaSalvo = localStorage.getItem("modoDark");
      setModoDark(temaSalvo === "true");

      try {
        const usuarioSalvo = localStorage.getItem("client_key");
        if (!usuarioSalvo) return;

        const usuarioValor = usuarioSalvo.replace(/"/g, "");
        const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
        const usuario = await responseUsuario.json();
        setTipoUsuario(usuario.tipo);
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        const todosProdutos: (Produto & { empresaId: number })[] = await response.json();

        const produtosDaEmpresa = todosProdutos
          .filter((p) => p.empresaId === usuario.empresaId)
          .map((p) => ({
            id: p.id,
            nome: p.nome,
            quantidade: p.quantidade,
            quantidadeMin: p.quantidadeMin,
            foto: p.foto,
          }));

        setProdutos(produtosDaEmpresa);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarPermissoes();
    carregarTemaEProdutos();
  }, []);

  const getStatusInfo = (produto: Produto) => {
    if (produto.quantidade < produto.quantidadeMin) {
      return {
        cor: modoDark ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-100 text-red-800 border-red-200",
        icone: <FaTimes className="text-sm" />,
        texto: t("status.critico")
      };
    } else if (produto.quantidade < produto.quantidadeMin + 5) {
      return {
        cor: modoDark ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-yellow-100 text-yellow-800 border-yellow-200",
        icone: <FaBox className="text-sm" />,
        texto: t("status.baixo")
      };
    } else {
      return {
        cor: modoDark ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-100 text-green-800 border-green-200",
        icone: <FaCheck className="text-sm" />,
        texto: t("status.normal")
      };
    }
  };

  const ordenarProdutos = (produtos: Produto[], campo: CampoOrdenacao, direcao: DirecaoOrdenacao) => {
    if (campo === "none") return [...produtos];

    return [...produtos].sort((a, b) => {
      let valorA, valorB;

      switch (campo) {
        case "nome":
          valorA = a.nome.toLowerCase();
          valorB = b.nome.toLowerCase();
          break;
        case "quantidade":
          valorA = a.quantidade;
          valorB = b.quantidade;
          break;
        case "status":
          const statusA = getStatusInfo(a).texto;
          const statusB = getStatusInfo(b).texto;
          valorA = statusA;
          valorB = statusB;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) {
        return direcao === "asc" ? -1 : 1;
      }
      if (valorA > valorB) {
        return direcao === "asc" ? 1 : -1;
      }
      return 0;
    });
  };


  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase()) &&
    (filtroTipo === "TODOS" || produto.quantidade < produto.quantidadeMin + 5)
  );

  const produtosOrdenados = ordenarProdutos(produtosFiltrados, campoOrdenacao, direcaoOrdenacao);

  const bgGradient = modoDark
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200";

  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  const estatisticasGerais = {
    totalProdutos: produtos.length,
    estoqueBaixo: produtos.filter(p => p.quantidade < p.quantidadeMin + 5 && p.quantidade >= p.quantidadeMin).length,
    estoqueCritico: produtos.filter(p => p.quantidade < p.quantidadeMin).length,
    estoqueNormal: produtos.filter(p => p.quantidade >= p.quantidadeMin + 5).length
  };

  if (carregando) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={textPrimary}>{t("carregando", { ns: "vendas" })}</p>
        </div>
      </div>
    );
  }

  if (!podeVisualizar) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center px-4`}>
        <div className="text-center">
          <div className={`w-24 h-24 mx-auto mb-6 ${modoDark ? "bg-red-500/20" : "bg-red-100"} rounded-full flex items-center justify-center`}>
            <FaTimes className={`text-3xl ${modoDark ? "text-red-400" : "text-red-500"}`} />
          </div>
          <h1 className={`text-2xl font-bold ${textPrimary} mb-4`}>{t("acessoRestrito")}</h1>
          <p className={textSecondary}>{t("semPermissaoVisualizar", { ns: "vendas" })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient}`}>
      <div className="px-4 sm:px-6 py-8 w-full max-w-7xl mx-auto">
        <section className={`relative py-8 rounded-3xl mb-6 overflow-hidden ${bgCard} backdrop-blur-sm border ${borderColor}`}>
          <div className="absolute inset-0">
            <div className={`absolute top-0 left-10 w-32 h-32 ${modoDark ? "bg-blue-500/20" : "bg-blue-200/50"} rounded-full blur-3xl animate-float`}></div>
            <div className={`absolute bottom-0 right-10 w-48 h-48 ${modoDark ? "bg-slate-700/20" : "bg-slate-300/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "2s" }}></div>
            <div className={`absolute top-1/2 left-1/2 w-24 h-24 ${modoDark ? "bg-cyan-500/20" : "bg-cyan-200/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "4s" }}></div>
          </div>

          <div className="relative z-10 text-center">
            <h1 className={`text-3xl md:text-4xl font-bold ${textPrimary} mb-3`}>
              {t("tituloRelatorioEstoque")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{t("historicoMovimentacoes")}</span>
            </h1>
            <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>
              {t("subtituloHistorico") || "Acompanhe todo o histórico de movimentações do seu estoque"}
            </p>
          </div>
        </section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="gradient-border animate-fade-in-up">
            <div className={`p-4 rounded-[15px] ${bgCard} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-1`}>
                    {estatisticasGerais.totalProdutos}
                  </div>
                  <div className={textMuted}>{t("estatisticas.totalProdutos")}</div>
                </div>
                <div className={`p-2 rounded-lg ${modoDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                  <FaBox className={`text-xl bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent`} />
                </div>
              </div>
            </div>
          </div>

          <div className="gradient-border animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className={`p-4 rounded-[15px] ${bgCard} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-1`}>
                    {estatisticasGerais.estoqueNormal}
                  </div>
                  <div className={textMuted}>{t("estatisticas.estoqueNormal")}</div>
                </div>
                <div className={`p-2 rounded-lg ${modoDark ? "bg-green-500/10" : "bg-green-50"}`}>
                  <FaCheck className={`text-xl bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent`} />
                </div>
              </div>
            </div>
          </div>

          <div className="gradient-border animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className={`p-4 rounded-[15px] ${bgCard} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent mb-1`}>
                    {estatisticasGerais.estoqueBaixo}
                  </div>
                  <div className={textMuted}>{t("estatisticas.estoqueBaixo")}</div>
                </div>
                <div className={`p-2 rounded-lg ${modoDark ? "bg-yellow-500/10" : "bg-yellow-50"}`}>
                  <FaBox className={`text-xl bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent`} />
                </div>
              </div>
            </div>
          </div>

          <div className="gradient-border animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className={`p-4 rounded-[15px] ${bgCard} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-1`}>
                    {estatisticasGerais.estoqueCritico}
                  </div>
                  <div className={textMuted}>{t("estatisticas.estoqueCritico")}</div>
                </div>
                <div className={`p-2 rounded-lg ${modoDark ? "bg-red-500/10" : "bg-red-50"}`}>
                  <FaTimes className={`text-xl bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-2xl ${bgCard} border ${borderColor} backdrop-blur-sm`}>
              <h2 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                <FaBox />
                {t("produtos")}
              </h2>
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 transition-opacity duration-300`}></div>
                  <div className={`relative flex items-center ${bgCard} rounded-xl px-4 py-3 border ${borderColor} backdrop-blur-sm`}>
                    <FaSearch className={`${modoDark ? "text-blue-400" : "text-blue-500"} mr-3 text-sm`} />
                    <input
                      type="text"
                      placeholder={t("buscarProduto")}
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className={`bg-transparent border-none outline-none ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"} w-full text-sm`}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setFiltroTipo("TODOS")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${filtroTipo === "TODOS"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                        : `${bgCard} ${bgHover} ${textPrimary} border ${borderColor}`
                      }`}
                  >
                    {t("todosProdutos")}
                  </button>
                  <button
                    onClick={() => setFiltroTipo("BAIXO")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${filtroTipo === "BAIXO"
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/25"
                        : `${bgCard} ${bgHover} ${textPrimary} border ${borderColor}`
                      }`}
                  >
                    {t("estoqueBaixo1")}
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {produtosOrdenados.map((produto) => {
                  const statusInfo = getStatusInfo(produto);
                  return (
                    <div
                      key={produto.id}
                      onClick={() => setProdutoSelecionado(produto.id)}
                      className={`group p-4 rounded-xl border ${borderColor} transition-all duration-300 cursor-pointer backdrop-blur-sm transform-gpu ${produtoSelecionado === produto.id
                          ? "ring-2 ring-blue-500 bg-blue-500/10"
                          : `${bgCard} ${bgHover} hover:scale-[1.02]`
                        }`}
                      style={{
                        transform: 'translateZ(0)', 
                        backfaceVisibility: 'hidden', 
                        willChange: 'transform' 
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${modoDark ? "bg-blue-500/20" : "bg-blue-100"} flex-shrink-0`}>
                            <FaBox className={`text-sm ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold ${textPrimary} text-sm truncate`}>
                              {produto.nome}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs font-medium ${produto.quantidade < produto.quantidadeMin
                                  ? "text-red-500"
                                  : produto.quantidade < produto.quantidadeMin + 5
                                    ? "text-yellow-500"
                                    : "text-green-500"
                                }`}>
                                {produto.quantidade} {t("unidades")}
                              </span>
                              {produto.quantidadeMin > 0 && (
                                <span className={`text-xs ${textMuted}`}>
                                  • Mín: {produto.quantidadeMin}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`status-badge border ${statusInfo.cor} inline-flex items-center gap-1 text-xs px-2 py-1 flex-shrink-0 ml-2`}>
                          {statusInfo.icone}
                          {statusInfo.texto}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {produtosOrdenados.length === 0 && (
                  <div className="text-center py-8">
                    <FaBox className={`text-4xl ${textMuted} mx-auto mb-3 opacity-50`} />
                    <p className={textMuted}>{t("nenhumProdutoEncontrado")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className={`p-6 rounded-2xl ${bgCard} border ${borderColor} backdrop-blur-sm h-full flex flex-col`}>
              {produtoSelecionado ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                      <FaHistory />
                      {t("historicoMovimentacoes")}
                    </h2>
                    <div className={`px-3 py-1 rounded-full text-xs border ${modoDark ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-blue-100 border-blue-200 text-blue-700"
                      }`}>
                      {produtos.find(p => p.id === produtoSelecionado)?.nome}
                    </div>
                  </div>
                  <div className="flex-1">
                    <HistoricoEstoque produtoId={produtoSelecionado} modoDark={modoDark} />
                  </div>
                </>
              ) : (
                <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                  <FaHistory className={`text-6xl ${textMuted} mb-4 opacity-50`} />
                  <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>
                    {t("selecioneProdutoTitulo") || "Selecione um Produto"}
                  </h3>
                  <p className={`${textMuted} max-w-md`}>
                    {t("selecioneProdutoDescricao") || "Escolha um produto da lista ao lado para visualizar seu histórico completo de movimentações"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}