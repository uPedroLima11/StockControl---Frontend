"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HiEnvelope } from "react-icons/hi2";
import Swal from "sweetalert2";

type Inputs = {
  email: string;
};

export default function Esqueci() {
  const { register, handleSubmit } = useForm<Inputs>();
  const { t } = useTranslation("esqueci");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function enviaRecuperacao(data: Inputs) {
    setCarregando(true);
    try {
      const token = Math.floor(100000 + Math.random() * 900000);
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/esqueceu/${data.email}`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recuperacao: token.toString(),
        }),
      });

      await fetch(`${process.env.NEXT_PUBLIC_URL_ESQUECI}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          codigo: token.toString(),
        }),
      });

      if (!response.ok) {
        Swal.fire({
          title: "Erro",
          text: "Usuário não encontrado ou email inválido.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
      setEnviado(true);
    } finally {
      setCarregando(false);
    }
  }
  return (
    <div className="flex justify-center items-center flex-col gap-5 bg-[#20252C] w-screen h-screen">
      <div>
        <Link href={"/"} className="bg-[#2F2C2C] p-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]">
          <img src="../../icone.png" alt="Logo" />
          <span className="p-0 pr-2 text-white text-center text-2xl font-semibold whitespace-nowrap">StockControl</span>
        </Link>
      </div>
      <form onSubmit={handleSubmit(enviaRecuperacao)} className="md:w-2/6">
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          Email registrado:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope className="text-gray-400" />
          </div>
          <input type="email" {...register("email")} className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Digite seu email aqui" required />
        </div>
        <button type="submit" disabled={carregando} className="text-white bg-[#00332C] font-bold hover:bg-[#00332c5b] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-full px-5 py-2.5 text-center">
          Enviar Email
        </button>
        {carregando ? t("processando") : null}

        {enviado && <p className="text-green-500 mt-4 text-base">{t("mensagemEnviada")}</p>}
      </form>
    </div>
  );
}
