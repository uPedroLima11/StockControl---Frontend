"use client";

import { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface Empresa {
  slug: any;
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
        title: novoEstado ? "Catálogo ativado!" : "Catálogo desativado!",
        text: novoEstado 
          ? "Seu catálogo agora está público e acessível pelo link."
          : "Seu catálogo não está mais público.",
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Erro ao alterar estado do catálogo:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível alterar o estado do catálogo.",
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
    <div className="min-h-screen flex justify-center items-start pt-10">
      <div
        className="w-full max-w-md rounded p-6 shadow-md"
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
          <div className="mt-4 p-4 rounded-lg" style={{ 
            backgroundColor: modoDark ? "#1E3A8A" : "#BFDBFE",
            color: modoDark ? "#FFFFFF" : "#1E3A8A"
          }}>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {empresa.catalogoPublico ? <FaEye /> : <FaEyeSlash />}
              Catálogo Público
            </h3>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">
                Status: <strong>{empresa.catalogoPublico ? "ATIVADO" : "DESATIVADO"}</strong>
              </span>
              <button
                onClick={toggleCatalogoPublico}
                disabled={atualizandoCatalogo}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  empresa.catalogoPublico 
                    ? "bg-red-100 text-red-800 hover:bg-red-200" 
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                } disabled:opacity-50`}
              >
                {atualizandoCatalogo ? "Processando..." : 
                 empresa.catalogoPublico ? "Desativar" : "Ativar"}
              </button>
            </div>

            <p className="text-sm mb-2">
              Seu catálogo está disponível em:
            </p>
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/catalogo/${empresa.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm break-all"
            >
              {process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/catalogo/{empresa.slug}
            </a>

            <p className="text-sm mt-2">
              📢 Os clientes verão apenas os produtos marcados como "Adicionar ao Catálogo"
            </p>
            
            {!empresa.catalogoPublico && (
              <p className="text-sm mt-2 text-yellow-600">
                ⚠️ Seu catálogo está desativado. Ative para torná-lo público.
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
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded-lg shadow-lg w-full max-w-md"
            style={{
              backgroundColor: modoDark ? "#1F2937" : "#FFFFFF",
              color: modoDark ? "#FFFFFF" : "#000000",
            }}
          >
            <h2 className="text-xl font-semibold mb-4">{t("modal.editarEmpresa.titulo")}</h2>

            {["nome", "email"].map((key) => (
              <div key={key} className="mb-3">
                <label className="block text-sm font-medium mb-1">{t(`campos.${key}`)}</label>
                <input
                  type="text"
                  className="w-full rounded p-2"
                  style={{
                    backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                    borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                    color: modoDark ? "#FFFFFF" : "#000000",
                  }}
                  value={empresaEditada[key as EmpresaChave] || ""}
                  onChange={(e) => setEmpresaEditada({
                    ...empresaEditada,
                    [key as EmpresaChave]: e.target.value
                  })}
                />
              </div>
            ))}

            {["telefone", "endereco", "pais", "estado", "cidade", "cep"].reduce((acc, key, index, array) => {
              if (index % 2 === 0) {
                acc.push(array.slice(index, index + 2));
              }
              return acc;
            }, [] as string[][]).map((pair, index) => (
              <div key={index} className="flex gap-2 mb-3">
                {pair.map((key) => (
                  <div key={key} className="flex-1">
                    <label className="block text-sm font-medium mb-1">{t(`campos.${key}`)}</label>
                    <input
                      type="text"
                      className="w-full rounded p-2"
                      style={{
                        backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                        borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                        color: modoDark ? "#FFFFFF" : "#000000",
                      }}
                      value={empresaEditada[key as EmpresaChave] || ""}
                      onChange={(e) => setEmpresaEditada({
                        ...empresaEditada,
                        [key as EmpresaChave]: e.target.value
                      })}
                    />
                  </div>
                ))}
              </div>
            ))}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{t("logoEmpresa")}</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full rounded p-2 opacity-0 absolute z-10 cursor-pointer"
                  style={{
                    backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                    borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                    color: modoDark ? "#FFFFFF" : "#000000",
                  }}
                  id="fileInput"
                />
                <div className="flex items-center justify-between p-2 rounded border"
                  style={{
                    backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                    borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                  }}>
                  <span className="text-sm">
                    {t("empresa.escolherArquivo")}
                  </span>
                  <span className="text-sm text-gray-500">
                    {t("empresa.nenhumArquivoEscolhido")}
                  </span>
                </div>
              </div>

              {fotoPreview && (
                <div className="mt-2">
                  <p className="text-sm mb-1">{t("empresa.preVisualizacao")}:</p>
                  <Image
                    src={fotoPreview}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="rounded"
                  />
                </div>
              )}
              {empresa.foto && !fotoPreview && (
                <div className="mt-2">
                  <p className="text-sm mb-1">Foto atual:</p>
                  <Image
                    src={empresa.foto}
                    alt="Foto atual"
                    width={128}
                    height={128}
                    className="rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEmpresaEditada({ ...empresaEditada, foto: null });
                      setFotoPreview(null);
                    }}
                    className="mt-2 text-sm text-red-500"
                  >
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setModalEdicaoAberto(false);
                  setFotoFile(null);
                  setFotoPreview(null);
                }}
                className="px-4 py-2 rounded cursor-pointer"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#FFFFFF" : "#000000",
                }}
              >
                {t("modal.cancelar")}
              </button>
              <button
                onClick={editarDadosEmpresa}
                className="px-4 py-2 text-white rounded cursor-pointer"
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