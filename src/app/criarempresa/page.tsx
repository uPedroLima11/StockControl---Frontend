"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";
import { UsuarioI } from "@/utils/types/usuario";
import { useTranslation } from "react-i18next";

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
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [modoDark, setModoDark] = useState(false);
  const { logar } = useUsuarioStore();
  const { t } = useTranslation("criarempresa");

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
      root.style.setProperty("--cor-input", "#374151");
      root.style.setProperty("--cor-borda", "#4B5563");
      root.style.setProperty("--cor-placeholder", "#9CA3AF");
      root.style.setProperty("--cor-botao", "#00332C");
      root.style.setProperty("--cor-botao-hover", "#004d41");
      document.body.style.backgroundColor = "#20252B";
      document.body.style.color = "#FFFFFF";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#FFFFFF");
      root.style.setProperty("--cor-texto", "#000000");
      root.style.setProperty("--cor-input", "#F3F4F6");
      root.style.setProperty("--cor-borda", "#D1D5DB");
      root.style.setProperty("--cor-placeholder", "#9CA3AF");
      root.style.setProperty("--cor-botao", "#00332C");
      root.style.setProperty("--cor-botao-hover", "#004d41");
      document.body.style.backgroundColor = "#FFFFFF";
      document.body.style.color = "#000000";
    }
  };

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
      fetchEmpresa(usuarioValor);
    }

    const id = localStorage.getItem("client_key");

    if (!id) {
      router.push("/login");
    }
  }, [router, logar]);

  const fetchEmpresa = async (idUsuario: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${idUsuario}`);
      if (response.ok) {
        const data = await response.json();
        if (data.empresa) {
          router.push("/empresa");
        }
      }
    } catch {
      // Sem lógica de erro
    }
  };

  async function onSubmit(data: Inputs) {
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
        Swal.fire({
          icon: "error",
          title: t("erro.titulo"),
          text: t("erro.mensagem"),
          confirmButtonColor: "#013C3C",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  const inputClass = `w-full p-2 rounded border placeholder-[var(--cor-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${modoDark ? "bg-[var(--cor-input)] text-[var(--cor-texto)] border-[var(--cor-borda)]" : "bg-[var(--cor-input)] text-[var(--cor-texto)] border-[var(--cor-borda)]"}`;

  return (
    <div
      className="flex flex-col items-center justify-center p-6 min-h-screen"
      style={{
        backgroundColor: "var(--cor-fundo)",
        color: "var(--cor-texto)",
      }}
    >
      <h1 className="text-3xl font-bold mb-6">{t("titulo")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl space-y-4">
        <input {...register("nome")} placeholder={t("campos.nome")} required className={inputClass} />
        <input {...register("email")} placeholder={t("campos.email")} type="email" required className={inputClass} />
        <input {...register("telefone")} placeholder={t("campos.telefone")} className={inputClass} />
        <input {...register("endereco")} placeholder={t("campos.endereco")} className={inputClass} />
        <input {...register("pais")} placeholder={t("campos.pais")} className={inputClass} />
        <input {...register("estado")} placeholder={t("campos.estado")} className={inputClass} />
        <input {...register("cidade")} placeholder={t("campos.cidade")} className={inputClass} />
        <input {...register("cep")} placeholder={t("campos.cep")} className={inputClass} />
        <input {...register("foto")} placeholder={t("campos.foto")} className={inputClass} />

        <button
          type="submit"
          className="w-full text-white font-bold py-2 px-4 rounded transition"
          style={{
            backgroundColor: "var(--cor-botao)",
            color: "#FFFFFF",
          }}
        >
          {t("botaoCriar")}
        </button>
      </form>
    </div>
  );
}
