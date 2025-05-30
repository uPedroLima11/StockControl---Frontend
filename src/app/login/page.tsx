"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiEnvelope, HiLockClosed } from "react-icons/hi2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useUsuarioStore } from "@/context/usuario";
import Swal from "sweetalert2";

type Inputs = {
  email: string;
  senha: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<Inputs>();
  const { logar } = useUsuarioStore();
  const [visivel, setVisivel] = useState(false);
  const router = useRouter();

  async function handleLogin(data: Inputs) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/usuario/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          senha: data.senha,
        }),
      });

      if (response.status === 200) {
        Swal.fire({
          text: "Login Realizado Com Sucesso!",
          icon: "success",
          confirmButtonColor: "#013C3C",
        });
        const dados = await response.json();
        logar(dados);
        localStorage.setItem("client_key", JSON.stringify(dados.id));
        router.push("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Algo deu errado, Verifque as credenciais",
          confirmButtonColor: "#013C3C",
        });
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
    }
  }

  return (
    <div className="flex justify-center items-center flex-col gap-5 bg-[#20252C] w-screen h-screen">
      <div className="mt-12">
        <Link href={"/"} className="bg-[#2F2C2C] p-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]">
          <img src="/icone.png" alt="Logo" />
          <span className="text-white text-2xl font-semibold whitespace-nowrap">StockControl</span>
        </Link>
      </div>

      <form className="md:w-2/6" onSubmit={handleSubmit(handleLogin)}>
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

        <button type="submit" className="text-white cursor-pointer bg-[#00332C] font-bold hover:bg-[#00332c5b] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg w-full px-5 py-2.5 text-center">
          Login
        </button>

        <div className="flex justify-between pt-5">
          <Link href="/registro" className="cursor-pointer text-white font-italic hover:text-[#b37400]">
            Não possuo conta
          </Link>
          <Link href="/esqueci" className="cursor-pointer text-white text-sm font-semibold hover:text-[#b37400]">
            Esqueceu sua senha?
          </Link>
        </div>
      </form>
    </div>
  );
}
