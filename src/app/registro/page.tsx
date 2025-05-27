/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { HiEnvelope, HiLockClosed, HiMiniUserCircle, HiCheckCircle, HiExclamationCircle } from "react-icons/hi2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

type Inputs = {
  nome: string;
  email: string;
  senha: string;
  verificarSenha: string;
};

export default function Registro() {
  const { register, handleSubmit, control } = useForm<Inputs>();
  const router = useRouter();
  const [visivel, setVisivel] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const senha = useWatch({ control, name: "senha" });
  const verificarSenha = useWatch({ control, name: "verificarSenha" });

  function validarSenha(senha: string) {
    if (!senha) return false;
    if (senha.length < 8) return false;
    let minusculas = 0, maiusculas = 0, numeros = 0, simbolos = 0;
    for (const char of senha) {
      if (/[a-z]/.test(char)) minusculas++;
      else if (/[A-Z]/.test(char)) maiusculas++;
      else if (/[0-9]/.test(char)) numeros++;
      else simbolos++;
    }
    return minusculas > 0 && maiusculas > 0 && numeros > 0 && simbolos > 0;
  }

  useEffect(() => {
    setPasswordValid(validarSenha(senha));
    setPasswordsMatch(senha === verificarSenha && senha !== '');
  }, [senha, verificarSenha]);

  async function verificaCadastro(data: Inputs) {
    try {
      if (!passwordValid) {
        Swal.fire({
          icon: "error",
          title: "Senha inválida",
          text: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.",
          confirmButtonColor: "#013C3C",
        });
        return;
      }
      if (data.senha !== data.verificarSenha) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "As senhas não coincidem.",
          confirmButtonColor: "#013C3C",
        });
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          tipo: "FUNCIONARIO",
        }),
      });
      if (response.status === 201) {
        router.push("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Algo deu errado.",
          text: "Verifique se o email já está cadastrado ou se a senha atende todos os requisitos.",
          confirmButtonColor: "#013C3C",
        });
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  }

  return (
    <div className="flex justify-center items-center flex-col gap-5 bg-[#20252C] min-h-screen w-full px-2 py-4">
      <div className="mt-2 w-full flex justify-center">
        <Link
          href="/"
          className="bg-[#2F2C2C] px-6 py-6 md:px-8 md:py-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]"
        >
          <img src="/icone.png" alt="Logo" className="w-16 h-16 md:w-20 md:h-20 mb-2" />
          <span className="p-0 pr-2 text-white text-xl md:text-2xl font-semibold whitespace-nowrap">StockControl</span>
        </Link>
      </div>

      <form
        className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-[#23272F] rounded-xl shadow-lg p-4 md:p-8 mx-auto"
        onSubmit={handleSubmit(verificaCadastro)}
      >
        <label className="block mb-2 text-sm md:text-base font-medium text-white">Seu Nome:</label>
        <div className="relative mb-3">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniUserCircle className="text-gray-400" />
          </div>
          <input
            type="text"
            maxLength={20}
            {...register("nome")}
            required
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <label className="block mb-2 text-sm md:text-base font-medium text-white">Seu Email:</label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope className="text-gray-400" />
          </div>
          <input
            type="email"
            {...register("email")}
            required
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <label className="block mb-2 text-sm md:text-base font-medium text-white">Sua Senha:</label>
        <div className="relative mb-3">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed className="text-gray-400" />
          </div>
          <input
            placeholder="mínimo 8 caractéres, Maiusculas, minusculas e simbolos"
            type={visivel ? "text" : "password"}
            {...register("senha")}
            required
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          />
          <div
            className="absolute cursor-pointer inset-y-0 end-0 flex items-center pe-3.5"
            onClick={() => setVisivel(!visivel)}
          >
            {visivel ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
          </div>
          {senha && (
            <div className="absolute inset-y-0 end-10 flex items-center pe-3.5">
              {passwordValid ? (
                <HiCheckCircle className="text-green-500" />
              ) : (
                <HiExclamationCircle className="text-red-500" />
              )}
            </div>
          )}
        </div>

        <label className="block mb-2 text-sm md:text-base font-medium text-white">Confirmar Senha:</label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed className="text-gray-400" />
          </div>
          <input
            placeholder="Digite a senha novamente"
            type={visivel ? "text" : "password"}
            {...register("verificarSenha")}
            required
            className="border text-sm md:text-base rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          />
          <div
            className="absolute cursor-pointer inset-y-0 end-0 flex items-center pe-3.5"
            onClick={() => setVisivel(!visivel)}
          >
            {visivel ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
          </div>
          {verificarSenha && (
            <div className="absolute inset-y-0 end-10 flex items-center pe-3.5">
              {passwordsMatch ? (
                <HiCheckCircle className="text-green-500" />
              ) : (
                <HiExclamationCircle className="text-red-500" />
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm md:text-base text-gray-400">A senha deve conter:</p>
          <ul className="text-xs md:text-sm text-gray-400 list-disc pl-5">
            <li className={senha?.length >= 8 ? "text-green-500" : "text-red-500"}>Mínimo 8 caracteres</li>
            <li className={senha && /[a-z]/.test(senha) ? "text-green-500" : "text-red-500"}>Pelo menos 1 letra minúscula</li>
            <li className={senha && /[A-Z]/.test(senha) ? "text-green-500" : "text-red-500"}>Pelo menos 1 letra maiúscula</li>
            <li className={senha && /[0-9]/.test(senha) ? "text-green-500" : "text-red-500"}>Pelo menos 1 número</li>
            <li className={senha && /[^a-zA-Z0-9]/.test(senha) ? "text-green-500" : "text-red-500"}>Pelo menos 1 símbolo</li>
          </ul>
        </div>

        <button
          type="submit"
          className="text-white cursor-pointer bg-[#00332C] font-bold hover:bg-[#00332c5b] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg w-full px-5 py-2.5 text-center text-base md:text-lg"
        >
          Registrar-se
        </button>

        <div className="flex justify-between pt-5">
          <Link href="/login" className="text-white font-italic hover:text-[#b37400] text-sm md:text-base cursor-pointer">
            já possuo login
          </Link>
        </div>
      </form>
    </div>
  );
}