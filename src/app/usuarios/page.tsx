"use client";
import { useEffect, useState } from "react";
import { FaCog, FaSearch, FaChevronDown, FaChevronUp, FaEnvelope, FaUserPlus, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useUsuarioStore } from "@/context/usuario";
import { UsuarioI } from "@/utils/types/usuario";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isEnviando, setIsEnviando] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [modalEditarUsuario, setModalEditarUsuario] = useState<null | UsuarioI>(null);
  const [novoTipo, setNovoTipo] = useState("FUNCIONARIO");
  const { logar } = useUsuarioStore();
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioI | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [showModalConvite, setShowModalConvite] = useState(false);
  const [showModalMensagem, setShowModalMensagem] = useState(false);
  const [modoDark, setModoDark] = useState(false);
  const [busca, setBusca] = useState("");
  const [usuarioExpandido, setUsuarioExpandido] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const usuariosPorPagina = 10;
  const { t } = useTranslation("usuarios");

  const cores = {
    dark: {
      fundo: "#0A1929",
      texto: "#FFFFFF",
      card: "#132F4C",
      borda: "#1E4976",
      primario: "#1976D2",
      secundario: "#00B4D8",
      placeholder: "#9CA3AF",
      hover: "#1E4976"
    },
    light: {
      fundo: "#F8FAFC",
      texto: "#0F172A",
      card: "#FFFFFF",
      borda: "#E2E8F0",
      primario: "#1976D2",
      secundario: "#0284C7",
      placeholder: "#6B7280",
      hover: "#EFF6FF"
    }
  };

  const temaAtual = modoDark ? cores.dark : cores.light;

  const translateRole = (role: string) => {
    return t(`roles.${role}`, { defaultValue: role });
  };

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
  }, []);

  useEffect(() => {
    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
        setUsuarioLogado(dados);
      }
    }

    const fetchDados = async (idUsuario: string) => {
      try {
        const resEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${idUsuario}`);
        if (!resEmpresa.ok) {
          setLoading(false);
          return;
        }

        const empresaData = await resEmpresa.json();
        if (!empresaData || !empresaData.id) {
          setLoading(false);
          return;
        }

        const empresaIdRecebido = empresaData.id;

        const resUsuarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario`);
        if (!resUsuarios.ok) throw new Error(t("erroBuscarUsuarios"));

        const todosUsuarios: UsuarioI[] = await resUsuarios.json();
        const usuariosDaEmpresa = todosUsuarios
          .filter((usuario) => usuario.empresaId === empresaIdRecebido)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setUsuarios(usuariosDaEmpresa);
      } catch (err: unknown) {
        console.error("Erro ao carregar dados:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t("erroDesconhecido"));
        }
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      fetchDados(usuarioValor);
    }
  }, [t, logar]);

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busca.toLowerCase())
  );

  const indexUltimoUsuario = paginaAtual * usuariosPorPagina;
  const indexPrimeiroUsuario = indexUltimoUsuario - usuariosPorPagina;
  const usuariosAtuais = usuariosFiltrados.slice(indexPrimeiroUsuario, indexUltimoUsuario);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const mudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    setUsuarioExpandido(null);
  };

  async function enviarNotificacao() {
    setIsEnviando(true);
    try {
      if (!usuarioSelecionado || !titulo || !descricao) {
        Swal.fire({
          title: t("modal.camposObrigatorios.titulo"),
          text: t("modal.camposObrigatorios.texto"),
          icon: "warning",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/notificacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          descricao,
          usuarioId: usuarioSelecionado.id,
          nomeRemetente: usuarioLogado?.nome,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        Swal.fire({
          title: t("modal.mensagemEnviada.titulo"),
          text: t("modal.mensagemEnviada.texto", { email: usuarioSelecionado.email }),
          icon: "success",
        });
        setTitulo("");
        setDescricao("");
        setUsuarioSelecionado(null);
        setShowModalMensagem(false);
      } else {
        Swal.fire({
          title: t("modal.erro.titulo"),
          text: data.message || t("modal.erro.textoEnviarNotificacao"),
          icon: "error",
        });
      }
    } catch (err) {
      console.error("Erro ao enviar notificação:", err);
      Swal.fire({
        title: t("modal.erro.titulo"),
        text: t("modal.erro.textoInterno"),
        icon: "error",
      });
    } finally {
      setIsEnviando(false);
    }
  }

  async function enviarConvite() {
    setIsEnviando(true);
    try {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const idUsuario = usuarioSalvo.replace(/"/g, "");

      const resEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${idUsuario}`);
      const empresa = await resEmpresa.json();

      const resTodosUsuarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario`);
      const todosUsuarios: UsuarioI[] = await resTodosUsuarios.json();

      const usuarioConvidado = todosUsuarios.find((u) => u.email === email);

      if (usuarioConvidado && usuarioConvidado.empresaId) {
        Swal.fire({
          title: t("modal.usuarioVinculado.titulo"),
          text: t("modal.usuarioVinculado.texto"),
          icon: "warning",
          confirmButtonText: t("modal.botaoOk"),
          confirmButtonColor: "#013C3C",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/convites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, empresaId: empresa.id }),
      });

      if (response.ok) {
        Swal.fire({
          title: t("modal.conviteEnviado.titulo"),
          text: t("modal.conviteEnviado.texto", { nome: usuarioLogado?.nome, email }),
          icon: "success",
          confirmButtonText: t("modal.botaoOk"),
          confirmButtonColor: "#013C3C",
        });
        setEmail("");
        setShowModalConvite(false);
      } else {
        alert(t("modal.erro.enviarConvite"));
      }
    } catch (err) {
      console.error(err);
      alert(t("modal.erro.enviarConvite"));
    } finally {
      setIsEnviando(false);
    }
  }

  async function confirmarRemocaoUsuario(usuario: UsuarioI) {
    if (!podeEditar(usuario)) return;

    Swal.fire({
      title: t("modal.confirmacaoRemocao.titulo"),
      text: t("modal.confirmacaoRemocao.texto", { nome: usuario.nome }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("modal.confirmacaoRemocao.confirmar"),
      cancelButtonText: t("modal.confirmacaoRemocao.cancelar"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuario.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empresaId: null, tipo: "FUNCIONARIO" }),
          });

          if (res.ok) {
            Swal.fire(
              t("modal.removido"),
              t("modal.confirmacaoRemocao.sucesso", { nome: usuario.nome }),
              "success"
            );
            setModalEditarUsuario(null);
            window.location.reload();
            setUsuarios((prev) =>
              prev.map((u) =>
                u.id === usuario.id ? { ...u, empresaId: null, tipo: "FUNCIONARIO" } : u
              )
            );
          } else {
            Swal.fire(
              t("modal.erro.titulo"),
              t("modal.confirmacaoRemocao.erro"),
              "error"
            );
          }
        } catch (err) {
          console.error("Erro ao remover usuário:", err);
          Swal.fire(
            t("modal.erro.titulo"),
            t("modal.erro.removerUsuario"),
            "error"
          );
        }
      }
    });
  }

  const podeEditar = (targetUser: UsuarioI) => {
    if (!usuarioLogado || usuarioLogado.id === targetUser.id) return false;
    if (usuarioLogado.tipo === "PROPRIETARIO") return true;
    if (usuarioLogado.tipo === "ADMIN" && targetUser.tipo !== "PROPRIETARIO") return true;
    return false;
  };

  const podeEditarCargo = (tipoUsuarioLogado: string, tipoUsuarioSelecionado: string, cargoSelecionado: string) => {
    if (tipoUsuarioLogado === "PROPRIETARIO") return true;
    if (tipoUsuarioLogado === "ADMIN") {
      if (tipoUsuarioSelecionado === "PROPRIETARIO") return false;
      if (cargoSelecionado === "PROPRIETARIO") return false;
      return true;
    }
    return false;
  };

  const toggleExpandirUsuario = (id: string) => {
    setUsuarioExpandido(usuarioExpandido === id ? null : id);
  };

  const formatarData = (dataString: string | Date) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: temaAtual.fundo }}>
        <p style={{ color: temaAtual.texto }}>{t("carregando")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: temaAtual.fundo }}>
        <p style={{ color: "#EF4444" }}>{t("erro")}: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo }}>
      <div className="w-full max-w-6xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: temaAtual.texto }}>
          {t("titulo")}
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4 mb-3 md:mb-6">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center border rounded-full px-3 md:px-4 py-1 md:py-2 shadow-sm flex-1"
              style={{
                backgroundColor: temaAtual.card,
                borderColor: temaAtual.borda,
              }}
            >
              <input
                type="text"
                placeholder={t("buscarUsuario")}
                className="outline-none font-mono placeholder-gray-400 text-sm bg-transparent"
                style={{
                  color: temaAtual.texto
                }}
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPaginaAtual(1);
                }}
              />
              <FaSearch className="ml-2" style={{ color: temaAtual.primario }} />
            </div>
            {totalPaginas > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                  className={`p-2 rounded-full ${paginaAtual === 1 ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                  style={{ color: temaAtual.texto }}
                >
                  <FaAngleLeft />
                </button>

                <span className="text-sm font-mono" style={{ color: temaAtual.texto }}>
                  {paginaAtual}/{totalPaginas}
                </span>

                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                  className={`p-2 rounded-full ${paginaAtual === totalPaginas ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                  style={{ color: temaAtual.texto }}
                >
                  <FaAngleRight />
                </button>
              </div>
            )}
          </div>

          {usuarioLogado?.empresaId && (
            <div className="flex gap-2 w-full sm:w-auto sm:flex-row items-center sm:items-stretch justify-center sm:justify-start">
              <button
                className="px-4 py-2 cursor-pointer rounded-lg transition font-mono text-sm flex items-center gap-2"
                style={{
                  backgroundColor: temaAtual.primario,
                  color: "#FFFFFF",
                }}
                onClick={() => setShowModalConvite(true)}
              >
                <FaUserPlus /> {t("convidarUsuario")}
              </button>
              <button
                className="px-4 py-2 cursor-pointer rounded-lg transition font-mono text-sm flex items-center gap-2"
                style={{
                  backgroundColor: temaAtual.primario,
                  color: "#FFFFFF",
                }}
                onClick={() => setShowModalMensagem(true)}
              >
                <FaEnvelope /> {t("enviarMensagem")}
              </button>
            </div>
          )}
        </div>

        <div
          className="border rounded-xl shadow"
          style={{
            backgroundColor: temaAtual.card,
            borderColor: temaAtual.borda,
          }}
        >
          {usuarios.length === 0 ? (
            <div className="p-4 text-center" style={{ color: temaAtual.texto }}>
              {usuarioLogado?.empresaId ? t("nenhumUsuario") : t("nenhumaEmpresa")}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full text-sm font-mono">
                  <thead className="border-b" style={{ borderColor: temaAtual.borda }}>
                    <tr style={{ color: temaAtual.texto }}>
                      <th className="py-3 px-4 text-left">{t("nomeUsuario")}</th>
                      <th className="py-3 px-4 text-left">{t("funcao")}</th>
                      <th className="py-3 px-4 text-left">{t("criadoEm")}</th>
                      <th className="py-3 px-4 text-left">{t("ultimaAtualizacao")}</th>
                      <th className="py-3 px-4 text-left">{t("acao")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosAtuais.map((usuario) => (
                      <tr
                        key={usuario.id}
                        className="border-b transition-all duration-200 cursor-pointer"
                        style={{
                          color: temaAtual.texto,
                          borderColor: temaAtual.borda,
                          backgroundColor: temaAtual.card,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.hover;
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = modoDark
                            ? "0 4px 12px rgba(30, 73, 118, 0.3)"
                            : "0 4px 12px rgba(2, 132, 199, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = temaAtual.card;
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <td className="py-3 px-4">{usuario.nome}</td>
                        <td className="py-3 px-4">{translateRole(usuario.tipo)}</td>
                        <td className="py-3 px-4">{formatarData(usuario.createdAt)}</td>
                        <td className="py-3 px-4">{formatarData(usuario.updatedAt)}</td>
                        <td className="py-3 px-4">
                          {podeEditar(usuario) && (
                            <FaCog
                              className="cursor-pointer transition hover:rotate-90"
                              onClick={() => {
                                setModalEditarUsuario(usuario);
                                setNovoTipo(usuario.tipo);
                              }}
                              style={{ color: temaAtual.primario }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-2 p-2">
                {usuariosAtuais.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="border rounded-lg p-3 transition-all cursor-pointer"
                    style={{
                      backgroundColor: temaAtual.card,
                      borderColor: temaAtual.borda,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = temaAtual.hover;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = modoDark
                        ? "0 4px 12px rgba(30, 73, 118, 0.3)"
                        : "0 4px 12px rgba(2, 132, 199, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = temaAtual.card;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => toggleExpandirUsuario(usuario.id)}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: temaAtual.hover }}>
                              <span className="text-lg" style={{ color: temaAtual.texto }}>
                                {usuario.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: temaAtual.texto }}>
                              {usuario.nome}
                            </p>
                            <p className="text-xs" style={{ color: temaAtual.placeholder }}>
                              {translateRole(usuario.tipo)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {podeEditar(usuario) && (
                          <FaCog
                            className="cursor-pointer transition hover:rotate-90"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalEditarUsuario(usuario);
                              setNovoTipo(usuario.tipo);
                            }}
                            style={{ color: temaAtual.primario }}
                          />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandirUsuario(usuario.id);
                          }}
                          className="p-1 transition"
                          style={{ color: temaAtual.primario }}
                        >
                          {usuarioExpandido === usuario.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-2 text-sm overflow-hidden transition-all duration-200 ${usuarioExpandido === usuario.id ? "max-h-96" : "max-h-0"
                        }`}
                      style={{ color: temaAtual.texto }}
                    >
                      <div className="pt-2 border-t space-y-2" style={{ borderColor: temaAtual.borda }}>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("email")}:</span>
                          <span className="truncate">{usuario.email}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("criadoEm")}:</span>
                          <span>{formatarData(usuario.createdAt)}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold min-w-[80px]">{t("ultimaAtualizacao")}:</span>
                          <span>{formatarData(usuario.updatedAt)}</span>
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

      {showModalConvite && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <h2 className="text-xl font-bold mb-4">{t("modal.convidarUsuario")}</h2>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.emailUsuario")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded p-2 border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded cursor-pointer transition"
                style={{
                  backgroundColor: temaAtual.hover,
                  color: temaAtual.texto,
                }}
                onClick={() => setShowModalConvite(false)}
              >
                {t("modal.cancelar")}
              </button>
              <button
                className={`px-4 py-2 rounded cursor-pointer transition ${isEnviando ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                }}
                onClick={enviarConvite}
                disabled={isEnviando}
              >
                {isEnviando ? t("modal.enviando") : t("modal.enviarConvite")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalMensagem && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <h2 className="text-xl font-bold mb-4">{t("modal.enviarMensagem")}</h2>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.de")}</label>
              <input
                type="text"
                value={usuarioLogado?.nome || ""}
                readOnly
                className="w-full rounded p-2 border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.para")}</label>
              <select
                className="w-full cursor-pointer rounded p-2 border"
                onChange={(e) => setUsuarioSelecionado(usuarios.find(u => u.id === e.target.value) || null)}
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              >
                <option value="">{t("modal.selecioneUsuario")}</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.tituloMensagem")}</label>
              <input
                type="text"
                placeholder={t("modal.tituloMensagem")}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded p-2 border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.descricaoMensagem")}</label>
              <textarea
                placeholder={t("modal.descricaoMensagem")}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded p-2 border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 cursor-pointer rounded transition"
                style={{
                  backgroundColor: temaAtual.hover,
                  color: temaAtual.texto,
                }}
                onClick={() => setShowModalMensagem(false)}
              >
                {t("modal.cancelar")}
              </button>
              <button
                className={`px-4 py-2 rounded transition cursor-pointer ${isEnviando ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                }}
                onClick={enviarNotificacao}
                disabled={isEnviando}
              >
                {isEnviando ? t("modal.enviando") : t("modal.enviarMensagem")}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditarUsuario && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <h2 className="text-xl font-bold mb-4">{t("modal.editarUsuario")}</h2>
            <p className="mb-3">{t("modal.usuario")}: <strong>{modalEditarUsuario.nome}</strong></p>

            <div className="mb-3">
              <label className="block mb-1 text-sm">{t("modal.alterarCargo")}</label>
              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                className="w-full rounded p-2 border"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  borderColor: temaAtual.borda
                }}
              >
                <option value="FUNCIONARIO">{t("modal.funcionario")}</option>
                <option value="ADMIN">{t("modal.admin")}</option>
                <option value="PROPRIETARIO">{t("modal.proprietario")}</option>
              </select>
            </div>

            <div className="flex justify-between gap-2">
              <button
                className="px-4 py-2 rounded transition"
                style={{
                  backgroundColor: temaAtual.hover,
                  color: temaAtual.texto,
                }}
                onClick={() => setModalEditarUsuario(null)}
              >
                {t("modal.cancelar")}
              </button>
              <button
                className="px-4 py-2 rounded transition"
                style={{
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                }}
                onClick={async () => {
                  if (!usuarioLogado || !modalEditarUsuario) return;
                  if (!podeEditarCargo(usuarioLogado.tipo, modalEditarUsuario.tipo, novoTipo)) {
                    Swal.fire(
                      t("modal.erroPermissao.titulo"),
                      t("modal.erroPermissao.texto"),
                      "warning"
                    );
                    return;
                  }

                  const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${modalEditarUsuario.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tipo: novoTipo }),
                  });

                  if (res.ok) {
                    Swal.fire(
                      t("modal.cargoAtualizado"),
                      t("modal.cargoAtualizadoSucesso"),
                      "success"
                    );
                    setModalEditarUsuario(null);
                    window.location.reload();
                  } else {
                    Swal.fire(
                      t("modal.erro.titulo"),
                      t("modal.erro.alterarCargo"),
                      "error"
                    );
                  }
                }}
              >
                {t("modal.salvarCargo")}
              </button>
              <button
                className="px-4 py-2 rounded transition"
                style={{
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                }}
                onClick={() => confirmarRemocaoUsuario(modalEditarUsuario)}
              >
                {t("modal.remover")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}