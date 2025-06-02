"use client";
import { FornecedorI } from "@/utils/types/fornecedor";
import { useEffect, useState } from "react";
import { FaCog, FaSearch, FaPhoneAlt, FaLock, FaChevronDown, FaChevronUp, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export default function Fornecedores() {
  const [modoDark, setModoDark] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [fornecedores, setFornecedores] = useState<FornecedorI[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState<FornecedorI | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [form, setForm] = useState<FornecedorI>({
    id: "",
    nome: "",
    email: "",
    cnpj: "",
    telefone: "",
    categoria: "",
    foto: "",
    empresaId: "",
    usuarioId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    Produto: [],
  });
  const [busca, setBusca] = useState("");
  const [fornecedorExpandido, setFornecedorExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const fornecedoresPorPagina = 10;
  const { t } = useTranslation("fornecedores");
  const router = useRouter();

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
      } else {
        root.style.setProperty("--cor-fundo", "#FFFFFF");
        root.style.setProperty("--cor-fonte", "#000000");
        root.style.setProperty("--cor-subtitulo", "#4B5563");
        root.style.setProperty("--cor-fundo-bloco", "#ececec");
      }

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const responseUsuario = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`);
      const usuario = await responseUsuario.json();
      setEmpresaId(usuario.empresaId);
      setTipoUsuario(usuario.tipo);

      if (usuario.empresaId) {
        const ativada = await verificarAtivacaoEmpresa(usuario.empresaId);
        setEmpresaAtivada(ativada);
      }

      const responseFornecedores = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`);
      const fornecedoresData = await responseFornecedores.json();
      const fornecedoresOrdenados = fornecedoresData.sort((a: FornecedorI, b: FornecedorI) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setFornecedores(fornecedoresOrdenados);
    };

    initialize();
  }, []);

  const formatarData = (dataString: string | Date) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatarTelefone = (telefone: string) => {
    return `(${telefone.slice(2, 4)}) ${telefone.slice(4, 9)}-${telefone.slice(9)}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleAdicionarFornecedor() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");
    handleAcaoProtegida(async () => {
      if (!empresaId) return alert("Empresa não identificada.");

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      const formData = new FormData();
      formData.append("nome", form.nome);
      formData.append("email", form.email);
      formData.append("cnpj", form.cnpj);
      formData.append("telefone", form.telefone);
      formData.append("categoria", form.categoria);
      formData.append("empresaId", empresaId);
      formData.append("usuarioId", usuarioValor || "");
      if (fotoFile) {
        formData.append("foto", fotoFile);
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 201) {
        Swal.fire({
          text: t("mensagens.fornecedorAdicionado"),
          icon: "success",
          confirmButtonColor: "#013C3C",
        });
        setModalAberto(false);
        window.location.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: t("mensagens.erro"),
          text: t("mensagens.erroAdicionar"),
          confirmButtonColor: "#013C3C",
        });
      }
    });
  }

  async function handleSalvarFornecedor() {
    const usuarioSalvo = localStorage.getItem("client_key");
    if (!usuarioSalvo) return;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");
    handleAcaoProtegida(async () => {
      if (!modalVisualizar?.id) return;

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId || "");
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      const formData = new FormData();
      formData.append("nome", form.nome);
      formData.append("email", form.email);
      formData.append("cnpj", form.cnpj);
      formData.append("telefone", form.telefone);
      formData.append("categoria", form.categoria);
      formData.append("empresaId", empresaId || "");
      formData.append("usuarioId", usuarioValor || "");

      if (fotoFile) {
        formData.append("foto", fotoFile);
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${modalVisualizar.id}`, {
          method: "PUT",
          body: formData,
        });

        if (response.ok) {
          Swal.fire({
            text: t("mensagens.fornecedorAtualizado"),
            icon: "success",
            confirmButtonColor: "#013C3C",
          });
          setModalVisualizar(null);
          window.location.reload();
        } else {
          throw new Error("Erro ao atualizar fornecedor");
        }
      } catch (error) {
        console.error("Erro ao atualizar fornecedor:", error);
        Swal.fire({
          icon: "error",
          title: t("mensagens.erro"),
          text: t("mensagens.erroAtualizar"),
          confirmButtonColor: "#013C3C",
        });
      }
    });
  }

  async function handleDelete() {
    handleAcaoProtegida(async () => {
      if (!modalVisualizar) return;

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId || "");
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      const result = await Swal.fire({
        title: t("mensagens.temCerteza"),
        text: t("mensagens.naoReverter"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("mensagens.simDeletar"),
        cancelButtonText: t("mensagens.cancelar"),
      });

      if (result.isConfirmed) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/fornecedor/${modalVisualizar.id}`, {
            method: "DELETE",
          });
          Swal.fire(t("mensagens.deletado"), t("mensagens.produtoExcluido"), "success");
          setModalVisualizar(null);
          window.location.reload();
        } catch (err) {
          console.error("Erro ao excluir produto:", err);
          Swal.fire(t("mensagens.erro"), t("mensagens.erroDeletar"), "error");
        }
      }
    });
  }

  function handleEntrarContato(fornecedor: FornecedorI) {
    const telefoneFormatado = fornecedor.telefone.replace(/\D/g, "");
    const numeroComDdd = `${telefoneFormatado}`;
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroComDdd}`;
    window.open(urlWhatsApp, "_blank");
  }

  const toggleExpandirFornecedor = (id: string) => {
    setFornecedorExpandido(fornecedorExpandido === id ? null : id);
  };

  const podeEditar = (tipoUsuario === "ADMIN" || tipoUsuario === "PROPRIETARIO") && empresaAtivada;

  // Filtra e pagina os fornecedores
  const fornecedoresFiltrados = fornecedores.filter(
    (fornecedor) =>
      fornecedor.empresaId === empresaId &&
      (fornecedor.nome.toLowerCase().includes(busca.toLowerCase()) ||
        fornecedor.categoria.toLowerCase().includes(busca.toLowerCase()))
  );

  const indexUltimoFornecedor = paginaAtual * fornecedoresPorPagina;
  const indexPrimeiroFornecedor = indexUltimoFornecedor - fornecedoresPorPagina;
  const fornecedoresAtuais = fornecedoresFiltrados.slice(indexPrimeiroFornecedor, indexUltimoFornecedor);
  const totalPaginas = Math.ceil(fornecedoresFiltrados.length / fornecedoresPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setFornecedorExpandido(null);
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: "var(--cor-fonte)" }}>
          {t("titulo")}
        </h1>

        {empresaId && !empresaAtivada && (
          <div className="mb-3 md:mb-6 p-3 md:p-4 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor: modoDark ? "#1E3A8A" : "#BFDBFE",
              color: modoDark ? "#FFFFFF" : "#1E3A8A"
            }}>
            <FaLock className="text-lg md:text-xl" />
            <div>
              <p className="font-bold text-sm md:text-base">{t("empresaNaoAtivada.alertaTitulo")}</p>
              <p className="text-xs md:text-sm">{t("empresaNaoAtivada.alertaMensagem")}</p>
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
              className="px-4 md:px-6 py-1 md:py-2 border-2 rounded-lg transition font-mono text-sm sm:w-auto"
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#FFFFFF",
                borderColor: modoDark ? "#FFFFFF" : "#00332C",
                color: modoDark ? "#FFFFFF" : "#00332C",
              }}
            >
              {t("novoFornecedor")}
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
          {fornecedoresFiltrados.length === 0 ? (
            <div className="p-4 text-center" style={{ color: "var(--cor-fonte)" }}>
              {t("nenhumFornecedorEncontrado")}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b">
                    <tr style={{ color: "var(--cor-fonte)" }}>
                      <th className="py-3 px-4 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <FaCog /> {t("foto")}
                        </div>
                      </th>
                      <th className="py-3 px-4 text-center">{t("nome")}</th>
                      <th className="py-3 px-4 text-center">{t("cnpj")}</th>
                      <th className="py-3 px-4 text-center">{t("email")}</th>
                      <th className="py-3 px-4 text-center">{t("telefone")}</th>
                      <th className="py-3 px-4 text-center">{t("categoria")}</th>
                      <th className="py-3 px-4 text-center">{t("adicionadoEm")}</th>
                      <th className="py-3 px-4 text-center">{t("contato")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fornecedoresAtuais.map((fornecedor) => (
                      <tr
                        key={fornecedor.id}
                        className={`cursor-pointer border-b transition ${modoDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          }`}
                      >
                        <td
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {fornecedor.foto ? (
                            <img
                              src={fornecedor.foto || "/contadefault.png"}
                              alt={fornecedor.nome}
                              className="mx-auto w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full"></div>
                          )}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {fornecedor.nome}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {fornecedor.cnpj}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {fornecedor.email}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {formatarTelefone(fornecedor.telefone)}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {fornecedor.categoria}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(fornecedor);
                            setForm(fornecedor);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {formatarData(fornecedor.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <FaPhoneAlt
                            onClick={() => handleEntrarContato(fornecedor)}
                            color="#25D366"
                            size={20}
                            className="cursor-pointer m-auto border-2 p-1 rounded-2xl"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-2 p-2">
                {fornecedoresAtuais.map((fornecedor) => (
                  <div
                    key={fornecedor.id}
                    className={`border rounded-lg p-3 transition-all ${modoDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        {fornecedor.foto ? (
                          <img
                            src={fornecedor.foto || "/contadefault.png"}
                            alt={fornecedor.nome}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full"></div>
                        )}
                        <div>
                          <p className="font-semibold" style={{ color: "var(--cor-fonte)" }}>{fornecedor.nome}</p>
                          <p className="text-xs" style={{ color: "var(--cor-subtitulo)" }}>
                            {fornecedor.categoria}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FaPhoneAlt
                          onClick={() => handleEntrarContato(fornecedor)}
                          color="#25D366"
                          size={16}
                          className="cursor-pointer border p-1 rounded-full"
                        />
                        <button
                          onClick={() => toggleExpandirFornecedor(fornecedor.id)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          style={{ color: modoDark ? "#a0aec0" : "#4a5568" }}
                        >
                          {fornecedorExpandido === fornecedor.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${fornecedorExpandido === fornecedor.id ? "max-h-96" : "max-h-0"
                        }`}
                      style={{ color: "var(--cor-fonte)" }}
                    >
                      <div className="pt-2 border-t space-y-2" style={{ borderColor: modoDark ? "#374151" : "#e5e7eb" }}>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("cnpj")}:</span>
                          <span>{fornecedor.cnpj}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("email")}:</span>
                          <span>{fornecedor.email}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("telefone")}:</span>
                          <span>{formatarTelefone(fornecedor.telefone)}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("adicionadoEm")}:</span>
                          <span>{formatarData(fornecedor.createdAt)}</span>
                        </div>
                        {podeEditar && (
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => {
                                setModalVisualizar(fornecedor);
                                setForm(fornecedor);
                              }}
                              className="px-3 py-1 text-xs rounded border"
                              style={{
                                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                                borderColor: modoDark ? "#FFFFFF" : "#000000",
                                color: modoDark ? "#FFFFFF" : "#000000"
                              }}
                            >
                              {t("editar")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {(modalAberto || modalVisualizar) && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-4 md:p-6 rounded-lg shadow-xl w-full max-w-md mx-2 bg-opacity-90"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              color: "var(--cor-fonte)",
            }}
          >
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
              {modalVisualizar ? t("visualizarFornecedor") : t("novoFornecedor")}
            </h2>

            <label className="block mb-1 text-sm">{t("nome")}</label>
            <input
              placeholder={t("nome")}
              value={form.nome || ""}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
              disabled={Boolean(!podeEditar && modalVisualizar)}
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            />

            <label className="block mb-1 text-sm">{t("email")}</label>
            <input
              placeholder={t("email")}
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
              disabled={Boolean(!podeEditar && modalVisualizar)}
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            />

            <label className="block mb-1 text-sm">{t("cnpj")}</label>
            <input
              placeholder={t("cnpj")}
              value={form.cnpj || ""}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
              disabled={Boolean(!podeEditar && modalVisualizar)}
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            />

            <label className="block mb-1 text-sm">{t("telefone")}</label>
            <input
              placeholder={t("telefone")}
              value={form.telefone || ""}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
              disabled={Boolean(!podeEditar && modalVisualizar)}
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            />

            <label className="block mb-1 text-sm">{t("categoria")}</label>
            <input
              placeholder={t("categoria")}
              value={form.categoria || ""}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
              disabled={Boolean(!podeEditar && modalVisualizar)}
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            />

            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("foto")}</label>
              {(fotoPreview || form.foto) && (
                <img
                  src={fotoPreview || form.foto || ""}
                  alt="Preview"
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full mb-2 mx-auto"
                  onError={e => { (e.target as HTMLImageElement).src = "/contadefault.png"; }}
                />
              )}
              {podeEditar && (
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={Boolean(!podeEditar && modalVisualizar)}
                  className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
                  style={{
                    backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                    color: modoDark ? "#FFFFFF" : "#000000"
                  }}
                />
              )}
            </div>

            <div className="flex justify-between mt-4 flex-wrap gap-2">
              <button
                onClick={() => {
                  setModalAberto(false);
                  setModalVisualizar(null);
                  setFotoFile(null);
                  setFotoPreview(null);
                }}
                className="hover:underline cursor-pointer text-sm md:text-base"
                style={{ color: "var(--cor-fonte)" }}
              >
                {t("fechar")}
              </button>
              {modalVisualizar ? (
                podeEditar && (
                  <>
                    <button
                      onClick={handleSalvarFornecedor}
                      className="px-3 md:px-4 py-1 md:py-2 rounded hover:bg-blue-700 cursor-pointer text-sm md:text-base"
                      style={{
                        backgroundColor: "green",
                        color: "white",
                        border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}`,
                      }}
                    >
                      {t("salvar")}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 md:px-4 py-1 md:py-2 rounded hover:bg-red-700 cursor-pointer text-sm md:text-base"
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}`,
                      }}
                    >
                      {t("excluir")}
                    </button>
                  </>
                )
              ) : (
                <button
                  onClick={handleAdicionarFornecedor}
                  className="px-3 md:px-4 py-1 md:py-2 rounded hover:bg-[#00443f] cursor-pointer text-sm md:text-base"
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}`
                  }}
                >
                  {t("afiliarFornecedor")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full rounded p-2 mb-3 text-sm md:text-base";