"use client";

import { useEffect, useState } from "react";
import { FaCog } from "react-icons/fa";
import { useUsuarioStore } from "../context/usuario";
import { UsuarioI } from "@/utils/types/usuario";
import Swal from "sweetalert2";

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
        const resEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
        if (!resEmpresa.ok) throw new Error("Você não possui uma empresa cadastrada");

        const empresaData = await resEmpresa.json();
        const empresaIdRecebido = empresaData.id;

        const resUsuarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario`);
        if (!resUsuarios.ok) throw new Error("Erro ao buscar usuários");

        const todosUsuarios: UsuarioI[] = await resUsuarios.json();
        const usuariosDaEmpresa = todosUsuarios.filter((usuario) => usuario.empresaId === empresaIdRecebido);

        setUsuarios(usuariosDaEmpresa);
      } catch (err: unknown) {
        console.error("Erro ao carregar dados:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erro desconhecido");
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
          title: "Campos obrigatórios",
          text: "Por favor, preencha todos os campos antes de enviar.",
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
        }),
      });

      if (response.ok) {
        Swal.fire({
          title: "Mensagem enviada!",
          text: `A mensagem foi enviada para ${usuarioSelecionado.email}.`,
          icon: "success",
        });
        setTitulo("");
        setDescricao("");
        setUsuarioSelecionado(null);
        setShowModalMensagem(false);
      } else {
        Swal.fire({
          title: "Erro",
          text: "Erro ao enviar a notificação. Tente novamente.",
          icon: "error",
        });
      }
    } catch (err) {
      console.error("Erro ao enviar notificação:", err);
      Swal.fire({
        title: "Erro",
        text: "Erro interno ao enviar a notificação.",
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

      const resEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
      const empresa = await resEmpresa.json();

      const resTodosUsuarios = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario`);
      const todosUsuarios: UsuarioI[] = await resTodosUsuarios.json();

      const usuarioConvidado = todosUsuarios.find((u) => u.email === email);

      if (usuarioConvidado && usuarioConvidado.empresaId) {
        Swal.fire({
          title: "Usuário já possui uma empresa vinculada",
          text: "Esse usuário já está vinculado a uma empresa.",
          icon: "warning",
          confirmButtonText: "Ok",
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
          title: "Convite enviado com sucesso!",
          text: `Um convite foi enviado para ${email}.`,
          icon: "success",
          confirmButtonText: "Ok",
          confirmButtonColor: "#013C3C",
        });
        setEmail("");
        setShowModalConvite(false);
      } else {
        alert("Erro ao enviar convite. Verifique se o e-mail é válido.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar convite.");
    } finally {
      setIsEnviando(false);
    }
  }

  async function confirmarRemocaoUsuario(usuario: UsuarioI) {
    if (!podeEditar(usuario)) return;

    Swal.fire({
      title: "Tem certeza?",
      text: `Deseja realmente remover ${usuario.nome} da empresa?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuario.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empresaId: null, tipo: "FUNCIONARIO" }),
          });

          if (res.ok) {
            Swal.fire(`Removido!", "Usuário ${usuario.nome} foi removido da empresa`, "success");
            setModalEditarUsuario(null);
            window.location.reload();
            setUsuarios((prev) =>
              prev.map((u) =>
                u.id === usuario.id ? { ...u, empresaId: null, tipo: "FUNCIONARIO" } : u
              )
            );
          } else {
            Swal.fire("Erro", "Não foi possível remover o usuário.", "error");
          }
        } catch (err) {
          console.error("Erro ao remover usuário:", err);
          Swal.fire("Erro", "Erro interno ao tentar remover usuário.", "error");
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
      <div className="min-h-screen bg-[#20252B] text-white py-10 px-4 md:px-16">
        <h1 className="text-3xl font-mono text-white">Carregando usuários...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#20252B] text-white py-10 px-4 md:px-16">
        <h1 className="text-3xl font-mono text-red-400">Erro: {error}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B1F24] text-white py-10 px-4 md:px-16">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-mono text-white">Usuários</h1>
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 rounded-sm font-bold bg-[#00332C] text-sm hover:bg-[#55d6be1a] transition"
            onClick={() => setShowModalConvite(true)}
          >
            Convidar Usuário
          </button>
          <button
            className="px-4 py-2 rounded-sm font-bold bg-[#ee1010] text-sm hover:bg-[#dd7878d8] transition"
            onClick={() => setShowModalMensagem(true)}
          >
            Enviar Mensagem
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left text-sm font-light border-separate border-spacing-y-2">
          <thead className="border-b border-gray-600 text-gray-300">
            <tr>
              <th className="px-6 py-4">Nome de Usuário</th>
              <th className="px-6 py-4">Função</th>
              <th className="px-6 py-4">Criado em</th>
              <th className="px-6 py-4 font-bold">Última Atualização</th>
              <th className="px-6 py-4">Ação</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="bg-[#2A2F36] rounded-md shadow-sm">
                  <td className="px-6 py-4">{usuario.nome}</td>
                  <td className="px-6 py-4">{usuario.tipo}</td>
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
          <div className="bg-[#2A2F36] p-6 rounded-lg w-full max-w-md text-white">
            <h2 className="text-xl mb-4">Convidar Usuário</h2>
            <div>
              <div className="mb-2">
                <label htmlFor="email" className="text-white text-sm font-semibold">
                  E-mail do Usuário:
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#444b52] text-white p-3 rounded-md mt-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded"
                onClick={() => setShowModalConvite(false)}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 bg-[#55D6BE] text-black rounded ${isEnviando ? "opacity-50 cursor-not-allowed" : "hover:bg-[#44bca5]"}`}
                onClick={enviarConvite}
                disabled={isEnviando}
              >
                {isEnviando ? "Enviando..." : "Enviar Convite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalMensagem && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div className="bg-[#2A2F36] p-6 rounded-lg w-full max-w-md text-white">
            <h2 className="text-xl mb-4">Enviar Mensagem</h2>
            <div>
              <div className="mb-2">
                <label htmlFor="nome" className="text-white text-sm font-semibold">
                  De:
                </label>
                <input
                  id="nome"
                  type="text"
                  value={usuarioLogado?.nome || ""}
                  readOnly
                  className="w-full bg-[#444b52] text-white p-3 rounded-md mt-2"
                />
              </div>
              <label htmlFor="nome" className="text-white text-sm font-semibold">
                Para:
              </label>
              <select
                className="w-full p-2 mb-4 rounded bg-[#1B1F24] border border-gray-600 text-white"
                onChange={(e) => setUsuarioSelecionado(usuarios.find(u => u.id === e.target.value) || null)}
              >
                <option value="">Selecione o usuário</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Título da mensagem"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-[#1B1F24] border border-gray-600 text-white"
              />

              <textarea
                placeholder="Descrição da mensagem"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-[#1B1F24] border border-gray-600 text-white"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded"
                onClick={() => setShowModalMensagem(false)}
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 bg-[#55D6BE] text-black rounded ${isEnviando ? "opacity-50 cursor-not-allowed" : "hover:bg-[#44bca5]"}`}
                onClick={enviarNotificacao}
                disabled={isEnviando}
              >
                {isEnviando ? "Enviando..." : "Enviar Mensagem"}
              </button>
            </div>
          </div>
        </div>
      )}
      {modalEditarUsuario && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div className="bg-[#2A2F36] p-6 rounded-lg w-full max-w-md text-white">
            <h2 className="text-xl mb-4">Editar Usuário</h2>
            <p className="mb-4">Usuário: <strong>{modalEditarUsuario.nome}</strong></p>

            <label className="block mb-2 font-semibold">Alterar Cargo:</label>
            <select
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-[#1B1F24] border border-gray-600 text-white"
            >
              <option value="FUNCIONARIO">FUNCIONARIO</option>
              <option value="ADMIN">ADMIN</option>
              <option value="PROPRIETARIO">PROPRIETARIO</option>
            </select>

            <div className="flex justify-between">
              <button
                className="bg-gray-500 hover:bg-gray-600 px-3 py-1.5 rounded text-sm"
                onClick={() => setModalEditarUsuario(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-[#013C3C] hover:bg-[#013c3c8e] px-3 py-1.5 rounded text-sm text-white"
                onClick={async () => {
                  if (!usuarioLogado || !modalEditarUsuario) return;
                  if (!podeEditarCargo(usuarioLogado.tipo, modalEditarUsuario.tipo, novoTipo)) {
                    Swal.fire("Ação não permitida", "Você não tem permissão para alterar este cargo.", "warning");
                    return;
                  }

                  const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${modalEditarUsuario.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tipo: novoTipo }),
                  });

                  if (res.ok) {
                    Swal.fire("Cargo atualizado!", "O cargo do usuário foi alterado com sucesso.", "success");
                    setModalEditarUsuario(null);
                    window.location.reload();
                  } else {
                    Swal.fire("Erro", "Não foi possível alterar o cargo.", "error");
                  }
                }}
              >
                Salvar Cargo
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm"
                onClick={() => confirmarRemocaoUsuario(modalEditarUsuario)}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
