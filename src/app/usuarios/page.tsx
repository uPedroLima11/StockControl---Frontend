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
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const { logar } = useUsuarioStore();

  useEffect(() => {
    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
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

  async function enviarConvite() {
    try {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const idUsuario = usuarioSalvo.replace(/"/g, "");

      const resEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
      const empresa = await resEmpresa.json();

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
        setShowModal(false);
      } else {
        alert("Erro ao enviar convite.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar convite.");
    }
  }

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
        <button
          className=" px-4 py-2 rounded-sm font-bold bg-[#00332C] text-sm hover:bg-[#55d6be1a] transition"
          onClick={() => setShowModal(true)}
        >
          Convidar Usuário
        </button>
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
                    <FaCog className="cursor-pointer hover:text-gray-400" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0  flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div className="bg-[#2A2F36] p-6 rounded-lg w-full max-w-md text-white">
            <h2 className="text-xl mb-4">Convidar Usuário</h2>
            <input
              type="email"
              placeholder="E-mail do usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-4 rounded bg-[#1B1F24] border border-gray-600 text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-[#55D6BE] text-black hover:bg-[#44bca5] rounded"
                onClick={enviarConvite}
              >
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
