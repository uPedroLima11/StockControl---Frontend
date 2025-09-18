"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";
import { UsuarioI } from "@/utils/types/usuario";
import { EmpresaI } from "@/utils/types/empresa";
import { useTranslation } from "react-i18next";
import { FaEdit, FaTrash, FaLock } from "react-icons/fa";

export default function MinhaConta() {
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioI | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaI | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { usuario, logar } = useUsuarioStore();
  const [form, setForm] = useState({
    nome: "",
    email: "",
  });
  const [modoDark, setModoDark] = useState(false);
  const { t } = useTranslation("conta");
  
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

  const translateRole = (role: string) => {
    return t(`roles.${role}`, { defaultValue: role });
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
      }
    }

    const buscarDados = async (idUsuario: string) => {
      const responseUser = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${idUsuario}`);
      if (responseUser.status === 200) {
        const dados = await responseUser.json();
        setUsuarioLogado(dados);
      }

      const responseEmpresa = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${idUsuario}`);
      if (responseEmpresa.status === 200) {
        const dados = await responseEmpresa.json();
        setEmpresa(dados);
      }
    };

    if (localStorage.getItem("client_key")) {
      const usuarioSalvo = localStorage.getItem("client_key") as string;
      const usuarioValor = usuarioSalvo.replace(/"/g, "");
      buscaUsuarios(usuarioValor);
      buscarDados(usuarioValor);
    }
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
    html::-webkit-scrollbar {
      width: 10px;
    }
    
    html::-webkit-scrollbar-track {
      background: ${modoDark ? "#132F4C" : "#F8FAFC"};
    }
    
    html::-webkit-scrollbar-thumb {
      background: ${modoDark ? "#132F4C" : "#90CAF9"}; 
      border-radius: 5px;
      border: 2px solid ${modoDark ? "#132F4C" : "#F8FAFC"};
    }
    
    html::-webkit-scrollbar-thumb:hover {
      background: ${modoDark ? "#132F4C" : "#64B5F6"}; 
    }
    
    html {
      scrollbar-width: thin;
      scrollbar-color: ${modoDark ? "#132F4C" : "#90CAF9"} ${modoDark ? "#0A1830" : "#F8FAFC"};
    }
    
    @media (max-width: 768px) {
      html::-webkit-scrollbar {
        width: 6px;
      }
      
      html::-webkit-scrollbar-thumb {
        border: 1px solid ${modoDark ? "#132F4C" : "#F8FAFC"};
        border-radius: 3px;
      }
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [modoDark]); 
  
  const abrirModal = () => {
    setForm({
      nome: usuario?.nome || "",
      email: usuario?.email || "",
    });
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!usuario) return;

    const atualizarDados = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
      }),
    });
    if (!(atualizarDados.status === 200)) {
      Swal.fire({
        icon: "error",
        title: t("modal.erro.titulo"),
        text: t("modal.erro.emailExistente"),
        confirmButtonText: t("modal.botaoOk"),
        confirmButtonColor: temaAtual.primario,
      });
    } else {
      Swal.fire({
        title: t("modal.sucesso.titulo"),
        icon: "success",
        confirmButtonColor: temaAtual.primario,
      });
    }
    setModalAberto(false);
    window.location.reload();
  };

  const handleExcluir = async () => {
    if (!usuario) return;

    await Swal.fire({
      title: t("modal.excluir.titulo"),
      text: t("modal.excluir.texto"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("modal.excluir.confirmar"),
      cancelButtonText: t("modal.excluir.cancelar"),
      confirmButtonColor: temaAtual.primario,
      cancelButtonColor: "#6B7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const excluirDados = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuario.id}`, {
          method: "DELETE",
        });
        if (excluirDados.status === 204) {
          Swal.fire({
            title: t("modal.excluir.sucesso"),
            icon: "success",
            confirmButtonColor: temaAtual.primario,
          });
          localStorage.removeItem("client_key");
          window.location.href = "/";
        } else {
          Swal.fire({
            icon: "error",
            title: t("modal.erro.titulo"),
            text: t("modal.erro.excluirConta"),
            confirmButtonText: t("modal.botaoOk"),
            confirmButtonColor: temaAtual.primario,
          });
        }
      }
    });
  };

 return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
      <div className="w-full max-w-2xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-6" style={{ color: temaAtual.texto }}>
          {t("titulo")}
        </h1>

        <div className="p-6 rounded-lg mb-6" style={{
          backgroundColor: temaAtual.card,
          border: `1px solid ${temaAtual.borda}`
        }}>
          <div className="border-b mb-4 pb-4" style={{ borderColor: temaAtual.borda }}>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: temaAtual.texto }}>
              <FaLock style={{ color: temaAtual.texto }} />
              {t("email")}
            </h2>
            <p className="mt-1" style={{ color: temaAtual.texto }}>{usuarioLogado?.email || "..."}</p>
          </div>

          <div className="mb-6 pb-4" style={{ borderColor: temaAtual.borda }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: temaAtual.texto }}>{t("senha")}</h2>
            <Link
              href="/esqueci"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-mono text-sm w-fit"
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
              {t("trocarSenha")}
            </Link>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4" style={{ color: temaAtual.texto }}>{t("informacoesConta")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("empresa.nome")}</p>
                <p style={{ color: temaAtual.texto }}><strong>{empresa?.nome || t("adicionar")}</strong></p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("empresa.cargo")}</p>
                <p style={{ color: temaAtual.texto }}><strong>{translateRole(usuarioLogado?.tipo || t("adicionar"))}</strong></p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("nome")}</p>
                <p style={{ color: temaAtual.texto }}>{usuarioLogado?.nome || t("adicionar")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("empresa.endereco")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa?.endereco || t("adicionar")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("empresa.pais")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa?.pais || t("adicionar")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("empresa.estado")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa?.estado || t("adicionar")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("empresa.cidade")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa?.cidade || t("adicionar")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("empresa.cep")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa?.cep ? `${empresa.cep.slice(0, 5)}-${empresa.cep.slice(5)}` : t("adicionar")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("empresa.telefone")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa?.telefone ? `(${empresa.telefone.slice(0, 2)}) ${empresa.telefone.slice(2)}` : t("adicionar")}</p>
              </div>
              <div>
                <p style={{ color: temaAtual.placeholder }}>{t("empresa.email")}</p>
                <p style={{ color: temaAtual.texto }}>{empresa?.email || t("adicionar")}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={abrirModal}
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
              {t("editarPerfil")}
            </button>
            <button
              onClick={handleExcluir}
              className="flex items-center cursor-pointer justify-center gap-2 px-4 py-2 rounded-lg transition font-medium"
              style={{
                backgroundColor: "#EF4444",
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <FaTrash className="text-sm" style={{ color: "#FFFFFF" }} />
              {t("excluirConta")}
            </button>
          </div>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-4 rounded-lg shadow-xl w-full max-w-md"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.borda}`
            }}
          >
            <h2 className="text-xl font-semibold mb-3" style={{ color: temaAtual.texto }}>{t("modal.editarTitulo")}</h2>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("modal.nome")}</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium" style={{ color: temaAtual.texto }}>{t("modal.email")}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: temaAtual.card,
                    color: temaAtual.texto,
                    border: `1px solid ${temaAtual.borda}`
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModalAberto(false)}
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
                onClick={handleSalvar}
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