"use client";

import { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaEye, FaEyeSlash, FaEdit, FaTrash, FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";
import Image from "next/image";
import { useTranslation } from "react-i18next";

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
      setEmpresaEditada(prev => prev ? { ...prev, [field]: value } : null);
      setCaracteres(value.length);
    }
  };

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);
  }, []);

  useEffect(() => {
    async function buscaUsuarios(idUsuario: string) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (response.status === 200) {
        const dados = await response.json();
        logar(dados);
        setTipoUsuario(dados.tipo as TipoUsuario);
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

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const fileName = target.files?.[0]?.name || t("empresa.nenhumArquivoEscolhido");
        const displayElement = fileInput.nextElementSibling?.querySelector('.text-gray-500');
        if (displayElement) {
          displayElement.textContent = fileName;
        }
      });
    }
  }, [logar, router, t]);

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
    if (!empresa || atualizandoCatalogo) return;

    setAtualizandoCatalogo(true);
    try {
      const novoEstado = !empresa.catalogoPublico;

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${empresa.id}/catalogo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          catalogoPublico: novoEstado
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar catálogo");
      }

      const empresaAtualizada = await response.json();
      setEmpresa(empresaAtualizada);

      Swal.fire({
        icon: "success",
        title: novoEstado ? t("empresa.catalogoAtivado") : t("empresa.catalogoDesativado"),
        text: novoEstado
          ? t("empresa.catalogoAgoraPublico")
          : t("empresa.catalogoNaoPublico"),
        timer: 2000,
        showConfirmButton: false,
        background: temaAtual.card,
        color: temaAtual.texto
      });
    } catch (error) {
      console.error("Erro ao alterar estado do catálogo:", error);
      Swal.fire({
        icon: "error",
        title: t("empresa.erro"),
        text: t("empresa.erroAlterarCatalogo"),
        background: temaAtual.card,
        color: temaAtual.texto,
        confirmButtonColor: temaAtual.primario
      });
    } finally {
      setAtualizandoCatalogo(false);
    }
  };

  const editarDadosEmpresa = async () => {
    if (!empresaEditada) return;

    try {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      if (!usuarioValor) return;

      const formData = new FormData();
      formData.append('nome', empresaEditada.nome);
      formData.append('email', empresaEditada.email);
      if (empresaEditada.telefone) formData.append('telefone', empresaEditada.telefone);
      if (empresaEditada.endereco) formData.append('endereco', empresaEditada.endereco);
      if (empresaEditada.pais) formData.append('pais', empresaEditada.pais);
      if (empresaEditada.estado) formData.append('estado', empresaEditada.estado);
      if (empresaEditada.cidade) formData.append('cidade', empresaEditada.cidade);
      if (empresaEditada.cep) formData.append('cep', empresaEditada.cep);

      if (fotoFile) {
        formData.append('foto', fotoFile);
      } else if (empresaEditada.foto === null) {
        formData.append('foto', 'null');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/${empresaEditada.id}/${usuarioValor}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error(t("erros.erroAtualizarEmpresa"));

      const data = await res.json();
      setEmpresa(data);
      setModalEdicaoAberto(false);
      window.location.reload();
    } catch (error) {
      console.error(t("erros.erroEditarEmpresa"), error);
      Swal.fire({
        icon: "error",
        title: t("erros.erro"),
        text: t("erros.erroEditarEmpresa"),
        background: temaAtual.card,
        color: temaAtual.texto,
        confirmButtonColor: temaAtual.primario
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
          cancelButtonColor: temaAtual.placeholder
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
          cancelButtonColor: temaAtual.placeholder
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
        confirmButtonColor: temaAtual.primario
      });
    }
  };

  if (loading) {
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
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
      <div className="w-full max-w-3xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-6" style={{ color: temaAtual.texto }}>
          {t("titulo")}
        </h1>

        <div className="p-6 rounded-lg mb-6" style={{
          backgroundColor: temaAtual.card,
          border: `1px solid ${temaAtual.borda}`
        }}>
          <div className="border-b mb-4 pb-4" style={{ borderColor: temaAtual.borda }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: temaAtual.texto }}>{t("dadosEmpresa")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("campos.nome")}</p>
                <p style={{ color: temaAtual.texto }}><strong>{empresa.nome}</strong></p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("campos.email")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa.email}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("campos.telefone")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa.telefone || t("naoInformado")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("campos.endereco")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa.endereco || t("naoInformado")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("campos.pais")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa.pais || t("naoInformado")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("campos.estado")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa.estado || t("naoInformado")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("campos.cidade")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa.cidade || t("naoInformado")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("campos.cep")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa.cep || t("naoInformado")}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg" style={{
            backgroundColor: temaAtual.hover,
            border: `1px solid ${temaAtual.borda}`
          }}>
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: temaAtual.texto }}>
              {empresa.catalogoPublico ?
                <FaEye style={{ color: temaAtual.texto }} /> :
                <FaEyeSlash style={{ color: temaAtual.texto }} />
              }
              {t("catalogo.publico")}
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <span className="text-sm" style={{ color: temaAtual.texto }}>
                {t("catalogo.status")}:{" "}
                <strong>
                  {empresa.catalogoPublico
                    ? t("catalogo.ativado")
                    : t("catalogo.desativado")}
                </strong>
              </span>
              <button
                onClick={toggleCatalogoPublico}
                disabled={atualizandoCatalogo}
                className={`px-3 py-1 cursor-pointer rounded text-sm font-medium transition ${empresa.catalogoPublico
                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
                  } disabled:opacity-50 w-fit`}
              >
                {atualizandoCatalogo
                  ? t("catalogo.processando")
                  : empresa.catalogoPublico
                    ? t("catalogo.desativar")
                    : t("catalogo.ativar")}
              </button>
            </div>

            <p className="text-sm mb-2" style={{ color: temaAtual.texto }}>{t("catalogo.disponivelEm")}</p>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL ||
              (typeof window !== "undefined"
                ? window.location.origin
                : "https://stockcontrol-six.vercel.app")
              }/catalogo/${empresa.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded text-sm break-all font-mono transition hover:opacity-80"
              style={{
              backgroundColor: temaAtual.primario + "20",
              color: "#22c55e", 
              border: `1px solid #22c55e40`,
              }}
            >
              {`${process.env.NEXT_PUBLIC_APP_URL ||
              (typeof window !== "undefined"
                ? window.location.origin
                : "https://stockcontrol-six.vercel.app")
              }/catalogo/${empresa.slug}`}
            </a>

            <p className="text-sm mt-2" style={{ color: temaAtual.texto }}>{t("catalogo.avisoClientes")}</p>

            {!empresa.catalogoPublico && (
              <p className="text-sm mt-2" style={{ color: "#F59E0B" }}>
                {t("catalogo.desativadoAviso")}
              </p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ color: temaAtual.texto }}>{t("logoEmpresa")}</h2>
            {empresa.foto && (
              <Image
                src={empresa.foto}
                alt={t("altLogoEmpresa")}
                width={128}
                height={128}
                className="rounded mb-4 border"
                style={{ borderColor: temaAtual.borda }}
              />
            )}
            {tipoUsuario !== "FUNCIONARIO" && (
              <button
                onClick={() => {
                  setEmpresaEditada(empresa);
                  setModalEdicaoAberto(true);
                }}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg transition font-medium"
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
                <FaCloudUploadAlt className="text-sm" style={{ color: "#FFFFFF" }} />
                {t("alterarLogo")}
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {(tipoUsuario === "PROPRIETARIO" || tipoUsuario === "ADMIN") && (
              <button
                onClick={() => {
                  setEmpresaEditada(empresa);
                  setModalEdicaoAberto(true);
                }}
                className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2 rounded-lg transition font-medium"
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
                <FaEdit className="text-sm" style={{ color: "#FFFFFF" }} />
                {t("editarDados")}
              </button>
            )}

            {tipoUsuario && (
              <button
                onClick={excluirOuSairDaEmpresa}
                className="flex items-center justify-center cursor-pointer gap-2 px-4 py-2 rounded-lg transition font-medium"
                style={{
                  backgroundColor: tipoUsuario === "PROPRIETARIO" ? "#EF4444" : "#6B7280",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {tipoUsuario === "PROPRIETARIO" ? (
                  <FaTrash className="text-sm" style={{ color: "#FFFFFF" }} />
                ) : (
                  <FaSignOutAlt className="text-sm" style={{ color: "#FFFFFF" }} />
                )}
                {tipoUsuario === "PROPRIETARIO" ? t("deletarEmpresa") : t("sairEmpresa")}
              </button>
            )}
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
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <h2 className="text-xl font-semibold mb-3" style={{ color: temaAtual.texto }}>{t("modal.editarEmpresa.titulo")}</h2>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("campos.nome")}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
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
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("campos.email")}</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                  value={empresaEditada.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value, 60, setEmailCaracteres)}
                  maxLength={60}
                />
                <div className="text-xs text-right mt-1" style={{ color: temaAtual.placeholder }}>
                  {emailCaracteres}/60 {emailCaracteres === 60 && " - Limite atingido"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("campos.telefone")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`
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
                  <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("campos.pais")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`
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
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("campos.endereco")}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
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
                  <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("campos.cidade")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`
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
                  <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("campos.estado")}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border"
                    style={{
                      backgroundColor: temaAtual.card,
                      color: temaAtual.texto,
                      border: `1px solid ${temaAtual.borda}`
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
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("campos.cep")}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
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
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("logoEmpresa")}</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full rounded p-2 opacity-0 absolute z-10 cursor-pointer"
                    style={{
                      backgroundColor: temaAtual.card,
                      border: `1px solid ${temaAtual.borda}`
                    }}
                    id="fileInput"
                  />
                  <div className="flex items-center justify-between p-2 rounded border text-sm"
                    style={{
                      backgroundColor: temaAtual.card,
                      border: `1px solid ${temaAtual.borda}`,
                      color: temaAtual.placeholder
                    }}>
                    <span>{t("empresa.escolherArquivo")}</span>
                    <span>
                      {t("empresa.nenhumArquivoEscolhido")}
                    </span>
                  </div>
                </div>

                {fotoPreview && (
                  <div className="mt-2">
                    <p className="text-sm mb-1" style={{ color: temaAtual.texto }}>{t("empresa.preVisualizacao")}:</p>
                    <Image
                      src={fotoPreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded border"
                      style={{ borderColor: temaAtual.borda }}
                    />
                  </div>
                )}
                {empresa.foto && !fotoPreview && (
                  <div className="mt-2">
                    <p className="text-sm mb-1" style={{ color: temaAtual.texto }}>{t("empresa.fotoAtual")}:</p>
                    <Image
                      src={empresa.foto}
                      alt="Foto atual"
                      width={80}
                      height={80}
                      className="rounded border"
                      style={{ borderColor: temaAtual.borda }}
                    />
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
                }}
                className="px-4 py-2 cursor-pointer rounded transition"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
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
                className="px-4 py-2 cursor-pointer rounded transition"
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
                {t("modal.salvar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}