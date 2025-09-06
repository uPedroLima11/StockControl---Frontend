"use client";

import { ProdutoI } from "@/utils/types/produtos";
import { VendaI } from "@/utils/types/vendas";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuShieldAlert, LuTriangleAlert } from "react-icons/lu";
import { FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight } from "react-icons/fa";

export default function Dashboard() {
  const [contagemProduto, setContagemProduto] = useState(0);
  const [contagemEstoque, setContagemEstoque] = useState(0);
  const [contagemValor, setContagemValor] = useState(0);
  const [contagemLucro, setContagemLucro] = useState(0);
  const [contagemVendas, setContagemVendas] = useState(0);
  const [contagemFornecedores, setContagemFornecedores] = useState(0);
  const [contagemFuncionarios, setContagemFuncionarios] = useState(0);
  const [vendas30Dias, setVendas30Dias] = useState(0);
  const [todasVendas, setTodasVendas] = useState<VendaI[]>([]);
  const [modoDark, setModoDark] = useState(false);
  const [produtos, setProdutos] = useState<ProdutoI[]>([]);
  const [produtoExpandido, setProdutoExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const { t } = useTranslation("dashboard");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  const produtosPorPagina = 5;

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);

    aplicarTema(ativado);

    fetchContagem();
    fetchProdutos();
    fetchFornecedores();
    fetchVendas();
    fetchFuncionarios();

    localStorage.setItem("TotalVendas", JSON.stringify(todasVendas));
  }, []);

  useEffect(() => {
  const interval = setInterval(() => {
    fetchContagem();
    fetchVendas();
  }, 5000); 

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

  async function fetchContagem() {
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
      const usuario = await responseUsuario.json();

      if (!usuario.empresaId) {
        setContagemEstoque(0);
        setContagemValor(0);
        setContagemLucro(0);
        return;
      }

      const responseVendas = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/contagem/${usuario.empresaId}`);
      if (responseVendas.ok) {
        const totalData = await responseVendas.json();
        setContagemLucro(totalData.total || 0);
        setContagemVendas(totalData.quantidadeVendas || 0);
      }

      const responseProdutos = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
      if (responseProdutos.ok) {
        const todosProdutos = await responseProdutos.json();
        const produtosDaEmpresa = todosProdutos.filter((p: any) => p.empresaId === usuario.empresaId);

        const contagemQuantidade = produtosDaEmpresa.reduce((sum: number, produto: any) =>
          sum + (produto.quantidade || 0), 0
        );

        const contagemPreco = produtosDaEmpresa.reduce((sum: number, produto: any) =>
          sum + ((produto.preco || 0) * (produto.quantidade || 0)), 0
        );

        setContagemEstoque(contagemQuantidade);
        setContagemValor(contagemPreco);
        setContagemProduto(produtosDaEmpresa.length);
      }

    } catch (error) {
      console.error("Erro de conexão:", error);
    }
  }

  async function fetchFuncionarios() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
    const usuario = await responseUsuario.json();
    const responseFuncionarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/contagem/${usuario.empresaId}`);
    if (responseFuncionarios.status === 200) {
      const data = await responseFuncionarios.json();
      setContagemFuncionarios(data.quantidade);
    } else {
      setContagemFuncionarios(0);
    }
  }

  async function fetchFornecedores() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
    const usuario = await responseUsuario.json();
    const responseFornecedor = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/contagem/${usuario.empresaId}`);
    if (responseFornecedor.status === 200) {
      const data = await responseFornecedor.json();
      setContagemFornecedores(data._count.id);
    } else {
      setContagemFornecedores(0);
    }
  }

  async function fetchProdutos() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
    const usuario = await responseUsuario.json();

    const responseProdutos = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
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

  useEffect(() => {
    const handleVendaRealizada = () => {
      fetchContagem();
      fetchVendas();
      fetchProdutos();
    };

    window.addEventListener('venda-realizada', handleVendaRealizada);

    return () => {
      window.removeEventListener('venda-realizada', handleVendaRealizada);
    };
  }, []);


  async function fetchVendas() {
    try {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
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
    (produto) => produto.quantidade < produto.quantidadeMin &&
      produto.quantidadeMin !== undefined &&
      produto.quantidadeMin > 0
  );

  const produtosAtencao = produtos.filter(
    (produto) => produto.quantidade >= produto.quantidadeMin &&
      produto.quantidade < produto.quantidadeMin + 5 &&
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
              {t("resumo.titulo")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { valor: contagemLucro, label: t("resumo.lucroTotal"), formato: "currency" },
                { valor: contagemValor, label: t("resumo.custoItens"), formato: "currency" },
                { valor: contagemEstoque, label: t("resumo.itensDisponiveis"), formato: "number" }
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-lg transition-colors duration-200 hover:bg-opacity-20"
                  style={{
                    backgroundColor: modoDark ? "rgba(25, 118, 210, 0.1)" : "rgba(2, 132, 199, 0.1)",
                    border: `1px solid ${modoDark ? "rgba(25, 118, 210, 0.3)" : "rgba(2, 132, 199, 0.3)"}`
                  }}
                >
                  <p className="text-2xl font-semibold mb-1" style={{
                    color: "var(--cor-fonte)"
                  }}>

                    {item.formato === "currency"
                      ? item.valor > 0 ? item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"
                      : item.valor
                    }
                  </p>
                  <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                    {item.label}
                  </p>
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
                <div key={index} className="p-3 rounded-lg transition-colors duration-200 hover:bg-opacity-20"
                  style={{
                    backgroundColor: modoDark ? "rgba(25, 118, 210, 0.1)" : "rgba(2, 132, 199, 0.1)",
                    border: `1px solid ${modoDark ? "rgba(25, 118, 210, 0.3)" : "rgba(2, 132, 199, 0.3)"}`
                  }}
                >
                  <p className="text-xl font-semibold mb-1" style={{
                    color: "var(--cor-fonte)"
                  }}>

                    {item.formato === "currency"
                      ? item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : item.valor
                    }
                  </p>
                  <p className="text-xs" style={{ color: "var(--cor-subtitulo)" }}>
                    {item.label}
                  </p>
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
                      <td className="py-3 px-4 text-center">{produto.quantidade}</td>
                      <td className="py-3 px-4 text-center">{produto.quantidadeMin}</td>
                      <td className="flex items-center justify-center py-3 px-4 text-center">
                        {produto.quantidade < produto.quantidadeMin ? (
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
                            {t("estoqueBaixo.colunas.estoqueIdeal")}: {produto.quantidadeMin}
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
                          {produto.quantidade < produto.quantidadeMin ? (
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