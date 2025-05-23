"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiEnvelope, HiLockClosed, HiMiniUserCircle } from "react-icons/hi2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import Swal from "sweetalert2";

type Inputs = {
  nome: string;
  email: string;
  senha: string;
  verificarSenha: string;
};

export default function Registro() {
  const { register, handleSubmit } = useForm<Inputs>();
  const router = useRouter();
  const [visivel, setVisivel] = useState(false);

  async function verificaCadastro(data: Inputs) {
    try {
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
        headers: {
          "Content-Type": "application/json",
        },
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
          text: "Verifique se o email já está cadastrado ou se a senha possui letra maiuscula e (?!# etc).",
          confirmButtonColor: "#013C3C",
        });
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  }

  return (
    <div className="flex justify-center items-center flex-col gap-5 bg-[#20252C] w-screen h-screen">
      <div className="mt-20">
        <Link href={"/"} className="bg-[#2F2C2C] p-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]">
          <img src="/icone.png" alt="Logo" />
          <span className="p-0 pr-2 text-white text-2xl font-semibold whitespace-nowrap">StockControl</span>
        </Link>
      </div>

      <form className="md:w-2/6" onSubmit={handleSubmit(verificaCadastro)}>
        <label className="block mb-2 text-sm font-medium text-white">Seu Nome:</label>
        <div className="relative mb-3">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniUserCircle className="text-gray-400" />
          </div>
          <input type="text" maxLength={20} {...register("nome")} required className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <label className="block mb-2 text-sm font-medium text-white">Seu Email:</label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope className="text-gray-400" />
          </div>
          <input type="email" {...register("email")} required className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <label className="block mb-2 text-sm font-medium text-white">Sua Senha:</label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed className="text-gray-400" />
          </div>
          <input type={visivel ? "text" : "password"} {...register("senha")} required className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" />
          <div className="absolute cursor-pointer inset-y-0 end-0 flex items-center pe-3.5" onClick={() => setVisivel(!visivel)}>
            {visivel ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
          </div>
        </div>

        <label className="block mb-2 text-sm font-medium text-white">Confirmar Senha:</label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed className="text-gray-400" />
          </div>
          <input type={visivel ? "text" : "password"} {...register("verificarSenha")} required className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" />
          <div className="absolute cursor-pointer inset-y-0 end-0 flex items-center pe-3.5" onClick={() => setVisivel(!visivel)}>
            {visivel ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
          </div>
        </div>

        <button type="submit" className="text-white bg-[#00332C] font-bold hover:bg-[#00332c5b] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg w-full px-5 py-2.5 text-center">
          Registrar-se
        </button>

        <div className="flex justify-between pt-5">
          <Link href="/login" className="text-white font-italic hover:text-[#b37400]">
            já possuo login
          </Link>
        </div>
      </form>
    </div>
  );
}
