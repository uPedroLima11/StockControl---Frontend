"use client";
import { HiEnvelope, HiLockClosed, HiMiniIdentification } from "react-icons/hi2";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import Link from "next/link";

type Inputs = {
  email: string;
  codigoVerificacao: string;
  senha: string;
  confirmaSenha: string;
};

export default function Alteracao() {
  const { register, handleSubmit } = useForm<Inputs>();
  const router = useRouter();

  async function verificaAlteracao(data: Inputs) {
    try {
      if (data.senha !== data.confirmaSenha) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "As senhas não coincidem.",
          confirmButtonColor: "#013C3C",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/recuperacao/alterar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          senha: data.senha,
          recuperacao: data.codigoVerificacao,
        }),
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Senha alterada com sucesso!",
          confirmButtonColor: "#013C3C",
        }).then(() => {
          router.push("/login");
        });
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
      Swal.fire({
        icon: "error",
        title: "Algo deu errado.",
        text: "Verifique se o email já está cadastrado ou se a senha possui letra maiuscula e (?!# etc).",
        confirmButtonColor: "#013C3C",
      });
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
      <form onSubmit={handleSubmit(verificaAlteracao)} className="md:w-2/6">
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          Email registrado:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope className="text-gray-400" />
          </div>
          <input type="email" {...register("email")} className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Digite seu email aqui" required />
        </div>
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          Código de verificação:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed className="text-gray-400" />
          </div>
          <input type="text" {...register("codigoVerificacao")} className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Digite o Código de verificação" required />
        </div>
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          Nova senha:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniIdentification className="text-gray-400" />
          </div>
          <input type="password" {...register("senha")} className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Digite sua nova senha aqui" required />
        </div>
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          Confirme sua nova senha:
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniIdentification className="text-gray-400" />
          </div>
          <input type="password" {...register("confirmaSenha")} className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Confirme sua senha" required />
        </div>
        <button type="submit" className="text-white bg-[#00332C] font-bold hover:bg-[#00332c5b] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-full px-5 py-2.5 text-center">
          Alterar Senha
        </button>
      </form>
    </div>
  );
}
