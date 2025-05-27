"use client";
import { HiEnvelope, HiLockClosed, HiMiniIdentification, HiCheckCircle, HiExclamationCircle } from "react-icons/hi2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import Swal from "sweetalert2";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

type Inputs = {
  email: string;
  codigoVerificacao: string;
  senha: string;
  confirmaSenha: string;
};

export default function Alteracao() {
  const { register, handleSubmit, control } = useForm<Inputs>();
  const { t } = useTranslation("alteracao");
  const router = useRouter();
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const senha = useWatch({ control, name: "senha" });
  const confirmaSenha = useWatch({ control, name: "confirmaSenha" });

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
    setPasswordsMatch(senha === confirmaSenha && senha !== '');
  }, [senha, confirmaSenha]);

  async function verificaAlteracao(data: Inputs) {
    try {
      if (!passwordValid) {
        Swal.fire({
          icon: "error",
          title: t("senhaInvalidaTitulo"),
          text: t("senhaInvalidaMensagem"),
          confirmButtonColor: "#013C3C",
        });
        return;
      }
      if (data.senha !== data.confirmaSenha) {
        Swal.fire({
          icon: "error",
          title: t("erroTitulo"),
          text: t("erroSenhasNaoCoincidem"),
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
          title: t("sucessoTitulo"),
          text: t("sucessoMensagem"),
          confirmButtonColor: "#013C3C",
        }).then(() => {
          router.push("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: t("erroTituloGenerico"),
          text: t("erroMensagemGenerica"),
          confirmButtonColor: "#013C3C",
        });
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      Swal.fire({
        icon: "error",
        title: t("erroTituloGenerico"),
        text: t("erroMensagemGenerica"),
        confirmButtonColor: "#013C3C",
      });
    }
  }

  return (
    <div className="flex justify-center items-center flex-col gap-5 bg-[#20252C] min-h-screen w-full px-4 py-8">
      <div>
        <Link href={"/"} className="bg-[#2F2C2C] p-8 rounded-4xl flex flex-col items-center justify-center shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]">
          <img src="../../icone.png" alt="Logo" />
          <span className="p-0 pr-2 text-white text-center text-2xl font-semibold whitespace-nowrap">StockControl</span>
        </Link>
      </div>
      <form onSubmit={handleSubmit(verificaAlteracao)} className="w-full max-w-md">
        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          {t("emailRegistrado")}
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiEnvelope className="text-gray-400" />
          </div>
          <input 
            type="email" 
            {...register("email")} 
            className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" 
            placeholder={t("digiteEmail")} 
            required 
          />
        </div>

        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          {t("codigoVerificacao")}
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiLockClosed className="text-gray-400" />
          </div>
          <input 
            type="text" 
            {...register("codigoVerificacao")} 
            className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" 
            placeholder={t("digiteCodigo")} 
            required 
          />
        </div>

        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          {t("novaSenha")}
        </label>
        <div className="relative mb-3">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniIdentification className="text-gray-400" />
          </div>
          <input 
            type={showPassword ? "text" : "password"} 
            {...register("senha")} 
            className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" 
            placeholder={t("digiteNovaSenha")} 
            required 
          />
          <div 
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FaEyeSlash className="text-gray-400" />
            ) : (
              <FaEye className="text-gray-400" />
            )}
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

        <label htmlFor="input-group-1" className="block mb-2 text-sm font-medium text-white">
          {t("confirmeSenha")}
        </label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <HiMiniIdentification className="text-gray-400" />
          </div>
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            {...register("confirmaSenha")} 
            className="border text-sm rounded-lg block w-full ps-10 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" 
            placeholder={t("confirmeSenhaPlaceholder")} 
            required 
          />
          <div 
            className="absolute inset-y-0 end-0 flex items-center pe-3.5 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <FaEyeSlash className="text-gray-400" />
            ) : (
              <FaEye className="text-gray-400" />
            )}
          </div>
          {confirmaSenha && (
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
          <p className="text-sm text-gray-400">{t("senhaRequisitos")}</p>
          <ul className="text-xs text-gray-400 list-disc pl-5">
            <li className={senha?.length >= 8 ? "text-green-500" : "text-red-500"}>{t("minimoCaracteres")}</li>
            <li className={senha && /[a-z]/.test(senha) ? "text-green-500" : "text-red-500"}>{t("letraMinuscula")}</li>
            <li className={senha && /[A-Z]/.test(senha) ? "text-green-500" : "text-red-500"}>{t("letraMaiuscula")}</li>
            <li className={senha && /[0-9]/.test(senha) ? "text-green-500" : "text-red-500"}>{t("numero")}</li>
            <li className={senha && /[^a-zA-Z0-9]/.test(senha) ? "text-green-500" : "text-red-500"}>{t("simbolo")}</li>
          </ul>
        </div>

        <button 
          type="submit" 
          className="text-white bg-[#00332C] font-bold hover:bg-[#00332c5b] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-full px-5 py-2.5 text-center"
        >
          {t("alterarSenha")}
        </button>
      </form>
    </div>
  );
}