"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";
import { UsuarioI } from "@/utils/types/usuario";
import { useTranslation } from "react-i18next";
import { FaCloudUploadAlt } from "react-icons/fa";

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
  const [loading, setLoading] = useState(true);

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

  const [charCounts, setCharCounts] = useState({
    nome: 0,
    email: 0,
    telefone: 0,
    endereco: 0,
    pais: 0,
    estado: 0,
    cidade: 0,
    cep: 0,
  });

  useEffect(() => {
    const subscription = watch((value) => {
      setCharCounts({
        nome: value.nome?.length || 0,
        email: value.email?.length || 0,
        telefone: value.telefone?.length || 0,
        endereco: value.endereco?.length || 0,
        pais: value.pais?.length || 0,
        estado: value.estado?.length || 0,
        cidade: value.cidade?.length || 0,
        cep: value.cep?.length || 0,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
  }, []);

  useEffect(() => {
    if (usuarioLogado) {
      console.log("Usuário logado:", usuarioLogado);
    }
  }, [usuarioLogado]);

  useEffect(() => {
    async function init() {
      try {
        const clientKey = localStorage.getItem("client_key");
        if (!clientKey) {
          router.push("/login");
          return;
        }

        const usuarioId = clientKey.replace(/"/g, "");

        const responseUser = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`
        );
        if (responseUser.ok) {
          const dados: UsuarioI = await responseUser.json();
          logar(dados);
          setUsuarioLogado(dados);

          if (dados.empresaId) {
            router.push("/dashboard");
            return;
          }
        }

        const responseEmpresa = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${usuarioId}`
        );
        if (responseEmpresa.ok) {
          const data = await responseEmpresa.json();
          if (data.empresa) {
            router.push("/empresa");
            return;
          }
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router, logar]);

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
      formData.append("nome", data.nome);
      formData.append("email", data.email);
      if (data.telefone) formData.append("telefone", data.telefone);
      if (data.endereco) formData.append("endereco", data.endereco);
      if (data.pais) formData.append("pais", data.pais);
      if (data.estado) formData.append("estado", data.estado);
      if (data.cidade) formData.append("cidade", data.cidade);
      if (data.cep) formData.append("cep", data.cep);
      if (data.foto && data.foto[0]) {
        formData.append("foto", data.foto[0]);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/empresa`,
        {
          method: "POST",
          headers: {
            "user-id": usuarioValor || "",
          },
          body: formData,
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: t("sucesso.titulo"),
          text: t("sucesso.mensagem"),
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        router.push("/empresa");
      } else {
        Swal.fire({
          icon: "error",
          title: t("erro.titulo"),
          text: t("erro.mensagem"),
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: t("erro.titulo"),
        text: t("erro.mensagem"),
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto
      });
    }
  }

  const CharCounter = ({ current, max }: { current: number; max: number }) => (
    <div
      className={`text-xs text-right mt-1 ${current > max ? "text-red-500" : ""}`}
      style={{ color: current > max ? "#EF4444" : temaAtual.placeholder }}
    >
      {current}/{max} {current > max && " - Limite excedido"}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
        <div className="font-mono" style={{ color: temaAtual.texto }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-6" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
      <div className="w-full max-w-md">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-4" style={{ color: temaAtual.texto }}>
          {t("titulo")}
        </h1>

        <div className="p-4 md:p-5 rounded-lg" style={{
          backgroundColor: temaAtual.card,
          border: `1px solid ${temaAtual.borda}`
        }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("campos.nome")}
              </label>
              <input
                {...register("nome", { maxLength: 20 })}
                placeholder={t("campos.nome")}
                required
                className="w-full px-3 py-1.5 rounded border text-sm"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                maxLength={20}
                onFocus={(e) => {
                  e.target.style.borderColor = temaAtual.primario;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = temaAtual.borda;
                }}
              />
              <CharCounter current={charCounts.nome} max={20} />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("campos.email")}
              </label>
              <input
                {...register("email", { maxLength: 60 })}
                placeholder={t("campos.email")}
                type="email"
                required
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                maxLength={60}
                onFocus={(e) => {
                  e.target.style.borderColor = temaAtual.primario;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = temaAtual.borda;
                }}
              />
              <CharCounter current={charCounts.email} max={60} />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("campos.telefone")}
              </label>
              <input
                {...register("telefone", { maxLength: 15 })}
                placeholder={t("campos.telefone")}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                maxLength={15}
                onFocus={(e) => {
                  e.target.style.borderColor = temaAtual.primario;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = temaAtual.borda;
                }}
              />
              <CharCounter current={charCounts.telefone} max={15} />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("campos.pais")}
              </label>
              <input
                {...register("pais", { maxLength: 20 })}
                placeholder={t("campos.pais")}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                maxLength={20}
                onFocus={(e) => {
                  e.target.style.borderColor = temaAtual.primario;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = temaAtual.borda;
                }}
              />
              <CharCounter current={charCounts.pais} max={20} />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("campos.endereco")}
              </label>
              <input
                {...register("endereco", { maxLength: 50 })}
                placeholder={t("campos.endereco")}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                maxLength={50}
                onFocus={(e) => {
                  e.target.style.borderColor = temaAtual.primario;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = temaAtual.borda;
                }}
              />
              <CharCounter current={charCounts.endereco} max={50} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.cidade")}
                </label>
                <input
                  {...register("cidade", { maxLength: 20 })}
                  placeholder={t("campos.cidade")}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                  maxLength={20}
                  onFocus={(e) => {
                    e.target.style.borderColor = temaAtual.primario;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = temaAtual.borda;
                  }}
                />
                <CharCounter current={charCounts.cidade} max={20} />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.estado")}
                </label>
                <input
                  {...register("estado", { maxLength: 2 })}
                  placeholder={t("campos.estado")}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                  maxLength={2}
                  onFocus={(e) => {
                    e.target.style.borderColor = temaAtual.primario;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = temaAtual.borda;
                  }}
                />
                <CharCounter current={charCounts.estado} max={2} />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("campos.cep")}
              </label>
              <input
                {...register("cep", { maxLength: 10 })}
                placeholder={t("campos.cep")}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                maxLength={10}
                onFocus={(e) => {
                  e.target.style.borderColor = temaAtual.primario;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = temaAtual.borda;
                }}
              />
              <CharCounter current={charCounts.cep} max={10} />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("campos.foto")}
              </label>
              {fotoPreview && (
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-full mb-2 mx-auto border"
                  style={{ borderColor: temaAtual.borda }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded border text-sm cursor-pointer transition"
                style={{
                  backgroundColor: temaAtual.card,
                  border: `1px solid ${temaAtual.borda}`,
                  color: temaAtual.texto
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = temaAtual.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = temaAtual.card;
                }}
              >
                <FaCloudUploadAlt className="text-sm" />
                {t("selecionarImagem")}
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg transition font-medium text-sm cursor-pointer"
              style={{
                backgroundColor: temaAtual.primario,
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {t("botaoCriar")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}