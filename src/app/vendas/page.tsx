"use client";

import { ProdutoI } from "@/utils/types/produtos";
import { ClienteI } from "@/utils/types/clientes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaSearch, FaShoppingCart, FaRegTrashAlt, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { VendaI } from "@/utils/types/vendas";

export default function Vendas() {
  const [produtos, setProdutos] = useState<ProdutoI[]>([]);
  const [vendas, setVendas] = useState<VendaI[]>([]);
  const [clientes, setClientes] = useState<ClienteI[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [carrinho, setCarrinho] = useState<{ produto: ProdutoI, quantidade: number }[]>([]);
  const [busca, setBusca] = useState("");
  const [modoDark, setModoDark] = useState(false);
  const [totalVendas, setTotalVendas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const produtosPorPagina = 7;
  const { t } = useTranslation("vendas");

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinhoVendas');
    if (carrinhoSalvo) {
      try {
        const carrinhoParseado = JSON.parse(carrinhoSalvo);
        setCarrinho(carrinhoParseado);
      } catch (err) {
        console.error('Erro ao parsear carrinho do localStorage', err);
        localStorage.removeItem('carrinhoVendas');
      }
    }

    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);

    const root = document.documentElement;
    if (ativado) {
      root.style.setProperty("--cor-fundo", "#20252B");
      root.style.setProperty("--cor-fonte", "#FFFFFF");
      root.style.setProperty("--cor-subtitulo", "#A3A3A3");
      root.style.setProperty("--cor-fundo-bloco", "#1a25359f");
    } else {
      root.style.setProperty("--cor-fundo", "#ffffff");
      root.style.setProperty("--cor-fonte", "#000000");
      root.style.setProperty("--cor-subtitulo", "#4B5563");
      root.style.setProperty("--cor-fundo-bloco", "#ececec");
    }

    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) {
      setCarregando(false);
      return;
    }
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    const initialize = async () => {
      try {
        setCarregando(true);

        const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
        const usuario = await responseUsuario.json();

        if (!usuario || !usuario.empresaId) {
          setProdutos([]);
          setVendas([]);
          setTotalVendas(0);
          setCarregando(false);
          return;
        }

        setEmpresaId(usuario.empresaId);
        setUserRole(usuario.tipo);

        const responseProdutos = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
        const todosProdutos: ProdutoI[] = await responseProdutos.json();
        const produtosDaEmpresa = todosProdutos.filter((p) => p.empresaId === usuario.empresaId && p.quantidade > 0);
        setProdutos(produtosDaEmpresa);

        const responseClientes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`);
        const clientesData = await responseClientes.json();
        const clientesDaEmpresa = clientesData.clientes?.filter((c: ClienteI) => c.empresaId === usuario.empresaId) || [];
        setClientes(clientesDaEmpresa);

        const responseVendas = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/${usuario.empresaId}`);
        if (!responseVendas.ok) {
          throw new Error('Erro ao carregar vendas');
        }

        const vendasData = await responseVendas.json();
        const vendasDaEmpresa = vendasData.vendas || [];

        const vendasOrdenadas = vendasDaEmpresa.sort((a: VendaI, b: VendaI) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setVendas(vendasOrdenadas);

        const responseTotal = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/contagem/${usuario.empresaId}`);
        const totalData = await responseTotal.json();

        let total = 0;
        if (totalData?.total?._sum?.valorVenda) {
          total = totalData.total._sum.valorVenda;
        } else if (totalData?.sum) {
          total = totalData.sum;
        } else if (totalData?.total) {
          total = totalData.total;
        } else if (typeof totalData === 'number') {
          total = totalData;
        }

        setTotalVendas(total);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        Swal.fire({
          icon: "error",
          title: t("erroCarregarDados"),
          text: t("tenteNovamente"),
        });
        setVendas([]);
        setTotalVendas(0);
      } finally {
        setCarregando(false);
      }
    };

    initialize();
  }, [t]);

  useEffect(() => {
    if (carrinho.length > 0) {
      localStorage.setItem('carrinhoVendas', JSON.stringify(carrinho));
    } else {
      localStorage.removeItem('carrinhoVendas');
    }
  }, [carrinho]);

  const adicionarAoCarrinho = (produto: ProdutoI) => {
    if (userRole !== "ADMIN" && userRole !== "PROPRIETARIO") return;

    const itemExistente = carrinho.find(item => item.produto.id === produto.id);

    if (itemExistente) {
      if (itemExistente.quantidade < produto.quantidade) {
        setCarrinho(carrinho.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        ));
      } else {
        Swal.fire({
          icon: "warning",
          title: t("avisoEstoque"),
          text: t("quantidadeMaiorQueEstoque"),
        });
      }
    } else {
      if (produto.quantidade > 0) {
        setCarrinho([...carrinho, { produto, quantidade: 1 }]);
      } else {
        Swal.fire({
          icon: "warning",
          title: t("avisoEstoque"),
          text: t("produtoSemEstoque"),
        });
      }
    }
  };

  const atualizarQuantidade = (produtoId: string, novaQuantidade: number | "") => {
    const produto = produtos.find(p => p.id === produtoId);

    setCarrinho(prevCarrinho => {
      return prevCarrinho
        .map(item => {
          if (item.produto.id === produtoId) {
            if (novaQuantidade === "" || isNaN(Number(novaQuantidade))) {
              return { ...item, quantidade: 0 };
            }

            const quantidadeNum = Number(novaQuantidade);

            if (produto && quantidadeNum > produto.quantidade) {
              Swal.fire({
                icon: "warning",
                title: t("avisoEstoque"),
                text: t("quantidadeMaiorQueEstoque"),
              });
              return { ...item, quantidade: produto.quantidade };
            }

            if (quantidadeNum < 0) {
              return { ...item, quantidade: 0 };
            }

            return { ...item, quantidade: quantidadeNum };
          }
          return item;
        })
        .filter(item => item.quantidade >= 0);
    });
  };

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter(item => item.produto.id !== produtoId));
  };

  const finalizarVenda = async () => {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    const hasValidItems = carrinho.some(item => item.quantidade > 0);

    if (!empresaId || !hasValidItems) {
      Swal.fire({
        icon: "error",
        title: t("erro"),
        text: carrinho.length === 0 ? t("carrinhoVazio") : t("quantidadeZeroErro"),
      });
      return;
    }

    try {
      setCarregando(true);

      const itemsToSell = carrinho.filter(item => item.quantidade > 0);

      const promises = itemsToSell.map(item => {
        return fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            empresaId,
            produtoId: Number(item.produto.id),
            quantidade: item.quantidade,
            valorCompra: item.produto.preco * 0.8,
            usuarioId: usuarioValor,
            clienteId: clienteSelecionado,
          }),
        });
      });

      const responses = await Promise.all(promises);

      const allSuccessful = responses.every(response => response.ok);
      if (!allSuccessful) {
        throw new Error('Algumas vendas não foram processadas corretamente');
      }

      await Swal.fire({
        position: "center",
        icon: "success",
        title: t("vendaSucesso"),
        showConfirmButton: false,
        timer: 1500,
      });

      setCarrinho([]);
      setClienteSelecionado(null);
      localStorage.removeItem('carrinhoVendas');

      try {
        const responseProdutos = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
        const todosProdutos: ProdutoI[] = await responseProdutos.json();
        const produtosDaEmpresa = todosProdutos.filter((p) => p.empresaId === empresaId);
        setProdutos(produtosDaEmpresa);

        const responseVendas = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/${empresaId}`);
        const vendasData = await responseVendas.json();

        const vendasOrdenadas = (vendasData.vendas || []).sort((a: VendaI, b: VendaI) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        setVendas(vendasOrdenadas);

        const responseTotal = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/venda/contagem/${empresaId}`);
        const totalData = await responseTotal.json();
        setTotalVendas(totalData?.total?._sum?.valorVenda || 0);

      } catch (updateError) {
        console.error("Erro ao atualizar dados:", updateError);
      }

    } catch (err) {
      console.error("Erro ao finalizar venda:", err);
      await Swal.fire({
        icon: "error",
        title: "Erro!",
        text: t("erroFinalizarVenda"),
      });
    } finally {
      setCarregando(false);
    }
  };

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const indexUltimoProduto = paginaAtual * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosAtuais = produtosFiltrados.slice(indexPrimeiroProduto, indexUltimoProduto);
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
  };

  const totalCarrinho = carrinho.reduce((total, item) =>
    total + (item.produto.preco * item.quantidade), 0
  );


if (carregando && !empresaId) {
  return (
    <div className="flex justify-center items-center h-screen" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <p style={{ color: "var(--cor-fonte)" }}>{t("carregando")}</p>
    </div>
  );
}

if (!empresaId || produtos.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8 h-60" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl text-center">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-6" style={{ color: "var(--cor-fonte)" }}>
          {t("titulo")}
        </h1>
        <div className="border rounded-xl p-8 shadow" style={{
          backgroundColor: "var(--cor-fundo-bloco)",
          borderColor: modoDark ? "#FFFFFF" : "#000000",
        }}>
          <p className="text-lg" style={{ color: "var(--cor-fonte)" }}>Você Não Possui Produtos cadastrados</p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: "var(--cor-fonte)" }}>
          {t("titulo")}
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4 mb-3 md:mb-6">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center border rounded-full px-3 md:px-4 py-1 md:py-2 shadow-sm flex-1"
              style={{
                backgroundColor: "var(--cor-fundo-bloco)",
                borderColor: modoDark ? "#FFFFFF" : "#000000",
              }}
            >
              <input
                type="text"
                placeholder={t("buscarProduto")}
                className="outline-none font-mono text-sm bg-transparent"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPaginaAtual(1);
                }}
                style={{ color: "var(--cor-fonte)" }}
              />
              <FaSearch className="ml-2" style={{ color: modoDark ? "#FBBF24" : "#00332C" }} />
            </div>
            {totalPaginas > 1 && (
              <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm md:text-base" style={{ color: "var(--cor-fonte)" }}>
              {t("totalVendas")}: R$ {totalVendas.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <div
              className="border rounded-xl shadow"
              style={{
                backgroundColor: "var(--cor-fundo-bloco)",
                borderColor: modoDark ? "#FFFFFF" : "#000000",
              }}
            >
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b">
                    <tr style={{ color: "var(--cor-fonte)" }}>
                      <th className="py-3 px-4 text-left">{t("produto")}</th>
                      <th className="text-center">{t("estoque")}</th>
                      <th className="text-center">{t("preco")}</th>
                      {(userRole === "ADMIN" || userRole === "PROPRIETARIO") && (
                        <th className="text-center">{t("acoes")}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {produtosAtuais.map((produto) => (
                      <tr
                        key={produto.id}
                        className="border-b hover:bg-opacity-50 transition"
                        style={{
                          color: "var(--cor-fonte)",
                          borderColor: modoDark ? "#FFFFFF" : "#000000",
                        }}
                      >
                        <td className="py-3 px-4 flex items-center gap-2">
                          <Image
                            src={produto.foto || "/out.jpg"}
                            width={30}
                            height={30}
                            className="rounded"
                            alt={produto.nome}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/out.jpg";
                            }}
                          />
                          <span>{produto.nome}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {produto.quantidade}
                        </td>
                        <td className="py-3 px-4 text-center">
                          R$ {produto.preco.toFixed(2).replace(".", ",")}
                        </td>
                        {(userRole === "ADMIN" || userRole === "PROPRIETARIO") && (
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => adicionarAoCarrinho(produto)}
                              disabled={produto.quantidade < 1}
                              className="px-3 py-1 rounded flex items-center gap-1"
                              style={{
                                backgroundColor: modoDark ? "#1a25359f" : "#FFFFFF",
                                color: modoDark ? "#FFFFFF" : "#00332C",
                                border: `1px solid ${modoDark ? "#FFFFFF" : "#00332C"}`,
                                opacity: produto.quantidade < 1 ? 0.5 : 1,
                              }}
                            >
                              <FaShoppingCart size={12} />
                              {t("adicionar")}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2 p-2">
                {produtosAtuais.map((produto) => (
                  <div
                    key={produto.id}
                    className={`border rounded-lg p-3 transition-all ${modoDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src={produto.foto || "/out.jpg"}
                          width={40}
                          height={40}
                          className="rounded"
                          alt={produto.nome}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/out.jpg";
                          }}
                        />
                        <div>
                          <p className="font-medium" style={{ color: "var(--cor-fonte)" }}>
                            {produto.nome}
                          </p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-xs" style={{ color: "var(--cor-subtitulo)" }}>
                              {t("estoque")}: {produto.quantidade}
                            </span>
                            <span className="text-xs" style={{ color: "var(--cor-subtitulo)" }}>
                              {t("preco")}: R$ {produto.preco.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(userRole === "ADMIN" || userRole === "PROPRIETARIO") && (
                        <button
                          onClick={() => adicionarAoCarrinho(produto)}
                          disabled={produto.quantidade < 1}
                          className="p-2 rounded-full"
                          style={{
                            color: modoDark ? "#FBBF24" : "#00332C",
                            opacity: produto.quantidade < 1 ? 0.5 : 1,
                          }}
                        >
                          <FaShoppingCart size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div
              className="border rounded-xl p-3 md:p-4 shadow"
              style={{
                backgroundColor: "var(--cor-fundo-bloco)",
                borderColor: modoDark ? "#FFFFFF" : "#000000",
              }}
            >
              <h2 className="text-lg font-bold mb-3 md:mb-4 flex items-center gap-2" style={{ color: "var(--cor-fonte)" }}>
                <FaShoppingCart /> {t("carrinho")}
              </h2>

              {carrinho.length === 0 ? (
                <p className="text-center py-4 text-sm md:text-base" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("carrinhoVazio")}
                </p>
              ) : (
                <>
                  <div className="max-h-64 md:max-h-96 overflow-y-auto">
                    {carrinho.map((item) => (
                      <div
                        key={item.produto.id}
                        className="flex justify-between items-center py-2 border-b"
                        style={{
                          borderColor: modoDark ? "#FFFFFF" : "#000000",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={item.produto.foto || "/out.jpg"}
                            width={30}
                            height={30}
                            className="rounded"
                            alt={item.produto.nome}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/out.jpg";
                            }}
                          />
                          <div>
                            <span className="text-sm md:text-base" style={{ color: "var(--cor-fonte)" }}>
                              {item.produto.nome}
                            </span>
                            <div className="text-xs" style={{
                              color: item.quantidade >= item.produto.quantidade ? "#EF4444" : "var(--cor-subtitulo)"
                            }}>
                              {t("estoqueDisponivel")}: {item.produto.quantidade}
                              {item.quantidade >= item.produto.quantidade && (
                                <span className="ml-1">({t("semEstoqueAdicional")})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            min="0"
                            max={item.produto.quantidade}
                            value={item.quantidade}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                atualizarQuantidade(item.produto.id, 0);
                              }
                              else if (/^\d+$/.test(value)) {
                                const numValue = parseInt(value, 10);
                                if (item.quantidade === 0) {
                                  atualizarQuantidade(item.produto.id, numValue);
                                }
                                else {
                                  atualizarQuantidade(item.produto.id, numValue);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "" || !/^\d+$/.test(e.target.value)) {
                                atualizarQuantidade(item.produto.id, 0);
                              }
                            }}
                            className="w-12 md:w-16 p-1 rounded text-center"
                            style={{
                              backgroundColor: "transparent",
                              color: "var(--cor-fonte)",
                              border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}`,
                            }}
                          />

                          <span className="text-sm md:text-base" style={{ color: "var(--cor-fonte)" }}>
                            R$ {(item.produto.preco * item.quantidade).toFixed(2).replace(".", ",")}
                          </span>

                          <button
                            onClick={() => removerDoCarrinho(item.produto.id)}
                            className="p-1 rounded-full"
                            style={{
                              color: modoDark ? "#F87171" : "#DC2626",
                            }}
                          >
                            <FaRegTrashAlt size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t" style={{ borderColor: modoDark ? "#FFFFFF" : "#000000" }}>
                    <div className="mb-3 md:mb-4">
                      <label className="block mb-1 text-sm" style={{ color: "var(--cor-fonte)" }}>
                        {t("cliente")}
                      </label>
                      <select
                        value={clienteSelecionado || ""}
                        onChange={(e) => setClienteSelecionado(e.target.value || null)}
                        className="w-full p-2 rounded border text-sm md:text-base"
                        style={{
                          backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                          color: modoDark ? "#FFFFFF" : "#000000",
                          borderColor: modoDark ? "#FFFFFF" : "#000000",
                        }}
                      >
                        <option value="">{t("naoInformarCliente")}</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span style={{ color: "var(--cor-fonte)" }}>{t("subtotal")}:</span>
                      <span style={{ color: "var(--cor-fonte)" }}>R$ {totalCarrinho.toFixed(2).replace(".", ",")}</span>
                    </div>

                    <button
                      onClick={finalizarVenda}
                      disabled={carregando}
                      className="w-full border-2 py-2 rounded-lg font-medium mt-2 md:mt-4 cursor-pointer text-sm md:text-base"
                      style={{
                        backgroundColor: modoDark ? "#1a25359f" : "#00332C",
                        color: "#FFFFFF",
                        opacity: carregando ? 0.7 : 1,
                      }}
                    >
                      {carregando ? t("processando") : t("finalizarVenda")}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div
              className="border rounded-xl p-3 md:p-4 shadow"
              style={{
                backgroundColor: "var(--cor-fundo-bloco)",
                borderColor: modoDark ? "#FFFFFF" : "#000000",
              }}
            >
              <h2 className="text-lg font-bold mb-3 md:mb-4" style={{ color: "var(--cor-fonte)" }}>
                {t("vendasRecentes")}
              </h2>

              {vendas.length === 0 ? (
                <p className="text-center py-4 text-sm md:text-base" style={{ color: "var(--cor-subtitulo)" }}>
                  {t("semVendas")}
                </p>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {vendas.slice(0, 5).map((venda) => (
                    <div key={venda.id} className="border-b pb-2" style={{ borderColor: modoDark ? "#FFFFFF" : "#000000" }}>
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <p className="text-sm md:text-base" style={{ color: "var(--cor-fonte)" }}>
                            {venda.produto?.nome || "Produto desconhecido"}
                          </p>
                          <p className="text-xs" style={{ color: "var(--cor-subtitulo)" }}>
                            {venda.cliente?.nome || t("clienteNaoInformado")} • {venda.createdAt ? new Date(venda.createdAt).toLocaleDateString() : "Data desconhecida"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm md:text-base" style={{ color: "var(--cor-fonte)" }}>
                            {venda.quantidade} x R$ {(venda.produto?.preco || 0).toFixed(2).replace(".", ",")}
                          </p>
                          <p className="font-medium text-sm md:text-base" style={{ color: modoDark ? "#FBBF24" : "#00332C" }}>
                            R$ {(venda.valorVenda || 0).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}