"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUsuarioStore } from "../context/usuario";
import Swal from "sweetalert2";
import { UsuarioI } from "@/utils/types/usuario";

type Empresa = {
  nome?: string;
  telefone?: string;
  endereco?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  email?: string;
};

export default function MinhaConta() {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { usuario, logar } = useUsuarioStore();
  const [form, setForm] = useState({
    nome: "",
    email: "",
  });
  useEffect(() => {
    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
      }
    }

    const buscarDados = async (idUsuario: string) => {
      const responseUser = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (responseUser.status === 200) {
        const dados = await responseUser.json();
        setUsuarioLogado(dados);
      }

      const responseEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
      if (responseEmpresa.status === 200) {
        const dados = await responseEmpresa.json();
        setEmpresa(dados);
      }
    };

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      buscarDados(usuarioValor);
    }
  }, []);

  const abrirModal = () => {
    setForm({
      nome: usuario?.nome || "",
      email: usuario?.email || "",
    });
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!usuario) return;

    const atualizarDados = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
      }),
    });
    if (!(atualizarDados.status === 200)) {
      Swal.fire({
        icon: "error",
        title: "Algo deu errado!",
        text: "Email ja Existente !",
        confirmButtonText: "Ok",
        confirmButtonColor: "#013C3C",
      });
    } else {
      Swal.fire({
        title: "Alteração realizada com sucesso!",
        icon: "success",
        confirmButtonColor: "#013C3C",
      });
    }
    setModalAberto(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 bg-[#20252B]">
      <div className="bg-white w-full max-w-md rounded p-6 shadow-md">
        <h1 className="text-2xl font-mono text-center mb-6">Minha conta</h1>

        <div className="border-b border-black mb-4 pb-2">
          <h2 className="text-lg font-semibold underline">Email</h2>
          <p className="mt-1">Email: {usuarioLogado?.email || "..."}</p>
        </div>

        <div className="border-b border-black mb-6 pb-6">
          <h2 className="text-lg font-semibold mb-4">Senha</h2>
          <Link href="/esqueci" className="px-6 py-2 border-2 border-[#00332C] rounded-lg text-[#00332C] hover:bg-[#00332C] hover:text-white transition font-mono text-sm">
            Trocar Minha Senha
          </Link>
        </div>

        <div className="border-b border-black mb-4 pb-2">
          <h2 className="text-lg font-semibold">Informações da Conta</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              Nome da Empresa: <strong>{empresa?.nome || "Adicionar"}</strong>
            </p>
            <p>
              Cargo na Empresa: <strong>{usuarioLogado?.tipo || "Adicionar"}</strong>
            </p>
            <p>Nome: {usuarioLogado?.nome?.split(" ")[0] || "Adicionar"}</p>
            <p>Sobrenome: {usuarioLogado?.nome?.split(" ").slice(1).join(" ") || "Adicionar"}</p>
            <p>Endereço: {empresa?.endereco || "Adicionar"}</p>
            <p>País: {empresa?.pais || "Adicionar"}</p>
            <p>Estado: {empresa?.estado || "Adicionar"}</p>
            <p>Cidade: {empresa?.cidade || "Adicionar"}</p>
            <p>Cep: {empresa?.cep || "Adicionar"}</p>
            <p>Telefone: {empresa?.telefone || "Adicionar"}</p>
            <p>Email da Empresa: {empresa?.email || "Adicionar"}</p>
          </div>
        </div>

        <button onClick={abrirModal} className="mt-4 bg-[#00332C] text-white px-6 py-2 rounded hover:bg-[#00443f] transition w-full">
          Editar Perfil
        </button>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Editar Informações</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={handleSalvar} className="px-4 py-2 bg-[#00332C] text-white rounded hover:bg-[#00443f]">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
