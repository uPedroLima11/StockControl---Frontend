"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Suporte() {
  const [modoDark, setModoDark] = useState(false);
  const { t } = useTranslation("suporte");
  const [carregando, setCarregando] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("modoDark");
    const ativado = temaSalvo === "true";
    setModoDark(ativado);
    aplicarTema(ativado);
  }, []);

  const aplicarTema = (ativado: boolean) => {
    const root = document.documentElement;
    if (ativado) {
      root.classList.add("dark");
      root.style.setProperty("--cor-fundo", "#20252B");
      root.style.setProperty("--cor-texto", "#fffff2");
      document.body.style.backgroundColor = "#20252B";
      document.body.style.color = "#fffff2";
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--cor-fundo", "#ffffff");
      root.style.setProperty("--cor-texto", "#000000");
      document.body.style.backgroundColor = "#fffff2";
      document.body.style.color = "#000000";
    }
  };

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
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen px-6 py-10 bg-[var(--cor-fundo)]">
      <main className="flex-1 mx-auto max-w-3xl">
        <h1
          className="text-3xl font-bold mb-6"
          style={{ color: modoDark ? "#e3f6f5" : "#000000" }}
        >
          {t("contato_suporte")}
        </h1>

        <p className="mb-8 text-lg" style={{ color: modoDark ? "#e3f6f5" : "#4B5563" }}>
          {t("suporte_descricao")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder={t("nome")}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-lg border text-base outline-none"
            style={{
              backgroundColor: modoDark ? "#374151" : "#F9FAFB",
              color: modoDark ? "#e3f6f5" : "#111827",
              borderColor: modoDark ? "#4B5563" : "#D1D5DB",
            }}
          />

          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-3 rounded-lg border text-base outline-none"
            style={{
              backgroundColor: modoDark ? "#374151" : "#F9FAFB",
              color: modoDark ? "#e3f6f5" : "#111827",
              borderColor: modoDark ? "#4B5563" : "#D1D5DB",
            }}
          />

          <textarea
            placeholder={t("mensagem")}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            required
            rows={6}
            className="w-full px-5 py-3 rounded-lg border text-base text-white outline-none resize-none"
            style={{
              backgroundColor: modoDark ? "#374151" : "#F9FAFB",
              color: modoDark ? "#e3f6f5" : "#111827",
              borderColor: modoDark ? "#4B5563" : "#D1D5DB",
            }}
          ></textarea>

          <button
            type="submit"
            disabled={carregando}
            className="w-full cursor-pointer py-3 rounded-lg font-medium text-base transition"
            style={{
              backgroundColor: modoDark ? "#4B5563" : "#2563EB",
              color: modoDark ? "#fffff2" : "#ffffff",
              opacity: carregando ? 0.7 : 1,
            }}
          >  {carregando ? t("processando") : t("enviar_mensagem")}

          </button>

          {enviado && (
            <p className="text-green-500 text-base">{t("mensagemEnviada")}</p>
          )}
        </form>
      </main>
    </div>
  );
}
