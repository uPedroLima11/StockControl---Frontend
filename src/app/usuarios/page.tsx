"use client";
import { useEffect, useState } from "react";
import { FaCog, } from "react-icons/fa";
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
  const { t } = useTranslation("usuarios");
  const translateRole = (role: string) => {
    return t(`roles.${role}`, { defaultValue: role });
  };

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
    aplicarTema(ativo);
  }, []);

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement;
    if (ativado) {
      root.classList.add("dark");
      root.style.setProperty("--cor-fundo", "#20252B");
      root.style.setProperty("--cor-texto", "#FFFFFF");
      root.style.setProperty("--cor-fundo-bloco", "#1a25359f");
      root.style.setProperty("--cor-borda", "#374151");
      root.style.setProperty("--cor-cinza", "#A3A3A3");
      document.body.style.backgroundColor = "#20252B";
      document.body.style.color = "#FFFFFF";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#FFFFFF");
      root.style.setProperty("--cor-texto", "#000000");
      root.style.setProperty("--cor-fundo-bloco", "#FFFFFF");
      root.style.setProperty("--cor-borda", "#E5E7EB");
      root.style.setProperty("--cor-cinza", "#4B5563");
      document.body.style.backgroundColor = "#FFFFFF";
      document.body.style.color = "#000000";
    }
  };

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
        const usuariosDaEmpresa = todosUsuarios.filter((usuario) => usuario.empresaId === empresaIdRecebido);

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
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--cor-fundo)" }}>
        <h1 className="text-3xl font-mono" style={{ color: "var(--cor-texto)" }}>{t("carregando")}</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--cor-fundo)" }}>
        <h1 className="text-3xl font-mono text-red-400">{t("erro")}: {error}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 md:px-16" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-mono" style={{ color: "var(--cor-texto)" }}>{t("titulo")}</h1>
        {usuarioLogado?.empresaId && (
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 rounded-sm font-bold text-sm transition"
              style={{
                backgroundColor: modoDark ? "#00332C" : "#55D6BE",
                color: modoDark ? "#FFFFFF" : "#000000",
                border: modoDark ? "1px solid #374151" : "1px solid #D1D5DB"
              }}
              onClick={() => setShowModalConvite(true)}
            >
              {t("convidarUsuario")}
            </button>
            <button
              className="px-4 py-2 rounded-sm font-bold text-sm transition"
              style={{
                backgroundColor: modoDark ? "#ee1010" : "#ff6b6b",
                color: "#FFFFFF",
                border: modoDark ? "1px solid #374151" : "1px solid #D1D5DB"
              }}
              onClick={() => setShowModalMensagem(true)}
            >
              {t("enviarMensagem")}
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left text-sm font-light border-separate border-spacing-y-2">
          <thead className="border" style={{ backgroundColor: modoDark ? "#1a25359f" : "#ececec" }}>
            <tr>
              <th className="px-6 py-4">{t("nomeUsuario")}</th>
              <th className="px-6 py-4">{t("funcao")}</th>
              <th className="px-6 py-4">{t("criadoEm")}</th>
              <th className="px-6 py-4 font-bold">{t("ultimaAtualizacao")}</th>
              <th className="px-6 py-4">{t("acao")}</th>
            </tr>
          </thead>
          <tbody style={{ color: "var(--cor-texto)" }}>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  {usuarioLogado?.empresaId ? t("nenhumUsuario") : t("nenhumaEmpresa")}
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="rounded-md shadow-sm"
                  style={{
                    backgroundColor: modoDark ? "#1a25359f" : "#ececec",

                    border: modoDark ? "1px solid #374151" : "1px solid #E5E7EB"
                  }}
                >
                  <td className="px-6 py-4">{usuario.nome}</td>
                  <td className="px-6 py-4">{translateRole(usuario.tipo)}</td>
                  <td className="px-6 py-4">{new Date(usuario.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold">{new Date(usuario.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {podeEditar(usuario) && (
                      <FaCog
                        className="cursor-pointer hover:text-gray-400"
                        onClick={() => {
                          setModalEditarUsuario(usuario);
                          setNovoTipo(usuario.tipo);
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModalConvite && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg w-full max-w-md"
            style={{
              backgroundColor: modoDark ? "#2A2F36" : "#FFFFFF",
              color: modoDark ? "#FFFFFF" : "#000000"
            }}
          >
            <h2 className="text-xl mb-4">{t("modal.convidarUsuario")}</h2>
            <div>
              <div className="mb-2">
                <label htmlFor="email" className="text-sm font-semibold">
                  {t("modal.emailUsuario")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border p-3 rounded-md mt-2"
                  style={{
                    backgroundColor: modoDark ? "#444b52" : "#F3F4F6",
                    color: modoDark ? "#FFFFFF" : "#000000"
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000"
                }}
                onClick={() => setShowModalConvite(false)}
              >
                {t("modal.cancelar")}
              </button>
              <button
                className={`px-4 py-2 rounded ${isEnviando ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: modoDark ? "#55D6BE" : "#013C3C",
                  color: modoDark ? "#000000" : "#FFFFFF"
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
            className="p-6 rounded-lg w-full max-w-md"
            style={{
              backgroundColor: modoDark ? "#2A2F36" : "#FFFFFF",
              color: modoDark ? "#FFFFFF" : "#000000"
            }}
          >
            <h2 className="text-xl mb-4">{t("modal.enviarMensagem")}</h2>
            <div>
              <div className="mb-2">
                <label htmlFor="nome" className="text-sm font-semibold">
                  {t("modal.de")}
                </label>
                <input
                  id="nome"
                  type="text"
                  value={usuarioLogado?.nome || ""}
                  readOnly
                  className="w-full p-3 rounded-md mt-2"
                  style={{
                    backgroundColor: modoDark ? "#444b52" : "#F3F4F6",
                    color: modoDark ? "#FFFFFF" : "#000000"
                  }}
                />
              </div>
              <label htmlFor="nome" className="text-sm font-semibold">
                {t("modal.para")}
              </label>
              <select
                className="w-full p-2 mb-4 rounded border"
                style={{
                  backgroundColor: modoDark ? "#1B1F24" : "#F3F4F6",
                  borderColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000"
                }}
                onChange={(e) => setUsuarioSelecionado(usuarios.find(u => u.id === e.target.value) || null)}
              >
                <option value="">{t("modal.selecioneUsuario")}</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder={t("modal.tituloMensagem")}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full p-2 mb-4 rounded border"
                style={{
                  backgroundColor: modoDark ? "#1B1F24" : "#F3F4F6",
                  borderColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000"
                }}
              />

              <textarea
                placeholder={t("modal.descricaoMensagem")}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full p-2 mb-4 rounded border"
                style={{
                  backgroundColor: modoDark ? "#1B1F24" : "#F3F4F6",
                  borderColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000"
                }}
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000"
                }}
                onClick={() => setShowModalMensagem(false)}
              >
                {t("modal.cancelar")}
              </button>
              <button
                className={`px-4 py-2 rounded ${isEnviando ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: modoDark ? "#55D6BE" : "#013C3C",
                  color: modoDark ? "#000000" : "#FFFFFF"
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
            className="p-6 rounded-lg w-full max-w-md"
            style={{
              backgroundColor: modoDark ? "#2A2F36" : "#FFFFFF",
              color: modoDark ? "#FFFFFF" : "#000000"
            }}
          >
            <h2 className="text-xl mb-4">{t("modal.editarUsuario")}</h2>
            <p className="mb-4">{t("modal.usuario")}: <strong>{modalEditarUsuario.nome}</strong></p>

            <label className="block mb-2 font-semibold">{t("modal.alterarCargo")}:</label>
            <select
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value)}
              className="w-full p-2 mb-4 rounded border"
              style={{
                backgroundColor: modoDark ? "#1B1F24" : "#F3F4F6",
                borderColor: modoDark ? "#374151" : "#D1D5DB",
                color: modoDark ? "#FFFFFF" : "#000000"
              }}
            >
              <option value="FUNCIONARIO">{t("modal.funcionario")}</option>
              <option value="ADMIN">{t("modal.admin")}</option>
              <option value="PROPRIETARIO">{t("modal.proprietario")}</option>
            </select>

            <div className="flex justify-between">
              <button
                className="px-3 py-1.5 rounded text-sm"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000"
                }}
                onClick={() => setModalEditarUsuario(null)}
              >
                {t("modal.cancelar")}
              </button>
              <button
                className="px-3 py-1.5 rounded text-sm text-white"
                style={{
                  backgroundColor: modoDark ? "#013C3C" : "#55D6BE",
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
                className="px-3 py-1.5 rounded text-sm text-white"
                style={{
                  backgroundColor: "#ee1010",
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