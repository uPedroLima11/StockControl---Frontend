"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";
import { UsuarioI } from "@/utils/types/usuario";
import { useTranslation } from "react-i18next";
import { FaCloudUploadAlt, FaCheck, FaTimes, FaLink } from "react-icons/fa";

type Inputs = {
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  dominio?: string;
  foto?: FileList;
};

type DominioStatus = {
  disponivel: boolean;
  carregando: boolean;
  mensagem: string;
  dominioSugerido: string;
};

type EmailStatus = {
  existe: boolean;
  carregando: boolean;
  mensagem: string;
};

export default function CriarEmpresa() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Inputs>({
    mode: "onChange"
  });
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [modoDark, setModoDark] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const { logar } = useUsuarioStore();
  const { t } = useTranslation("criarempresa");
  const [loading, setLoading] = useState(true);
  const [dominioStatus, setDominioStatus] = useState<DominioStatus>({
    disponivel: false,
    carregando: false,
    mensagem: "",
    dominioSugerido: ""
  });

  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    existe: false,
    carregando: false,
    mensagem: ""
  });

  const cores = {
    dark: {
      fundo: "#0A1929",
      texto: "#FFFFFF",
      card: "#132F4C",
      borda: "#1E4976",
      primario: "#1976D2",
      secundario: "#00B4D8",
      placeholder: "#9CA3AF",
      hover: "#1E4976",
      sucesso: "#22C55E",
      erro: "#EF4444",
      alerta: "#F59E0B"
    },
    light: {
      fundo: "#F8FAFC",
      texto: "#0F172A",
      card: "#FFFFFF",
      borda: "#E2E8F0",
      primario: "#1976D2",
      secundario: "#0284C7",
      placeholder: "#6B7280",
      hover: "#EFF6FF",
      sucesso: "#22C55E",
      erro: "#EF4444",
      alerta: "#F59E0B"
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
    dominio: 0,
  });

  const dominioWatch = watch("dominio");
  const emailWatch = watch("email");

  useEffect(() => {
    const verificarDominio = async () => {
      if (!dominioWatch || dominioWatch.trim().length < 3) {
        setDominioStatus({
          disponivel: false,
          carregando: false,
          mensagem: "",
          dominioSugerido: ""
        });
        return;
      }

      setDominioStatus(prev => ({ ...prev, carregando: true }));

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/empresa/verificar-dominio/${encodeURIComponent(dominioWatch)}`
        );

        if (response.ok) {
          const data = await response.json();
          setDominioStatus({
            disponivel: data.disponivel,
            carregando: false,
            mensagem: data.mensagem,
            dominioSugerido: data.dominioSugerido
          });
        }
      } catch (_error) {
        setDominioStatus({
          disponivel: false,
          carregando: false,
          mensagem: t("erros.verificacaoDominio"),
          dominioSugerido: ""
        });
      }
    };

    const timeoutId = setTimeout(verificarDominio, 500);
    return () => clearTimeout(timeoutId);
  }, [dominioWatch, t]);

  useEffect(() => {
    const verificarEmail = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailWatch || !emailRegex.test(emailWatch)) {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: ""
        });
        return;
      }

      setEmailStatus(prev => ({ ...prev, carregando: true }));

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL_API}/empresa/verificar-email/${encodeURIComponent(emailWatch)}`
        );

        if (response.ok) {
          const data = await response.json();
          setEmailStatus({
            existe: data.existe,
            carregando: false,
            mensagem: data.mensagem
          });
        } else {
          setEmailStatus({
            existe: false,
            carregando: false,
            mensagem: t("erros.verificacaoEmail")
          });
        }
      } catch (_error) {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: t("erros.verificacaoEmail")
        });
      }
    };

    const timeoutId = setTimeout(verificarEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [emailWatch, t]);

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
        dominio: value.dominio?.length || 0,
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

        const responseUser = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioId}`);
        if (responseUser.ok) {
          const dados: UsuarioI = await responseUser.json();
          logar(dados);
          setUsuarioLogado(dados);

          if (dados.empresaId) {
            router.push("/dashboard");
            return;
          }
        }

        const responseEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${usuarioId}`);
        if (responseEmpresa.ok) {
          const data = await responseEmpresa.json();
          if (data.empresa) {
            router.push("/empresa");
            return;
          }
        }
      } catch (_err) {
        console.error("Erro ao buscar dados:", _err);
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
    if (!data.dominio || data.dominio.trim().length < 4) {
      Swal.fire({
        icon: "error",
        title: t("erros.dominioInvalidoTitulo"),
        text: t("erros.dominioInvalidoTexto"),
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto
      });
      return;
    }

    if (emailStatus.existe) {
      Swal.fire({
        icon: "error",
        title: t("erros.emailExistenteTitulo"),
        text: t("erros.emailExistenteTexto"),
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto
      });
      return;
    }

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
      if (data.dominio) formData.append("dominio", data.dominio);
      if (data.foto && data.foto[0]) {
        formData.append("foto", data.foto[0]);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa`, {
        method: "POST",
        headers: {
          "user-id": usuarioValor || "",
        },
        body: formData,
      });

      if (response.ok) {
        await response.json(); 

        Swal.fire({
          icon: "success",
          title: t("sucesso.titulo"),
          html: `<div><p>${t("sucesso.mensagem")}</p></div>`,
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
        router.push("/empresa");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Swal.fire({
          icon: "error",
          title: t("erro.titulo"),
          text: errorData.mensagem || t("erro.mensagem"),
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto
        });
      }
    } catch (_err) {
      console.error(_err);
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
      style={{ color: current > max ? temaAtual.erro : temaAtual.placeholder }}
    >
      {current}/{max} {current > max && ` - ${t("validacao.limiteExcedido")}`}
    </div>
  );

  const CampoObrigatorio = () => <span className="text-red-500 ml-1">*</span>;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
        <div className="font-mono" style={{ color: temaAtual.texto }}>{t("carregando")}</div>
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
              <label className="block mb-1 text-sm font-medium items-center" style={{ color: temaAtual.texto }}>
                {t("campos.nome")}
                <CampoObrigatorio />
              </label>
              <input
                {...register("nome", {
                  required: t("validacao.nomeObrigatorio"),
                  maxLength: 20
                })}
                placeholder={t("campos.nome")}
                required
                className="w-full px-3 py-1.5 rounded border text-sm"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${errors.nome ? temaAtual.erro : temaAtual.borda}`
                }}
                maxLength={20}
              />
              <CharCounter current={charCounts.nome} max={20} />
              {errors.nome && (
                <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium items-center" style={{ color: temaAtual.texto }}>
                {t("campos.email")}
                <CampoObrigatorio />
              </label>
              <div className="relative">
                <input
                  {...register("email", {
                    required: t("validacao.emailObrigatorio"),
                    maxLength: 60,
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t("validacao.emailInvalido")
                    }
                  })}
                  placeholder={t("campos.email")}
                  type="email"
                  required
                  className="w-full px-3 py-2 rounded border text-sm pr-10"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${errors.email || emailStatus.existe ? temaAtual.erro : temaAtual.borda}`
                  }}
                  maxLength={60}
                />
                {emailStatus.carregando && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: temaAtual.primario }}></div>
                  </div>
                )}
                {!emailStatus.carregando && emailWatch && emailWatch.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailStatus.existe ? (
                      <FaTimes className="text-red-500" />
                    ) : (
                      <FaCheck className="text-green-500" />
                    )}
                  </div>
                )}
              </div>
              <CharCounter current={charCounts.email} max={60} />

              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}

              {emailStatus.mensagem && (
                <div
                  className={`text-xs mt-1 ${emailStatus.existe ? 'text-red-600' : 'text-green-600'}`}
                  style={{ color: emailStatus.existe ? temaAtual.erro : temaAtual.sucesso }}
                >
                  {emailStatus.mensagem}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                />
                <CharCounter current={charCounts.pais} max={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                />
                <CharCounter current={charCounts.endereco} max={50} />
              </div>

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
                />
                <CharCounter current={charCounts.cidade} max={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                />
                <CharCounter current={charCounts.estado} max={2} />
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
                />
                <CharCounter current={charCounts.cep} max={10} />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium items-center" style={{ color: temaAtual.texto }}>
                <FaLink className="inline mr-1 text-sm" />
                {t("campos.dominio")}
                <CampoObrigatorio />
              </label>
              <div className="relative">
                <input
                  {...register("dominio", {
                    required: t("validacao.dominioObrigatorio"),
                    maxLength: 30,
                    minLength: {
                      value: 4,
                      message: t("validacao.dominioMinimo")
                    }
                  })}
                  placeholder={t("campos.dominioPlaceholder")}
                  className="w-full px-3 py-2 rounded border text-sm pr-10"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${errors.dominio || (dominioWatch && dominioWatch.length > 0 && dominioWatch.length < 4) ? temaAtual.erro : temaAtual.borda}`
                  }}
                  maxLength={30}
                />
                {dominioStatus.carregando && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: temaAtual.primario }}></div>
                  </div>
                )}
                {!dominioStatus.carregando && dominioWatch && dominioWatch.length >= 3 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {dominioStatus.disponivel ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <CharCounter current={charCounts.dominio} max={30} />

              {errors.dominio && (
                <p className="text-xs text-red-500 mt-1">{errors.dominio.message}</p>
              )}

              {dominioWatch && dominioWatch.length > 0 && dominioWatch.length < 4 && (
                <p className="text-xs text-red-500 mt-1">{t("validacao.dominioMinimo")}</p>
              )}

              {dominioWatch && dominioWatch.length >= 3 && !dominioStatus.carregando && (
                <div
                  className={`text-xs mt-1 ${dominioStatus.disponivel ? 'text-green-600' : 'text-red-600'}`}
                  style={{ color: dominioStatus.disponivel ? temaAtual.sucesso : temaAtual.erro }}
                >
                  {dominioStatus.mensagem}
                </div>
              )}

              <div className="text-xs mt-2 mb-3" style={{ color: temaAtual.placeholder }}>
                {process.env.NEXT_PUBLIC_URL_API}/catalogo/{dominioWatch || t("campos.dominioExemplo")}
              </div>
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
              className="w-full px-4 py-2 rounded-lg transition font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: temaAtual.primario,
                color: "#FFFFFF",
              }}
              disabled={
                !dominioWatch ||
                dominioWatch.length < 4 ||
                (dominioWatch.length >= 4 && !dominioStatus.disponivel && !dominioStatus.carregando) ||
                emailStatus.existe ||
                emailStatus.carregando
              }
            >
              {t("botaoCriar")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}