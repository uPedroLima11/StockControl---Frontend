"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUsuarioStore } from "../context/usuario";
import Swal from "sweetalert2";
import { UsuarioI } from "@/utils/types/usuario";
import { EmpresaI } from "@/utils/types/empresa";

export default function MinhaConta() {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaI | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { usuario, logar } = useUsuarioStore();
  const [form, setForm] = useState({
    nome: "",
    email: "",
  });
  const [modoDark, setModoDark] = useState(false);

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
      root.style.setProperty("--cor-destaque", "#00332C");
      document.body.style.backgroundColor = "#20252B";
      document.body.style.color = "#FFFFFF";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#FFFFFF");
      root.style.setProperty("--cor-texto", "#000000");
      root.style.setProperty("--cor-fundo-bloco", "#FFFFFF");
      root.style.setProperty("--cor-borda", "#E5E7EB");
      root.style.setProperty("--cor-cinza", "#4B5563");
      root.style.setProperty("--cor-destaque", "#00332C");
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
    window.location.reload();
  };

  const handleExcluir = async () => {
    if (!usuario) return;

    await Swal.fire({
      title: "Tem certeza?",
      text: "Essa ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const excluirDados = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuario.id}`, {
          method: "DELETE",
        });
        console.log(excluirDados.status);
        if (excluirDados.status === 204) {
          Swal.fire({
            title: "Conta excluída com sucesso!",
            icon: "success",
            confirmButtonColor: "#013C3C",
          });
          localStorage.removeItem("client_key");
          window.location.href = "/";
        } else {
          Swal.fire({
            icon: "error",
            title: "Algo deu errado!",
            text: "Não foi possível excluir a conta.",
            confirmButtonText: "Ok",
            confirmButtonColor: "#013C3C",
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-10" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div
        className="w-full max-w-md rounded p-6 shadow-md"
        style={{
          backgroundColor: modoDark ? "#1F2937" : "#FFFFFF",
          color: modoDark ? "#FFFFFF" : "#000000",
          border: modoDark ? "1px solid #374151" : "2px solid #000000"
        }}
      >
        <h1 className="text-2xl font-mono text-center mb-6" style={{ color: "var(--cor-texto)" }}>Minha conta</h1>

        <div
          className="border-b mb-4 pb-2"
          style={{ borderColor: "var(--cor-borda)" }}
        >
          <h2 className="text-lg font-semibold underline">Email</h2>
          <p className="mt-1">{usuarioLogado?.email || "..."}</p>
        </div>

        <div
          className="border-b mb-6 pb-6"
          style={{ borderColor: "var(--cor-borda)" }}
        >
          <h2 className="text-lg font-semibold mb-4">Senha</h2>
          <Link
            href="/esqueci"
            className="px-6 py-2 border-2 rounded-lg transition font-mono text-sm hover:bg-[var(--cor-destaque)] hover:text-white"
            style={{
              borderColor: "var(--cor-destaque)",
              color: "var(--cor-texto)",
              backgroundColor: modoDark ? "transparent" : "transparent",

            }}
          >
            Trocar Minha Senha
          </Link>
        </div>

        <div
          className="border-b mb-4 pb-2"
          style={{ borderColor: "var(--cor-borda)" }}
        >
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

        <div className="flex items-center mt-6 gap-1">
          <button
            onClick={abrirModal}
            className="mt-4 px-5 py-2 rounded transition w-full cursor-pointer"
            style={{
              backgroundColor: "var(--cor-destaque)",
              color: "#FFFFFF",

            }}
          >
            Editar Perfil
          </button>
          <button
            onClick={handleExcluir}
            className="mt-4 px-6 py-2 rounded transition w-full cursor-pointer"
            style={{
              backgroundColor: "#ee1010",
              color: "#FFFFFF",

            }}
          >
            Excluir Conta
          </button>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded shadow-lg w-full max-w-md"
            style={{
              backgroundColor: modoDark ? "#1F2937" : "#FFFFFF",
              color: modoDark ? "#FFFFFF" : "#000000"
            }}
          >
            <h2 className="text-xl font-semibold mb-4">Editar Informações</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                  borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000"
                }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                  borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000"
                }}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 rounded hover:bg-gray-400"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="px-4 py-2 text-white rounded"
                style={{
                  backgroundColor: "var(--cor-destaque)",
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}