"use client";

import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaEdit, FaTrash, FaSignOutAlt, FaLink, FaGlobe, FaTimes, FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUsuarioStore } from "@/context/usuario";
import { useTranslation } from "react-i18next";
import { usuarioTemPermissao } from "@/utils/permissoes";
import { cores } from "@/utils/cores";
import Swal from "sweetalert2";
import Image from "next/image";

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

        const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${usuarioValor}`);

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
      } catch {
        router.push("/criarempresa");
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();

    const style = document.createElement("style");
    style.textContent = `
    html::-webkit-scrollbar {
      width: 10px;
    }
    html::-webkit-scrollbar-track {
      background: ${ativo ? "#132F4C" : "#F8FAFC"};
    }
    html::-webkit-scrollbar-thumb {
      background: ${ativo ? "#132F4C" : "#90CAF9"}; 
      border-radius: 5px;
      border: 2px solid ${ativo ? "#132F4C" : "#F8FAFC"};
    }
    html::-webkit-scrollbar-thumb:hover {
      background: ${ativo ? "#132F4C" : "#64B5F6"}; 
    }
    html {
      scrollbar-width: thin;
      scrollbar-color: ${ativo ? "#132F4C" : "#90CAF9"} ${ativo ? "#0A1830" : "#F8FAFC"};
    }
    @media (max-width: 768px) {
      html::-webkit-scrollbar {
        width: 6px;
      }
      html::-webkit-scrollbar-thumb {
        border: 1px solid ${ativo ? "#132F4C" : "#F8FAFC"};
        border-radius: 3px;
      }
    }
    `;
    document.head.appendChild(style);

    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        const fileName = target.files?.[0]?.name || t("nenhumArquivoEscolhido");
        const displayElement = fileInput.nextElementSibling?.querySelector(".text-gray-500");
        if (displayElement) {
          displayElement.textContent = fileName;
        }
      });
    }

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
        const url = `${process.env.NEXT_PUBLIC_URL_API}/empresa/verificar-email/${encodeURIComponent(empresaEditada.email)}?empresaId=${empresaEditada.id}`;
        const response = await fetch(url);

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

  if (loading || carregandoPermissao) {
    return (
      <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
        <p className="font-mono" style={{ color: temaAtual.texto }}>
          {t("carregando")}
        </p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
        <p className="text-red-600 font-mono">{t("empresaNaoEncontrada")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 md:px-6 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
      <div className="w-full max-w-4xl">
        <h1 className="text-center text-xl md:text-2xl font-semibold mb-6" style={{ color: temaAtual.texto }}>
          {t("titulo")}
        </h1>

        <div
          className="p-5 md:p-6 rounded-xl shadow-lg mb-6"
          style={{
            backgroundColor: temaAtual.card,
            border: `1px solid ${temaAtual.borda}`,
          }}
        >
          <div className="border-b mb-5 pb-5" style={{ borderColor: temaAtual.borda }}>
            <h2 className="text-lg md:text-xl font-semibold mb-5 flex items-center gap-2" style={{ color: temaAtual.texto }}>
              <FaGlobe className="text-lg" />
              {t("dadosEmpresa")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
              {[
                { label: t("campos.nome"), value: empresa.nome, key: "nome" },
                { label: t("campos.email"), value: empresa.email, key: "email" },
                { label: t("campos.telefone"), value: empresa.telefone || t("naoInformado"), key: "telefone" },
                { label: t("campos.endereco"), value: empresa.endereco || t("naoInformado"), key: "endereco" },
                { label: t("campos.pais"), value: empresa.pais || t("naoInformado"), key: "pais" },
                { label: t("campos.estado"), value: empresa.estado || t("naoInformado"), key: "estado" },
                { label: t("campos.cidade"), value: empresa.cidade || t("naoInformado"), key: "cidade" },
                { label: t("campos.cep"), value: empresa.cep || t("naoInformado"), key: "cep" },
              ].map((field) => (
                <div
                  key={field.key}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: modoDark ? temaAtual.fundo : "#F8FAFC",
                    border: modoDark ? "none" : `1px solid ${temaAtual.borda}`,
                    boxShadow: modoDark ? "none" : "0 1px 3px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <p
                    style={{
                      color: modoDark ? temaAtual.placeholder : "#64748B",
                      fontSize: "0.875rem",
                      marginBottom: "0.5rem",
                      fontWeight: modoDark ? "normal" : "500",
                    }}
                  >
                    {field.label}
                  </p>
                  <p
                    style={{
                      color: temaAtual.texto,
                      fontSize: "0.95rem",
                      fontWeight: field.key === "nome" ? "500" : "normal",
                    }}
                  >
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="md:w-2/5">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: temaAtual.texto }}>
                  {t("logoEmpresa")}
                </h2>
                <div className="flex justify-start">
                  {empresa.foto ? (
                    <Image src={empresa.foto} alt={t("altLogoEmpresa")} width={120} height={120} className="rounded-lg border-2 object-contain" style={{ borderColor: temaAtual.borda }} />
                  ) : (
                    <div
                      className="w-32 h-32 rounded-lg border-2 flex items-center justify-center"
                      style={{
                        borderColor: temaAtual.borda,
                        backgroundColor: temaAtual.fundo,
                      }}
                    >
                      <span style={{ color: temaAtual.placeholder }}>{t("semLogo")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-start">
                {temPermissaoGerenciar && (
                  <button
                    onClick={() => {
                      setEmpresaEditada(empresa);
                      setModalEdicaoAberto(true);
                    }}
                    className="flex items-center cursor-pointer justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 text-sm whitespace-nowrap"
                    style={{
                      backgroundColor: temaAtual.primario,
                      color: "#FFFFFF",
                      minWidth: "unset",
                      width: "fit-content",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <FaEdit className="text-xs" style={{ color: "#FFFFFF" }} />
                    {t("editarDados")}
                  </button>
                )}

                {tipoUsuario && (
                  <button
                    onClick={excluirOuSairDaEmpresa}
                    className="flex transition-all duration-200 hover:scale-105 items-center justify-center cursor-pointer gap-1 px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                    style={{
                      backgroundColor: tipoUsuario === "PROPRIETARIO" ? "#EF4444" : "#6B7280",
                      color: "#FFFFFF",
                      minWidth: "unset",
                      width: "fit-content",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {tipoUsuario === "PROPRIETARIO" ? <FaTrash className="text-xs" style={{ color: "#FFFFFF" }} /> : <FaSignOutAlt className="text-xs" style={{ color: "#FFFFFF" }} />}
                    {t(tipoUsuario === "PROPRIETARIO" ? "deletarEmpresa" : "sairEmpresa")}
                  </button>
                )}
              </div>
            </div>

            <div className="md:w-full">
              <div
                className="p-5 rounded-xl"
                style={{
                  backgroundColor: temaAtual.card,
                  border: `1px solid ${temaAtual.borda}`,
                }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg" style={{ color: temaAtual.texto }}>
                  {empresa.catalogoPublico ? <FaEye className="text-xl" style={{ color: "#10B981" }} /> : <FaEyeSlash className="text-xl" style={{ color: "#EF4444" }} />}
                  {t("catalogo.publico")}
                </h3>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                  <div>
                    <span className="text-sm font-medium" style={{ color: temaAtual.texto }}>
                      {t("catalogo.status")}: <strong style={{ color: empresa.catalogoPublico ? "#10B981" : "#EF4444" }}>{empresa.catalogoPublico ? t("catalogo.ativado") : t("catalogo.desativado")}</strong>
                    </span>
                  </div>
                  {temPermissaoGerenciar && (
                    <button onClick={toggleCatalogoPublico} disabled={atualizandoCatalogo} className={`px-4 py-2 transition-all duration-200 hover:scale-105 cursor-pointer rounded-lg text-sm font-medium ${empresa.catalogoPublico ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"} disabled:opacity-50 w-full md:w-auto`}>
                      {atualizandoCatalogo ? t("catalogo.processando") : empresa.catalogoPublico ? t("catalogo.desativar") : t("catalogo.ativar")}
                    </button>
                  )}
                </div>

                <p className="text-sm mb-3 font-medium" style={{ color: temaAtual.texto }}>
                  {t("catalogo.disponivelEm")}
                </p>
                <div
                  className="flex items-center gap-2 p-3 rounded-lg mb-3"
                  style={{
                    backgroundColor: temaAtual.fundo,
                    border: `1px solid ${temaAtual.borda}`,
                  }}
                >
                  <FaLink className="flex-shrink-0" style={{ color: temaAtual.primario }} />
                  <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://stockcontrol-six.vercel.app")}/catalogo/${empresa.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all font-mono transition hover:opacity-80"
                    style={{
                      color: temaAtual.primario,
                    }}
                  >
                    {`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://stockcontrol-six.vercel.app")}/catalogo/${empresa.slug}`}
                  </a>
                </div>

                <p className="text-sm mb-2" style={{ color: temaAtual.texto }}>
                  {t("catalogo.avisoClientes")}
                </p>

                {!empresa.catalogoPublico && (
                  <p
                    className="text-sm mt-2 p-3 rounded-lg"
                    style={{
                      backgroundColor: modoDark ? "#422727" : "#FEF2F2",
                      color: modoDark ? "#FCA5A5" : "#DC2626",
                      border: modoDark ? "none" : "1px solid #FECACA",
                    }}
                  >
                    {t("catalogo.desativadoAviso")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalEdicaoAberto && empresaEditada && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-4 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`,
            }}
          >
            <h2 className="text-xl font-semibold mb-3" style={{ color: temaAtual.texto }}>
              {t("modal.editarEmpresa.titulo")}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.nome")}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`,
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
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.email")}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded border pr-10"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${emailStatus.existe ? temaAtual.erro : temaAtual.borda}`,
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
                  {!emailStatus.carregando && empresaEditada.email && empresaEditada.email !== empresa?.email && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{emailStatus.existe ? <FaTimes className="text-red-500" /> : <FaCheck className="text-green-500" />}</div>}
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                    {t("campos.telefone")}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`,
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
                  <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                    {t("campos.pais")}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`,
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
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.endereco")}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`,
                  }}
                  value={empresaEditada.endereco || ""}
                  onChange={(e) => handleInputChange("endereco", e.target.value, 50, setEnderecoCaracteres)}
                  maxLength={50}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {enderecoCaracteres}/50 {enderecoCaracteres === 50 && " - Limite atingido"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                    {t("campos.cidade")}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`,
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
                  <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                    {t("campos.estado")}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`,
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
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("campos.cep")}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`,
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
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>
                  {t("logoEmpresa")}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full rounded p-2 opacity-0 absolute z-10 cursor-pointer"
                    style={{
                      backgroundColor: temaAtual.card,
                      border: `1px solid ${temaAtual.borda}`,
                    }}
                    id="fileInput"
                  />
                  <div
                    className="flex items-center justify-between p-2 rounded border text-sm"
                    style={{
                      backgroundColor: temaAtual.card,
                      border: `1px solid ${temaAtual.borda}`,
                      color: temaAtual.placeholder,
                    }}
                  >
                    <span>{t("escolherArquivo")}</span>
                  </div>
                </div>

                {fotoPreview && (
                  <div className="mt-2">
                    <p className="text-sm mb-1" style={{ color: temaAtual.texto }}>
                      {t("preVisualizacao")}:
                    </p>
                    <Image src={fotoPreview} alt="Preview" width={80} height={80} className="rounded border" style={{ borderColor: temaAtual.borda }} />
                  </div>
                )}
                {empresa.foto && !fotoPreview && (
                  <div className="mt-2">
                    <p className="text-sm mb-1" style={{ color: temaAtual.texto }}>
                      {t("fotoAtual")}:
                    </p>
                    <Image src={empresa.foto} alt="Foto atual" width={80} height={80} className="rounded border" style={{ borderColor: temaAtual.borda }} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setModalEdicaoAberto(false);
                  setFotoFile(null);
                  setFotoPreview(null);
                  setEmailStatus({ existe: false, carregando: false, mensagem: "" });
                }}
                className="px-4 py-2 cursor-pointer rounded transition"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = temaAtual.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = temaAtual.card;
                }}
              >
                {t("modal.cancelar")}
              </button>
              <button
                onClick={editarDadosEmpresa}
                disabled={emailStatus.existe || emailStatus.carregando}
                className="px-4 py-2 cursor-pointer rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: temaAtual.primario,
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  if (!emailStatus.existe && !emailStatus.carregando) {
                    e.currentTarget.style.opacity = "0.9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!emailStatus.existe && !emailStatus.carregando) {
                    e.currentTarget.style.opacity = "1";
                  }
                }}
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
