"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaLock, FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { cores } from "@/utils/cores";
import Link from "next/link";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

type TipoUsuario = "FUNCIONARIO" | "ADMIN" | "PROPRIETARIO";

export default function AtivacaoPage() {
  const [codigo, setCodigo] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [modoDark, setModoDark] = useState(false);
  const [empresaAtivada, setEmpresaAtivada] = useState(false);
  const { t } = useTranslation("ativacao");
  const [, setStatusAtivacao] = useState<{
    ativada: boolean;
    chave: string | null;
    dataAtivacao: Date | null;
  }>({ ativada: false, chave: null, dataAtivacao: null });
  const router = useRouter();

  const temaAtual = modoDark ? cores.dark : cores.light;

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativo = temaSalvo === "true";
    setModoDark(ativo);

    const checkUsuarioEStatus = async () => {
      try {
        const userId = localStorage.getItem("client_key")?.replace(/"/g, "");
        if (!userId) {
          router.push("/login");
          return;
        }

        const userRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/${userId}`);
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(t("erroBuscarUsuario"));
        setTipoUsuario(userData.tipo);

        const empresaRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/usuario/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
          },
        });
        const empresaData = await empresaRes.json();
        if (!empresaRes.ok) throw new Error(t("erroBuscarEmpresa"));
        setEmpresaId(empresaData.id);

        const statusRes = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/empresa/status-ativacao/${empresaData.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
          },
        });
        const statusData = await statusRes.json();
        if (statusRes.ok) {
          setStatusAtivacao(statusData);
          setEmpresaAtivada(statusData.ativada);
        }
      } catch (error: unknown) {
        console.error("Erro ao verificar status:", error);
      }
    };

    checkUsuarioEStatus();

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

    return () => {
      document.head.removeChild(style);
    };
  }, [router, t]);

  const handleAtivar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!codigo.trim()) {
        throw new Error(t("erroCodigoVazio"));
      }

      const chaveRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!chaveRegex.test(codigo)) {
        console.log("Formato inválido detectado:", codigo);
        throw new Error(t("erroCodigoInvalido"));
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/chave/${codigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresaId }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(t("chaveNaoEncontrada") || "Código de ativação não existe");
        } else if (res.status === 400) {
          if (responseData.mensagem?.includes("já foi utilizada")) {
            throw new Error(t("chaveJaUtilizada") || "Este código de ativação já foi utilizado por outra empresa");
          }
          if (responseData.mensagem?.includes("já possui uma chave")) {
            throw new Error(t("empresaJaAtivada") || "Esta empresa já possui uma chave de ativação");
          }
          throw new Error(responseData.mensagem || t("erroAtivacao"));
        }
        throw new Error(responseData.mensagem || t("erroAtivacao"));
      }

      Swal.fire({
        icon: "success",
        title: t("empresaAtivada") || "Empresa ativada!",
        text: t("empresaAtivadaMensagem") || "Sua empresa foi ativada com sucesso.",
        confirmButtonColor: temaAtual.primario,
      });

      setEmpresaAtivada(true);
      setStatusAtivacao((prev) => ({ ...prev, ativada: true }));
    } catch (error: unknown) {
      console.error("Erro completo:", error);

      if (error instanceof Error) {
        let mensagemErro = error.message;

        if (error.message.includes("não encontrada")) {
          mensagemErro = t("chaveNaoEncontrada") || "Código de ativação não existe";
        } else if (error.message.includes("já foi utilizada")) {
          mensagemErro = t("chaveJaUtilizada") || "Este código de ativação já foi utilizado por outra empresa";
        } else if (error.message.includes("já possui uma chave")) {
          mensagemErro = t("empresaJaAtivada") || "Esta empresa já possui uma chave de ativação";
        }

        console.log("Mensagem de erro para usuário:", mensagemErro);

        Swal.fire({
          icon: "error",
          title: "Erro na ativação",
          text: mensagemErro,
          confirmButtonColor: temaAtual.erro,
        });
      } else {
        console.log("Erro desconhecido");

        Swal.fire({
          icon: "error",
          title: "Erro",
          text: t("erroGenerico") || "Erro desconhecido ao ativar empresa",
          confirmButtonColor: temaAtual.erro,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (tipoUsuario && tipoUsuario !== "PROPRIETARIO") {
    return (
      <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
        <div
          className="w-full max-w-md p-6 rounded-lg text-center"
          style={{
            backgroundColor: temaAtual.card,
            border: `1px solid ${temaAtual.borda}`,
          }}
        >
          <div className="flex justify-center mb-4">
            <FaLock className="text-4xl" style={{ color: temaAtual.erro }} />
          </div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: temaAtual.texto }}>
            {t("acessoRestrito")}
          </h2>
          <p className="mb-6 text-sm" style={{ color: temaAtual.placeholder }}>
            {t("apenasProprietarios")}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-4 py-2 rounded-lg transition font-medium"
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
            {t("voltarDashboard")}
          </button>
        </div>
      </div>
    );
  }

  if (empresaAtivada && tipoUsuario === "PROPRIETARIO") {
    return (
      <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
        <div
          className="w-full max-w-md p-6 rounded-lg text-center"
          style={{
            backgroundColor: temaAtual.card,
            border: `1px solid ${temaAtual.borda}`,
          }}
        >
          <div className="flex justify-center mb-4">
            <FaCheckCircle className="text-4xl" style={{ color: temaAtual.sucesso }} />
          </div>

          <h2 className="text-xl font-semibold mb-4" style={{ color: temaAtual.texto }}>
            {t("empresaJaAtivada")}
          </h2>

          <p className="mb-6 text-sm" style={{ color: temaAtual.placeholder }}>
            {t("empresaJaAtivadaMensagem")}
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-4 py-2 cursor-pointer rounded-lg transition font-medium"
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
            {t("voltarDashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
      <div
        className="w-full max-w-md p-6 rounded-lg"
        style={{
          backgroundColor: temaAtual.card,
          border: `1px solid ${temaAtual.borda}`,
        }}
      >
        <div className="flex justify-center mb-4">
          <FaLock className="text-4xl" style={{ color: temaAtual.primario }} />
        </div>

        <h2 className="text-xl font-semibold text-center mb-4" style={{ color: temaAtual.texto }}>
          {t("ativacaoTitulo")}
        </h2>

        <p className="text-center mb-6 text-sm" style={{ color: temaAtual.placeholder }}>
          {t("ativacaoDescricao")}
        </p>

        <form onSubmit={handleAtivar} className="space-y-4">
          <div>
            <label htmlFor="codigo" className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
              {t("codigoAtivacao")}
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: temaAtual.card,
                color: temaAtual.texto,
                border: `1px solid ${temaAtual.borda}`,
              }}
              placeholder={t("codigoAtivacaoPlaceholder")}
              required
              disabled={loading}
              onFocus={(e) => {
                e.target.style.borderColor = temaAtual.primario;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = temaAtual.borda;
              }}
            />
            <p className="mt-1 text-xs text-center" style={{ color: temaAtual.placeholder }}>
              {t("codigoAtivacaoAjuda")}
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg cursor-pointer transition font-medium flex items-center justify-center"
              style={{
                backgroundColor: loading ? temaAtual.placeholder : temaAtual.primario,
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("ativando")}
                </div>
              ) : (
                t("ativarEmpresa")
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm mb-2" style={{ color: temaAtual.placeholder }}>
            {t("naoEfetuouPagamento")}
          </p>
          <Link
            href="https://wa.me/+5553981185633"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm transition"
            style={{
              color: temaAtual.primario,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <FaShoppingCart className="mr-2" />
            <span className="font-medium">{t("cliqueAqui")}</span>
            <span className="ml-1">{t("paraComprarAtivacao")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
