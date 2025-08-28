"use client";

import { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaEye, FaEyeSlash } from "react-icons/fa";
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
type EmpresaChave = keyof Pick<Empresa, "nome" | "email" | "telefone" | "endereco" | "pais" | "estado" | "cidade" | "cep">;

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
      root.style.setProperty("--cor-fundo-bloco", "#ececec");
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
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Erro ao alterar estado do catálogo:", error);
      Swal.fire({
        icon: "error",
        title: t("empresa.erro"),
        text: t("empresa.erroAlterarCatalogo"),
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
        confirmButtonColor: "#013C3C",
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
        confirmButtonColor: "#013C3C",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: "var(--cor-fundo)" }}>
        <p className="font-mono" style={{ color: "var(--cor-texto)" }}>
          {t("carregando")}
        </p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: "var(--cor-fundo)" }}>
        <p className="text-red-600 font-mono">{t("empresaNaoEncontrada")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-start pt-10 px-4">
      <div
        className="w-auto min-w-[300px] max-w-3xl rounded p-6 shadow-md mx-auto"
        style={{
          backgroundColor: modoDark ? "#1F2937" : "#FFFFFF",
          color: modoDark ? "#FFFFFF" : "#000000",
          border: modoDark ? "1px solid #374151" : "2px solid #000000",
        }}
      >
        <h1 className="text-2xl font-mono text-center mb-6" style={{ color: "var(--cor-texto)" }}>
          {t("titulo")}
        </h1>

        <div className="border-b mb-4 pb-2" style={{ borderColor: "var(--cor-borda)" }}>
          <h2 className="text-lg font-semibold underline">{t("dadosEmpresa")}</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              {t("campos.nome")}: <strong>{empresa.nome}</strong>
            </p>
            <p>
              {t("campos.endereco")}: {empresa.endereco || t("naoInformado")}
            </p>
            <p>
              {t("campos.pais")}: {empresa.pais || t("naoInformado")}
            </p>
            <p>
              {t("campos.estado")}: {empresa.estado || t("naoInformado")}
            </p>
            <p>
              {t("campos.cidade")}: {empresa.cidade || t("naoInformado")}
            </p>
            <p>
              {t("campos.cep")}: {empresa.cep || t("naoInformado")}
            </p>
            <p>
              {t("campos.telefone")}: {empresa.telefone || t("naoInformado")}
            </p>
            <p>
              {t("campos.email")}: {empresa.email}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div
            className="mt-4 p-4 rounded-lg"
            style={{
              backgroundColor: modoDark ? "#1E3A8A" : "#BFDBFE",
              color: modoDark ? "#FFFFFF" : "#1E3A8A",
            }}
          >
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {empresa.catalogoPublico ? <FaEye /> : <FaEyeSlash />}
              {t("catalogo.publico")}
            </h3>

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">
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
                className={`px-3 py-1 rounded text-sm font-medium transition ${empresa.catalogoPublico
                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
                  } disabled:opacity-50`}
              >
                {atualizandoCatalogo
                  ? t("catalogo.processando")
                  : empresa.catalogoPublico
                    ? t("catalogo.desativar")
                    : t("catalogo.ativar")}
              </button>
            </div>

            <p className="text-sm mb-2">{t("catalogo.disponivelEm")}</p>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL ||
                (typeof window !== "undefined"
                  ? window.location.origin
                  : "https://stockcontrol-six.vercel.app")
                }/catalogo/${empresa.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 rounded bg-opacity-20 text-sm break-all font-mono transition hover:bg-opacity-30"
              style={{
                backgroundColor: modoDark ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
                color: modoDark ? "#22c55e" : "#15803d",
                border: modoDark ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              {`${process.env.NEXT_PUBLIC_APP_URL ||
                (typeof window !== "undefined"
                  ? window.location.origin
                  : "https://stockcontrol-six.vercel.app")
                }/catalogo/${empresa.slug}`}
            </a>

            <p className="text-sm mt-2">{t("catalogo.avisoClientes")}</p>

            {!empresa.catalogoPublico && (
              <p className="text-sm mt-2 text-yellow-600">
                {t("catalogo.desativadoAviso")}
              </p>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">{t("logoEmpresa")}</h2>
            {empresa.foto && (
              <Image
                src={empresa.foto}
                alt={t("altLogoEmpresa")}
                width={128}
                height={128}
                className="rounded mb-4"
              />
            )}
            {tipoUsuario !== "FUNCIONARIO" && (
              <button
                onClick={() => {
                  setEmpresaEditada(empresa);
                  setModalEdicaoAberto(true);
                }}
                className="flex items-center gap-2 px-6 py-2 rounded-lg transition font-mono text-sm font-bold"
                style={{
                  border: "2px solid var(--cor-destaque)",
                  color: "var(--cor-texto)",
                  backgroundColor: "transparent",
                }}
              >
                <FaCloudUploadAlt />
                {t("alterarLogo")}
              </button>
            )}
          </div>

          {(tipoUsuario === "PROPRIETARIO" || tipoUsuario === "ADMIN") && (
            <button
              onClick={() => {
                setEmpresaEditada(empresa);
                setModalEdicaoAberto(true);
              }}
              className="w-full px-6 py-2 rounded-lg transition font-mono text-sm"
              style={{
                backgroundColor: "#2563eb",
                color: "#FFFFFF",
              }}
            >
              {t("editarDados")}
            </button>
          )}

          {tipoUsuario && (
            <button
              onClick={excluirOuSairDaEmpresa}
              className="w-full px-6 py-2 rounded-lg transition font-mono text-sm"
              style={{
                backgroundColor: "#ee1010",
                color: "#FFFFFF",
              }}
            >
              {tipoUsuario === "PROPRIETARIO" ? t("deletarEmpresa") : t("sairEmpresa")}
            </button>
          )}
        </div>
      </div>
      {modalEdicaoAberto && empresaEditada && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-4 rounded-lg shadow-lg w-full max-w-md"
            style={{
              backgroundColor: modoDark ? "#1F2937" : "#FFFFFF",
              color: modoDark ? "#FFFFFF" : "#000000",
              maxHeight: "95vh",
              overflowY: "auto"
            }}
          >
            <h2 className="text-xl font-semibold mb-3">{t("modal.editarEmpresa.titulo")}</h2>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium mb-1">{t("campos.nome")}</label>
                <input
                  type="text"
                  className="w-full rounded p-2 text-sm"
                  style={{
                    backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                    borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                    color: modoDark ? "#FFFFFF" : "#000000",
                  }}
                  value={empresaEditada.nome || ""}
                  onChange={(e) => handleInputChange("nome", e.target.value, 20, setNomeCaracteres)}
                  maxLength={20}
                />
                <div className="text-xs text-right mt-1" style={{ color: nomeCaracteres === 20 ? "#ef4444" : "var(--cor-cinza)" }}>
                  {nomeCaracteres}/20
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">{t("campos.email")}</label>
                <input
                  type="email"
                  className="w-full rounded p-2 text-sm"
                  style={{
                    backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                    borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                    color: modoDark ? "#FFFFFF" : "#000000",
                  }}
                  value={empresaEditada.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value, 60, setEmailCaracteres)}
                  maxLength={60}
                />
                <div className="text-xs text-right mt-1" style={{ color: emailCaracteres === 60 ? "#ef4444" : "var(--cor-cinza)" }}>
                  {emailCaracteres}/60
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">{t("campos.telefone")}</label>
                  <input
                    type="text"
                    className="w-full rounded p-2 text-sm"
                    style={{
                      backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                      borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                      color: modoDark ? "#FFFFFF" : "#000000",
                    }}
                    value={empresaEditada.telefone || ""}
                    onChange={(e) => handleInputChange("telefone", e.target.value, 15, setTelefoneCaracteres)}
                    maxLength={15}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: telefoneCaracteres === 15 ? "#ef4444" : "var(--cor-cinza)" }}>
                    {telefoneCaracteres}/15
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">{t("campos.pais")}</label>
                  <input
                    type="text"
                    className="w-full rounded p-2 text-sm"
                    style={{
                      backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                      borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                      color: modoDark ? "#FFFFFF" : "#000000",
                    }}
                    value={empresaEditada.pais || ""}
                    onChange={(e) => handleInputChange("pais", e.target.value, 20, setPaisCaracteres)}
                    maxLength={20}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: paisCaracteres === 20 ? "#ef4444" : "var(--cor-cinza)" }}>
                    {paisCaracteres}/20
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">{t("campos.endereco")}</label>
                <input
                  type="text"
                  className="w-full rounded p-2 text-sm"
                  style={{
                    backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                    borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                    color: modoDark ? "#FFFFFF" : "#000000",
                  }}
                  value={empresaEditada.endereco || ""}
                  onChange={(e) => handleInputChange("endereco", e.target.value, 50, setEnderecoCaracteres)}
                  maxLength={50}
                />
                <div className="text-xs text-right mt-1" style={{ color: enderecoCaracteres === 50 ? "#ef4444" : "var(--cor-cinza)" }}>
                  {enderecoCaracteres}/50
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">{t("campos.cidade")}</label>
                  <input
                    type="text"
                    className="w-full rounded p-2 text-sm"
                    style={{
                      backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                      borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                      color: modoDark ? "#FFFFFF" : "#000000",
                    }}
                    value={empresaEditada.cidade || ""}
                    onChange={(e) => handleInputChange("cidade", e.target.value, 20, setCidadeCaracteres)}
                    maxLength={20}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: cidadeCaracteres === 20 ? "#ef4444" : "var(--cor-cinza)" }}>
                    {cidadeCaracteres}/20
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">{t("campos.estado")}</label>
                  <input
                    type="text"
                    className="w-full rounded p-2 text-sm"
                    style={{
                      backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                      borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                      color: modoDark ? "#FFFFFF" : "#000000",
                    }}
                    value={empresaEditada.estado || ""}
                    onChange={(e) => handleInputChange("estado", e.target.value, 2, setEstadoCaracteres)}
                    maxLength={2}
                  />
                  <div className="text-xs text-right mt-1" style={{ color: estadoCaracteres === 2 ? "#ef4444" : "var(--cor-cinza)" }}>
                    {estadoCaracteres}/2
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">{t("campos.cep")}</label>
                <input
                  type="text"
                  className="w-full rounded p-2 text-sm"
                  style={{
                    backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                    borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                    color: modoDark ? "#FFFFFF" : "#000000",
                  }}
                  value={empresaEditada.cep || ""}
                  onChange={(e) => handleInputChange("cep", e.target.value, 10, setCepCaracteres)}
                  maxLength={10}
                />
                <div className="text-xs text-right mt-1" style={{ color: cepCaracteres === 10 ? "#ef4444" : "var(--cor-cinza)" }}>
                  {cepCaracteres}/10
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-xs font-medium mb-1">{t("logoEmpresa")}</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full rounded p-2 opacity-0 absolute z-10 cursor-pointer text-sm"
                    style={{
                      backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                      borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                      color: modoDark ? "#FFFFFF" : "#000000",
                    }}
                    id="fileInput"
                  />
                  <div className="flex items-center justify-between p-2 rounded border text-xs"
                    style={{
                      backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                      borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                    }}>
                    <span>{t("empresa.escolherArquivo")}</span>
                    <span className="text-gray-500">
                      {t("empresa.nenhumArquivoEscolhido")}
                    </span>
                  </div>
                </div>

                {fotoPreview && (
                  <div className="mt-2">
                    <p className="text-xs mb-1">{t("empresa.preVisualizacao")}:</p>
                    <Image
                      src={fotoPreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded"
                    />
                  </div>
                )}
                {empresa.foto && !fotoPreview && (
                  <div className="mt-2">
                    <p className="text-xs mb-1">Foto atual:</p>
                    <Image
                      src={empresa.foto}
                      alt="Foto atual"
                      width={80}
                      height={80}
                      className="rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setModalEdicaoAberto(false);
                  setFotoFile(null);
                  setFotoPreview(null);
                }}
                className="px-3 py-1.5 rounded cursor-pointer text-sm"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000",
                }}
              >
                {t("modal.cancelar")}
              </button>
              <button
                onClick={editarDadosEmpresa}
                className="px-3 py-1.5 text-white rounded cursor-pointer text-sm"
                style={{
                  backgroundColor: "#10b981",
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