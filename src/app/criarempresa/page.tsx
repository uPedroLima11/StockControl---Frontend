"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUsuarioStore } from "../context/usuario";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  empresaId: string | null;
};

type Inputs = {
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  foto?: string;
};

export default function CriarEmpresa() {
  const { register, handleSubmit } = useForm<Inputs>();
  const router = useRouter();
  const [idUsuario, setIdUsuario] = useState<string | null>(null);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const { usuario, logar } = useUsuarioStore();

  useEffect(() => {
    if (usuarioLogado?.empresaId) {
      router.push("/dashboard");
    }
  }, [usuarioLogado, router]);
  
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
    };

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      buscarDados(usuarioValor);
      setIdUsuario(usuarioValor);
      fetchEmpresa(usuarioValor);
    }

    const id = localStorage.getItem("client_key");

    if (!id) {
      alert("Usuário não autenticado. Faça login novamente.");
      router.push("/login");
    }
  }, [router]);

  const fetchEmpresa = async (idUsuario: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
      if (response.ok) {
        const data = await response.json();
        if (data.empresa) {
          router.push("/empresa");
        }
      } else {
        console.error("Erro ao buscar empresa", response.statusText);
      }
    } catch (err) {
      console.error("Erro de conexão", err);
    }
  };

  async function onSubmit(data: Inputs) {
    const id = localStorage.getItem("client_key");
    const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": usuarioValor || "",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.location.reload();
        router.push("/dashboard");
      } else {
        const res = await response.json();
        alert(res.mensagem || "Erro ao criar empresa");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#20252C] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Criar Empresa</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl space-y-4">
        <input {...register("nome")} placeholder="Nome da empresa" required className={inputClass} />
        <input {...register("email")} placeholder="Email da empresa" type="email" required className={inputClass} />
        <input {...register("telefone")} placeholder="Telefone" className={inputClass} />
        <input {...register("endereco")} placeholder="Endereço" className={inputClass} />
        <input {...register("pais")} placeholder="País" className={inputClass} />
        <input {...register("estado")} placeholder="Estado" className={inputClass} />
        <input {...register("cidade")} placeholder="Cidade" className={inputClass} />
        <input {...register("cep")} placeholder="CEP" className={inputClass} />
        <input {...register("foto")} placeholder="URL da Foto (opcional)" className={inputClass} />

        <button type="submit" className="w-full bg-[#00332C] hover:bg-[#004d41] text-white font-bold py-2 px-4 rounded">
          Criar Empresa
        </button>
      </form>
    </div>
  );
}

const inputClass = "w-full p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
