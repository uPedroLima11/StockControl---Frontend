"use client";

import { ProdutoI } from "@/utils/types/produtos";
import { FornecedorI } from "@/utils/types/fornecedor";
import { CategoriaI } from "@/utils/types/categoria";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { FaSearch, FaCog, FaLock, FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight, FaStar, FaRegStar } from "react-icons/fa";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export default function Produtos() {
  const [produtos, setProdutos] = useState<ProdutoI[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState<ProdutoI | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorI[]>([]);
  const [categorias, setCategorias] = useState<CategoriaI[]>([]);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [modoDark, setModoDark] = useState(false);
  const [produtoExpandido, setProdutoExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const produtosPorPagina = 10;
  const { t } = useTranslation("produtos");
  const router = useRouter();

  const [form, setForm] = useState<ProdutoI>({
    id: "",
    nome: "",
    descricao: "",
    preco: 0,
    quantidade: 0,
    quantidadeMin: 0,
    foto: "",
    noCatalogo: false,
    fornecedorId: "",
    categoriaId: "",
    empresaId: "",
    fornecedor: undefined,
    categoria: undefined,
    empresa: "",
    usuarioId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [nomeCaracteres, setNomeCaracteres] = useState(0);
  const [descricaoCaracteres, setDescricaoCaracteres] = useState(0);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const verificarAtivacaoEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar dados da empresa");
      }
      const empresaData = await response.json();

      const ativada = empresaData.ChaveAtivacao !== null && empresaData.ChaveAtivacao !== undefined;

      setEmpresaAtivada(ativada);
      return ativada;
    } catch (error) {
      console.error("Erro ao verificar ativação da empresa:", error);
      return false;
    }
  };

  const mostrarAlertaNaoAtivada = () => {
    Swal.fire({
      title: t("empresaNaoAtivada.titulo"),
      text: t("empresaNaoAtivada.mensagem"),
      icon: "warning",
      confirmButtonText: t("empresaNaoAtivada.botao"),
      confirmButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/ativacao");
      }
    });
  };

  const handleAcaoProtegida = (acao: () => void) => {
    if (!empresaAtivada) {
      mostrarAlertaNaoAtivada();
      return;
    }
    acao();
  };

  useEffect(() => {
    const initialize = async () => {
      const temaSalvo = localStorage.getItem("modoDark");
      const ativado = temaSalvo === "true";
      setModoDark(ativado);

      const root = document.documentElement;

      if (ativado) {
        root.style.setProperty("--cor-fundo", "#20252B");
        root.style.setProperty("--cor-fonte", "#FFFFFF");
        root.style.setProperty("--cor-subtitulo", "#A3A3A3");
        root.style.setProperty("--cor-fundo-bloco", "#1a25359f");
        root.style.setProperty("--cor-teste", "#000000");
      } else {
        root.style.setProperty("--cor-fundo", "#FFFFFF");
        root.style.setProperty("--cor-fonte", "#000000");
        root.style.setProperty("--cor-subtitulo", "#4B5563");
        root.style.setProperty("--cor-fundo-bloco", "#ececec");
        root.style.setProperty("--cor-teste", "#000000");
      }

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
      if (!responseUsuario.ok) {
        console.error("Erro ao buscar os dados do usuário");
        return;
      }
      const usuario = await responseUsuario.json();
      setEmpresaId(usuario.empresaId);
      setTipoUsuario(usuario.tipo);


      if (usuario.empresaId) {
        const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
        setEmpresaAtivada(ativada);

        if (ativada) {
          const responseProdutos = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`);
          if (responseProdutos.ok) {
            const todosProdutos = await responseProdutos.json();
            const produtosDaEmpresa = todosProdutos
              .filter((p: ProdutoI) => p.empresaId === usuario.empresaId)
              .sort((a: ProdutoI, b: ProdutoI) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            setProdutos(produtosDaEmpresa);
          }
        }
      }

      const responseFornecedores = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`);
      if (responseFornecedores.ok) {
        const fornecedoresData = await responseFornecedores.json();
        setFornecedores(fornecedoresData);
      }

      const responseCategorias = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/categorias`);
      if (responseCategorias.ok) {
        const categoriasData = await responseCategorias.json();
        setCategorias(categoriasData);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (modalVisualizar) {
      setForm({
        ...modalVisualizar,
        preco: parseFloat(modalVisualizar.preco.toFixed(2)),
        quantidade: modalVisualizar.quantidade,
        quantidadeMin: modalVisualizar.quantidadeMin || 0,
      });
      setPreview(modalVisualizar.foto || null);
      setNomeCaracteres(modalVisualizar.nome?.length || 0);
      setDescricaoCaracteres(modalVisualizar.descricao?.length || 0);
    }
  }, [modalVisualizar]);

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 60) {
      setForm({ ...form, nome: value });
      setNomeCaracteres(value.length);
    }
  };

  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 255) {
      setForm({ ...form, descricao: value });
      setDescricaoCaracteres(value.length);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const toggleCatalogo = async (produtoId: string, noCatalogo: boolean) => {
    handleAcaoProtegida(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${produtoId}/catalogo`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ noCatalogo: !noCatalogo }),
        });

        if (response.ok) {
          const produtoAtualizado = await response.json();

          setProdutos(produtos.map(p =>
            p.id === produtoId ? { ...p, noCatalogo: produtoAtualizado.noCatalogo } : p
          ));

          if (modalVisualizar && modalVisualizar.id === produtoId) {
            setModalVisualizar({ ...modalVisualizar, noCatalogo: produtoAtualizado.noCatalogo });
            setForm({ ...form, noCatalogo: produtoAtualizado.noCatalogo });
          }

          Swal.fire({
            position: "center",
            icon: "success",
            title: produtoAtualizado.noCatalogo
              ? t("produtoAdicionadoCatalogo.titulo")
              : t("produtoRemovidoCatalogo.titulo"),
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire("Erro!", "Não foi possível alterar o catálogo", "error");
        }
      } catch (err) {
        console.error("Erro ao alterar catálogo:", err);
        Swal.fire("Erro!", "Erro de conexão com o servidor", "error");
      }
    });
  };

  const handleSubmit = async () => {
    handleAcaoProtegida(async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!empresaId) {
        Swal.fire("Erro", "Empresa não identificada.", "error");
        return;
      }

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      try {
        const formData = new FormData();

        if (file) {
          formData.append("foto", file);
        } else if (form.foto) {
          formData.append("foto", form.foto);
        }

        formData.append("nome", form.nome);
        formData.append("descricao", form.descricao);
        formData.append("preco", form.preco.toString());
        formData.append("quantidade", form.quantidade.toString());
        formData.append("quantidadeMin", form.quantidadeMin.toString());
        formData.append("noCatalogo", form.noCatalogo.toString());
        if (form.fornecedorId) formData.append("fornecedorId", form.fornecedorId);
        if (form.categoriaId) formData.append("categoriaId", form.categoriaId);
        formData.append("empresaId", empresaId);
        formData.append("usuarioId", usuarioValor);

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          setModalAberto(false);
          setForm({
            id: "",
            nome: "",
            descricao: "",
            noCatalogo: false,
            preco: 0,
            quantidade: 0,
            quantidadeMin: 0,
            foto: "",
            fornecedorId: "",
            categoriaId: "",
            empresaId: "",
            fornecedor: undefined,
            categoria: undefined,
            empresa: "",
            usuarioId: "",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          setFile(null);
          setPreview(null);

          Swal.fire({
            position: "center",
            icon: "success",
            title: t("produtoCriadoSucesso.titulo"),
            showConfirmButton: false,
            timer: 1500,
          });

          setTimeout(() => window.location.reload(), 1600);
        } else {
          const errorText = await response.text();
          Swal.fire("Erro!", `Erro ao cadastrar produto: ${errorText}`, "error");
        }
      } catch (err) {
        console.error("Erro ao criar produto:", err);
        Swal.fire("Erro!", "Erro de conexão com o servidor", "error");
      }
    });
  };

  const handleUpdate = async () => {
    handleAcaoProtegida(async () => {
      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!modalVisualizar) return;

      if (empresaId) {
        const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
        if (!empresaAtivada) {
          mostrarAlertaNaoAtivada();
          return;
        }
      }

      try {
        const formData = new FormData();

        if (file) {
          formData.append("foto", file);
        }

        formData.append("nome", form.nome);
        formData.append("descricao", form.descricao);
        formData.append("preco", form.preco.toString());
        formData.append("quantidade", form.quantidade.toString());
        formData.append("quantidadeMin", form.quantidadeMin.toString());
        formData.append("noCatalogo", form.noCatalogo.toString());
        formData.append("usuarioId", usuarioValor);

        if (form.fornecedorId) formData.append("fornecedorId", form.fornecedorId);
        if (form.categoriaId) formData.append("categoriaId", form.categoriaId);

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${modalVisualizar.id}`, {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          const updatedProduto = await response.json();

          setModalVisualizar(null);
          setFile(null);
          setPreview(null);

          setProdutos(produtos.map(p => p.id === updatedProduto.id ? updatedProduto : p));
          Swal.fire({
            position: "center",
            icon: "success",
            title: t("produtoAtualizadoSucesso.titulo"),
            showConfirmButton: false,
            timer: 1500,
          });
          setTimeout(() => window.location.reload(), 1600);
        } else {
          const errorText = await response.text();
          Swal.fire({
            icon: "error",
            title: "Erro!",
            text: `Erro ao atualizar produto: ${errorText}`
          });
        }
      } catch (err) {
        console.error("Erro ao atualizar produto:", err);
        Swal.fire({
          icon: "error",
          title: "Erro!",
          text: "Erro inesperado ao tentar atualizar."
        });
      }
    });
  };

  const handleDelete = async () => {
    handleAcaoProtegida(async () => {
      if (!modalVisualizar) return;

      if (empresaId) {
        const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
        if (!empresaAtivada) {
          mostrarAlertaNaoAtivada();
          return;
        }
      }

      const result = await Swal.fire({
        title: t("confirmacaoExclusao.titulo"),
        text: t("confirmacaoExclusao.mensagem"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("confirmacaoExclusao.botaoConfirmar"),
        cancelButtonText: t("confirmacaoExclusao.botaoCancelar"),
      });

      if (result.isConfirmed) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos/${modalVisualizar.id}`, {
            method: "DELETE",
          });
          Swal.fire(
            t("produtoExcluidoSucesso.titulo"),
            t("produtoExcluidoSucesso.mensagem"),
            "success"
          );
          setModalVisualizar(null);
          window.location.reload();
        } catch (err) {
          console.error("Erro ao excluir produto:", err);
          Swal.fire("Erro!", "Não foi possível deletar o produto.", "error");
        }
      }
    });
  };

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const indexUltimoProduto = paginaAtual * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosAtuais = produtosFiltrados.slice(indexPrimeiroProduto, indexUltimoProduto);
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);

  const podeEditar = (tipoUsuario === "ADMIN" || tipoUsuario === "PROPRIETARIO") && empresaAtivada;

  const toggleExpandirProduto = (id: string) => {
    setProdutoExpandido(produtoExpandido === id ? null : id);
  };

  const formatarPreco = (preco: number) => {
    return preco.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setProdutoExpandido(null);
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: "var(--cor-fonte)" }}>
          {t("titulo")}
        </h1>

        {empresaId && !empresaAtivada && (
          <div className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor: modoDark ? "#1E3A8A" : "#BFDBFE",
              color: modoDark ? "#FFFFFF" : "#1E3A8A"
            }}>
            <FaLock className="text-xl" />
            <div>
              <p className="font-bold">{t("empresaNaoAtivada.alertaTitulo")}</p>
              <p>{t("empresaNaoAtivada.alertaMensagem")}</p>
            </div>
          </div>
        )}

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
                placeholder={t("buscar")}
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

          {podeEditar && (
            <button
              onClick={() => handleAcaoProtegida(() => setModalAberto(true))}
              className="px-6 py-2 border-2 rounded-lg transition font-mono text-sm"
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#FFFFFF",
                borderColor: modoDark ? "#FFFFFF" : "#00332C",
                color: modoDark ? "#FFFFFF" : "#00332C",
              }}
            >
              {t("novo")}
            </button>
          )}
        </div>

        <div
          className="border rounded-xl shadow"
          style={{
            backgroundColor: "var(--cor-fundo-bloco)",
            borderColor: modoDark ? "#FFFFFF" : "#000000",
          }}
        >
          {produtosFiltrados.length === 0 ? (
            <div className="p-4 text-center" style={{ color: "var(--cor-fonte)" }}>
              {t("nenhumProdutoEncontrado")}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b">
                    <tr style={{ color: "var(--cor-fonte)" }}>
                      <th className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <FaCog /> {t("nome")}
                        </div>
                      </th>
                      <th>{t("fornecedor")}</th>
                      <th>{t("categoria")}</th>
                      <th className="text-center">{t("estoque")}</th>
                      <th>{t("preco")}</th>
                      <th className="text-center">{t("catalogo")}</th>
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
                        <td
                          className="py-3 px-4 flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setModalVisualizar(produto);
                            setForm(produto);
                          }}
                        >
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
                          <span className="max-w-[500px] overflow-hidden text-ellipsis whitespace-nowrap block">{produto.nome}</span>
                        </td>
                        <td className="py-3 px-3 text-center">{produto.fornecedor?.nome || "-"}</td>
                        <td className="py-3 px-3 text-center">{produto.categoria?.nome || "-"}</td>
                        <td className="py-3 px-4 text-center">{produto.quantidade || "-"}</td>
                        <td className="py-3 px-3 text-center">
                          R$ {formatarPreco(produto.preco)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCatalogo(produto.id, produto.noCatalogo);
                            }}
                            className="p-1 text-yellow-500 hover:text-yellow-600 transition"
                            title={produto.noCatalogo ? t("removerDoCatalogo") : t("adicionarAoCata")}
                          >
                            {produto.noCatalogo ? <FaStar /> : <FaRegStar />}
                          </button>
                        </td>
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
                      <div className="flex items-center gap-2 flex-1">
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
                        <div className="flex-1">
                          <p className="font-semibold" style={{ color: "var(--cor-fonte)" }}>
                            {produto.nome}
                          </p>
                          <p className="text-xs" style={{ color: "var(--cor-subtitulo)" }}>
                            R$ {formatarPreco(produto.preco)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCatalogo(produto.id, produto.noCatalogo)}
                          className="text-yellow-500 hover:text-yellow-600 p-1"
                          title={produto.noCatalogo ? t("removerDoCatalogo") : t("adicionarAoCata")}
                        >
                          {produto.noCatalogo ? <FaStar /> : <FaRegStar />}
                        </button>

                        <button
                          onClick={() => toggleExpandirProduto(produto.id)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          style={{ color: modoDark ? "#a0aec0" : "#4a5568" }}
                        >
                          {produtoExpandido === produto.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${produtoExpandido === produto.id ? "max-h-96" : "max-h-0"
                        }`}
                      style={{ color: "var(--cor-fonte)" }}
                    >
                      <div className="pt-2 border-t" style={{ borderColor: modoDark ? "#374151" : "#e5e7eb" }}>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="font-semibold">{t("fornecedor")}:</p>
                            <p>{produto.fornecedor?.nome || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{t("categoria")}:</p>
                            <p>{produto.categoria?.nome || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{t("estoque")}:</p>
                            <p>{produto.quantidade || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{t("quantidadeMinima")}:</p>
                            <p>{produto.quantidadeMin || "-"}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{t("catalogo")}:</p>
                            <p>{produto.noCatalogo ? t("sim") : t("nao")}</p>
                          </div>
                        </div>
                        {produto.descricao && (
                          <div className="mt-2">
                            <p className="font-semibold">{t("descricao")}:</p>
                            <p>{produto.descricao}</p>
                          </div>
                        )}
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setModalVisualizar(produto);
                              setForm(produto);
                            }}
                            className="px-3 py-1 text-sm rounded border"
                            style={{
                              backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                              color: modoDark ? "#FFFFFF" : "#000000",
                            }}
                          >
                            {t("editar")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {(modalAberto || modalVisualizar) && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
            <div
              className="p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: "var(--cor-fundo-bloco)",
                color: "var(--cor-fonte)",
              }}
            >
              <h2 className="text-xl font-bold mb-4">
                {modalVisualizar ? t("editarProduto") : t("novoProduto")}
              </h2>

              <div className="mb-3">
                <label className="block mb-1 text-sm">{t("nome")}</label>
                <input
                  placeholder={t("nome")}
                  value={form.nome || ""}
                  onChange={handleNomeChange}
                  className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  style={{
                    backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                    color: modoDark ? "#FFFFFF" : "#000000"
                  }}
                  maxLength={60}
                />
                <div className="text-xs text-right mt-1" style={{ color: nomeCaracteres === 60 ? "#ef4444" : "var(--cor-subtitulo)" }}>
                  {nomeCaracteres}/60 {nomeCaracteres === 60 && " - Limite atingido"}
                </div>
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-sm">{t("descricao")}</label>
                <input
                  placeholder={t("descricao")}
                  value={form.descricao || ""}
                  onChange={handleDescricaoChange}
                  className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  style={{
                    backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                    color: modoDark ? "#FFFFFF" : "#000000"
                  }}
                  maxLength={255}
                />
                <div className="text-xs text-right mt-1" style={{ color: descricaoCaracteres === 255 ? "#ef4444" : "var(--cor-subtitulo)" }}>
                  {descricaoCaracteres}/255 {descricaoCaracteres === 255 && " - Limite atingido"}
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <div className="flex-1">
                  <label className="block mb-1 text-sm">{t("preco")}</label>
                  <input
                    placeholder={t("preco")}
                    type="number"
                    min={0}
                    value={form.preco || ""}
                    onChange={(e) => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })}
                    className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    style={{
                      backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                      color: modoDark ? "#FFFFFF" : "#000000"
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm">{t("quantidade")}</label>
                  <input
                    placeholder={t("quantidade")}
                    type="number"
                    min={0}
                    value={form.quantidade || ""}
                    onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                    className={`${inputClass} bg-transparent border  ${modoDark ? "border-white" : "border-gray-300"}`}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    style={{
                      backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                      color: modoDark ? "#FFFFFF" : "#000000"
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full">
                {podeEditar && (
                  <div className="flex-1 flex flex-col justify-end mb-3">
                    <label className="block mb-1 text-sm">{t("foto")}</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full px-3 py-3 cursor-pointer rounded border text-sm flex items-center justify-center gap-2 mb-3 ${modoDark
                        ? "border-blue-400"
                        : "border-gray-400"
                        }`}
                      style={{
                        backgroundColor: modoDark ? "#183366" : "#e5e7eb",
                        color: modoDark ? "#60a5fa" : "#374151",
                        fontWeight: 600,
                        transition: "background 0.2s",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={modoDark ? "#60a5fa" : "#374151"}
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                      {t("selecionarImagem")}
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <label className="block mb-1 text-sm">{t("quantidadeMinima")}</label>
                  <input
                    placeholder={t("quantidadeMinima")}
                    type="number"
                    min={0}
                    value={form.quantidadeMin || ""}
                    onChange={(e) => setForm({ ...form, quantidadeMin: Number(e.target.value) })}
                    className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
                    disabled={Boolean(!podeEditar && modalVisualizar)}
                    style={{
                      backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                      color: modoDark ? "#FFFFFF" : "#000000"
                    }}
                  />
                </div>
              </div>
              {(preview || form.foto) && (
                <div className="mb-4 ">
                  <img
                    src={preview || form.foto || ""}
                    alt="Preview"
                    className=" w-20 h-20 md:w-44 md:h-44 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/out.jpg";
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2 mb-3">
                <select
                  value={form.fornecedorId || ""}
                  onChange={(e) => setForm({ ...form, fornecedorId: e.target.value })}
                  className={`${inputClass} bg-transparent px-6 py-3 md:py-[0.65rem] rounded border text-sm ${modoDark ? "border-white" : "border-gray-300"}`}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  style={{
                    backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                    color: modoDark ? "#FFFFFF" : "#000000"
                  }}
                >
                  <option value="">{t("selecionarFornecedor")}</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={form.categoriaId || ""}
                  onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                  className={`${inputClass} bg-transparent px-6 py-3 md:py-[0.65rem] rounded border text-sm ${modoDark ? "border-white" : "border-gray-300"}`}
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  style={{
                    backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                    color: modoDark ? "#FFFFFF" : "#000000"
                  }}
                >
                  <option value="">{t("selecionarCategoria")}</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {podeEditar && (
                <div className="flex items-center mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.noCatalogo || false}
                      onChange={(e) => setForm({ ...form, noCatalogo: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">{t("adicionarAoCata")}</span>
                  </label>
                </div>
              )}

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setModalVisualizar(null);
                    setFile(null);
                    setPreview(null);
                  }}
                  className="cursor-pointer hover:underline"
                  style={{ color: "var(--cor-fonte)" }}
                >
                  {t("fechar")}
                </button>
                {modalVisualizar ? (
                  podeEditar && (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="px-4 cursor-pointer py-2 rounded hover:bg-blue-700"
                        style={{
                          backgroundColor: "green",
                          color: "white",
                        }}
                      >
                        {t("salvar")}
                      </button>
                      <button
                        onClick={handleDelete}
                        className="cursor-pointer px-4 py-2 rounded hover:bg-red-700"
                        style={{
                          backgroundColor: "red",
                          color: "white",

                        }}
                      >
                        {t("excluir")}
                      </button>
                    </>
                  )
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="cursor-pointer px-4 py-2 rounded hover:bg-[#00443f]"
                    style={{
                      backgroundColor: "green",
                      color: "white",
                    }}
                  >
                    {t("criar")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass = "w-full rounded p-2 mb-3";