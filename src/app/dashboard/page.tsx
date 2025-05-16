"use client";

import { ProdutoI } from "@/utils/types/produtos";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuShieldAlert, LuTriangleAlert } from "react-icons/lu";

export default function Dashboard() {
  const [contagemProdutos, setContagemProdutos] = useState(0);
  const [contagemValor, setContagemValor] = useState(0);
  const [contagemLucro, setContagemLucro] = useState(0);
  const [modoDark, setModoDark] = useState(false);
  const [produtos, setProdutos] = useState<ProdutoI[]>([]);
  const { t } = useTranslation("dashboard");

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);
    fetchContagem();
    fetchProdutos();

    const root = document.documentElement;

    if (ativado) {
      root.style.setProperty("--cor-fundo", "#20252B");
      root.style.setProperty("--cor-fonte", "#fffff2");
      root.style.setProperty("--cor-subtitulo", "#A3A3A3");
      root.style.setProperty("--cor-fundo-bloco", "#1a25359f");
    } else {
      root.style.setProperty("--cor-fundo", "#fffff2");
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
        setContagemProdutos(0);
        setContagemValor(0);
        setContagemLucro(0);
        return;
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/contagem/${usuario.empresaId}`);
        if (response.status === 200) {
          const data = await response.json();
          setContagemProdutos(data.contagemQuantidade);
          setContagemValor(data.contagemPreco);
        }

        const responseLucro = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/contagem/${usuario.empresaId}`);
        if (responseLucro.status === 200) {
          const data = await responseLucro.json();
          setContagemLucro(data.total._sum.valorVenda);
        }
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
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

  return (
    <div className="px-2 sm:px-4 pt-8">
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
                  {contagemLucro.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("resumo.lucroMensal")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {contagemValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("resumo.custoItens")}
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold" style={{ color: "var(--cor-fonte)" }}>
                  {contagemProdutos}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              {[
                ["10", t("atividades.itensRecebidos")],
                ["R$ 57.30", t("atividades.custoItens")],
                ["5", t("atividades.itensAjustados")],
                ["12", t("atividades.itensRemovidos")],
                ["R$ 24.00 / R$ 3.00", t("atividades.ajusteCusto")],
              ].map(([valor, texto]) => (
                <div key={texto}>
                  <p className="text-lg font-bold" style={{ color: "var(--cor-fonte)" }}>
                    {valor}
                  </p>
                  <p className="text-sm" style={{ color: "var(--cor-subtitulo)" }}>
                    {texto}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="border-2 rounded-xl p-6 shadow-md overflow-x-auto"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              borderColor: modoDark ? "#fffff2" : "#000000",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ color: "var(--cor-fonte)" }}>
              {t("estoqueBaixo.titulo")}
            </h2>
            <table className="min-w-full text-sm text-left">
              <thead className="border-b">
                <tr style={{ color: "var(--cor-fonte)" }} className="font-semibold">
                  <th className="py-2 pr-4 text-start whitespace-nowrap">{t("estoqueBaixo.colunas.produto")}</th>
                  <th className="py-2 pr-4 text-center whitespace-nowrap">{t("estoqueBaixo.colunas.estoqueAtual")}</th>
                  <th className="py-2 pr-4 text-center whitespace-nowrap">{t("estoqueBaixo.colunas.estoqueIdeal")}</th>
                  <th className="py-2 pr-4 text-center whitespace-nowrap">Estado</th>
                </tr>
              </thead>
              <tbody style={{ color: "var(--cor-fonte)" }}>
                {produtos
                  .filter((produto) => produto.quantidade < produto.quantidadeMin + 5 && produto.quantidadeMin !== undefined && produto.quantidadeMin > 0)
                  .map((produto) => (
                    <tr key={produto.id} className="border-b">
                      <td className="py-2 pr-4 text-start whitespace-nowrap">{produto.nome}</td>
                      <td className="py-2 pr-4 text-center whitespace-nowrap">{produto.quantidade}</td>
                      <td className="py-2 pr-4 text-center whitespace-nowrap">{produto.quantidadeMin}</td>
                      <td className="flex items-center justify-center py-2 pr-4 text-center whitespace-nowrap">
                        {produto.quantidade < produto.quantidadeMin ? (
                          <div className="flex items-center gap-1">
                            <LuShieldAlert size={18} color="#dc143c" /> {"Crítico"}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <LuTriangleAlert size={18} color="#eead2d" /> {"Atenção"}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
