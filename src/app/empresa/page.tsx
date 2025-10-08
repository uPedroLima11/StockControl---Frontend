"use client";

import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaEdit, FaTrash, FaSignOutAlt, FaLink, FaGlobe, FaTimes, FaCheck, FaBuilding, FaUsers, FaChartLine, FaSync, FaInfoCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUsuarioStore } from "@/context/usuario";
import { useTranslation } from "react-i18next";
import { usuarioTemPermissao } from "@/utils/permissoes";
import { cores } from "@/utils/cores";
import Swal from "sweetalert2";
import Image from "next/image";
import Cookies from "js-cookie";
import { FaShield } from "react-icons/fa6";

type EmailStatus = {
  existe: boolean;
  carregando: boolean;
  mensagem: string;
};

interface Empresa {
  slug: string;
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  foto?: string | null;
  catalogoPublico?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type TipoUsuario = "FUNCIONARIO" | "ADMIN" | "PROPRIETARIO";

export default function Empresa() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresaEditada, setEmpresaEditada] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [atualizandoCatalogo, setAtualizandoCatalogo] = useState(false);
  const router = useRouter();
  const { logar } = useUsuarioStore();
  const [modoDark, setModoDark] = useState(false);
  const { t } = useTranslation("empresa");
  const [temPermissaoGerenciar, setTemPermissaoGerenciar] = useState(false);
  const [carregandoPermissao, setCarregandoPermissao] = useState(true);
  const [, setIsUploading] = useState(false);
  const [stats, setStats] = useState({
    totalProdutos: 0,
    totalUsuarios: 0,
    produtosCatalogo: 0,
    estoqueBaixo: 0,
  });

  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    existe: false,
    carregando: false,
    mensagem: "",
  });

  const temaAtual = modoDark ? cores.dark : cores.light;

  const [nomeCaracteres, setNomeCaracteres] = useState(0);
  const [emailCaracteres, setEmailCaracteres] = useState(0);
  const [telefoneCaracteres, setTelefoneCaracteres] = useState(0);
  const [paisCaracteres, setPaisCaracteres] = useState(0);
  const [enderecoCaracteres, setEnderecoCaracteres] = useState(0);
  const [estadoCaracteres, setEstadoCaracteres] = useState(0);
  const [cidadeCaracteres, setCidadeCaracteres] = useState(0);
  const [cepCaracteres, setCepCaracteres] = useState(0);

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      window.location.href = "/login";
    }

    if (modalEdicaoAberto && empresaEditada) {
      setNomeCaracteres(empresaEditada.nome?.length || 0);
      setEmailCaracteres(empresaEditada.email?.length || 0);
      setTelefoneCaracteres(empresaEditada.telefone?.length || 0);
      setPaisCaracteres(empresaEditada.pais?.length || 0);
      setEnderecoCaracteres(empresaEditada.endereco?.length || 0);
      setEstadoCaracteres(empresaEditada.estado?.length || 0);
      setCidadeCaracteres(empresaEditada.cidade?.length || 0);
      setCepCaracteres(empresaEditada.cep?.length || 0);
    }
  }, [modalEdicaoAberto, empresaEditada]);

  const handleInputChange = (field: keyof Empresa, value: string, maxLength: number, setCaracteres: React.Dispatch<React.SetStateAction<number>>) => {
    if (value.length <= maxLength) {
      if (field === "email") {
        value = value.toLowerCase();
      }

      setEmpresaEditada((prev) => (prev ? { ...prev, [field]: value } : null));
      setCaracteres(value.length);
    }
  };

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);

    const verificarPermissaoGerenciar = async (userId: string) => {
      try {
        const temPermissao = await usuarioTemPermissao(userId, "empresa_gerenciar");
        setTemPermissaoGerenciar(temPermissao);
      } catch (error) {
        console.error("Erro ao verificar permissão:", error);
        setTemPermissaoGerenciar(false);
      } finally {
        setCarregandoPermissao(false);
      }
    };

    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
        setTipoUsuario(dados.tipo as TipoUsuario);
        await verificarPermissaoGerenciar(idUsuario);
      }
    }

    const buscarDados = async (idUsuario: string) => {
      const responseUser = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (responseUser.status === 200) {
        await responseUser.json();
      }
    };

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      buscarDados(usuarioValor);
    }

    const fetchEmpresa = async () => {
      try {
        const userId = localStorage.getItem("client_key");
        if (!userId) {
          console.warn(t("erros.usuarioNaoLogado"));
          return;
        }

        const usuarioSalvo = localStorage.getItem("client_key") as string;
        const usuarioValor = usuarioSalvo.replace(/"/g, "");

        const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${usuarioValor}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        if (res.status === 404) {
          router.push("/criarempresa");
          return;
        }

        if (!res.ok) {
          throw new Error(t("erros.erroBuscarEmpresa"));
        }

        const data = await res.json();

        if (!data.id) {
          router.push("/criarempresa");
          return;
        }

        setEmpresa(data);
        setFotoPreview(data.foto || null);

        await carregarEstatisticas(data.id);
      } catch {
        router.push("/criarempresa");
      } finally {
        setLoading(false);
      }
    };

    const carregarEstatisticas = async (empresaId: string) => {
      try {
        const [produtosRes, usuariosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/produtos`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/empresa/${empresaId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          })
        ]);

        if (produtosRes.ok) {
          const todosProdutos = await produtosRes.json();
          const produtosDaEmpresa = todosProdutos.filter((p: any) => p.empresaId === empresaId);
          const produtosCatalogo = produtosDaEmpresa.filter((p: any) => p.noCatalogo);
          const estoqueBaixo = produtosDaEmpresa.filter((p: any) => p.quantidade <= (p.quantidadeMin || 0));

          setStats(prev => ({
            ...prev,
            totalProdutos: produtosDaEmpresa.length,
            produtosCatalogo: produtosCatalogo.length,
            estoqueBaixo: estoqueBaixo.length,
          }));
        }

        if (usuariosRes.ok) {
          const usuarios = await usuariosRes.json();
          setStats(prev => ({
            ...prev,
            totalUsuarios: usuarios.length,
          }));
        } else if (usuariosRes.status === 404) {
          const countRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/contagem/${empresaId}`, {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          });

          if (countRes.ok) {
            const data = await countRes.json();
            setStats(prev => ({
              ...prev,
              totalUsuarios: data.quantidade,
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    };
    fetchEmpresa();

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .animate-slide-in {
        animation: slideIn 0.4s ease-out forwards;
      }
      
      .card-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
        
      .card-hover:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }
      
      .glow-effect {
        position: relative;
        overflow: hidden;
      }
      
      .glow-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s;
      }
      
      .glow-effect:hover::before {
        left: 100%;
      }
      
      .gradient-border {
        position: relative;
        background: linear-gradient(45deg, ${ativo ? "#3B82F6, #0EA5E9, #1E293B" : "#1976D2, #0284C7, #E2E8F0"});
        padding: 1px;
        border-radius: 16px;
      }
      
      .gradient-border > div {
        background: ${ativo ? "#1E293B" : "#FFFFFF"};
        border-radius: 15px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [logar, router, t]);

  useEffect(() => {
    if (modalEdicaoAberto && empresaEditada) {
      setNomeCaracteres(empresaEditada.nome?.length || 0);
      setEmailCaracteres(empresaEditada.email?.length || 0);
      setTelefoneCaracteres(empresaEditada.telefone?.length || 0);
      setPaisCaracteres(empresaEditada.pais?.length || 0);
      setEnderecoCaracteres(empresaEditada.endereco?.length || 0);
      setEstadoCaracteres(empresaEditada.estado?.length || 0);
      setCidadeCaracteres(empresaEditada.cidade?.length || 0);
      setCepCaracteres(empresaEditada.cep?.length || 0);
    }
  }, [modalEdicaoAberto, empresaEditada]);

  useEffect(() => {
    const verificarEmailEdicao = async () => {
      if (!empresaEditada || !empresaEditada.email || empresaEditada.email === empresa?.email) {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: "",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(empresaEditada.email)) {
        setEmailStatus({
          existe: false,
          carregando: false,
          mensagem: "",
        });
        return;
      }

      setEmailStatus((prev) => ({ ...prev, carregando: true }));

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/verificar-email/${encodeURIComponent(empresaEditada.email)}?empresaId=${empresaEditada.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
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

    const timeoutId = setTimeout(verificarEmailEdicao, 500);
    return () => clearTimeout(timeoutId);
  }, [empresaEditada?.email, empresaEditada?.id, empresa?.email, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCatalogoPublico = async () => {
    if (!empresa || atualizandoCatalogo || !temPermissaoGerenciar) return;

    setAtualizandoCatalogo(true);
    try {
      const novoEstado = !empresa.catalogoPublico;

      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${empresa.id}/catalogo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": usuarioValor,
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          catalogoPublico: novoEstado,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar catálogo");
      }

      const empresaAtualizada = await response.json();
      setEmpresa(empresaAtualizada);

      Swal.fire({
        icon: "success",
        title: novoEstado ? t("catalogoAtivado") : t("catalogoDesativado"),
        text: novoEstado ? t("catalogoAgoraPublico") : t("catalogoNaoPublico"),
        timer: 2000,
        showConfirmButton: false,
        background: temaAtual.card,
        color: temaAtual.texto,
      });
    } catch (error) {
      console.error("Erro ao alterar estado do catálogo:", error);
      Swal.fire({
        icon: "error",
        title: t("erro"),
        text: t("erroAlterarCatalogo"),
        background: temaAtual.card,
        color: temaAtual.texto,
        confirmButtonColor: temaAtual.primario,
      });
    } finally {
      setAtualizandoCatalogo(false);
    }
  };

  const uploadFotoUpdate = async (file: File, empresaId: string): Promise<string | null> => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("foto", file);

      const usuarioSalvo = localStorage.getItem("client_key");
      if (!usuarioSalvo) return null;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${empresaId}/upload-foto`, {
        method: "PUT",
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

  const editarDadosEmpresa = async () => {
    if (!empresaEditada || !temPermissaoGerenciar) return;

    if (emailStatus.existe) {
      Swal.fire({
        icon: "error",
        title: t("erros.emailExistenteTitulo"),
        text: t("erros.emailExistenteTexto"),
        background: temaAtual.card,
        color: temaAtual.texto,
        confirmButtonColor: temaAtual.primario,
      });
      return;
    }

    try {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!usuarioValor) return;

      let fotoUrl = empresaEditada.foto;

      if (fotoFile) {
        const uploadedUrl = await uploadFotoUpdate(fotoFile, empresaEditada.id);
        if (uploadedUrl) {
          fotoUrl = uploadedUrl;
        } else {
          Swal.fire({
            icon: "warning",
            title: t("avisos.uploadFotoFalhouTitulo"),
            text: t("avisos.uploadFotoFalhouTexto"),
            background: temaAtual.card,
            color: temaAtual.texto,
            confirmButtonColor: temaAtual.primario,
          });
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${empresaEditada.id}/${usuarioValor}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": usuarioValor,
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          nome: empresaEditada.nome?.trim(),
          email: empresaEditada.email?.trim().toLowerCase(),
          telefone: empresaEditada.telefone?.trim(),
          endereco: empresaEditada.endereco?.trim(),
          pais: empresaEditada.pais?.trim(),
          estado: empresaEditada.estado?.trim(),
          cidade: empresaEditada.cidade?.trim(),
          cep: empresaEditada.cep?.trim(),
          fotoUrl: fotoUrl,
        }),
      });

      if (!res.ok) throw new Error(t("erros.erroAtualizarEmpresa"));

      const data = await res.json();
      setEmpresa(data);
      setModalEdicaoAberto(false);
      setFotoFile(null);
      setFotoPreview(null);
      setEmailStatus({ existe: false, carregando: false, mensagem: "" });

      Swal.fire({
        icon: "success",
        title: t("sucesso.empresaAtualizada"),
        text: t("sucesso.dadosAtualizados"),
        background: temaAtual.card,
        color: temaAtual.texto,
        confirmButtonColor: temaAtual.primario,
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2100);
    } catch (error) {
      console.error(t("erros.erroEditarEmpresa"), error);
      Swal.fire({
        icon: "error",
        title: t("erros.erro"),
        text: t("erros.erroEditarEmpresa"),
        background: temaAtual.card,
        color: temaAtual.texto,
        confirmButtonColor: temaAtual.primario,
      });
    }
  };

  const excluirOuSairDaEmpresa = async () => {
    try {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!usuarioValor) return;

      if (tipoUsuario === "PROPRIETARIO") {
        const confirm = await Swal.fire({
          title: t("modal.excluir.titulo"),
          text: t("modal.excluir.texto"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: t("modal.excluir.confirmar"),
          cancelButtonText: t("modal.excluir.cancelar"),
          background: temaAtual.card,
          color: temaAtual.texto,
          confirmButtonColor: temaAtual.primario,
          cancelButtonColor: temaAtual.placeholder,
        });

        if (confirm.isConfirmed) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${usuarioValor}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "user-id": usuarioValor,
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          });

          if (!res.ok) throw new Error(t("erros.erroExcluirEmpresa"));

          router.push("/criarempresa");
          window.location.reload();
        }
      } else {
        const confirm = await Swal.fire({
          title: t("modal.sair.titulo"),
          text: t("modal.sair.texto"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: t("modal.sair.confirmar"),
          cancelButtonText: t("modal.sair.cancelar"),
          background: temaAtual.card,
          color: temaAtual.texto,
          confirmButtonColor: temaAtual.primario,
          cancelButtonColor: temaAtual.placeholder,
        });

        if (confirm.isConfirmed) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuarioValor}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              empresaId: null,
              tipo: "FUNCIONARIO",
            }),
          });

          if (!res.ok) throw new Error(t("erros.erroSairEmpresa"));

          router.push("/criarempresa");
          window.location.reload();
        }
      }
    } catch (error) {
      console.error(t("erros.erroProcessarExclusao"), error);
      Swal.fire({
        icon: "error",
        title: t("erros.erro"),
        text: t("erros.erroProcessarExclusao"),
        background: temaAtual.card,
        color: temaAtual.texto,
        confirmButtonColor: temaAtual.primario,
      });
    }
  };

  const bgGradient = modoDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200";
  const textPrimary = modoDark ? "text-white" : "text-slate-900";
  const textSecondary = modoDark ? "text-gray-300" : "text-slate-600";
  const textMuted = modoDark ? "text-gray-400" : "text-slate-500";
  const bgCard = modoDark ? "bg-slate-800/50" : "bg-white/80";
  const borderColor = modoDark ? "border-blue-500/30" : "border-blue-200";
  const bgStats = modoDark ? "bg-slate-800/50" : "bg-white/80";

  if (loading || carregandoPermissao) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
            <FaSync className={`text-2xl ${textPrimary} animate-spin`} />
          </div>
          <p className={`font-medium ${textPrimary}`}>{t("carregando")}</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 ${bgCard} rounded-full flex items-center justify-center border ${borderColor}`}>
            <FaBuilding className={`text-2xl ${textPrimary}`} />
          </div>
          <p className={`text-lg font-medium ${textPrimary} mb-2`}>{t("empresaNaoEncontrada")}</p>
          <button
            onClick={() => router.push("/criarempresa")}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 font-semibold text-white flex items-center gap-2 mx-auto hover:scale-105"
          >
            <FaBuilding className="text-sm" />
            {t("criarEmpresa")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgGradient}`}>
      <div className="flex">
        <div className="flex-1 min-w-0">
          <div className="px-4 sm:px-6 py-8 w-full max-w-7xl mx-auto">
            <section className={`relative py-8 rounded-3xl mb-6 overflow-hidden ${bgCard} backdrop-blur-sm border ${borderColor}`}>
              <div className="absolute inset-0">
                <div className={`absolute top-0 left-10 w-32 h-32 ${modoDark ? "bg-blue-500/20" : "bg-blue-200/50"} rounded-full blur-3xl animate-float`}></div>
                <div className={`absolute bottom-0 right-10 w-48 h-48 ${modoDark ? "bg-slate-700/20" : "bg-slate-300/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "2s" }}></div>
                <div className={`absolute top-1/2 left-1/2 w-24 h-24 ${modoDark ? "bg-cyan-500/20" : "bg-cyan-200/50"} rounded-full blur-3xl animate-float`} style={{ animationDelay: "4s" }}></div>
              </div>

              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  {empresa.foto ? (
                    <Image
                      src={empresa.foto}
                      alt={t("altLogoEmpresa")}
                      width={80}
                      height={80}
                      className="rounded-2xl border-2 object-cover shadow-lg"
                      style={{ borderColor: temaAtual.borda }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center shadow-lg"
                      style={{
                        borderColor: temaAtual.borda,
                        backgroundColor: temaAtual.fundo,
                      }}
                    >
                      <FaBuilding className={`text-2xl ${textMuted}`} />
                    </div>
                  )}
                  <div>
                    <h1 className={`text-3xl md:text-4xl font-bold ${textPrimary} mb-2`}>
                      {empresa.nome}
                    </h1>
                    <p className={`text-lg ${textSecondary}`}>{t("dadosEmpresa")}</p>
                  </div>
                </div>
              </div>
            </section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: t("stats.totalProdutos"),
                  value: stats.totalProdutos,
                  icon: FaBuilding,
                  color: "from-blue-500 to-cyan-500",
                  bgColor: modoDark ? "bg-blue-500/10" : "bg-blue-50",
                },
                {
                  label: t("stats.totalUsuarios"),
                  value: stats.totalUsuarios,
                  icon: FaUsers,
                  color: "from-green-500 to-emerald-500",
                  bgColor: modoDark ? "bg-green-500/10" : "bg-green-50",
                },
                {
                  label: t("stats.produtosCatalogo"),
                  value: stats.produtosCatalogo,
                  icon: FaEye,
                  color: "from-purple-500 to-pink-500",
                  bgColor: modoDark ? "bg-purple-500/10" : "bg-purple-50",
                },
                {
                  label: t("stats.estoqueBaixo"),
                  value: stats.estoqueBaixo,
                  icon: FaInfoCircle,
                  color: "from-orange-500 to-red-500",
                  bgColor: modoDark ? "bg-orange-500/10" : "bg-orange-50",
                },
              ].map((stat, index) => (
                <div key={index} className="gradient-border animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`p-4 rounded-[15px] ${bgStats} backdrop-blur-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>{stat.value}</div>
                        <div className={textMuted}>{stat.label}</div>
                      </div>
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`text-xl bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className={`rounded-2xl ${bgCard} backdrop-blur-sm border ${borderColor} p-6 card-hover`}>
                  <h2 className={`text-xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
                    <FaGlobe className="text-blue-500" />
                    {t("informacoesEmpresa")}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: t("campos.nome"), value: empresa.nome, icon: FaBuilding },
                      { label: t("campos.email"), value: empresa.email, icon: FaGlobe },
                      { label: t("campos.telefone"), value: empresa.telefone || t("naoInformado"), icon: FaLink },
                      { label: t("campos.endereco"), value: empresa.endereco || t("naoInformado"), icon: FaBuilding },
                      { label: t("campos.pais"), value: empresa.pais || t("naoInformado"), icon: FaGlobe },
                      { label: t("campos.estado"), value: empresa.estado || t("naoInformado"), icon: FaGlobe },
                      { label: t("campos.cidade"), value: empresa.cidade || t("naoInformado"), icon: FaGlobe },
                      { label: t("campos.cep"), value: empresa.cep || t("naoInformado"), icon: FaLink },
                    ].map((field, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border ${borderColor} ${bgCard} transition-all duration-300 hover:scale-105 glow-effect`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <field.icon className={`text-sm ${modoDark ? "text-blue-400" : "text-blue-500"}`} />
                          <span className={`text-sm font-medium ${textMuted}`}>{field.label}</span>
                        </div>
                        <p className={`font-medium ${textPrimary} break-words`}>{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className={`rounded-2xl ${bgCard} backdrop-blur-sm border ${borderColor} p-6 card-hover`}>
                  <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-3`}>
                    {empresa.catalogoPublico ? <FaEye className="text-green-500" /> : <FaEyeSlash className="text-red-500" />}
                    {t("catalogo.publico")}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${textPrimary}`}>
                        {t("catalogo.status")}:{" "}
                        <span className={empresa.catalogoPublico ? "text-green-500" : "text-red-500"}>
                          {empresa.catalogoPublico ? t("catalogo.ativado") : t("catalogo.desativado")}
                        </span>
                      </span>
                    </div>

                    {temPermissaoGerenciar && (
                      <button
                        onClick={toggleCatalogoPublico}
                        disabled={atualizandoCatalogo}
                        className={`w-full cursor-pointer px-4 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 ${empresa.catalogoPublico
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30"
                            : "bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30"
                          } disabled:opacity-50 hover:scale-105`}
                      >
                        {atualizandoCatalogo ? (
                          <FaSync className="animate-spin" />
                        ) : empresa.catalogoPublico ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                        {atualizandoCatalogo
                          ? t("catalogo.processando")
                          : empresa.catalogoPublico
                            ? t("catalogo.desativar")
                            : t("catalogo.ativar")}
                      </button>
                    )}

                    <div className={`p-4 rounded-xl border ${borderColor} ${bgCard}`}>
                      <p className={`text-sm font-medium ${textPrimary} mb-2`}>{t("catalogo.disponivelEm")}</p>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <FaLink className="flex-shrink-0 text-blue-500" />
                        <a
                          href={`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://stockcontrol-six.vercel.app")}/catalogo/${empresa.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm break-all font-mono transition hover:opacity-80 text-blue-500"
                        >
                          {`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://stockcontrol-six.vercel.app")}/catalogo/${empresa.slug}`}
                        </a>
                      </div>
                    </div>

                    {!empresa.catalogoPublico && (
                      <div
                        className={`p-3 rounded-lg text-sm ${modoDark ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-orange-50 text-orange-600 border border-orange-200"
                          }`}
                      >
                        {t("catalogo.desativadoAviso")}
                      </div>
                    )}
                  </div>
                </div>

                <div className={`rounded-2xl ${bgCard} backdrop-blur-sm border ${borderColor} p-6 card-hover`}>
                  <h3 className={`text-lg font-bold ${textPrimary} mb-4 flex items-center gap-3`}>
                    <FaShield className="text-cyan-500" />
                    {t("acoes")}
                  </h3>

                  <div className="space-y-3">
                    {temPermissaoGerenciar && (
                      <button
                        onClick={() => {
                          setEmpresaEditada(empresa);
                          setModalEdicaoAberto(true);
                        }}
                        className="w-full cursor-pointer px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 font-semibold text-white flex items-center justify-center gap-2 hover:scale-105"
                      >
                        <FaEdit className="text-sm" />
                        {t("editarDados")}
                      </button>
                    )}

                    {tipoUsuario && (
                      <button
                        onClick={excluirOuSairDaEmpresa}
                        className={`w-full cursor-pointer px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-white flex items-center justify-center gap-2 hover:scale-105 ${tipoUsuario === "PROPRIETARIO"
                            ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                            : "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600"
                          }`}
                      >
                        {tipoUsuario === "PROPRIETARIO" ? <FaTrash className="text-sm" /> : <FaSignOutAlt className="text-sm" />}
                        {t(tipoUsuario === "PROPRIETARIO" ? "deletarEmpresa" : "sairEmpresa")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modalEdicaoAberto && empresaEditada && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className={`p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-sm border ${borderColor}`}
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: temaAtual.texto }}>
                {t("modal.editarEmpresa.titulo")}
              </h2>
              <button
                onClick={() => {
                  setModalEdicaoAberto(false);
                  setFotoFile(null);
                  setFotoPreview(null);
                  setEmailStatus({ existe: false, carregando: false, mensagem: "" });
                }}
                className={`p-2 cursor-pointer rounded-lg transition-colors ${textMuted} hover:${textPrimary}`}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.nome")}
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm ${modoDark ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-300"
                    }`}
                  style={{
                    color: temaAtual.texto,
                  }}
                  value={empresaEditada.nome || ""}
                  onChange={(e) => handleInputChange("nome", e.target.value, 20, setNomeCaracteres)}
                  maxLength={20}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {nomeCaracteres}/20 {nomeCaracteres === 20 && " - Limite atingido"}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.email")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm ${modoDark ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-300"
                      } ${emailStatus.existe ? "border-red-500" : ""}`}
                    style={{
                      color: temaAtual.texto,
                    }}
                    value={empresaEditada.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value, 60, setEmailCaracteres)}
                    maxLength={60}
                  />
                  {emailStatus.carregando && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: temaAtual.primario }}></div>
                    </div>
                  )}
                  {!emailStatus.carregando && empresaEditada.email && empresaEditada.email !== empresa?.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailStatus.existe ? <FaTimes className="text-red-500" /> : <FaCheck className="text-green-500" />}
                    </div>
                  )}
                </div>
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {emailCaracteres}/60 {emailCaracteres === 60 && " - Limite atingido"}
                </div>

                {emailStatus.mensagem && (
                  <div className={`text-xs mt-1 ${emailStatus.existe ? "text-red-600" : "text-green-600"}`} style={{ color: emailStatus.existe ? temaAtual.erro : temaAtual.sucesso }}>
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
                    type="text"
                    className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm ${modoDark ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-300"
                      }`}
                    style={{
                      color: temaAtual.texto,
                    }}
                    value={empresaEditada.telefone || ""}
                    onChange={(e) => handleInputChange("telefone", e.target.value, 15, setTelefoneCaracteres)}
                    maxLength={15}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {telefoneCaracteres}/15 {telefoneCaracteres === 15 && " - Limite atingido"}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                    {t("campos.pais")}
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm ${modoDark ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-300"
                      }`}
                    style={{
                      color: temaAtual.texto,
                    }}
                    value={empresaEditada.pais || ""}
                    onChange={(e) => handleInputChange("pais", e.target.value, 20, setPaisCaracteres)}
                    maxLength={20}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {paisCaracteres}/20 {paisCaracteres === 20 && " - Limite atingido"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.endereco")}
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm ${modoDark ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-300"
                    }`}
                  style={{
                    color: temaAtual.texto,
                  }}
                  value={empresaEditada.endereco || ""}
                  onChange={(e) => handleInputChange("endereco", e.target.value, 50, setEnderecoCaracteres)}
                  maxLength={50}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {enderecoCaracteres}/50 {enderecoCaracteres === 50 && " - Limite atingido"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                    {t("campos.cidade")}
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm ${modoDark ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-300"
                      }`}
                    style={{
                      color: temaAtual.texto,
                    }}
                    value={empresaEditada.cidade || ""}
                    onChange={(e) => handleInputChange("cidade", e.target.value, 20, setCidadeCaracteres)}
                    maxLength={20}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {cidadeCaracteres}/20 {cidadeCaracteres === 20 && " - Limite atingido"}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                    {t("campos.estado")}
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm ${modoDark ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-300"
                      }`}
                    style={{
                      color: temaAtual.texto,
                    }}
                    value={empresaEditada.estado || ""}
                    onChange={(e) => handleInputChange("estado", e.target.value, 2, setEstadoCaracteres)}
                    maxLength={2}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                    {estadoCaracteres}/2 {estadoCaracteres === 2 && " - Limite atingido"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.cep")}
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm ${modoDark ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-300"
                    }`}
                  style={{
                    color: temaAtual.texto,
                  }}
                  value={empresaEditada.cep || ""}
                  onChange={(e) => handleInputChange("cep", e.target.value, 10, setCepCaracteres)}
                  maxLength={10}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {cepCaracteres}/10 {cepCaracteres === 10 && " - Limite atingido"}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("logoEmpresa")}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full rounded-xl p-2 opacity-0 absolute z-10 cursor-pointer"
                    style={{
                      backgroundColor: temaAtual.card,
                      border: `1px solid ${temaAtual.borda}`,
                    }}
                    id="fileInput"
                  />
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all duration-300 ${modoDark ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-300"
                      }`}
                    style={{
                      color: temaAtual.placeholder,
                    }}
                  >
                    <span>{t("escolherArquivo")}</span>
                  </div>
                </div>

                {(fotoPreview || empresa.foto) && (
                  <div className="mt-3">
                    <p className="text-sm mb-2 font-medium" style={{ color: temaAtual.texto }}>
                      {fotoPreview ? t("preVisualizacao") : t("fotoAtual")}:
                    </p>
                    <Image
                      src={fotoPreview || empresa.foto || ""}
                      alt={fotoPreview ? "Preview" : "Foto atual"}
                      width={80}
                      height={80}
                      className="rounded-xl border object-cover"
                      style={{ borderColor: temaAtual.borda }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: temaAtual.borda }}>
              <button
                onClick={() => {
                  setModalEdicaoAberto(false);
                  setFotoFile(null);
                  setFotoPreview(null);
                  setEmailStatus({ existe: false, carregando: false, mensagem: "" });
                }}
                className={`px-4 cursor-pointer py-2 rounded-xl transition-all duration-300 font-medium border hover:scale-105 ${modoDark ? "bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                {t("modal.cancelar")}
              </button>
              <button
                onClick={editarDadosEmpresa}
                disabled={emailStatus.existe || emailStatus.carregando}
                className="px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all duration-300 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                {t("modal.salvar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}