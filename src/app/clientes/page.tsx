"use client";
import { ClienteI } from "@/utils/types/clientes";
import { useEffect, useState } from "react";
import { FaSearch, FaPhoneAlt, FaLock, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaEdit, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export default function Clientes() {
  const [modoDark, setModoDark] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaAtivada, setEmpresaAtivada] = useState<boolean>(false);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteI[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizar, setModalVisualizar] = useState<ClienteI | null>(null);
  const [form, setForm] = useState<ClienteI>({
    id: "",
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    empresaId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [busca, setBusca] = useState("");
  const [clienteExpandido, setClienteExpandido] = useState<string | null>(null);
  const { t } = useTranslation("clientes");
  const router = useRouter();

  const verificarAtivacaoEmpresa = async (empresaId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${empresaId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar os dados da empresa");
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

      const responseClientes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`);
      const clientesData = await responseClientes.json();
      setClientes(clientesData.clientes || []);
    };

    initialize();
  }, []);

  const clientesDaEmpresa = empresaId 
    ? clientes.filter(cliente => cliente.empresaId === empresaId)
    : [];

  const clientesFiltrados = clientesDaEmpresa.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone?.includes(busca)
  );

  async function handleAdicionarCliente() {
    handleAcaoProtegida(async () => {
      if (!empresaId) return alert("Empresa não identificada.");

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId);
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          empresaId,
        }),
      });

      if (response.status === 201) {
        Swal.fire({
          text: t("sucesso.adicionarCliente"),
          icon: "success",
          confirmButtonColor: "#013C3C",
        });
        setModalAberto(false);
        window.location.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: t("erro.titulo"),
          text: t("erro.mensagem"),
          confirmButtonColor: "#013C3C",
        });
      }
    });
  }

  async function handleSalvarCliente() {
    handleAcaoProtegida(async () => {
      if (!modalVisualizar?.id) return;

      const empresaAtivada = await verificarAtivacaoEmpresa(empresaId || "");
      if (!empresaAtivada) {
        mostrarAlertaNaoAtivada();
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes/${modalVisualizar.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        if (response.ok) {
          Swal.fire({
            text: "Cliente atualizado com sucesso!",
            icon: "success",
            confirmButtonColor: "#013C3C",
          });
          setModalVisualizar(null);
          window.location.reload();
        } else {
          throw new Error("Erro ao atualizar cliente");
        }
      } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Algo deu errado ao atualizar o cliente.",
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
        title: t("confirmacao.excluir.titulo"),
        text: t("confirmacao.excluir.mensagem"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("confirmacao.excluir.confirmar"),
        cancelButtonText: t("confirmacao.excluir.cancelar"),
      });

      if (result.isConfirmed) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_URL_API}/clientes/${modalVisualizar.id}`, {
            method: "DELETE",
          });
          Swal.fire(
            t("sucesso.excluir.titulo"),
            t("sucesso.excluir.mensagem"),
            "success"
          );
          setModalVisualizar(null);
          window.location.reload();
        } catch (err) {
          console.error("Erro ao excluir cliente:", err);
          Swal.fire(
            t("erro.excluir.titulo"),
            t("erro.excluir.mensagem"),
            "error"
          );
        }
      }
    });
  }

  function handleEntrarContato(cliente: ClienteI) {
    if (!cliente.telefone) {
      Swal.fire({
        icon: "info",
        title: t("info.semTelefone.titulo"),
        text: t("info.semTelefone.mensagem"),
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const telefoneFormatado = cliente.telefone.replace(/\D/g, "");
    const numeroComDdd = `${telefoneFormatado}`;
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroComDdd}`;
    window.open(urlWhatsApp, "_blank");
  }

  function formatarEndereco(cliente: ClienteI) {
    const partes = [];
    if (cliente.endereco) partes.push(cliente.endereco);
    if (cliente.cidade) partes.push(cliente.cidade);
    if (cliente.estado) partes.push(cliente.estado);
    if (cliente.cep) partes.push(cliente.cep);

    return partes.join(", ");
  }

  function formatarTelefone(telefone: string) {
    if (!telefone) return "-";
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
  }

  const podeEditar = (tipoUsuario === "ADMIN" || tipoUsuario === "PROPRIETARIO") && empresaAtivada;

  const toggleExpandirCliente = (id: string) => {
    setClienteExpandido(clienteExpandido === id ? null : id);
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: "var(--cor-fonte)" }}>
          {t("titulo")}
        </h1>

        {empresaId && !empresaAtivada && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-lg flex items-center gap-3"
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
          <div
            className="flex items-center border rounded-full px-3 md:px-4 py-1 md:py-2 shadow-sm"
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
              onChange={(e) => setBusca(e.target.value)}
              style={{ color: "var(--cor-fonte)" }}
            />
            <FaSearch className="ml-2" style={{ color: modoDark ? "#FBBF24" : "#00332C" }} />
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
              {t("novoCliente")}
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
          {!empresaId || clientesDaEmpresa.length === 0 ? (
            <div className="p-4 text-center" style={{ color: "var(--cor-fonte)" }}>
              {t("nenhumClienteEncontrado")}
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="p-4 text-center" style={{ color: "var(--cor-fonte)" }}>
              {t("nenhumClienteEncontradoBusca")}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b">
                    <tr style={{ color: "var(--cor-fonte)" }}>
                      <th className="py-3 px-4 text-center">{t("nome")}</th>
                      <th className="py-3 px-4 text-center">{t("email")}</th>
                      <th className="py-3 px-4 text-center">{t("telefone")}</th>
                      <th className="py-3 px-4 text-center">{t("endereco")}</th>
                      <th className="py-3 px-4 text-center">{t("adicionadoEm")}</th>
                      <th className="py-3 px-4 text-center">{t("contato")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente: ClienteI) => (
                      <tr
                        key={cliente.id}
                        className={`cursor-pointer border-b transition ${modoDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          }`}
                      >
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {cliente.nome}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {cliente.email || "-"}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {formatarTelefone(cliente.telefone || "")}
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center max-w-[200px] truncate"
                          title={formatarEndereco(cliente) || "-"}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <FaMapMarkerAlt />
                            <span className="truncate">
                              {formatarEndereco(cliente) || "-"}
                            </span>
                          </div>
                        </td>
                        <td
                          onClick={() => {
                            setModalVisualizar(cliente);
                            setForm(cliente);
                          }}
                          className="py-3 px-4 text-center"
                        >
                          {new Date(cliente.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <FaPhoneAlt
                            onClick={() => handleEntrarContato(cliente)}
                            color="#25D366"
                            size={32}
                            className="cursor-pointer m-auto border-2 p-1 rounded-2xl"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2 p-2">
                {clientesFiltrados.map((cliente) => (
                  <div
                    key={cliente.id}
                    className={`border rounded-lg p-3 transition-all ${modoDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold truncate" style={{ color: "var(--cor-fonte)" }}>
                            {cliente.nome}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--cor-subtitulo)" }}>
                          <span>{new Date(cliente.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEntrarContato(cliente)}
                          className="text-green-500 hover:text-green-700 p-1"
                        >
                          <FaPhoneAlt />
                        </button>

                        <button
                          onClick={() => toggleExpandirCliente(cliente.id)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          style={{ color: modoDark ? "#a0aec0" : "#4a5568" }}
                        >
                          {clienteExpandido === cliente.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${clienteExpandido === cliente.id ? "max-h-96" : "max-h-0"
                        }`}
                      style={{ color: "var(--cor-fonte)" }}
                    >
                      <div className="pt-2 border-t space-y-2" style={{ borderColor: modoDark ? "#374151" : "#e5e7eb" }}>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("email")}:</span>
                          <span>{cliente.email || "-"}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("telefone")}:</span>
                          <span>{formatarTelefone(cliente.telefone || "")}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("endereco")}:</span>
                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt />
                            {formatarEndereco(cliente) || "-"}
                          </span>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          {podeEditar ? (
                            <button
                              onClick={() => {
                                setModalVisualizar(cliente);
                                setForm(cliente);
                              }}
                              className="flex items-center gap-1 px-3 py-1 rounded text-sm"
                              style={{
                                backgroundColor: modoDark ? "#1a25359f" : "#ececec",
                                color: modoDark ? "#FFFFFF" : "#000000",
                              }}
                            >
                              <FaEdit /> {t("editar")}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setModalVisualizar(cliente);
                                setForm(cliente);
                              }}
                              className="flex items-center gap-1 px-3 py-1 rounded text-sm"
                              style={{
                                backgroundColor: modoDark ? "#1a25359f" : "#ececec",
                                color: modoDark ? "#FFFFFF" : "#000000",
                              }}
                            >
                              <FaEye /> {t("visualizar")}
                            </button>
                          )}
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

      {(modalAberto || modalVisualizar) && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-4 md:p-6 rounded-lg shadow-xl w-full max-w-md mx-4 bg-opacity-90"
            style={{
              backgroundColor: "var(--cor-fundo-bloco)",
              color: "var(--cor-fonte)",
            }}
          >
            <h2 className="text-lg md:text-xl font-bold mb-4">{modalVisualizar ? t("visualizarCliente") : t("novoCliente")}</h2>

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

            <label className="block mb-1 text-sm">{t("endereco")}</label>
            <input
              placeholder={t("endereco")}
              value={form.endereco || ""}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
              disabled={Boolean(!podeEditar && modalVisualizar)}
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            />

            <label className="block mb-1 text-sm">{t("cidade")}</label>
            <input
              placeholder={t("cidade")}
              value={form.cidade || ""}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
              disabled={Boolean(!podeEditar && modalVisualizar)}
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            />

            <label className="block mb-1 text-sm">{t("estado")}</label>
            <input
              placeholder={t("estado")}
              value={form.estado || ""}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
              disabled={Boolean(!podeEditar && modalVisualizar)}
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            />

            <label className="block mb-1 text-sm">{t("cep")}</label>
            <input
              placeholder={t("cep")}
              value={form.cep || ""}
              onChange={(e) => setForm({ ...form, cep: e.target.value })}
              className={`${inputClass} bg-transparent border ${modoDark ? "border-white" : "border-gray-300"}`}
              disabled={Boolean(!podeEditar && modalVisualizar)}
              style={{
                backgroundColor: modoDark ? "#1a25359f" : "#F3F4F6",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            />

            <div className="flex justify-between mt-4 flex-wrap gap-2">
              <button
                onClick={() => {
                  setModalAberto(false);
                  setModalVisualizar(null);
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
                      onClick={handleSalvarCliente}
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
                  onClick={handleAdicionarCliente}
                  className="px-3 md:px-4 py-1 md:py-2 rounded hover:bg-[#00443f] cursor-pointer text-sm md:text-base"
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    border: `1px solid ${modoDark ? "#FFFFFF" : "#000000"}`
                  }}
                >
                  {t("adicionarCliente")}
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