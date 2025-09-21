"use client";

import { ProdutoI } from "@/utils/types/produtos";
import { VendaI } from "@/utils/types/vendas";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LuShieldAlert, LuTriangleAlert } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight } from "react-icons/fa";

interface CategoriaDistribuicao {
  categoria: string;
  quantidade: number;
  cor: string;
}

interface ProdutoVenda {
  id: string;
  nome: string;
  vendas: number;
}

export default function Dashboard() {
  const [contagemProduto, setContagemProduto] = useState(0);
  const [, setContagemEstoque] = useState(0);
  const [, setContagemValor] = useState(0);
  const [, setContagemLucro] = useState(0);
  const [contagemVendas, setContagemVendas] = useState(0);
  const [contagemFornecedores, setContagemFornecedores] = useState(0);
  const [contagemFuncionarios, setContagemFuncionarios] = useState(0);
  const [vendas30Dias, setVendas30Dias] = useState(0);
  const [todasVendas, setTodasVendas] = useState<VendaI[]>([]);
  const [modoDark, setModoDark] = useState(false);
  const [produtos, setProdutos] = useState<ProdutoI[]>([]);
  const [produtosTopVendas, setProdutosTopVendas] = useState<ProdutoVenda[]>([]);
  const [distribuicaoCategorias, setDistribuicaoCategorias] = useState<CategoriaDistribuicao[]>([]);
  const [produtoExpandido, setProdutoExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const { t, i18n } = useTranslation("dashboard");

  const produtosPorPagina = 5;
  const coresCategorias = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6A0572", "#9EE6CF", "#45B7D1", "#F9A1BC", "#9B59B6", "#E74C3C", "#2ECC71"];

  const calcularAngulosPizza = (categorias: CategoriaDistribuicao[]) => {
    const total = categorias.reduce((sum, cat) => sum + cat.quantidade, 0);
    if (total === 0) return categorias.map(() => 0);

    let anguloAcumulado = 0;
    return categorias.map(cat => {
      const porcentagem = (cat.quantidade / total) * 100;
      const anguloInicio = anguloAcumulado;
      anguloAcumulado += (porcentagem / 100) * 360;
      return anguloInicio;
    });
  };

  const angulosPizza = calcularAngulosPizza(distribuicaoCategorias);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);
    aplicarTema(ativado);

    const usuarioSalvo = localStorage.getItem("client_key");
    if (usuarioSalvo) {
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      fetchDashboardData(usuarioValor);
    }

    const interval = setInterval(() => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (usuarioSalvo) {
        const usuarioValor = usuarioSalvo.replace(/"/g, "");
        fetchContagem(usuarioValor);
        fetchVendas(usuarioValor);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement;
    if (ativado) {
      root.style.setProperty("--cor-fundo", "#0A1929");
      root.style.setProperty("--cor-fonte", "#FFFFFF");
      root.style.setProperty("--cor-subtitulo", "#9CA3AF");
      root.style.setProperty("--cor-fundo-bloco", "#132F4C");
      root.style.setProperty("--cor-borda", "#1E4976");
      root.style.setProperty("--cor-caixa-destaque", "#1976D2");
    } else {
      root.style.setProperty("--cor-fundo", "#F8FAFC");
      root.style.setProperty("--cor-fonte", "#0F172A");
      root.style.setProperty("--cor-subtitulo", "#6B7280");
      root.style.setProperty("--cor-fundo-bloco", "#FFFFFF");
      root.style.setProperty("--cor-borda", "#E2E8F0");
      root.style.setProperty("--cor-caixa-destaque", "#0284C7");
    }
    document.body.style.backgroundColor = ativado ? "#0A1929" : "#F8FAFC";
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
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
    return () => {
      document.head.removeChild(style);
    };
  }, [modoDark]);

  async function fetchTodasCategorias() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/categorias`);
      if (response.ok) {
        const categorias = await response.json();
        return categorias.map((cat: { nome: string }) => cat.nome);
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return [];
    }
  }

  async function fetchDashboardData(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) {
        resetAllData();
        return;
      }

      await Promise.all([
        fetchContagem(usuarioId),
        fetchProdutos(usuarioId),
        fetchFornecedores(usuarioId),
        fetchVendas(usuarioId),
        fetchFuncionarios(usuarioId),
        fetchTopProdutos(usuarioId),
        fetchDistribuicaoCategorias(usuarioId)
      ]);
    } catch (error) {
      console.error("Erro ao buscar dados da dashboard:", error);
    }
  }

  function resetAllData() {
    setContagemEstoque(0);
    setContagemValor(0);
    setContagemLucro(0);
    setContagemVendas(0);
    setContagemProduto(0);
    setContagemFornecedores(0);
    setContagemFuncionarios(0);
    setVendas30Dias(0);
    setTodasVendas([]);
    setProdutos([]);
    setProdutosTopVendas([]);
    setDistribuicaoCategorias([]);
  }

  async function fetchContagem(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const [responseVendas, responseProdutos] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/contagem/${usuario.empresaId}`),
        fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/contagem/${usuario.empresaId}`)
      ]);

      if (responseVendas.ok) {
        const totalData = await responseVendas.json();
        setContagemLucro(totalData.total || 0);
        setContagemVendas(totalData.quantidadeVendas || 0);
      }

      if (responseProdutos.ok) {
        const produtosData = await responseProdutos.json();
        setContagemEstoque(produtosData.contagemQuantidade || 0);
        setContagemValor(produtosData.contagemPreco || 0);
        setContagemProduto(produtosData.count || 0);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  }

  async function fetchFuncionarios(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const responseFuncionarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/contagem/${usuario.empresaId}`);
      if (responseFuncionarios.ok) {
        const data = await responseFuncionarios.json();
        setContagemFuncionarios(data.quantidade || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setContagemFuncionarios(0);
    }
  }

  async function fetchFornecedores(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const responseFornecedor = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/contagem/${usuario.empresaId}`);
      if (responseFornecedor.ok) {
        const data = await responseFornecedor.json();
        setContagemFornecedores(data._count?.id || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      setContagemFornecedores(0);
    }
  }

  async function fetchProdutos(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const responseProdutos = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
      if (responseProdutos.ok) {
        const todosProdutos: ProdutoI[] = await responseProdutos.json();
        const produtosDaEmpresa = todosProdutos.filter((p) => p.empresaId === usuario.empresaId);

        const produtosComSaldos = await Promise.all(
          produtosDaEmpresa.map(async (produto) => {
            try {
              const responseSaldo = await fetch(
                `${process.env.NEXT_PUBLIC_URL_API}/produtos/${produto.id}/saldo`
              );
              if (responseSaldo.ok) {
                const { saldo } = await responseSaldo.json();
                return { ...produto, quantidade: saldo };
              }
            } catch (error) {
              console.error("Erro ao buscar saldo:", error);
            }
            return produto;
          })
        );

        setProdutos(produtosComSaldos);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  async function fetchVendas(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) {
        setTodasVendas([]);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/${usuario.empresaId}`);
      if (response.ok) {
        const data = await response.json();
        const vendas = data.vendas || [];
        setTodasVendas(vendas);
        calcularVendas30Dias(vendas);
        setContagemVendas(vendas.length);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  }

  async function fetchTopProdutos(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/top-produtos/${usuario.empresaId}`);

      if (response.ok) {
        const data = await response.json();
        setProdutosTopVendas(data);
      } else {
        if (todasVendas.length > 0) {
          const vendasPorProduto: { [key: string]: { vendas: number, nome: string } } = {};

          todasVendas.forEach(venda => {
            if (venda.produtoId && venda.produto) {
              const produtoId = venda.produtoId.toString();

              if (!vendasPorProduto[produtoId]) {
                vendasPorProduto[produtoId] = {
                  vendas: 0,
                  nome: venda.produto.nome
                };
              }
              vendasPorProduto[produtoId].vendas += venda.quantidade || 1;
            }
          });

          const topProdutos = Object.entries(vendasPorProduto)
            .sort((a, b) => b[1].vendas - a[1].vendas)
            .slice(0, 5)
            .map(([produtoId, data]) => ({
              id: produtoId,
              nome: data.nome,
              vendas: data.vendas
            }));

          setProdutosTopVendas(topProdutos);
        } else {
          setProdutosTopVendas([]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar top produtos:", error);
      setProdutosTopVendas([]);
    }
  }

  async function fetchDistribuicaoCategorias(usuarioId: string) {
    try {
      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) return;

      const [responseProdutos, todasCategorias] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`),
        fetchTodasCategorias()
      ]);

      if (responseProdutos.ok) {
        const todosProdutos: ProdutoI[] = await responseProdutos.json();
        const produtosDaEmpresa = todosProdutos.filter((p) => p.empresaId === usuario.empresaId);

        const distribuicao: { [key: string]: number } = {};
        produtosDaEmpresa.forEach(produto => {
          const categoria = produto.categoria?.nome || "Sem Categoria";
          distribuicao[categoria] = (distribuicao[categoria] || 0) + 1;
        });

        const categoriasOrdenadas = Object.entries(distribuicao)
          .sort((a, b) => b[1] - a[1]);

        const categoriasComProdutos = categoriasOrdenadas.filter(([, quantidade]) => quantidade > 0);

        const distribuicaoFinal: CategoriaDistribuicao[] = categoriasComProdutos.map(([categoria, quantidade], index) => ({
          categoria,
          quantidade,
          cor: coresCategorias[index] || "#CCCCCC"
        })).slice(0, 5);

        if (distribuicaoFinal.length < 5) {
          const categoriasExistentes = new Set(distribuicaoFinal.map(item => item.categoria));

          const categoriasDisponiveis = todasCategorias.filter((categoria: string) =>
            !categoriasExistentes.has(categoria) && !distribuicao[categoria]
          );

          categoriasDisponiveis.slice(0, 5 - distribuicaoFinal.length).forEach((categoria: string) => {
            distribuicaoFinal.push({
              categoria,
              quantidade: 0,
              cor: coresCategorias[distribuicaoFinal.length] || "#CCCCCC"
            });
          });
        }

        setDistribuicaoCategorias(distribuicaoFinal);
      }
    } catch (error) {
      console.error("Erro ao buscar distribuição de categorias:", error);
    }
  }

  function calcularVendas30Dias(vendas: VendaI[]) {
    const data30DiasAtras = new Date();
    data30DiasAtras.setDate(data30DiasAtras.getDate() - 30);

    const vendasFiltradas = vendas.filter(venda => {
      if (!venda.createdAt) return false;
      const dataVenda = new Date(venda.createdAt);
      return dataVenda >= data30DiasAtras;
    });

    const total = vendasFiltradas.reduce((sum, venda) => sum + (venda.valorVenda || 0), 0);
    setVendas30Dias(total);
  }

  const toggleExpandirProduto = (id: string) => {
    setProdutoExpandido(produtoExpandido === id ? null : id);
  };

  const produtosCriticos = produtos.filter(
    (produto) => produto.quantidade < (produto.quantidadeMin || 0) &&
      produto.quantidadeMin !== undefined &&
      produto.quantidadeMin > 0
  );

  const produtosAtencao = produtos.filter(
    (produto) => produto.quantidade >= (produto.quantidadeMin || 0) &&
      produto.quantidade < (produto.quantidadeMin || 0) + 5 &&
      produto.quantidadeMin !== undefined &&
      produto.quantidadeMin > 0
  );

  const produtosEstoqueBaixo = [...produtosCriticos, ...produtosAtencao];

  const indexUltimoProduto = paginaAtual * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosAtuais = produtosEstoqueBaixo.slice(indexPrimeiroProduto, indexUltimoProduto);
  const totalPaginas = Math.ceil(produtosEstoqueBaixo.length / produtosPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setProdutoExpandido(null);
  };

  const totalItens = distribuicaoCategorias.reduce((sum, cat) => sum + cat.quantidade, 0);

  return (
    <div className="px-2 sm:px-4 pt-8 min-h-screen" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div
        className="justify-center w-full max-w-6xl rounded-2xl px-4 sm:px-8 md:px-12 py-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 mx-auto mb-8 shadow-xl"
        style={{
          background: modoDark
            ? "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)"
            : "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
          border: `1px solid ${modoDark ? "#1E4976" : "#E2E8F0"}`
        }}
      >
        <Image
          alt="icone"
          src="/icone.png"
          width={100}
          height={100}
          quality={100}
          priority
          className="object-contain filter brightness-0 invert"
        />
        <div className="text-white text-center md:text-left">
          <h1 className="text-3xl font-bold">STOCKCONTROL</h1>
          <p className="text-base mt-1 opacity-90">
            {t("intro.linha1")} <br />
            {t("intro.linha2")}
          </p>
        </div>
      </div>

      <div className="flex justify-center px-2 sm:px-4 pb-10">
        <div className="w-full max-w-6xl space-y-6">
          <h1 className="text-center text-2xl font-mono mb-6" style={{ color: "var(--cor-fonte)" }}>
            {t("dashboardTitulo")}
          </h1>
          <div
            className="border rounded-xl p-6 shadow-md transition-all duration-300"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: "var(--cor-borda)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{
              color: "var(--cor-fonte)",
              borderColor: "var(--cor-borda)"
            }}>
              📊 {t("financeiro.titulo")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg" style={{
                backgroundColor: modoDark ? "rgba(25, 118, 210, 0.1)" : "rgba(2, 132, 199, 0.1)",
                border: `1px solid ${modoDark ? "rgba(25, 118, 210, 0.3)" : "rgba(2, 132, 199, 0.3)"}`
              }}>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <span>🏆</span> {t("financeiro.topProdutos")}
                </h3>
                <div className="space-y-3">
                  {produtosTopVendas.length > 0 ? (
                    produtosTopVendas.map((produto) => {
                      const maxVendas = Math.max(...produtosTopVendas.map(p => p.vendas));
                      const porcentagem = maxVendas > 0 ? (produto.vendas / maxVendas) * 100 : 0;
                      return (
                        <div key={produto.id} className="space-y-1 group relative">
                          <div className="flex justify-between text-sm">
                            <span className="truncate max-w-[160px]" title={produto.nome}>
                              {produto.nome}
                            </span>
                            <span className="font-medium whitespace-nowrap">
                              {produto.vendas} {t("financeiro.unidades")}
                            </span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${porcentagem}%`,
                                backgroundColor: modoDark ? "#1976D2" : "#0284C7"
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-sm text-gray-500">
                      {t("financeiro.semDados")}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{
                backgroundColor: modoDark ? "rgba(25, 118, 210, 0.1)" : "rgba(2, 132, 199, 0.1)",
                border: `1px solid ${modoDark ? "rgba(25, 118, 210, 0.3)" : "rgba(2, 132, 199, 0.3)"}`
              }}>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <span>📦</span> {t("financeiro.categorias")}
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg width="128" height="128" viewBox="0 0 100 100" className="transform -rotate-90">
                        {distribuicaoCategorias.map((item, index) => {
                          const porcentagem = totalItens > 0 ? (item.quantidade / totalItens) * 100 : 0;
                          const anguloInicio = angulosPizza[index];

                          return (
                            <circle
                              key={index}
                              cx="50"
                              cy="50"
                              r="45"
                              fill="transparent"
                              stroke={item.cor}
                              strokeWidth="10"
                              strokeDasharray={`${porcentagem} ${100 - porcentagem}`}
                              strokeDashoffset={100 - anguloInicio}
                              className="transition-all duration-500"
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-center">
                          {totalItens}
                          <br />
                          <span className="text-xs">{t("financeiro.itens")}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    {distribuicaoCategorias.map((item, index) => {
                      const porcentagem = totalItens > 0 ? ((item.quantidade / totalItens) * 100).toFixed(0) : "0";
                      return (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.cor }} />
                            <span className="font-medium truncate max-w-[80px]" title={item.categoria}>
                              {item.categoria}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{item.quantidade}</span>
                            <span className="text-gray-500">({porcentagem}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="border rounded-xl p-6 shadow-md transition-all duration-300"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: "var(--cor-borda)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{
              color: "var(--cor-fonte)",
              borderColor: "var(--cor-borda)"
            }}>
              {t("atividades.titulo")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
              {[
                { valor: contagemVendas, label: t("atividades.contagemVendas"), formato: "number" },
                { valor: vendas30Dias, label: t("atividades.lucroMensal"), formato: "currency" },
                { valor: contagemFornecedores, label: t("atividades.contagemFornecedores"), formato: "number" },
                { valor: contagemProduto, label: t("atividades.contagemItens"), formato: "number" },
                { valor: contagemFuncionarios, label: t("atividades.contagemFuncionarios"), formato: "number" }
              ].map((item, index) => (
                <div key={index} className="p-3 rounded-lg"
                  style={{
                    backgroundColor: modoDark ? "rgba(25, 118, 210, 0.1)" : "rgba(2, 132, 199, 0.1)",
                    border: `1px solid ${modoDark ? "rgba(25, 118, 210, 0.3)" : "rgba(2, 132, 199, 0.3)"}`
                  }}
                >
                  <p className="text-xl font-semibold mb-1" style={{ color: "var(--cor-fonte)" }}>
                    {item.formato === "currency"
                      ? item.valor.toLocaleString(i18n.language === "en" ? "en-US" : "pt-BR", {
                        style: "currency",
                        currency: i18n.language === "en" ? "USD" : "BRL"
                      })
                      : item.valor
                    }
                  </p>
                  <p className="text-sm text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className="border rounded-xl p-6 shadow-md transition-all duration-300"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: "var(--cor-borda)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = modoDark
                ? "0 12px 30px rgba(25, 118, 210, 0.25)"
                : "0 12px 30px rgba(2, 132, 199, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{
              color: "var(--cor-fonte)",
              borderColor: "var(--cor-borda)"
            }}>
              {t("estoqueBaixo.titulo")}
            </h2>

            <div className="hidden md:block">
              <table className="min-w-full text-sm text-left">
                <thead className="border-b" style={{ borderColor: "var(--cor-borda)" }}>
                  <tr style={{ color: "var(--cor-fonte)" }} className="font-semibold">
                    <th className="py-3 px-4 text-start">{t("estoqueBaixo.colunas.produto")}</th>
                    <th className="py-3 px-4 text-center">{t("estoqueBaixo.colunas.estoqueAtual")}</th>
                    <th className="py-3 px-4 text-center">{t("estoqueBaixo.colunas.estoqueIdeal")}</th>
                    <th className="py-3 px-4 text-center">{t("Estado")}</th>
                  </tr>
                </thead>
                <tbody style={{ color: "var(--cor-fonte)" }}>
                  {produtosAtuais.map((produto) => (
                    <tr
                      key={produto.id}
                      className="border-b transition-all duration-200 cursor-pointer"
                      style={{ borderColor: "var(--cor-borda)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = modoDark
                          ? "rgba(25, 118, 210, 0.15)"
                          : "rgba(2, 132, 199, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td className="py-3 px-4 text-start">{produto.nome}</td>
                      <td className="py-3 px-4 text-center">{produto.quantidadeMin || 0}</td>
                      <td className="flex items-center justify-center py-3 px-4 text-center">
                        {produto.quantidade < (produto.quantidadeMin || 0) ? (
                          <div className="flex items-center gap-1 text-red-400">
                            <LuShieldAlert size={18} /> {t("estoqueBaixo.estadoCritico")}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <LuTriangleAlert size={18} /> {t("estoqueBaixo.estadoAtencao")}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {produtosAtuais.length === 0 ? (
                <div className="p-4 text-center rounded-lg" style={{
                  color: "var(--cor-subtitulo)",
                  backgroundColor: modoDark ? "rgba(25, 118, 210, 0.1)" : "rgba(2, 132, 199, 0.1)",
                  border: `1px solid ${modoDark ? "rgba(25, 118, 210, 0.3)" : "rgba(2, 132, 199, 0.3)"}`
                }}>
                  {t("estoqueBaixo.nenhumProduto")}
                </div>
              ) : (
                produtosAtuais.map((produto) => (
                  <div
                    key={produto.id}
                    className="border rounded-lg p-4 transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: "var(--cor-fundo-bloco)",
                      borderColor: "var(--cor-borda)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = modoDark
                        ? "rgba(25, 118, 210, 0.15)"
                        : "rgba(2, 132, 199, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--cor-fundo-bloco)";
                    }}
                    onClick={() => toggleExpandirProduto(produto.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold" style={{ color: "var(--cor-fonte)" }}>
                            {produto.nome}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span style={{ color: "var(--cor-subtitulo)" }}>
                            {t("estoqueBaixo.colunas.estoqueAtual")}: {produto.quantidade}
                          </span>
                          <span style={{ color: "var(--cor-subtitulo)" }}>
                            {t("estoqueBaixo.colunas.estoqueIdeal")}: {produto.quantidadeMin || 0}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandirProduto(produto.id);
                        }}
                        className="p-1"
                        style={{ color: "var(--cor-subtitulo)" }}
                      >
                        {produtoExpandido === produto.id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>

                    <div
                      className={`mt-3 text-sm overflow-hidden transition-all duration-200 ${produtoExpandido === produto.id ? "max-h-96" : "max-h-0"}`}
                      style={{ color: "var(--cor-fonte)" }}
                    >
                      <div className="pt-3 border-t" style={{ borderColor: "var(--cor-borda)" }}>
                        <div className="flex items-center gap-2">
                          {produto.quantidade < (produto.quantidadeMin || 0) ? (
                            <>
                              <LuShieldAlert size={18} className="text-red-400" />
                              <span className="text-red-400">{t("estoqueBaixo.estadoCritico")}</span>
                            </>
                          ) : (
                            <>
                              <LuTriangleAlert size={18} className="text-yellow-400" />
                              <span className="text-yellow-400">{t("estoqueBaixo.estadoAtencao")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {produtosEstoqueBaixo.length > produtosPorPagina && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className={`p-2 rounded-full transition-colors ${paginaAtual === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-20"}`}
                  style={{
                    color: "var(--cor-fonte)",
                    backgroundColor: modoDark ? "rgba(25, 118, 210, 0.1)" : "rgba(2, 132, 199, 0.1)"
                  }}
                >
                  <FaAngleLeft />
                </button>

                <span className="text-sm font-mono" style={{ color: "var(--cor-fonte)" }}>
                  {paginaAtual}/{totalPaginas}
                </span>

                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={`p-2 rounded-full transition-colors ${paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-20"}`}
                  style={{
                    color: "var(--cor-fonte)",
                    backgroundColor: modoDark ? "rgba(25, 118, 210, 0.1)" : "rgba(2, 132, 199, 0.1)"
                  }}
                >
                  <FaAngleRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}