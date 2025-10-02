"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HiEnvelope } from "react-icons/hi2";
import { cores } from "@/utils/cores";
import Link from "next/link";
import Swal from "sweetalert2";

type Inputs = {
  email: string;
};

export default function Esqueci() {
  const { register, handleSubmit } = useForm<Inputs>();
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const temaAtual = cores.dark;

  async function enviaRecuperacao(data: Inputs) {
    setCarregando(true);
    try {
      const token = Math.floor(100000 + Math.random() * 900000);

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/esqueceu/${data.email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recuperacao: token.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar código no banco');
      }

      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/recuperacao-senha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: data.email,
          codigo: token.toString(),
        }),
      });

      const emailData = await emailResponse.json();

      if (!emailResponse.ok || !emailData.success) {
        throw new Error(emailData.message || 'Erro ao enviar email');
      }

      setEnviado(true);

      Swal.fire({
        title: "Email enviado!",
        text: "Verifique sua caixa de entrada para o código de recuperação.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto
      });

    } catch (error: unknown) {
      console.error('Erro:', error);

      let errorMessage = "Ocorreu um erro ao tentar enviar o e-mail de recuperação. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: "Erro ao enviar",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: temaAtual.primario,
        background: temaAtual.card,
        color: temaAtual.texto
      });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      className="flex justify-center items-center flex-col gap-5 min-h-screen w-full px-4 py-8"
      style={{ backgroundColor: temaAtual.fundo }}
    >
      <div className="w-full flex justify-center">
        <Link
          href={"/"}
          className="p-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: temaAtual.card }}
        >
          <img src="/icone.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 mb-2 brightness-0 invert" />
          <span
            className="text-center text-xl md:text-2xl font-semibold whitespace-nowrap"
            style={{ color: temaAtual.texto }}
          >
            StockControl
          </span>
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(enviaRecuperacao)}
        className="w-full max-w-md rounded-xl shadow-lg p-6 md:p-8"
        style={{ backgroundColor: temaAtual.card }}
      >
        <h2
          className="text-xl md:text-2xl font-semibold mb-6 text-center"
          style={{ color: temaAtual.texto }}
        >
          Recuperar senha
        </h2>

        <label
          htmlFor="input-group-1"
          className="block mb-2 text-sm md:text-base font-medium"
          style={{ color: temaAtual.texto }}
        >
          E-mail cadastrado
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope style={{ color: temaAtual.placeholder }} />
          </div>
          <input
            type="email"
            {...register("email", {
              required: true,
              pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
            })}
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Digite seu e-mail"
            required
            style={{
              backgroundColor: temaAtual.fundo,
              color: temaAtual.texto,
              borderColor: temaAtual.borda
            }}
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="text-white cursor-pointer font-bold focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg w-full px-5 py-2.5 text-center text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: temaAtual.primario }}
          onMouseEnter={(e) => {
            if (!carregando) {
              e.currentTarget.style.opacity = "0.9";
            }
          }}
          onMouseLeave={(e) => {
            if (!carregando) {
              e.currentTarget.style.opacity = "1";
            }
          }}
        >
          {carregando ? "Enviando código..." : "Enviar código de recuperação"}
        </button>

        {enviado && (
          <div
            className="mt-4 p-3 rounded-lg text-center border"
            style={{
              backgroundColor: "#10B98120",
              borderColor: "#10B981",
              color: "#10B981"
            }}
          >
            <p className="text-sm md:text-base">Código enviado! Verifique seu email.</p>
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm md:text-base hover:opacity-80 cursor-pointer transition-all"
            style={{ color: temaAtual.texto }}
          >
            Voltar para o login
          </Link>
        </div>
      </form>
    </div>
  );
}