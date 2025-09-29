"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import { cores } from "@/utils/cores";

export default function Suporte() {
  const [modoDark, setModoDark] = useState(false);
  const { t } = useTranslation("suporte");
  const [carregando, setCarregando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  const temaAtual = modoDark ? cores.dark : cores.light;

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      await fetch(process.env.NEXT_PUBLIC_URL_SUPORTE as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, mensagem }),
      });

      setEnviado(true);
      setNome("");
      setEmail("");
      setMensagem("");
      
      setTimeout(() => {
        setEnviado(false);
      }, 3000);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 md:px-4 py-4 md:py-8" style={{ backgroundColor: temaAtual.fundo, minHeight: "100vh" }}>
      <div className="w-full max-w-3xl">
        <h1 className="text-center text-xl md:text-2xl font-mono mb-3 md:mb-6" style={{ color: temaAtual.texto }}>
          {t("contato_suporte")}
        </h1>

        <p className="text-center mb-6 md:mb-8 text-sm md:text-base" style={{ color: temaAtual.placeholder }}>
          {t("suporte_descricao")}
        </p>

        <div className="p-6 rounded-lg" style={{
          backgroundColor: temaAtual.card,
          border: `1px solid ${temaAtual.borda}`
        }}>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("nome")}
              </label>
              <input
                type="text"
                placeholder={t("nome")}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border text-sm md:text-base outline-none transition-colors"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = temaAtual.primario;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = temaAtual.borda;
                }}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("email")}
              </label>
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border text-sm md:text-base outline-none transition-colors"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = temaAtual.primario;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = temaAtual.borda;
                }}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: temaAtual.texto }}>
                {t("mensagem")}
              </label>
              <textarea
                placeholder={t("mensagem")}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                required
                rows={6}
                className="w-full placeholder-gray-400 px-4 py-2 rounded-lg border text-sm md:text-base outline-none resize-none transition-colors"
                style={{
                  backgroundColor: temaAtual.card,
                  color: temaAtual.texto,
                  border: `1px solid ${temaAtual.borda}`
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = temaAtual.primario;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = temaAtual.borda;
                }}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full flex items-center justify-center cursor-pointer gap-2 py-2 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: temaAtual.primario,
                color: "#FFFFFF",
              }}
              onMouseEnter={(e) => {
                if (!carregando) {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!carregando) {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {carregando ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("processando")}
                </div>
              ) : (
                <>
                  <FaPaperPlane className="text-sm " />
                  {t("enviar_mensagem")}
                </>
              )}
            </button>

            {enviado && (
              <div className="flex items-center gap-2 p-3 rounded-lg mt-4" style={{
                backgroundColor: "#10B98120",
                border: "1px solid #10B981"
              }}>
                <FaCheckCircle className="text-green-500" />
                <p className="text-sm md:text-base" style={{ color: temaAtual.texto }}>
                  {t("mensagemEnviada")}
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg text-center" style={{
            backgroundColor: temaAtual.card,
            border: `1px solid ${temaAtual.borda}`
          }}>
            <h3 className="font-semibold mb-2" style={{ color: temaAtual.texto }}>Email</h3>
            <p className="text-sm" style={{ color: temaAtual.placeholder }}>stockcontroldev@gmail.com
</p>
          </div>
          
          <div className="p-4 rounded-lg text-center" style={{
            backgroundColor: temaAtual.card,
            border: `1px solid ${temaAtual.borda}`
          }}>
            <h3 className="font-semibold mb-2" style={{ color: temaAtual.texto }}>Telefone</h3>
            <p className="text-sm" style={{ color: temaAtual.placeholder }}>(53) 98118-5633</p>
          </div>
          
          <div className="p-4 rounded-lg text-center" style={{
            backgroundColor: temaAtual.card,
            border: `1px solid ${temaAtual.borda}`
          }}>
            <h3 className="font-semibold mb-2" style={{ color: temaAtual.texto }}>Horário</h3>
            <p className="text-sm" style={{ color: temaAtual.placeholder }}>Seg-Sex: 9h-18h</p>
          </div>
        </div>
      </div>
    </div>
  );
}