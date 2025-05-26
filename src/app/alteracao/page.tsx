"use client";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiEnvelope, HiLockClosed, HiMiniIdentification } from "react-icons/hi2";

export default function Esqueci() {
  const { t } = useTranslation("alteracao");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleAlterar = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("https://n8n-render-7cc2.onrender.com/webhook-test/esqueci-senha" as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, codigo, senha, confirmarSenha }),
    });

    setEmail("");
    setCodigo("");
    setSenha("");
    setConfirmarSenha("");
    setEnviado(true);
  };
  return (
    <div className="flex justify-center items-center flex-col gap-5 bg-[#20252C] w-screen h-screen">
      <div>
        <Link href={"/"} className="bg-[#2F2C2C] p-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]">
          <img src="../../icone.png" alt="Logo" />
          <span className="p-0 pr-2 text-white text-center text-2xl font-semibold whitespace-nowrap">StockControl</span>
        </Link>
      </div>
      <form onSubmit={handleAlterar} className="md:w-2/6">
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          Email registrado:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope className="text-gray-400" />
          </div>
          <input type="email" onChange={(e) => setEmail(e.target.value)} className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Digite seu email aqui" required />
        </div>
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          Código de verificação:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed className="text-gray-400" />
          </div>
          <input type="text" onChange={(e) => setCodigo(e.target.value)} className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Digite o Código de verificação" required />
        </div>
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          Nova senha:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniIdentification className="text-gray-400" />
          </div>
          <input type="password" onChange={(e) => setSenha(e.target.value)} className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Digite sua nova senha aqui" required />
        </div>
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          Confirme sua nova senha:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniIdentification className="text-gray-400" />
          </div>
          <input type="password" onChange={(e) => setConfirmarSenha(e.target.value)} className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Confirme sua senha" required />
        </div>
        <button type="submit" className="text-white bg-[#00332C] font-bold hover:bg-[#00332c5b] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-full px-5 py-2.5 text-center">
          Alterar Senha
        </button>
        {enviado && <p className="text-green-500 text-base">{t("mensagemEnviada")}</p>}
      </form>
    </div>
  );
}
