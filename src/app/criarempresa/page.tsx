"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";
import { UsuarioI } from "@/utils/types/usuario";
import { useTranslation } from "react-i18next";
import { FaCloudUploadAlt, FaCheck, FaTimes, FaLink, FaBuilding, FaMapMarkerAlt, FaPhone, FaGlobe, FaEnvelope, FaUser, FaCity, FaFlag, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import Cookies from "js-cookie";
import Image from "next/image";

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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    mode: "onChange",
  });
  const router = useRouter();
  const [, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [modoDark, setModoDark] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const { logar } = useUsuarioStore();
  const { t } = useTranslation("criarempresa");
  const [loading, setLoading] = useState(true);
  const [, setIsUploading] = useState(false);

  const [dominioStatus, setDominioStatus] = useState<DominioStatus>({
    disponivel: false,
    carregando: false,
    mensagem: "",
    dominioSugerido: "",
  });

  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    existe: false,
    carregando: false,
    mensagem: "",
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
      alerta: "#F59E0B",
    },
    light: {
      fundo: "#F8FAFC",
      texto: "#0F172A",
      card: "#FFFFFF",
      borda: "#E2E8F0",
      primario: "#1976D2",
      secundario: "#0284C7",
      placeholder: "#6B7280",
      hover: "#F1F5F9",
      sucesso: "#22C55E",
      erro: "#EF4444",
      alerta: "#F59E0B",
    },
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

  const bgGradient = modoDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200";
  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const bgInput = modoDark ? "bg-slate-700/50" : "bg-gray-100";
  const bgHover = modoDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50";

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }

    const verificarDominio = async () => {
      if (!dominioWatch || dominioWatch.trim().length < 3) {
        setDominioStatus({
          disponivel: false,
          carregando: false,
          mensagem: "",
          dominioSugerido: "",
        });
        return;
      }

      setDominioStatus((prev) => ({ ...prev, carregando: true }));

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/verificar-dominio/${encodeURIComponent(dominioWatch)}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDominioStatus({
            disponivel: data.disponivel,
            carregando: false,
            mensagem: data.mensagem,
            dominioSugerido: data.dominioSugerido,
          });
        }
      } catch {
        setDominioStatus({
          disponivel: false,
          carregando: false,
          mensagem: t("erros.verificacaoDominio"),
          dominioSugerido: "",
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
          mensagem: "",
        });
        return;
      }

      setEmailStatus((prev) => ({ ...prev, carregando: true }));

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/verificar-email/${encodeURIComponent(emailWatch)}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEmailStatus({
            existe: data.existe,
            carregando: false,
            mensagem: data.mensagem,
          });
        } else {
          setEmailStatus({
            existe: false,
            carregando: false,
            mensagem: t("erros.verificacaoEmail"),
          });
        }
      } catch {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: t("erros.verificacaoEmail"),
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
    const ativado = temaSalvo === "true";
    setModoDark(ativado);

    const handleThemeChange = (e: CustomEvent) => {
      setModoDark(e.detail.modoDark);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);

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

        const responseEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/empresa/${usuarioId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        });
        if (responseEmpresa.ok) {
          const data = await responseEmpresa.json();
          if (data.empresa) {
            router.push("/empresa");
            return;
          }
        }
      } catch (err) {
        console.error("Erro em buscar os dados:", err);
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

  const uploadFotoSeparada = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("foto", file);

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return null;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/upload-foto`, {
        method: "POST",
        body: formData,
        headers: {
          "user-id": usuarioValor,
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.fotoUrl;
      } else {
        console.error("Erro no upload da foto:", await response.text());
        return null;
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      return null;
    } finally {
      setIsUploading(false);
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
        color: temaAtual.texto,
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
        color: temaAtual.texto,
      });
      return;
    }

    const usuarioSalvo = localStorage.getItem("client_key") as string;
    const usuarioValor = usuarioSalvo.replace(/"/g, "");

    try {
      let fotoUrl = null;

      if (data.foto && data.foto[0]) {
        const uploadedUrl = await uploadFotoSeparada(data.foto[0]);
        if (uploadedUrl) {
          fotoUrl = uploadedUrl;
        } else {
          Swal.fire({
            icon: "warning",
            title: t("avisos.uploadFotoFalhouTitulo"),
            text: t("avisos.uploadFotoFalhouTexto"),
            confirmButtonColor: temaAtual.primario,
            background: temaAtual.card,
            color: temaAtual.texto,
          });
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": usuarioValor,
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          endereco: data.endereco,
          pais: data.pais,
          estado: data.estado,
          cidade: data.cidade,
          cep: data.cep,
          dominioSolicitado: data.dominio,
          fotoUrl: fotoUrl,
        }),
      });

      if (response.ok) {
        await response.json();

        Swal.fire({
          icon: "success",
          title: t("sucesso.titulo"),
          html: `
          <div>
            <p>${t("sucesso.mensagem")}</p>
          </div>
        `,
          confirmButtonColor: temaAtual.primario,
          background: temaAtual.card,
          color: temaAtual.texto,
          confirmButtonText: t("sucesso.botaoConfirmar"),
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
          color: temaAtual.texto,
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
        color: temaAtual.texto,
      });
    }
  }

  const CharCounter = ({ current, max }: { current: number; max: number }) => (
    <div className={`text-xs text-right mt-1 ${current > max ? "text-red-500" : ""}`} style={{ color: current > max ? temaAtual.erro : temaAtual.placeholder }}>
      {current}/{max} {current > max && ` - ${t("validacao.limiteExcedido")}`}
    </div>
  );

  const CampoObrigatorio = () => <span className="text-red-500 ml-1">*</span>;

  if (loading) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className={`${textPrimary} font-medium`}>{t("carregando")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient}`}>
      <div className="flex">
        <div className="flex-1 min-w-0">
          <div className="px-4 sm:px-6 py-8 w-full max-w-4xl mx-auto">
            <section className={`relative py-8 rounded-3xl mb-6 overflow-hidden ${bgCard} backdrop-blur-sm border ${borderColor}`}>
              <div className="absolute inset-0">
                <div className={`absolute top-0 left-10 w-32 h-32 ${modoDark ? "bg-blue-500/20" : "bg-blue-200/50"} rounded-full blur-3xl animate-float`}></div>
                <div className={`absolute bottom-0 right-10 w-48 h-48 ${modoDark ? "bg-slate-700/20" : "bg-slate-300/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "2s" }}></div>
                <div className={`absolute top-1/2 left-1/2 w-24 h-24 ${modoDark ? "bg-cyan-500/20" : "bg-cyan-200/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "4s" }}></div>
              </div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <FaBuilding className="text-white text-3xl" />
                </div>
                <h1 className={`text-3xl md:text-4xl font-bold ${textPrimary} mb-3`}>
                  {t("titulo")} <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{t("empresa")}</span>
                </h1>
                <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>{t("subtitulo")}</p>
              </div>
            </section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="gradient-border animate-fade-in-up">
                  <div className={`p-6 rounded-[15px] ${bgCard} backdrop-blur-sm`}>
                    <h2 className={`text-xl font-bold ${textPrimary} mb-6 flex items-center gap-2`}>
                      <FaBuilding className={modoDark ? "text-blue-400" : "text-blue-500"} />
                      {t("informacoesEmpresa")}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label className={`block mb-2 text-sm font-medium items-center ${textPrimary}`}>
                          <FaUser className="inline mr-2 text-sm" />
                          {t("campos.nome")}
                          <CampoObrigatorio />
                        </label>
                        <input
                          {...register("nome", {
                            required: t("validacao.nomeObrigatorio"),
                            maxLength: 20,
                          })}
                          placeholder={t("campos.nome")}
                          required
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 ${bgInput} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"}`}
                          style={{
                            border: `1px solid ${errors.nome ? temaAtual.erro : temaAtual.borda}`,
                          }}
                          maxLength={20}
                        />
                        <CharCounter current={charCounts.nome} max={20} />
                        {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
                      </div>
                      <div>
                        <label className={`block mb-2 text-sm font-medium items-center ${textPrimary}`}>
                          <FaEnvelope className="inline mr-2 text-sm" />
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
                                message: t("validacao.emailInvalido"),
                              },
                            })}
                            placeholder={t("campos.email")}
                            type="email"
                            required
                            className={`w-full px-4 py-3 rounded-xl border text-sm pr-10 transition-all duration-300 ${bgInput} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"}`}
                            style={{
                              border: `1px solid ${errors.email || emailStatus.existe ? temaAtual.erro : temaAtual.borda}`,
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
                              {emailStatus.existe ? <FaTimes className="text-red-500" /> : <FaCheck className="text-green-500" />}
                            </div>
                          )}
                        </div>
                        <CharCounter current={charCounts.email} max={60} />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                        {emailStatus.mensagem && (
                          <div className={`text-xs mt-1 ${emailStatus.existe ? "text-red-600" : "text-green-600"}`} style={{ color: emailStatus.existe ? temaAtual.erro : temaAtual.sucesso }}>
                            {emailStatus.mensagem}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block mb-2 text-sm font-medium items-center ${textPrimary}`}>
                            <FaPhone className="inline mr-2 text-sm" />
                            {t("campos.telefone")}
                          </label>
                          <input
                            {...register("telefone", { maxLength: 15 })}
                            placeholder={t("campos.telefone")}
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 ${bgInput} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"}`}
                            style={{
                              border: `1px solid ${temaAtual.borda}`,
                            }}
                            maxLength={15}
                          />
                          <CharCounter current={charCounts.telefone} max={15} />
                        </div>

                        <div>
                          <label className={`block mb-2 text-sm font-medium items-center ${textPrimary}`}>
                            <FaFlag className="inline mr-2 text-sm" />
                            {t("campos.pais")}
                          </label>
                          <input
                            {...register("pais", { maxLength: 20 })}
                            placeholder={t("campos.pais")}
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 ${bgInput} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"}`}
                            style={{
                              border: `1px solid ${temaAtual.borda}`,
                            }}
                            maxLength={20}
                          />
                          <CharCounter current={charCounts.pais} max={20} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block mb-2 text-sm font-medium items-center ${textPrimary}`}>
                            <FaMapMarkerAlt className="inline mr-2 text-sm" />
                            {t("campos.endereco")}
                          </label>
                          <input
                            {...register("endereco", { maxLength: 50 })}
                            placeholder={t("campos.endereco")}
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 ${bgInput} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"}`}
                            style={{
                              border: `1px solid ${temaAtual.borda}`,
                            }}
                            maxLength={50}
                          />
                          <CharCounter current={charCounts.endereco} max={50} />
                        </div>

                        <div>
                          <label className={`block mb-2 text-sm font-medium items-center ${textPrimary}`}>
                            <FaCity className="inline mr-2 text-sm" />
                            {t("campos.cidade")}
                          </label>
                          <input
                            {...register("cidade", { maxLength: 20 })}
                            placeholder={t("campos.cidade")}
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 ${bgInput} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"}`}
                            style={{
                              border: `1px solid ${temaAtual.borda}`,
                            }}
                            maxLength={20}
                          />
                          <CharCounter current={charCounts.cidade} max={20} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block mb-2 text-sm font-medium ${textPrimary}`}>
                            {t("campos.estado")}
                          </label>
                          <input
                            {...register("estado", { maxLength: 2 })}
                            placeholder={t("campos.estado")}
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 ${bgInput} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"}`}
                            style={{
                              border: `1px solid ${temaAtual.borda}`,
                            }}
                            maxLength={2}
                          />
                          <CharCounter current={charCounts.estado} max={2} />
                        </div>

                        <div>
                          <label className={`block mb-2 text-sm font-medium ${textPrimary}`}>
                            {t("campos.cep")}
                          </label>
                          <input
                            {...register("cep", { maxLength: 10 })}
                            placeholder={t("campos.cep")}
                            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-300 ${bgInput} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"}`}
                            style={{
                              border: `1px solid ${temaAtual.borda}`,
                            }}
                            maxLength={10}
                          />
                          <CharCounter current={charCounts.cep} max={10} />
                        </div>
                      </div>
                      <div>
                        <label className={`block mb-2 text-sm font-medium items-center ${textPrimary}`}>
                          <FaLink className="inline mr-2 text-sm" />
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
                                message: t("validacao.dominioMinimo"),
                              },
                            })}
                            placeholder={t("campos.dominioPlaceholder")}
                            className={`w-full px-4 py-3 rounded-xl border text-sm pr-10 transition-all duration-300 ${bgInput} ${textPrimary} placeholder-${modoDark ? "gray-400" : "slate-500"}`}
                            style={{
                              border: `1px solid ${errors.dominio || (dominioWatch && dominioWatch.length > 0 && dominioWatch.length < 4) ? temaAtual.erro : temaAtual.borda}`,
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
                              {dominioStatus.disponivel ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}
                            </div>
                          )}
                        </div>
                        <CharCounter current={charCounts.dominio} max={30} />

                        {errors.dominio && <p className="text-xs text-red-500 mt-1">{errors.dominio.message}</p>}

                        {dominioWatch && dominioWatch.length > 0 && dominioWatch.length < 4 && <p className="text-xs text-red-500 mt-1">{t("validacao.dominioMinimo")}</p>}

                        {dominioWatch && dominioWatch.length >= 3 && !dominioStatus.carregando && (
                          <div className={`text-xs mt-1 ${dominioStatus.disponivel ? "text-green-600" : "text-red-600"}`} style={{ color: dominioStatus.disponivel ? temaAtual.sucesso : temaAtual.erro }}>
                            {dominioStatus.mensagem}
                          </div>
                        )}

                        <div className={`text-xs mt-2 p-3 rounded-lg ${modoDark ? "bg-slate-700/50" : "bg-slate-100"}`}>
                          <span className={textMuted}>URL do seu catálogo: </span>
                          <span className={textPrimary}>
                            {process.env.NEXT_PUBLIC_URL_API}/catalogo/{dominioWatch || t("campos.dominioExemplo")}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className={`block mb-2 text-sm font-medium ${textPrimary}`}>
                          {t("campos.foto")}
                        </label>
                        <div className="flex items-center gap-4">
                          {fotoPreview && (
                            <div className="relative">
                              <Image
                                src={fotoPreview}
                                alt="Preview"
                                width={80}
                                height={80}
                                className="w-20 h-20 object-cover rounded-xl border-2"
                                style={{ borderColor: temaAtual.borda }}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="fileInput" />
                            <label
                              htmlFor="fileInput"
                              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm cursor-pointer transition-all duration-300 ${bgHover} ${textPrimary}`}
                              style={{
                                border: `1px solid ${temaAtual.borda}`,
                              }}
                            >
                              <FaCloudUploadAlt className="text-sm" />
                              {t("selecionarImagem")}
                            </label>
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full px-4 py-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        style={{
                          background: modoDark ? "linear-gradient(135deg, #3B82F6, #0EA5E9)" : "linear-gradient(135deg, #1976D2, #0284C7)",
                          color: "#FFFFFF",
                        }}
                        disabled={!dominioWatch || dominioWatch.length < 4 || (dominioWatch.length >= 4 && !dominioStatus.disponivel && !dominioStatus.carregando) || emailStatus.existe || emailStatus.carregando}
                      >
                        <FaBuilding className="text-sm" />
                        {t("botaoCriar")}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-sm overflow-hidden`}>
                  <div className="p-4 border-b" style={{ borderColor: temaAtual.borda }}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: temaAtual.texto }}>
                      <FaInfoCircle className={modoDark ? "text-blue-400" : "text-blue-500"} />
                      {t("informacoesImportantes")}
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${modoDark ? "bg-blue-500/10" : "bg-blue-50"} border ${modoDark ? "border-blue-500/20" : "border-blue-200"}`}>
                        <h3 className={`font-bold text-sm ${textPrimary} mb-1`}>{t("dicaDominio.titulo")}</h3>
                        <p className={`text-xs ${textMuted}`}>{t("dicaDominio.mensagem")}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${modoDark ? "bg-green-500/10" : "bg-green-50"} border ${modoDark ? "border-green-500/20" : "border-green-200"}`}>
                        <h3 className={`font-bold text-sm ${textPrimary} mb-1`}>{t("dicaEmail.titulo")}</h3>
                        <p className={`text-xs ${textMuted}`}>{t("dicaEmail.mensagem")}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${modoDark ? "bg-purple-500/10" : "bg-purple-50"} border ${modoDark ? "border-purple-500/20" : "border-purple-200"}`}>
                        <h3 className={`font-bold text-sm ${textPrimary} mb-1`}>{t("dicaFoto.titulo")}</h3>
                        <p className={`text-xs ${textMuted}`}>{t("dicaFoto.mensagem")}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-sm overflow-hidden`}>
                  <div className="p-4 border-b" style={{ borderColor: temaAtual.borda }}>
                    <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: temaAtual.texto }}>
                      <FaCheckCircle className={modoDark ? "text-green-400" : "text-green-500"} />
                      {t("statusValidacao")}
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textPrimary}`}>{t("campos.dominio")}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${!dominioWatch || dominioWatch.length < 4 ? "bg-yellow-500/20 text-yellow-500" : dominioStatus.disponivel ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                          {!dominioWatch || dominioWatch.length < 4 ? t("status.pendente") : dominioStatus.disponivel ? t("status.disponivel") : t("status.indisponivel")}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textPrimary}`}>{t("campos.email")}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${!emailWatch ? "bg-yellow-500/20 text-yellow-500" : emailStatus.existe ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"}`}>
                          {!emailWatch ? t("status.pendente") : emailStatus.existe ? t("status.ocupado") : t("status.disponivel")}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${textPrimary}`}>{t("campos.nome")}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${charCounts.nome > 0 ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                          {charCounts.nome > 0 ? t("status.preenchido") : t("status.pendente")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}