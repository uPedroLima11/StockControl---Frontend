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

  const produtosPorPagina = 5;

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);
    fetchContagem();
    fetchProdutos();
    fetchFornecedores();
    fetchVendas();
    fetchFuncionarios();

    localStorage.setItem("TotalVendas", JSON.stringify(todasVendas));

    const root = document.documentElement;

    if (ativado) {
      root.style.setProperty("--cor-fundo", "#20252B");
      root.style.setProperty("--cor-fonte", "#ffffff");
      root.style.setProperty("--cor-subtitulo", "#A3A3A3");
      root.style.setProperty("--cor-fundo-bloco", "#1a25359f");
    } else {
      root.style.setProperty("--cor-fonte", "#000000");
      root.style.setProperty("--cor-subtitulo", "#4B5563");
      root.style.setProperty("--cor-fundo-bloco", "#ececec");
    }
  }, []);

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
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/contagem/${usuario.empresaId}`);
        if (response.status === 200) {
          const data = await response.json();
          setContagemEstoque(data.contagemQuantidade);
          setContagemValor(data.contagemPreco);
          setContagemProduto(data.count);
        }

        const responseLucro = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/contagem/${usuario.empresaId}`);
        if (responseLucro.status === 200) {
          const data = await responseLucro.json();
          setContagemLucro(data.total);
          setContagemVendas(data.quantidadeVendas);
        }
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
    setProdutos(produtosDaEmpresa);
  }

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
        setTodasVendas(data.vendas || []);
        calcularVendas30Dias(data.vendas || []);
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

    const total = vendasFiltradas.reduce((sum, venda) => sum + venda.valorVenda, 0);
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
    <div className="px-2 sm:px-4 pt-8" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="justify-center w-full max-w-6xl rounded-[2rem] px-4 sm:px-8 md:px-12 py-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 mx-auto shadow-[...]" style={{ backgroundColor: "var(--cor-caixa-destaque)" }}>
        <Image alt="icone" src="/icone.png" width={100} height={100} quality={100} priority className="object-contain" />
        <div className="text-white text-center md:text-left">
          <h1 className="text-3xl font-bold">STOCKCONTROL</h1>
          <p className="text-base mt-1">
            {t("intro.linha1")} <br />
            {t("intro.linha2")}
          </p>
        </div>
      </div>

      <div className="flex justify-center px-2 sm:px-4 py-10">
        <div className="w-full max-w-6xl space-y-8">
          <h1 className="text-center text-2xl font-mono" style={{ color: "var(--cor-fonte)" }}>
            {t("dashboardTitulo")}
          </h1>
          <div
            className="border-2 rounded-xl p-6 shadow-md"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#fffff2" : "#000000",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ color: "var(--cor-fonte)" }}>
              {t("resumo.titulo")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {contagemLucro > 0 ? contagemLucro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("resumo.lucroTotal")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {contagemValor > 0 ? contagemValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "R$ 0,00"}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("resumo.custoItens")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {contagemEstoque}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("resumo.itensDisponiveis")}
                </p>
              </div>
            </div>
          </div>
          <div
            className="border-2 rounded-xl p-6 shadow-md"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#fffff2" : "#000000",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ color: "var(--cor-fonte)" }}>
              {t("atividades.titulo")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center">
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {contagemVendas}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("atividades.contagemVendas")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {vendas30Dias.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("atividades.lucroMensal")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {contagemFornecedores}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("atividades.contagemFornecedores")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {contagemProduto}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("atividades.contagemItens")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {contagemFuncionarios}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("atividades.contagemFuncionarios")}
                </p>
              </div>
            </div>
          </div>
          <div
            className="border-2 rounded-xl p-6 shadow-md"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#fffff2" : "#000000",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ color: "var(--cor-fonte)" }}>
              {t("estoqueBaixo.titulo")}
            </h2>

            <div className="hidden md:block">
              <table className="min-w-full text-sm text-left">
                <thead className="border-b">
                  <tr style={{ color: "var(--cor-fonte)" }} className="font-semibold">
                    <th className="py-2 pr-4 text-start whitespace-nowrap">{t("estoqueBaixo.colunas.produto")}</th>
                    <th className="py-2 pr-4 text-center whitespace-nowrap">{t("estoqueBaixo.colunas.estoqueAtual")}</th>
                    <th className="py-2 pr-4 text-center whitespace-nowrap">{t("estoqueBaixo.colunas.estoqueIdeal")}</th>
                    <th className="py-2 pr-4 text-center whitespace-nowrap">{t("Estado")}</th>
                  </tr>
                </thead>
                <tbody style={{ color: "var(--cor-fonte)" }}>
                  {produtosAtuais.map((produto) => (
                    <tr key={produto.id} className="border-b">
                      <td className="py-2 pr-4 text-start whitespace-nowrap">{produto.nome}</td>
                      <td className="py-2 pr-4 text-center whitespace-nowrap">{produto.quantidade}</td>
                      <td className="py-2 pr-4 text-center whitespace-nowrap">{produto.quantidadeMin}</td>
                      <td className="flex items-center justify-center py-2 pr-4 text-center whitespace-nowrap">
                        {produto.quantidade < produto.quantidadeMin ? (
                          <div className="flex items-center gap-1">
                            <LuShieldAlert size={18} color="#dc143c" /> {t("estoqueBaixo.estadoCritico")}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <LuTriangleAlert size={18} color="#eead2d" /> {t("estoqueBaixo.estadoAtencao")}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            <div className="md:hidden space-y-2">
              {produtosAtuais.length === 0 ? (
                <div className="p-4 text-center" style={{ color: "var(--cor-fonte)" }}>
                  {t("estoqueBaixo.nenhumProduto")}
                </div>
              ) : (
                produtosAtuais.map((produto) => (
                  <div
                    key={produto.id}
                    className={`border rounded-lg p-3 transition-all ${modoDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold" style={{ color: "var(--cor-fonte)" }}>
                            {produto.nome}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                            {t("estoqueBaixo.colunas.estoqueAtual")}: {produto.quantidade}
                          </p>
                          <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                            {t("estoqueBaixo.colunas.estoqueIdeal")}: {produto.quantidadeMin}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpandirProduto(produto.id)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        style={{ color: modoDark ? "#a0aec0" : "#4a5568" }}
                      >
                        {produtoExpandido === produto.id ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>

                    <div
                      className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${produtoExpandido === produto.id ? "max-h-96" : "max-h-0"}`}
                      style={{ color: "var(--cor-fonte)" }}
                    >
                      <div className="pt-2 border-t" style={{ borderColor: modoDark ? "#374151" : "#e5e7eb" }}>
                        <div className="flex items-center gap-1">
                          {produto.quantidade < produto.quantidadeMin ? (
                            <>
                              <LuShieldAlert size={18} color="#dc143c" />
                              <span>{t("estoqueBaixo.estadoCritico")}</span>
                            </>
                          ) : (
                            <>
                              <LuTriangleAlert size={18} color="#eead2d" />
                              <span>{t("estoqueBaixo.estadoAtencao")}</span>
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
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className={`p-2 rounded-full ${paginaAtual === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                  style={{ color: "var(--cor-fonte)" }}
                >
                  <FaAngleLeft />
                </button>

                <span className="text-sm font-mono" style={{ color: "var(--cor-fonte)" }}>
                  {paginaAtual}/{totalPaginas}
                </span>

                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={`p-2 rounded-full ${paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                  style={{ color: "var(--cor-fonte)" }}
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