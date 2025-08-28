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
  foto?: FileList;
};

export default function CriarEmpresa() {
  const { register, handleSubmit, setValue, watch } = useForm<Inputs>();
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [modoDark, setModoDark] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const { logar } = useUsuarioStore();
  const { t } = useTranslation("criarempresa");

  const formValues = watch();
  const [charCounts, setCharCounts] = useState({
    nome: 0,
    email: 0,
    telefone: 0,
    endereco: 0,
    pais: 0,
    estado: 0,
    cidade: 0,
    cep: 0
  });

  useEffect(() => {
    setCharCounts({
      nome: formValues.nome?.length || 0,
      email: formValues.email?.length || 0,
      telefone: formValues.telefone?.length || 0,
      endereco: formValues.endereco?.length || 0,
      pais: formValues.pais?.length || 0,
      estado: formValues.estado?.length || 0,
      cidade: formValues.cidade?.length || 0,
      cep: formValues.cep?.length || 0
    });
  }, [formValues]);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${idUsuario}`);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue("foto", e.target.files);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: Inputs) {
    const usuarioSalvo = localStorage.getItem("client_key") as string;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    try {
      const formData = new FormData();
      formData.append('nome', data.nome);
      formData.append('email', data.email);
      if (data.telefone) formData.append('telefone', data.telefone);
      if (data.endereco) formData.append('endereco', data.endereco);
      if (data.pais) formData.append('pais', data.pais);
      if (data.estado) formData.append('estado', data.estado);
      if (data.cidade) formData.append('cidade', data.cidade);
      if (data.cep) formData.append('cep', data.cep);
      if (data.foto && data.foto[0]) {
        formData.append('foto', data.foto[0]);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa`, {
        method: "POST",
        headers: {
          "user-id": usuarioValor || "",
        },
        body: formData,
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

  const CharCounter = ({ current, max }: { current: number; max: number }) => (
    <div className={`text-xs text-right mt-1 ${current > max ? 'text-red-500' : 'text-gray-500'}`}>
      {current}/{max} {current > max && ' - Limite excedido'}
    </div>
  );

  return (
    <div
      className="flex flex-col items-center justify-center p-4 md:p-6 min-h-screen"
      style={{
        backgroundColor: "var(--cor-fundo)",
        color: "var(--cor-texto)",
      }}
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">{t("titulo")}</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md md:max-w-xl space-y-3 md:space-y-4">
        <div>
          <input 
            {...register("nome", { maxLength: 20 })} 
            placeholder={t("campos.nome")} 
            required 
            className={inputClass}
            maxLength={20}
          />
          <CharCounter current={charCounts.nome} max={20} />
        </div>

        <div>
          <input 
            {...register("email", { maxLength: 60 })} 
            placeholder={t("campos.email")} 
            type="email" 
            required 
            className={inputClass}
            maxLength={60}
          />
          <CharCounter current={charCounts.email} max={60} />
        </div>

        <div>
          <input 
            {...register("telefone", { maxLength: 15 })} 
            placeholder={t("campos.telefone")} 
            className={inputClass}
            maxLength={15}
          />
          <CharCounter current={charCounts.telefone} max={15} />
        </div>

        <div>
          <input 
            {...register("pais", { maxLength: 20 })} 
            placeholder={t("campos.pais")} 
            className={inputClass}
            maxLength={20}
          />
          <CharCounter current={charCounts.pais} max={20} />
        </div>

        <div>
          <input 
            {...register("endereco", { maxLength: 50 })} 
            placeholder={t("campos.endereco")} 
            className={inputClass}
            maxLength={50}
          />
          <CharCounter current={charCounts.endereco} max={50} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <input 
              {...register("cidade", { maxLength: 20 })} 
              placeholder={t("campos.cidade")} 
              className={inputClass}
              maxLength={20}
            />
            <CharCounter current={charCounts.cidade} max={20} />
          </div>

          <div>
            <input 
              {...register("estado", { maxLength: 2 })} 
              placeholder={t("campos.estado")} 
              className={inputClass}
              maxLength={2}
            />
            <CharCounter current={charCounts.estado} max={2} />
          </div>
        </div>

        <div>
          <input 
            {...register("cep", { maxLength: 10 })} 
            placeholder={t("campos.cep")} 
            className={inputClass}
            maxLength={10}
          />
          <CharCounter current={charCounts.cep} max={10} />
        </div>

        <div className="mb-4">
          <label className="block mb-2">{t("campos.foto")}</label>
          {fotoPreview && (
            <img
              src={fotoPreview}
              alt="Preview"
              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full mb-2 mx-auto"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={`w-full p-2 rounded border ${modoDark ? "bg-[var(--cor-input)] text-[var(--cor-texto)] border-[var(--cor-borda)]" : "bg-[var(--cor-input)] text-[var(--cor-texto)] border-[var(--cor-borda)]"}`}
          />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer text-white font-bold py-2 px-4 rounded transition hover:bg-[var(--cor-botao-hover)]"
          style={{
            backgroundColor: "var(--cor-botao)",
          }}
        >
          {t("botaoCriar")}
        </button>
      </form>
    </div>
  );
}