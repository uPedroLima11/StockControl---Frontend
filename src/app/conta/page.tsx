"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";
import { UsuarioI } from "@/utils/types/usuario";
import { EmpresaI } from "@/utils/types/empresa";
import { useTranslation } from "react-i18next";

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
  const translateRole = (role: string) => {
    return t(`roles.${role}`, { defaultValue: role });
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
      root.style.setProperty("--cor-texto", "#fffff2");
      root.style.setProperty("--cor-fundo-bloco", "#1a25359f");
      root.style.setProperty("--cor-borda", "#374151");
      root.style.setProperty("--cor-cinza", "#A3A3A3");
      root.style.setProperty("--cor-destaque", "#00332C");
      document.body.style.backgroundColor = "#20252B";
      document.body.style.color = "#fffff2";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#ffffff");
      root.style.setProperty("--cor-texto", "#000000");
      root.style.setProperty("--cor-fundo-bloco", "#ececec");
      root.style.setProperty("--cor-borda", "#ffffff");
      root.style.setProperty("--cor-cinza", "#4B5563");
      root.style.setProperty("--cor-destaque", "#00332C");
      document.body.style.backgroundColor = "#fffff";
      document.body.style.color = "#000000";
    }
  };

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
        confirmButtonColor: "#013C3C",
      });
    } else {
      Swal.fire({
        title: t("modal.sucesso.titulo"),
        icon: "success",
        confirmButtonColor: "#013C3C",
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        const excluirDados = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios/${usuario.id}`, {
          method: "DELETE",
        });
        if (excluirDados.status === 204) {
          Swal.fire({
            title: t("modal.excluir.sucesso"),
            icon: "success",
            confirmButtonColor: "#013C3C",
          });
          localStorage.removeItem("client_key");
          window.location.href = "/";
        } else {
          Swal.fire({
            icon: "error",
            title: t("modal.erro.titulo"),
            text: t("modal.erro.excluirConta"),
            confirmButtonText: t("modal.botaoOk"),
            confirmButtonColor: "#013C3C",
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-start pt-10" style={{ backgroundColor: "var(--cor-fundo)" }}>
      <div
        className="w-full max-w-md rounded p-6 shadow-md"
        style={{
          backgroundColor: modoDark ? "#1F2937" : "#ffffff",
          color: modoDark ? "#fffff2" : "#000000",
          border: modoDark ? "1px solid #374151" : "2px solid #000000",
        }}
      >
        <h1 className="text-2xl font-mono text-center mb-6" style={{ color: "var(--cor-texto)" }}>
          {t("titulo")}
        </h1>

        <div className="border-b mb-4 pb-2" style={{ borderColor: "var(--cor-borda)" }}>
          <h2 className="text-lg font-semibold underline">{t("email")}</h2>
          <p className="mt-1">{usuarioLogado?.email || "..."}</p>
        </div>

        <div className="border-b mb-6 pb-6" style={{ borderColor: "var(--cor-borda)" }}>
          <h2 className="text-lg font-semibold mb-4">{t("senha")}</h2>
          <Link
            href="/esqueci"
            className="px-6 py-2 border-2 rounded-lg transition font-mono text-sm hover:bg-[var(--cor-destaque)] hover:text-white"
            style={{
              borderColor: "var(--cor-destaque)",
              color: "var(--cor-texto)",
              backgroundColor: modoDark ? "transparent" : "transparent",
            }}
          >
            {t("trocarSenha")}
          </Link>
        </div>

        <div
          className="border-b mb-4 pb-2">
          <h2 className="text-lg font-semibold">{t("informacoesConta")}</h2>
          <div className="mt-2 space-y-1 text-sm">
            <p>
              {t("empresa.nome")}: <strong>{empresa?.nome || t("adicionar")}</strong>
            </p>
            <p>
              {t("empresa.cargo")}: <strong>{translateRole(usuarioLogado?.tipo || t("adicionar"))}</strong>
            </p>
            <p>
              {t("nome")}: {usuarioLogado?.nome || t("adicionar")}
            </p>
            <p>
              {t("empresa.endereco")}: {empresa?.endereco || t("adicionar")}
            </p>
            <p>
              {t("empresa.pais")}: {empresa?.pais || t("adicionar")}
            </p>
            <p>
              {t("empresa.estado")}: {empresa?.estado || t("adicionar")}
            </p>
            <p>
              {t("empresa.cidade")}: {empresa?.cidade || t("adicionar")}
            </p>
            <p>
              {t("empresa.cep")}: {empresa?.cep ? `${empresa.cep.slice(0, 5)}-${empresa.cep.slice(5)}` : t("adicionar")}
            </p>
            <p>
              {t("empresa.telefone")}: {empresa?.telefone ? `(${empresa.telefone.slice(0, 2)}) ${empresa.telefone.slice(2)}` : t("adicionar")}
            </p>
            <p>
              {t("empresa.email")}: {empresa?.email || t("adicionar")}
            </p>
          </div>
        </div>

        <div className="flex items-center mt-6 gap-1">
          <button
            onClick={abrirModal}
            className="mt-4 px-5 py-2 rounded transition w-full cursor-pointer"
            style={{
              backgroundColor: "var(--cor-destaque)",
              color: "#fffff2",
            }}
          >
            {t("editarPerfil")}
          </button>
          <button
            onClick={handleExcluir}
            className="mt-4 px-6 py-2 rounded transition w-full cursor-pointer"
            style={{
              backgroundColor: "#ee1010",
              color: "#fffff2",
            }}
          >
            {t("excluirConta")}
          </button>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
          <div
            className="p-6 rounded shadow-lg w-full max-w-md"
            style={{
              backgroundColor: modoDark ? "#1F2937" : "#fffff2",
              color: modoDark ? "#fffff2" : "#000000",
            }}
          >
            <h2 className="text-xl font-semibold mb-4">{t("modal.editarTitulo")}</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t("modal.nome")}</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                  borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                  color: modoDark ? "#fffff2" : "#000000",
                }}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t("modal.email")}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#F3F4F6",
                  borderColor: modoDark ? "#4B5563" : "#D1D5DB",
                  color: modoDark ? "#fffff2" : "#000000",
                }}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
                style={{
                  backgroundColor: modoDark ? "#374151" : "#D1D5DB",
                  color: modoDark ? "#fffff2" : "#000000",
                }}
              >
                {t("modal.cancelar")}
              </button>
              <button
                onClick={handleSalvar}
                className="px-4 py-2 text-white rounded cursor-pointer"
                style={{
                  backgroundColor: "var(--cor-destaque)",
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
